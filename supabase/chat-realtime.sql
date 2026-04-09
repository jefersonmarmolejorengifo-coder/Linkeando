-- ============================================================
-- Habilitar Supabase Realtime en la tabla mensajes
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Agregar mensajes a la publicación de Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE mensajes;
