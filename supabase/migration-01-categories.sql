-- ============================================================
-- MIGRACIÓN 01: Expandir categorías de 8 a 14
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Eliminar constraint que exige categoría en profesionales
ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS profesional_requiere_categoria;

-- 2. Eliminar CHECK de categoría en usuarios
ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_categoria_check;

-- 3. Re-crear CHECK con 14 categorías
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_categoria_check
  CHECK (categoria IN (
    'cerrajeria', 'plomeria', 'electricidad', 'pintura',
    'carpinteria', 'limpieza', 'jardineria', 'albanileria',
    'aire_acondicionado', 'gas', 'techos', 'soldadura',
    'muebles', 'otros'
  ));

-- 4. Re-crear constraint profesional requiere categoría
ALTER TABLE public.usuarios ADD CONSTRAINT profesional_requiere_categoria
  CHECK (tipo = 'cliente' OR (tipo = 'profesional' AND categoria IS NOT NULL));

-- 5. Eliminar CHECK de categoría en solicitudes
ALTER TABLE public.solicitudes DROP CONSTRAINT IF EXISTS solicitudes_categoria_check;

-- 6. Re-crear CHECK con 14 categorías en solicitudes
ALTER TABLE public.solicitudes ADD CONSTRAINT solicitudes_categoria_check
  CHECK (categoria IN (
    'cerrajeria', 'plomeria', 'electricidad', 'pintura',
    'carpinteria', 'limpieza', 'jardineria', 'albanileria',
    'aire_acondicionado', 'gas', 'techos', 'soldadura',
    'muebles', 'otros'
  ));
