-- ============================================================
-- MIGRACIÓN 05: Calificaciones 3D, Incidencias, Suscripciones, Alertas
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── CAL_PROFESIONAL (cliente califica al profesional, 3 dimensiones) ──

CREATE TABLE IF NOT EXISTS public.cal_profesional (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_completado_id  UUID NOT NULL REFERENCES public.servicios_completados(id) ON DELETE CASCADE,
  cliente_id              UUID NOT NULL REFERENCES public.usuarios(id),
  profesional_id          UUID NOT NULL REFERENCES public.usuarios(id),
  calidad                 SMALLINT NOT NULL CHECK (calidad BETWEEN 1 AND 5),
  precio                  SMALLINT NOT NULL CHECK (precio BETWEEN 1 AND 5),
  oportunidad             SMALLINT NOT NULL CHECK (oportunidad BETWEEN 1 AND 5),
  monto_mano_obra         NUMERIC(12,2),
  comentario              TEXT,
  created_at              TIMESTAMPTZ DEFAULT now(),
  UNIQUE (servicio_completado_id, cliente_id)
);

ALTER TABLE public.cal_profesional ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Calificaciones profesional públicas"
  ON public.cal_profesional FOR SELECT USING (true);

CREATE POLICY "Cliente califica al profesional"
  ON public.cal_profesional FOR INSERT
  WITH CHECK (auth.uid() = cliente_id);

CREATE INDEX IF NOT EXISTS idx_cal_pro_profesional ON public.cal_profesional (profesional_id);
CREATE INDEX IF NOT EXISTS idx_cal_pro_servicio ON public.cal_profesional (servicio_completado_id);

-- Trigger: recalcular rating_promedio del profesional desde cal_profesional
CREATE OR REPLACE FUNCTION public.actualizar_rating_3d()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.usuarios
  SET rating_promedio = (
    SELECT round(avg((calidad + precio + oportunidad)::numeric / 3.0), 2)
    FROM public.cal_profesional
    WHERE profesional_id = NEW.profesional_id
  )
  WHERE id = NEW.profesional_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cal_profesional_rating
  AFTER INSERT ON public.cal_profesional
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_rating_3d();

-- ─── CAL_CLIENTE (profesional califica al cliente, 3 dimensiones) ──

CREATE TABLE IF NOT EXISTS public.cal_cliente (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_completado_id  UUID NOT NULL REFERENCES public.servicios_completados(id) ON DELETE CASCADE,
  profesional_id          UUID NOT NULL REFERENCES public.usuarios(id),
  cliente_id              UUID NOT NULL REFERENCES public.usuarios(id),
  pago_oportuno           SMALLINT NOT NULL CHECK (pago_oportuno BETWEEN 1 AND 5),
  disponibilidad          SMALLINT NOT NULL CHECK (disponibilidad BETWEEN 1 AND 5),
  atencion                SMALLINT NOT NULL CHECK (atencion BETWEEN 1 AND 5),
  comentario              TEXT,
  created_at              TIMESTAMPTZ DEFAULT now(),
  UNIQUE (servicio_completado_id, profesional_id)
);

ALTER TABLE public.cal_cliente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Calificaciones cliente públicas"
  ON public.cal_cliente FOR SELECT USING (true);

CREATE POLICY "Profesional califica al cliente"
  ON public.cal_cliente FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

CREATE INDEX IF NOT EXISTS idx_cal_cli_cliente ON public.cal_cliente (cliente_id);

-- ─── INCIDENCIAS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.incidencias (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_completado_id  UUID REFERENCES public.servicios_completados(id) ON DELETE SET NULL,
  profesional_id          UUID NOT NULL REFERENCES public.usuarios(id),
  tipo                    TEXT NOT NULL CHECK (tipo IN ('no_show', 'pro_cancel')),
  reportado_por           UUID NOT NULL REFERENCES public.usuarios(id),
  descripcion             TEXT,
  created_at              TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.incidencias ENABLE ROW LEVEL SECURITY;

-- Incidencias visibles públicamente (solo lectura)
CREATE POLICY "Incidencias visibles para todos"
  ON public.incidencias FOR SELECT USING (true);

CREATE POLICY "Cliente reporta incidencia"
  ON public.incidencias FOR INSERT
  WITH CHECK (auth.uid() = reportado_por);

CREATE INDEX IF NOT EXISTS idx_incidencias_pro ON public.incidencias (profesional_id);

-- Trigger: incrementar total_incidencias del profesional
CREATE OR REPLACE FUNCTION public.incrementar_incidencias()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.profesionales
  SET total_incidencias = total_incidencias + 1
  WHERE usuario_id = NEW.profesional_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER incidencia_creada
  AFTER INSERT ON public.incidencias
  FOR EACH ROW EXECUTE FUNCTION public.incrementar_incidencias();

-- ─── SUSCRIPCIONES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.suscripciones (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id    UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  plan              TEXT NOT NULL CHECK (plan IN ('mensual', 'trimestral', 'semestral', 'anual')),
  mp_preapproval_id TEXT,
  estado            TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada', 'vencida')),
  monto             NUMERIC(12,2) NOT NULL,
  fecha_inicio      TIMESTAMPTZ DEFAULT now(),
  fecha_fin         TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suscripciones visibles para el profesional"
  ON public.suscripciones FOR SELECT
  USING (auth.uid() = profesional_id);

CREATE POLICY "Sistema crea suscripciones"
  ON public.suscripciones FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

CREATE INDEX IF NOT EXISTS idx_suscripciones_pro ON public.suscripciones (profesional_id);

-- ─── ALERTAS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.alertas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL,
  titulo          TEXT NOT NULL,
  mensaje         TEXT,
  leida           BOOLEAN DEFAULT false,
  referencia_id   UUID,
  referencia_tipo TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve sus propias alertas"
  ON public.alertas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Sistema crea alertas"
  ON public.alertas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuario marca alertas como leídas"
  ON public.alertas FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE INDEX IF NOT EXISTS idx_alertas_usuario ON public.alertas (usuario_id);
CREATE INDEX IF NOT EXISTS idx_alertas_leida ON public.alertas (usuario_id, leida);
