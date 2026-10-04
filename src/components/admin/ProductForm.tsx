"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/types/catalog";
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/schemas/product";
import { createProduct, updateProduct } from "@/actions/products";
import { useImageUploads } from "@/hooks/useImageUploads";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/types/database";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ImageUploader } from "./ImageUploader";
import { Field, Switch, TextArea, TextInput } from "./fields";

type Props = {
  mode: "create" | "edit";
  productId: string;
  categories: Category[];
  defaultValues: ProductFormInput;
  initialImages?: { storage_path: string; public_url: string }[];
  initialPublished?: boolean;
  onCreated?: (result: { id: string; slug: string; published: boolean }) => void;
};

export function ProductForm({
  mode,
  productId,
  categories,
  defaultValues,
  initialImages = [],
  initialPublished = false,
  onCreated,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const uploads = useImageUploads(productId, initialImages);
  const [published, setPublished] = useState(initialPublished);
  const [submitting, setSubmitting] = useState<null | "publish" | "draft" | "save">(null);
  const [imageError, setImageError] = useState<string>();
  const [detailsOpen, setDetailsOpen] = useState(mode === "edit");
  const savedRef = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  // Limpa do storage fotos enviadas e não salvas ao sair do formulário
  const unsavedPaths = uploads.unsavedPaths;
  useEffect(() => {
    return () => {
      if (savedRef.current) return;
      const paths = unsavedPaths();
      if (paths.length) getBrowserSupabase().storage.from(STORAGE_BUCKET).remove(paths);
    };
  }, [unsavedPaths]);

  // Aviso ao fechar a aba com alterações pendentes
  const hasPending = isDirty || uploads.unsavedPaths().length > 0;
  useEffect(() => {
    if (!hasPending) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasPending]);

  function checkImages() {
    if (uploads.busy) return "Aguarde o envio das fotos terminar.";
    if (uploads.failed) return "Há fotos com erro. Tente reenviar ou remova-as.";
    if (uploads.ready.length === 0) return "Adicione pelo menos 1 foto.";
    return undefined;
  }

  const submit = (intent: "publish" | "draft" | "save") =>
    handleSubmit(
      async (values) => {
        const imgErr = checkImages();
        setImageError(imgErr);
        if (imgErr) {
          toast.error(imgErr);
          document.getElementById("secao-fotos")?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        if (submitting) return;
        setSubmitting(intent);

        const nextPublished = intent === "publish" ? true : intent === "draft" ? false : published;
        const payload = { id: productId, values, images: uploads.ready, published: nextPublished };
        const result = mode === "create" ? await createProduct(payload) : await updateProduct(payload);

        if (!result.ok) {
          setSubmitting(null);
          toast.error(result.error);
          return;
        }

        savedRef.current = true;
        uploads.markAllPersisted();
        if (mode === "create") {
          onCreated?.({ ...result.data, published: nextPublished });
        } else {
          // A página remonta o formulário (key = updated_at) com os dados salvos
          setSubmitting(null);
          toast.success("Alterações salvas.");
          router.refresh();
        }
      },
      () => {
        const imgErr = checkImages();
        setImageError(imgErr);
        toast.error("Revise os campos destacados.");
      },
    )();

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} className="space-y-10 pb-28">
      {/* 1. Fotos */}
      <section id="secao-fotos" aria-labelledby="t-fotos" className="scroll-mt-24">
        <StepTitle id="t-fotos" n={1}>
          Fotos
        </StepTitle>
        <ImageUploader api={uploads} error={imageError} />
      </section>

      {/* 2. Nome */}
      <section aria-labelledby="t-nome">
        <StepTitle id="t-nome" n={2}>
          Nome
        </StepTitle>
        <Field id="name" label={<span className="sr-only">Nome do produto</span>} error={errors.name?.message}>
          <TextInput
            id="name"
            placeholder="Ex.: Conjunto Box Probel King Hard 193x203"
            autoComplete="off"
            enterKeyHint="next"
            invalid={!!errors.name}
            className="h-14 text-lg"
            {...register("name")}
          />
        </Field>
      </section>

      {/* 3. Categoria */}
      <section aria-labelledby="t-cat">
        <StepTitle id="t-cat" n={3}>
          Categoria
        </StepTitle>
        <Controller
          control={control}
          name="category_id"
          render={({ field }) => (
            <div role="radiogroup" aria-labelledby="t-cat" aria-invalid={!!errors.category_id} className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const checked = field.value === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => field.onChange(c.id)}
                    onBlur={field.onBlur}
                    className={cn(
                      "h-12 rounded-full border px-5 text-[0.9375rem] font-medium transition-colors",
                      checked
                        ? "border-graphite bg-graphite text-paper"
                        : errors.category_id
                          ? "border-danger/50 bg-white"
                          : "border-graphite/15 bg-white hover:border-graphite",
                    )}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.category_id && (
          <p role="alert" className="mt-2 text-[0.8125rem] text-danger">
            {errors.category_id.message}
          </p>
        )}
      </section>

      {/* Detalhes opcionais */}
      <section className="rounded-[var(--radius-md)] border border-graphite/10 bg-white">
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          aria-expanded={detailsOpen}
          aria-controls="detalhes"
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span>
            <span className="block font-medium">Mais detalhes</span>
            <span className="block text-[0.8125rem] text-stone">Opcional: marca, descrição, ficha técnica, preço</span>
          </span>
          <ChevronDown className={cn("size-5 transition-transform", detailsOpen && "rotate-180")} aria-hidden />
        </button>

        <div id="detalhes" hidden={!detailsOpen} className="space-y-8 border-t border-graphite/10 px-5 py-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="brand" label="Marca" error={errors.brand?.message}>
              <TextInput id="brand" placeholder="Ex.: Probel" {...register("brand")} />
            </Field>
            <Field id="size" label="Tamanho" error={errors.size?.message}>
              <TextInput id="size" placeholder="Ex.: King 193x203" {...register("size")} />
            </Field>
          </div>

          <Field id="short_description" label="Descrição curta" hint="Aparece no catálogo e nos destaques." error={errors.short_description?.message}>
            <TextArea id="short_description" rows={2} className="min-h-20" {...register("short_description")} />
          </Field>
          <Field id="description" label="Descrição completa" error={errors.description?.message}>
            <TextArea id="description" rows={5} {...register("description")} />
          </Field>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-stone">Ficha técnica</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="spring_type" label="Tipo de mola">
                <TextInput id="spring_type" placeholder="Ex.: Molas ensacadas" {...register("spring_type")} />
              </Field>
              <Field id="comfort_level" label="Conforto">
                <TextInput id="comfort_level" placeholder="Ex.: Firme" {...register("comfort_level")} />
              </Field>
              <Field id="height" label="Altura">
                <TextInput id="height" placeholder="Ex.: 32 cm" {...register("height")} />
              </Field>
              <Field id="supported_weight" label="Peso suportado">
                <TextInput id="supported_weight" placeholder="Ex.: 150 kg por pessoa" {...register("supported_weight")} />
              </Field>
              <Field id="fabric" label="Tecido">
                <TextInput id="fabric" placeholder="Ex.: Malha" {...register("fabric")} />
              </Field>
              <Field id="warranty" label="Garantia">
                <TextInput id="warranty" placeholder="Ex.: 1 ano" {...register("warranty")} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1 text-sm font-semibold uppercase tracking-[0.08em] text-stone">Preço</legend>
            <p className="mb-3 text-[0.8125rem] text-stone">Sem preço, o site mostra “Consulte condições”.</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="price" label="Preço (R$)" error={errors.price?.message}>
                <TextInput id="price" inputMode="decimal" placeholder="0,00" invalid={!!errors.price} {...register("price")} />
              </Field>
              <Field id="promotional_price" label="Preço promocional (R$)" error={errors.promotional_price?.message}>
                <TextInput
                  id="promotional_price"
                  inputMode="decimal"
                  placeholder="0,00"
                  invalid={!!errors.promotional_price}
                  {...register("promotional_price")}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="divide-y divide-graphite/10">
            <legend className="mb-1 text-sm font-semibold uppercase tracking-[0.08em] text-stone">Opções</legend>
            <Controller
              control={control}
              name="available"
              render={({ field }) => (
                <Switch
                  id="available"
                  checked={!!field.value}
                  onChange={field.onChange}
                  label="Disponível"
                  description="Desligado: some do catálogo, mas continua salvo."
                />
              )}
            />
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <Switch id="featured" checked={!!field.value} onChange={field.onChange} label="Destaque" description="Aparece na home." />
              )}
            />
            <Controller
              control={control}
              name="promotion"
              render={({ field }) => (
                <Switch
                  id="promotion"
                  checked={!!field.value}
                  onChange={field.onChange}
                  label="Condição especial"
                  description="Exibe o selo “Condição especial” no catálogo."
                />
              )}
            />
          </fieldset>
        </div>
      </section>

      {/* 4. Publicar — barra fixa */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-graphite/10 bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 pb-safe">
          {mode === "create" ? (
            <>
              <Button
                variant="ghost"
                size="lg"
                className="flex-1 sm:flex-none"
                loading={submitting === "draft"}
                disabled={!!submitting}
                onClick={() => submit("draft")}
              >
                Salvar rascunho
              </Button>
              <Button
                variant="admin"
                size="lg"
                className="flex-[2] sm:ml-auto sm:flex-none sm:px-10"
                loading={submitting === "publish"}
                disabled={!!submitting || uploads.busy}
                onClick={() => submit("publish")}
              >
                {uploads.busy ? "Enviando fotos…" : "Publicar"}
              </Button>
            </>
          ) : (
            <>
              <div className="flex-1">
                <Switch id="published" checked={published} onChange={setPublished} label={published ? "Publicado" : "Rascunho"} />
              </div>
              <Button
                variant="admin"
                size="lg"
                className="px-8"
                loading={submitting === "save"}
                disabled={!!submitting || uploads.busy}
                onClick={() => submit("save")}
              >
                {uploads.busy ? "Enviando fotos…" : "Salvar"}
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

function StepTitle({ id, n, children }: { id: string; n: number; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-4 flex items-center gap-3 text-lg font-semibold">
      <span className="flex size-7 items-center justify-center rounded-full bg-graphite text-[0.8125rem] text-paper tabular-nums">
        {n}
      </span>
      {children}
    </h2>
  );
}
