/**
 * Fotografia editorial opcional (fotos reais da loja / produtos).
 *
 * Para usar: coloque os arquivos em /public/media e informe o caminho abaixo
 * (ex.: "/media/colchao-01.webp"). Enquanto o valor for `null`, o site usa
 * os blocos arquitetônicos abstratos ou a capa de um produto em destaque.
 */
export const EDITORIAL_MEDIA: {
  /** Até 4 imagens — uma para cada coluna do hero */
  hero: [string | null, string | null, string | null, string | null];
  /** Imagem que nasce do bloco abstrato na seção cinematográfica */
  statement: string | null;
  /** Foto da loja na seção "Venha sentir o conforto de perto" */
  store: string | null;
} = {
  hero: [null, null, null, null],
  statement: null,
  store: null,
};
