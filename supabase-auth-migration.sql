-- ============================================================
-- MiBarber - Migración a Multi-usuario con Supabase Auth
-- ============================================================
-- Copia y pega este contenido en el SQL Editor de tu proyecto en Supabase
-- (https://supabase.com/dashboard/project/_/sql) y presiona RUN.

-- 1. Agregar la columna user_id vinculada a auth.users
ALTER TABLE public.cortes 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Si se inserta un nuevo corte sin especificar user_id, toma el usuario autenticado automáticamente:
ALTER TABLE public.cortes 
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. Crear índice para optimizar consultas filtradas por usuario
CREATE INDEX IF NOT EXISTS idx_cortes_user_id ON public.cortes (user_id);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.cortes ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas públicas anteriores si existían
DROP POLICY IF EXISTS "Permitir lectura publica de cortes" ON public.cortes;
DROP POLICY IF EXISTS "Permitir creacion publica de cortes" ON public.cortes;
DROP POLICY IF EXISTS "Permitir actualizacion publica de cortes" ON public.cortes;
DROP POLICY IF EXISTS "Permitir eliminacion publica de cortes" ON public.cortes;
DROP POLICY IF EXISTS "Usuarios ven sus propios cortes" ON public.cortes;
DROP POLICY IF EXISTS "Usuarios crean sus propios cortes" ON public.cortes;
DROP POLICY IF EXISTS "Usuarios actualizan sus propios cortes" ON public.cortes;
DROP POLICY IF EXISTS "Usuarios eliminan sus propios cortes" ON public.cortes;

-- 5. Crear políticas de seguridad para usuarios autenticados:
-- Cada usuario solo puede ver, insertar, modificar y eliminar sus propios registros.

-- Lectura:
CREATE POLICY "Usuarios ven sus propios cortes" 
ON public.cortes FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Inserción:
CREATE POLICY "Usuarios crean sus propios cortes" 
ON public.cortes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Actualización:
CREATE POLICY "Usuarios actualizan sus propios cortes" 
ON public.cortes FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Eliminación:
CREATE POLICY "Usuarios eliminan sus propios cortes" 
ON public.cortes FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- ============================================================
-- PASO OPCIONAL (PARA NO PERDER TUS CORTES EXISTENTES):
-- ============================================================
-- Si ya tenías cortes cargados en la base de datos antes de activar
-- las cuentas, una vez que te registres en la app con tu email,
-- podés asignarte todos los cortes antiguos ejecutando esta consulta
-- (reemplazando 'tu_email@ejemplo.com' por el correo con el que te registraste):
--
-- UPDATE public.cortes 
-- SET user_id = (SELECT id FROM auth.users WHERE email = 'tu_email@ejemplo.com') 
-- WHERE user_id IS NULL;
-- ============================================================
