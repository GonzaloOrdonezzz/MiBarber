-- ============================================================
-- MiBarber - Habilitar Acceso Multi-Usuario a los Cortes
-- ============================================================
-- Copia y pega este comando en el SQL Editor de tu proyecto en Supabase y presiona RUN:

ALTER TABLE public.cortes DISABLE ROW LEVEL SECURITY;

-- Verificar que todos los cortes pertenezcan a Gonzalo:
UPDATE public.cortes 
SET user_id = 'efb95d5d-072f-4644-bb3a-9d1f086cd6af'
WHERE user_id IS NULL;
