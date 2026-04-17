-- ============================================================
-- MIGRACIÓN 04: Tablas pro_especialidades y pro_zonas
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── PRO_ESPECIALIDADES ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pro_especialidades (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id  UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  categoria       TEXT NOT NULL CHECK (categoria IN (
    'cerrajeria', 'plomeria', 'electricidad', 'pintura',
    'carpinteria', 'limpieza', 'jardineria', 'albanileria',
    'aire_acondicionado', 'gas', 'techos', 'soldadura',
    'muebles', 'otros'
  )),
  es_principal    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (profesional_id, categoria)
);

ALTER TABLE public.pro_especialidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Especialidades visibles para todos"
  ON public.pro_especialidades FOR SELECT USING (true);

CREATE POLICY "Profesional gestiona sus especialidades"
  ON public.pro_especialidades FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

CREATE POLICY "Profesional actualiza sus especialidades"
  ON public.pro_especialidades FOR UPDATE
  USING (auth.uid() = profesional_id);

CREATE POLICY "Profesional elimina sus especialidades"
  ON public.pro_especialidades FOR DELETE
  USING (auth.uid() = profesional_id);

CREATE INDEX IF NOT EXISTS idx_pro_especialidades_pro ON public.pro_especialidades (profesional_id);
CREATE INDEX IF NOT EXISTS idx_pro_especialidades_cat ON public.pro_especialidades (categoria);

-- Migrar categoría actual de usuarios a pro_especialidades
INSERT INTO public.pro_especialidades (profesional_id, categoria, es_principal)
SELECT id, categoria, true FROM public.usuarios
WHERE tipo = 'profesional' AND categoria IS NOT NULL
ON CONFLICT (profesional_id, categoria) DO NOTHING;

-- ─── PRO_ZONAS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pro_zonas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id  UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  departamento    TEXT DEFAULT 'Valle del Cauca',
  ciudad          TEXT DEFAULT 'Cali',
  barrio          TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (profesional_id, barrio)
);

ALTER TABLE public.pro_zonas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Zonas visibles para todos"
  ON public.pro_zonas FOR SELECT USING (true);

CREATE POLICY "Profesional gestiona sus zonas"
  ON public.pro_zonas FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

CREATE POLICY "Profesional actualiza sus zonas"
  ON public.pro_zonas FOR UPDATE
  USING (auth.uid() = profesional_id);

CREATE POLICY "Profesional elimina sus zonas"
  ON public.pro_zonas FOR DELETE
  USING (auth.uid() = profesional_id);

CREATE INDEX IF NOT EXISTS idx_pro_zonas_pro ON public.pro_zonas (profesional_id);

-- Migrar barrio actual de usuarios a pro_zonas
INSERT INTO public.pro_zonas (profesional_id, barrio)
SELECT id, barrio FROM public.usuarios
WHERE tipo = 'profesional' AND barrio IS NOT NULL
ON CONFLICT (profesional_id, barrio) DO NOTHING;
