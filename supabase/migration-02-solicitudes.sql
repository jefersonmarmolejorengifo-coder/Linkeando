-- ============================================================
-- MIGRACIÓN 02: Campos nuevos en solicitudes + SID auto-generado
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Agregar columnas nuevas
ALTER TABLE public.solicitudes ADD COLUMN IF NOT EXISTS sid TEXT UNIQUE;
ALTER TABLE public.solicitudes ADD COLUMN IF NOT EXISTS modalidad TEXT DEFAULT 'puntual';
ALTER TABLE public.solicitudes ADD COLUMN IF NOT EXISTS cuando TEXT;
ALTER TABLE public.solicitudes ADD COLUMN IF NOT EXISTS urgente BOOLEAN DEFAULT false;
ALTER TABLE public.solicitudes ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 2. Crear secuencia para SID
CREATE SEQUENCE IF NOT EXISTS public.solicitud_sid_seq START 1;

-- 3. Función para generar SID formato LNK-YYMM-XXXX
CREATE OR REPLACE FUNCTION public.generar_sid_solicitud()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  yymm TEXT;
  seq_num INT;
BEGIN
  yymm := to_char(now(), 'YYMM');
  seq_num := nextval('public.solicitud_sid_seq');
  NEW.sid := 'LNK-' || yymm || '-' || lpad(seq_num::text, 4, '0');
  RETURN NEW;
END;
$$;

-- 4. Trigger para auto-generar SID en cada inserción
DROP TRIGGER IF EXISTS solicitud_generar_sid ON public.solicitudes;
CREATE TRIGGER solicitud_generar_sid
  BEFORE INSERT ON public.solicitudes
  FOR EACH ROW
  WHEN (NEW.sid IS NULL)
  EXECUTE FUNCTION public.generar_sid_solicitud();

-- 5. Generar SID para solicitudes existentes que no lo tengan
UPDATE public.solicitudes
SET sid = 'LNK-' || to_char(created_at, 'YYMM') || '-' || lpad((row_number() OVER (ORDER BY created_at))::text, 4, '0')
WHERE sid IS NULL;
