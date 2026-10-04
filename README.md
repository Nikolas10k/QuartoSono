# Quarto Sono Colchões — site + catálogo administrável

Showroom digital da Quarto Sono (Brazlândia e Ceilândia, Brasília — DF).
**Não é e-commerce**: o visitante navega pelo catálogo e fala com a loja pelo WhatsApp
com uma mensagem que já traz o nome do produto.

- **Site:** Home editorial → Produtos → Produto → WhatsApp
- **Admin (`/admin`):** Login → Novo produto → Fotos → Nome → Categoria → Publicar (≈ 1 min, pelo celular)

Stack: Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4 · Supabase (Auth, Postgres, Storage) ·
GSAP/ScrollTrigger · Zod · React Hook Form · Lucide.

---

## 1. Instalação local

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev                  # http://localhost:3000
```

| Variável | Onde encontrar |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → API Keys → **publishable** (ou a anon legada) |
| `NEXT_PUBLIC_SITE_URL` | URL pública final (ex.: `https://quartosono.com.br`) — usada em canonical, sitemap e OpenGraph |

> A chave `service_role` **não é usada** em lugar nenhum. Toda escrita acontece com a sessão do admin e é
> autorizada pelo RLS.

Scripts: `npm run dev` · `npm run build` · `npm run start` · `npm run lint`.

## 2. Supabase

O projeto roda **dentro do projeto Supabase compartilhado “Arrepasse”**, isolado das outras aplicações:

| Recurso | Nome |
| --- | --- |
| Schema Postgres | `quartosono` (nada no `public`) |
| Tabelas | `categories`, `products`, `product_images`, `admins` |
| Bucket de fotos | `quartosono` → `products/{product-id}/image-NN.webp` |
| Função de autorização | `quartosono.is_admin()` |

Migrations versionadas em [`supabase/migrations`](supabase/migrations) (já aplicadas no Arrepasse):

1. `…01_quartosono_schema.sql`: tabelas, índices, slug único automático (`-2`, `-3`…), triggers e RLS
2. `…02_quartosono_storage.sql`: bucket público (só leitura por URL); upload e remoção apenas para admins
3. `…03_quartosono_seed_categories.sql`: Colchões, Conjuntos Box, Camas, Cabeceiras, Sofás, Outros
4. `…04_quartosono_expose_schema.sql`: expõe o schema `quartosono` na Data API

**Regras de acesso (RLS)**
- Visitante: lê categorias e **apenas produtos publicados** (e as fotos deles).
- Admin: lê e escreve tudo. É admin quem está em `quartosono.admins`. Como `auth.users` é compartilhado
  com outras apps, só estar logado não dá acesso.
- O catálogo mostra apenas `published = true AND available = true`. Um produto indisponível sai do
  catálogo, mas continua no banco e no painel.

> ⚠️ Se alguém editar *Project Settings → Data API → Exposed schemas* no painel do Supabase, mantenha
> `quartosono` na lista.

Para usar outro projeto Supabase: rode as migrations em ordem no SQL Editor (ou `supabase db push`).

## 3. Criar um admin

Sem cadastro público. Para dar acesso a alguém:

1. Supabase → **Authentication → Users → Add user** (e-mail + senha, marque *Auto confirm*).
2. SQL Editor:
   ```sql
   insert into quartosono.admins (user_id)
   select id from auth.users where email = 'pessoa@exemplo.com';
   ```
Para revogar: `delete from quartosono.admins where user_id = (select id from auth.users where email = '…');`

## 4. Cadastrar um produto (pelo celular)

1. Acesse `/admin` e entre com e-mail e senha.
2. Toque em **+ NOVO PRODUTO**.
3. **Fotos**: tire ou escolha de 1 a 10 fotos. Elas são convertidas para WebP no próprio aparelho e enviadas
   com barra de progresso. Arraste ⋮⋮ para reordenar; a ★ define a capa (a primeira foto é a capa).
4. **Nome** e **Categoria**.
5. **Publicar**. Pronto: *Ver produto · Copiar link · Adicionar outro*.

Opcional, em “Mais detalhes”: marca, descrições, tamanho, mola, conforto, altura, peso, tecido, garantia,
preço/preço promocional e as chaves Disponível / Destaque / Condição especial.
Sem preço, o site mostra **“Consulte condições”** (nunca R$ 0,00).

Na listagem: alternar disponível/indisponível e destaque com um toque, editar e excluir (com confirmação).

## 5. Deploy na Vercel

1. Importe o repositório na Vercel (framework detectado: Next.js).
2. Em *Settings → Environment Variables*, cadastre as 3 variáveis acima (Production e Preview).
3. Deploy. Depois, aponte o domínio e atualize `NEXT_PUBLIC_SITE_URL`.
4. No Supabase → *Authentication → URL Configuration*, adicione a URL do site em *Site URL / Redirect URLs*.

Cache: as páginas públicas usam ISR (5 min), e toda ação do admin revalida a vitrine na hora
(`revalidatePath('/', 'layout')`).

## 6. Conteúdo e dados reais

- Dados da empresa (WhatsApp, telefone, endereços, nota no Google): [`src/lib/site.ts`](src/lib/site.ts).
  **Não invente** horários, preços ou métricas: campos ausentes ficam `null` e a interface se adapta.
- Depoimentos reais (opcional): [`src/lib/reviews.ts`](src/lib/reviews.ts). Lista vazia mostra só a nota agregada.
- Fotos editoriais (hero, seção cinematográfica, loja): coloque os arquivos em `public/media/` e informe os
  caminhos em [`src/lib/media.ts`](src/lib/media.ts). Sem foto, o site usa blocos arquitetônicos abstratos
  ou a capa de um produto em destaque.

## 7. Estrutura

```
src/
  app/(site)/        páginas públicas (home, produtos, categorias, sobre, lojas, contato)
  app/admin/         login + painel (route group (panel) protegido)
  actions/           server actions (auth, produtos) — sempre checam admin + Zod
  components/        ui · layout · home · catalog · admin · motion
  hooks/             useImageUploads, useReducedMotion
  lib/               site (dados reais), seo, format, whatsapp, supabase/*, gsap, image-processing
  schemas/           Zod (formulário de produto)
  services/          consultas (catálogo público e admin)
  types/             tipos do banco e do catálogo
  proxy.ts           renova a sessão e barra /admin sem login
supabase/migrations/ SQL versionado
```
