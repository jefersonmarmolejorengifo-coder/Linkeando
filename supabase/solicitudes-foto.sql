-- ============================================================
-- Agregar foto_url a solicitudes + bucket de storage
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Columna foto en solicitudes
ALTER TABLE public.solicitudes
  ADD COLUMN IF NOT EXISTS foto_url text;

-- 2. Bucket para fotos de solicitudes (público, máx 5 MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'solicitudes',
  'solicitudes',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas RLS del bucket
CREATE POLICY "Fotos solicitudes públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'solicitudes');

CREATE POLICY "Cliente sube foto solicitud"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'solicitudes'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Cliente reemplaza foto solicitud"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'solicitudes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Cliente elimina foto solicitud"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'solicitudes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
