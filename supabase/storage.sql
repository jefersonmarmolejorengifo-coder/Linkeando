-- ============================================================
-- LINKEANDO – Storage bucket para avatares
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Crear el bucket público
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatares',
  'avatares',
  true,
  2097152,   -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Cualquiera puede ver los avatares (bucket es público)
create policy "Avatares visibles para todos"
  on storage.objects for select
  using (bucket_id = 'avatares');

-- Solo el propietario puede subir/reemplazar su avatar
-- El path debe ser: {userId}/avatar.{ext}
create policy "Usuario sube su avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatares'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Usuario actualiza su avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatares'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Usuario elimina su avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatares'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────
-- Agregar campo tarifa a usuarios (si ya ejecutaste schema.sql)
-- ─────────────────────────────────────────────────────────────
alter table public.usuarios
  add column if not exists tarifa numeric(10,2);
