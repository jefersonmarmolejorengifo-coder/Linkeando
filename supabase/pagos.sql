-- ============================================================
-- Tabla de pagos de Mercado Pago
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE public.pagos (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_completado_id uuid NOT NULL REFERENCES public.servicios_completados(id) ON DELETE CASCADE,
  cliente_id            uuid NOT NULL REFERENCES public.usuarios(id),
  profesional_id        uuid NOT NULL REFERENCES public.usuarios(id),
  -- Mercado Pago
  mp_preference_id      text NOT NULL,          -- ID de la preferencia creada
  mp_payment_id         text,                   -- ID del pago (llega en el callback)
  mp_status             text CHECK (mp_status IN ('approved','rejected','pending','in_process','cancelled')) DEFAULT 'pending',
  monto                 numeric(12,2) NOT NULL,
  moneda                text NOT NULL DEFAULT 'COP',
  -- Auditoría
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),
  UNIQUE (servicio_completado_id)               -- un pago por servicio
);

-- Trigger updated_at
CREATE TRIGGER pagos_updated_at
  BEFORE UPDATE ON public.pagos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pago visible para cliente y profesional"
  ON public.pagos FOR SELECT
  USING (auth.uid() = cliente_id OR auth.uid() = profesional_id);

CREATE POLICY "Cliente crea el pago"
  ON public.pagos FOR INSERT
  WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Sistema actualiza estado del pago"
  ON public.pagos FOR UPDATE
  USING (auth.uid() = cliente_id OR auth.uid() = profesional_id);

-- Índices
CREATE INDEX ON public.pagos (servicio_completado_id);
CREATE INDEX ON public.pagos (mp_payment_id);
