-- ============================================================
-- MIGRACIÓN 07 — Vinclu rebrand + features nuevos (no destructivo)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Usuarios: flag onboarding + cédula ──
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cedula    TEXT;

ALTER TABLE public.usuarios
  DROP CONSTRAINT IF EXISTS usuarios_cedula_format;
ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_cedula_format
  CHECK (cedula IS NULL OR cedula ~ '^[0-9]{5,15}$');

-- ── Profesionales: negocio fijo + descripción ──
ALTER TABLE public.profesionales
  ADD COLUMN IF NOT EXISTS negocio_fijo        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS negocio_direccion   TEXT,
  ADD COLUMN IF NOT EXISTS negocio_descripcion TEXT;

-- ── Mensajes: soporte para notas de voz e imágenes ──
ALTER TABLE public.mensajes
  ADD COLUMN IF NOT EXISTS tipo         TEXT DEFAULT 'texto',
  ADD COLUMN IF NOT EXISTS voz_url      TEXT,
  ADD COLUMN IF NOT EXISTS voz_duracion SMALLINT;

ALTER TABLE public.mensajes
  DROP CONSTRAINT IF EXISTS mensajes_tipo_check;
ALTER TABLE public.mensajes
  ADD CONSTRAINT mensajes_tipo_check
  CHECK (tipo IN ('texto','voz','imagen'));

ALTER TABLE public.mensajes
  DROP CONSTRAINT IF EXISTS mensajes_voz_duracion_check;
ALTER TABLE public.mensajes
  ADD CONSTRAINT mensajes_voz_duracion_check
  CHECK (voz_duracion IS NULL OR (voz_duracion > 0 AND voz_duracion <= 300));

-- ── Postulaciones: nota de voz del profesional ──
ALTER TABLE public.postulaciones
  ADD COLUMN IF NOT EXISTS voz_url      TEXT,
  ADD COLUMN IF NOT EXISTS voz_duracion SMALLINT;

ALTER TABLE public.postulaciones
  DROP CONSTRAINT IF EXISTS postulaciones_voz_duracion_check;
ALTER TABLE public.postulaciones
  ADD CONSTRAINT postulaciones_voz_duracion_check
  CHECK (voz_duracion IS NULL OR (voz_duracion > 0 AND voz_duracion <= 300));

-- ── Solicitudes: campo dirección explícito ──
ALTER TABLE public.solicitudes
  ADD COLUMN IF NOT EXISTS direccion TEXT;

-- ── Índice para precio reportado por cliente ──
CREATE INDEX IF NOT EXISTS idx_cal_pro_monto
  ON public.cal_profesional (profesional_id, monto_mano_obra)
  WHERE monto_mano_obra IS NOT NULL;

-- ── Bucket de notas de voz (5 MB, privado) ──
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-notes','voice-notes', FALSE, 5242880,
  ARRAY['audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- RLS de objetos en voice-notes: path debe empezar con userId
DROP POLICY IF EXISTS "voice-notes insert owner" ON storage.objects;
CREATE POLICY "voice-notes insert owner"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "voice-notes update owner" ON storage.objects;
CREATE POLICY "voice-notes update owner"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "voice-notes delete owner" ON storage.objects;
CREATE POLICY "voice-notes delete owner"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Lectura: cualquier autenticado (server actions entregan URLs firmadas)
DROP POLICY IF EXISTS "voice-notes read authenticated" ON storage.objects;
CREATE POLICY "voice-notes read authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'voice-notes');

-- ── Índices para rendimiento ──
CREATE INDEX IF NOT EXISTS idx_mensajes_tipo     ON public.mensajes (solicitud_id, tipo);
CREATE INDEX IF NOT EXISTS idx_postulaciones_voz ON public.postulaciones (solicitud_id) WHERE voz_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profesionales_neg ON public.profesionales (negocio_fijo) WHERE negocio_fijo = TRUE;
