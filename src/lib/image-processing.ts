"use client";

/**
 * Converte a foto escolhida (câmera/galeria) para WebP no próprio navegador:
 * - corrige orientação EXIF
 * - limita o lado maior a 2400px (nítido em telas retina, leve no 4G)
 * - qualidade 0.86 (sem perda visível)
 * Se o navegador não codificar WebP, usa JPEG 0.88.
 */
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const MAX_INPUT_BYTES = 25 * 1024 * 1024;
const MAX_SIDE = 2400;

export type ProcessedImage = { blob: Blob; ext: "webp" | "jpg"; width: number; height: number };

export class ImageProcessingError extends Error {}

function isHeic(file: File) {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // cai para <img> (alguns Safari decodificam HEIC apenas assim)
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function processImage(file: File): Promise<ProcessedImage> {
  if (file.size > MAX_INPUT_BYTES) {
    throw new ImageProcessingError("Foto muito grande (máx. 25 MB).");
  }
  const typeOk = ACCEPTED_TYPES.includes(file.type) || isHeic(file) || file.type === "";
  if (!typeOk) {
    throw new ImageProcessingError("Formato não suportado. Use JPEG, PNG, WEBP ou HEIC.");
  }

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await decode(file);
  } catch {
    throw new ImageProcessingError(
      isHeic(file)
        ? "Este navegador não abre fotos HEIC. No iPhone, use o Safari ou ajuste a câmera para “Mais compatível”."
        : "Não foi possível ler esta foto.",
    );
  }

  const w0 = "naturalWidth" in source ? source.naturalWidth : source.width;
  const h0 = "naturalHeight" in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, MAX_SIDE / Math.max(w0, h0));
  const width = Math.round(w0 * scale);
  const height = Math.round(h0 * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageProcessingError("Seu navegador não conseguiu processar a foto.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  if ("close" in source) source.close();

  const webp = await toBlob(canvas, "image/webp", 0.86);
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp", width, height };

  const jpg = await toBlob(canvas, "image/jpeg", 0.88);
  if (!jpg) throw new ImageProcessingError("Falha ao converter a foto.");
  return { blob: jpg, ext: "jpg", width, height };
}

/** Upload com progresso (XHR) direto para o Storage, autenticado como o admin. */
export function uploadWithProgress(opts: {
  url: string;
  accessToken: string;
  apiKey: string;
  blob: Blob;
  contentType: string;
  onProgress: (pct: number) => void;
  signal?: AbortSignal;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", opts.url);
    xhr.setRequestHeader("Authorization", `Bearer ${opts.accessToken}`);
    xhr.setRequestHeader("apikey", opts.apiKey);
    xhr.setRequestHeader("Content-Type", opts.contentType);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = `Falha no envio (${xhr.status}).`;
      try {
        const body = JSON.parse(xhr.responseText);
        if (body?.statusCode === "409" || /exists/i.test(body?.message ?? "")) message = "DUPLICATE";
        else if (body?.message) message = body.message;
      } catch {}
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error("Sem conexão. Verifique a internet e tente novamente."));
    xhr.onabort = () => reject(new Error("Envio cancelado."));
    opts.signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(opts.blob);
  });
}
