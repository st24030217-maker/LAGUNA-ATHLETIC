-- ==============================================================================
-- ⚠️  ARCHIVO OBSOLETO – NO EJECUTAR EN PRODUCCIÓN
-- ==============================================================================
--
-- Este archivo fue la versión inicial del esquema de base de datos de
-- LAGUNA ATHLETIC. Tiene políticas de seguridad abiertas (FOR ALL USING true)
-- que exponen todos los datos sin autenticación, lo cual es un riesgo grave.
--
-- ✅ USA EN SU LUGAR: supabase_secure_setup.sql
--    - Autenticación obligatoria via Supabase Auth
--    - Roles diferenciados: admin, director, coach, player, guardian
--    - Políticas RLS granulares por tabla y por rol
--    - Funciones de seguridad con SECURITY DEFINER
--
-- Si tu base de datos actual aún usa el esquema viejo (ejecutado desde este
-- archivo), debes migrar ejecutando supabase_secure_setup.sql en el
-- SQL Editor de Supabase. Ese script usa CREATE TABLE IF NOT EXISTS y
-- DROP POLICY IF EXISTS, por lo que es seguro ejecutarlo sobre un proyecto
-- existente sin perder datos.
--
-- ==============================================================================
-- FIN DEL ARCHIVO – no hay SQL ejecutable aquí.
-- ==============================================================================

-- ⛔ Salvaguarda: este bloque aborta la ejecución si alguien corre este archivo
-- por error, garantizando que jamás se aplique el esquema inseguro a la BD.
DO $$
BEGIN
    RAISE EXCEPTION 'ARCHIVO OBSOLETO: supabase_schema.sql NO debe ejecutarse. Usa supabase_secure_setup.sql en su lugar.';
END $$;
