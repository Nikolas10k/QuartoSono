-- Quarto Sono — schema isolado dentro do projeto Supabase compartilhado.
-- Nada aqui toca o schema public nem objetos de outras aplicações.

create schema if not exists quartosono;

grant usage on schema quartosono to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Admins: somente usuários listados aqui administram o catálogo.
-- (auth.users é compartilhado com outras apps do projeto.)
-- ---------------------------------------------------------------------------
create table quartosono.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function quartosono.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from quartosono.admins a where a.user_id = (select auth.uid())
  );
$$;

revoke all on function quartosono.is_admin() from public;
grant execute on function quartosono.is_admin() to anon, authenticated, service_role;

create or replace function quartosono.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Categorias
-- ---------------------------------------------------------------------------
create table quartosono.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 80),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_updated_at
before update on quartosono.categories
for each row execute function quartosono.set_updated_at();

-- ---------------------------------------------------------------------------
-- Produtos (preços em numeric(12,2), nunca float)
-- ---------------------------------------------------------------------------
create table quartosono.products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (char_length(name) between 2 and 140),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id       uuid not null references quartosono.categories (id) on delete restrict,
  brand             text,
  short_description text,
  description       text,
  size              text,
  spring_type       text,
  comfort_level     text,
  height            text,
  supported_weight  text,
  fabric            text,
  warranty          text,
  price             numeric(12, 2) check (price is null or price > 0),
  promotional_price numeric(12, 2) check (promotional_price is null or promotional_price > 0),
  featured          boolean not null default false,
  promotion         boolean not null default false,
  available         boolean not null default true,
  published         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint promotional_below_price check (
    promotional_price is null or price is null or promotional_price < price
  )
);

create index products_category_idx on quartosono.products (category_id);
create index products_public_idx on quartosono.products (published, available, created_at desc);
create index products_featured_idx on quartosono.products (featured) where featured;

create trigger products_updated_at
before update on quartosono.products
for each row execute function quartosono.set_updated_at();

-- Slug único: se já existir, acrescenta -2, -3, ...
create or replace function quartosono.ensure_unique_product_slug()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_slug text := new.slug;
  candidate text := new.slug;
  n integer := 1;
begin
  if tg_op = 'UPDATE' and new.slug = old.slug then
    return new;
  end if;

  while exists (
    select 1 from quartosono.products p
    where p.slug = candidate and p.id <> new.id
  ) loop
    n := n + 1;
    candidate := base_slug || '-' || n;
  end loop;

  new.slug := candidate;
  return new;
end;
$$;

create trigger products_unique_slug
before insert or update of slug on quartosono.products
for each row execute function quartosono.ensure_unique_product_slug();

-- ---------------------------------------------------------------------------
-- Imagens
-- ---------------------------------------------------------------------------
create table quartosono.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references quartosono.products (id) on delete cascade,
  storage_path text not null unique,
  public_url   text not null,
  position     integer not null default 0,
  is_cover     boolean not null default false,
  created_at   timestamptz not null default now()
);

create index product_images_product_idx on quartosono.product_images (product_id, position);
create unique index product_images_one_cover on quartosono.product_images (product_id) where is_cover;

-- ---------------------------------------------------------------------------
-- Privilégios (RLS decide o que cada papel enxerga)
-- ---------------------------------------------------------------------------
grant select on quartosono.categories, quartosono.products, quartosono.product_images to anon, authenticated;
grant insert, update, delete on quartosono.categories, quartosono.products, quartosono.product_images to authenticated;
grant select on quartosono.admins to authenticated;
grant all on all tables in schema quartosono to service_role;

alter table quartosono.admins         enable row level security;
alter table quartosono.categories     enable row level security;
alter table quartosono.products       enable row level security;
alter table quartosono.product_images enable row level security;

-- admins: cada usuário só enxerga a própria linha; nenhuma escrita via API
create policy "admins_select_self" on quartosono.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- categorias: leitura pública, escrita só admin
create policy "categories_read" on quartosono.categories
  for select to anon, authenticated
  using (true);
create policy "categories_admin_insert" on quartosono.categories
  for insert to authenticated with check ((select quartosono.is_admin()));
create policy "categories_admin_update" on quartosono.categories
  for update to authenticated using ((select quartosono.is_admin())) with check ((select quartosono.is_admin()));
create policy "categories_admin_delete" on quartosono.categories
  for delete to authenticated using ((select quartosono.is_admin()));

-- produtos: público lê apenas publicados; admin lê tudo e escreve
create policy "products_read" on quartosono.products
  for select to anon, authenticated
  using (published or (select quartosono.is_admin()));
create policy "products_admin_insert" on quartosono.products
  for insert to authenticated with check ((select quartosono.is_admin()));
create policy "products_admin_update" on quartosono.products
  for update to authenticated using ((select quartosono.is_admin())) with check ((select quartosono.is_admin()));
create policy "products_admin_delete" on quartosono.products
  for delete to authenticated using ((select quartosono.is_admin()));

-- imagens: seguem a visibilidade do produto
create policy "product_images_read" on quartosono.product_images
  for select to anon, authenticated
  using (
    (select quartosono.is_admin())
    or exists (
      select 1 from quartosono.products p
      where p.id = product_images.product_id and p.published
    )
  );
create policy "product_images_admin_insert" on quartosono.product_images
  for insert to authenticated with check ((select quartosono.is_admin()));
create policy "product_images_admin_update" on quartosono.product_images
  for update to authenticated using ((select quartosono.is_admin())) with check ((select quartosono.is_admin()));
create policy "product_images_admin_delete" on quartosono.product_images
  for delete to authenticated using ((select quartosono.is_admin()));
