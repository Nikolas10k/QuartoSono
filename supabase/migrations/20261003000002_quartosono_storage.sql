-- Bucket exclusivo do Quarto Sono. Caminho: products/{product-id}/image-NN.webp
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('quartosono', 'quartosono', true, 10485760, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Leitura pública acontece pela URL pública do bucket (sem listagem).
-- Escrita, listagem e remoção: somente admins do Quarto Sono.
create policy "quartosono_admin_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'quartosono' and (select quartosono.is_admin()));

create policy "quartosono_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'quartosono' and (select quartosono.is_admin()));

create policy "quartosono_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'quartosono' and (select quartosono.is_admin()))
  with check (bucket_id = 'quartosono' and (select quartosono.is_admin()));

create policy "quartosono_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'quartosono' and (select quartosono.is_admin()));
