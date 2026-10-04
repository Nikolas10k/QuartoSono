insert into quartosono.categories (name, slug, position) values
  ('Colchões',      'colchoes',      1),
  ('Conjuntos Box', 'conjuntos-box', 2),
  ('Camas',         'camas',         3),
  ('Cabeceiras',    'cabeceiras',    4),
  ('Sofás',         'sofas',         5),
  ('Outros',        'outros',        6)
on conflict (slug) do nothing;
