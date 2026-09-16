-- ============================================================
-- MiBarber - Script de creación de tabla en Supabase PostgreSQL
-- ============================================================
-- Copia y pega este contenido en el SQL Editor de tu proyecto en Supabase:

-- 1. Crear tabla de cortes
CREATE TABLE IF NOT EXISTS public.cortes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    cliente_nombre VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    hora VARCHAR(10) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estado_pago VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    fecha_pago TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_cortes_user_id ON public.cortes (user_id);
CREATE INDEX IF NOT EXISTS idx_cortes_fecha ON public.cortes (fecha);
CREATE INDEX IF NOT EXISTS idx_cortes_estado_pago ON public.cortes (estado_pago);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.cortes ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acceso seguras por usuario autenticado (Supabase Auth)
CREATE POLICY "Usuarios ven sus propios cortes" 
ON public.cortes FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus propios cortes" 
ON public.cortes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus propios cortes" 
ON public.cortes FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Solo eliminar cortes propios
CREATE POLICY "Usuarios eliminan sus propios cortes" 
ON public.cortes FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

