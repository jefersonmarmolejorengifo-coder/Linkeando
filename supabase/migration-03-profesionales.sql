-- ============================================================
-- MIGRACIÓN 03: Tabla profesionales (perfil extendido)
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Crear tabla profesionales
CREATE TABLE IF NOT EXISTS public.profesionales (
  usuario_id    UUID PRIMARY KEY REFERENCES public.usuarios(id) ON DELETE CASCADE,
  bio           TEXT,
  anos_experiencia INTEGER DEFAULT 0,
  disponible    BOOLEAN DEFAULT true,
  radio_km      NUMERIC(5,1) DEFAULT 10.0,
  lat_base      DOUBLE PRECISION,
  lng_base      DOUBLE PRECISION,
  es_premium    BOOLEAN DEFAULT false,
  premium_hasta TIMESTAMPTZ,
  total_incidencias INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS
ALTER TABLE public.profesionales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profesionales visibles para todos"
  ON public.profesionales FOR SELECT USING (true);

CREATE POLICY "Profesional crea su propio perfil"
  ON public.profesionales FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Profesional edita su propio perfil"
  ON public.profesionales FOR UPDATE
  USING (auth.uid() = usuario_id);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_profesionales_disponible ON public.profesionales (disponible);
CREATE INDEX IF NOT EXISTS idx_profesionales_es_premium ON public.profesionales (es_premium);

-- 4. Insertar registros para profesionales existentes que no tengan perfil extendido
INSERT INTO public.profesionales (usuario_id, lat_base, lng_base)
SELECT id, lat, lng FROM public.usuarios
WHERE tipo = 'profesional'
  AND id NOT IN (SELECT usuario_id FROM public.profesionales)
ON CONFLICT (usuario_id) DO NOTHING;
