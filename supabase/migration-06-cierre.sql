-- ============================================================
-- MIGRACIÓN 06: Campo cierre_tipo en servicios_completados
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Agregar columna cierre_tipo
ALTER TABLE public.servicios_completados
  ADD COLUMN IF NOT EXISTS cierre_tipo TEXT DEFAULT 'satisfactorio'
  CHECK (cierre_tipo IN ('satisfactorio', 'cancel_cliente', 'no_show', 'pro_cancel'));

-- 2. Agregar columna sid
ALTER TABLE public.servicios_completados
  ADD COLUMN IF NOT EXISTS sid TEXT UNIQUE;

-- 3. Función para generar SID en servicios_completados
CREATE OR REPLACE FUNCTION public.generar_sid_servicio()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  sol_sid TEXT;
BEGIN
  -- Usar el mismo SID de la solicitud asociada
  SELECT sid INTO sol_sid FROM public.solicitudes WHERE id = NEW.solicitud_id;
  IF sol_sid IS NOT NULL THEN
    NEW.sid := sol_sid;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS servicio_generar_sid ON public.servicios_completados;
CREATE TRIGGER servicio_generar_sid
  BEFORE INSERT ON public.servicios_completados
  FOR EACH ROW
  WHEN (NEW.sid IS NULL)
  EXECUTE FUNCTION public.generar_sid_servicio();

-- 4. Actualizar servicios existentes con el SID de su solicitud
UPDATE public.servicios_completados sc
SET sid = s.sid
FROM public.solicitudes s
WHERE sc.solicitud_id = s.id AND sc.sid IS NULL AND s.sid IS NOT NULL;
