"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { ImageProcessingError, processImage, uploadWithProgress } from "@/lib/image-processing";
import { STORAGE_BUCKET } from "@/types/database";

export const MAX_IMAGES = 10;

export type UploadItem = {
  key: string;
  preview: string;
  storage_path: string | null;
  public_url: string | null;
  status: "processing" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  /** Já salvo no banco (edição) */
  persisted: boolean;
  file?: File;
};

type InitialImage = { storage_path: string; public_url: string };

function indexFromPath(path: string) {
  const m = path.match(/image-(\d+)\./);
  return m ? Number(m[1]) : 0;
}

let keySeq = 0;
const newKey = () => `img-${Date.now().toString(36)}-${(keySeq++).toString(36)}`;

export function useImageUploads(productId: string, initial: InitialImage[] = []) {
  const [items, setItems] = useState<UploadItem[]>(() =>
    initial.map((img) => ({
      key: newKey(),
      preview: img.public_url,
      storage_path: img.storage_path,
      public_url: img.public_url,
      status: "done",
      progress: 100,
      persisted: true,
    })),
  );
  const counter = useRef(initial.reduce((max, i) => Math.max(max, indexFromPath(i.storage_path)), 0));
  const itemsRef = useRef(items);
  useLayoutEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const patch = useCallback((key: string, p: Partial<UploadItem>) => {
    setItems((all) => all.map((it) => (it.key === key ? { ...it, ...p } : it)));
  }, []);

  const runUpload = useCallback(
    async (key: string, file: File) => {
      patch(key, { status: "processing", progress: 0, error: undefined });
      try {
        const processed = await processImage(file);
        patch(key, { status: "uploading", progress: 2 });

        const supabase = getBrowserSupabase();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("Sessão expirada. Entre novamente.");

        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const apiKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
        const contentType = processed.ext === "webp" ? "image/webp" : "image/jpeg";

        for (let attempt = 0; attempt < 6; attempt++) {
          const n = ++counter.current;
          const path = `products/${productId}/image-${String(n).padStart(2, "0")}.${processed.ext}`;
          try {
            await uploadWithProgress({
              url: `${baseUrl}/storage/v1/object/${STORAGE_BUCKET}/${path}`,
              accessToken: token,
              apiKey,
              blob: processed.blob,
              contentType,
              onProgress: (pct) => patch(key, { progress: Math.max(2, pct) }),
            });
            const public_url = `${baseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
            // Item pode ter sido removido durante o envio
            if (!itemsRef.current.some((it) => it.key === key)) {
              await supabase.storage.from(STORAGE_BUCKET).remove([path]);
              return;
            }
            patch(key, { status: "done", progress: 100, storage_path: path, public_url, file: undefined });
            return;
          } catch (e) {
            if (e instanceof Error && e.message === "DUPLICATE") continue;
            throw e;
          }
        }
        throw new Error("Não foi possível gerar um nome para a foto.");
      } catch (e) {
        patch(key, {
          status: "error",
          error: e instanceof ImageProcessingError || e instanceof Error ? e.message : "Falha no envio.",
        });
      }
    },
    [patch, productId],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      const room = MAX_IMAGES - itemsRef.current.length;
      const accepted = list.slice(0, Math.max(0, room));
      const created: UploadItem[] = accepted.map((file) => ({
        key: newKey(),
        preview: URL.createObjectURL(file),
        storage_path: null,
        public_url: null,
        status: "processing",
        progress: 0,
        persisted: false,
        file,
      }));
      setItems((all) => [...all, ...created]);
      // Envia em sequência curta (2 por vez) para não saturar o 4G
      (async () => {
        const queue = [...created];
        const worker = async () => {
          while (queue.length) {
            const it = queue.shift()!;
            await runUpload(it.key, it.file!);
          }
        };
        await Promise.all([worker(), worker()]);
      })();
      return { accepted: accepted.length, rejected: list.length - accepted.length };
    },
    [runUpload],
  );

  const retry = useCallback(
    (key: string) => {
      const it = itemsRef.current.find((i) => i.key === key);
      if (it?.file) runUpload(key, it.file);
    },
    [runUpload],
  );

  const remove = useCallback((key: string) => {
    const it = itemsRef.current.find((i) => i.key === key);
    setItems((all) => all.filter((i) => i.key !== key));
    if (!it) return;
    if (it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
    // Fotos novas (não salvas) já enviadas: apaga do storage agora.
    // Fotos já salvas: removidas no servidor ao salvar o produto.
    if (!it.persisted && it.storage_path) {
      getBrowserSupabase().storage.from(STORAGE_BUCKET).remove([it.storage_path]);
    }
  }, []);

  const move = useCallback((from: number, to: number) => {
    setItems((all) => {
      if (from === to || from < 0 || to < 0 || from >= all.length || to >= all.length) return all;
      const next = [...all];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });
  }, []);

  const makeCover = useCallback(
    (key: string) => {
      const from = itemsRef.current.findIndex((i) => i.key === key);
      move(from, 0);
    },
    [move],
  );

  /** Fotos novas enviadas e ainda não salvas (para limpar ao sair sem salvar) */
  const unsavedPaths = useCallback(
    () => itemsRef.current.filter((i) => !i.persisted && i.storage_path).map((i) => i.storage_path!),
    [],
  );

  const markAllPersisted = useCallback(() => {
    setItems((all) => all.map((i) => ({ ...i, persisted: true })));
  }, []);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((i) => i.preview.startsWith("blob:") && URL.revokeObjectURL(i.preview));
    };
  }, []);

  const busy = items.some((i) => i.status === "processing" || i.status === "uploading");
  const failed = items.some((i) => i.status === "error");
  const ready = useMemo(
    () =>
      items
        .filter((i) => i.status === "done" && i.storage_path && i.public_url)
        .map((i) => ({ storage_path: i.storage_path!, public_url: i.public_url! })),
    [items],
  );

  return { items, addFiles, remove, retry, move, makeCover, busy, failed, ready, unsavedPaths, markAllPersisted };
}

export type ImageUploadsApi = ReturnType<typeof useImageUploads>;
