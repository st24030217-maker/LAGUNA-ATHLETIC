
CREATE TABLE IF NOT EXISTS public.players (
    id BIGINT PRIMARY KEY,
    number INT NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    position_alt TEXT,
    player_group TEXT DEFAULT 'Sin Cat.',
    status TEXT DEFAULT 'Ausente',
    checkin_time TEXT DEFAULT '-',
    attendance_pct NUMERIC(5,2) DEFAULT 0,
    streak TEXT DEFAULT '0 A',
    starter BOOLEAN DEFAULT false,
    injured BOOLEAN DEFAULT false,
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    mins INT DEFAULT 0,
    cards INT DEFAULT 0,
    reg_status TEXT DEFAULT 'Activo',
    birthdate DATE,
    tutor_name TEXT,
    phone TEXT,
    photo TEXT DEFAULT 'LAGUNA.jpg',
    contacts JSONB DEFAULT '[]'::jsonb,
    doc_acta BOOLEAN DEFAULT false,
    doc_curp BOOLEAN DEFAULT false,
    doc_medico BOOLEAN DEFAULT false,
    doc_ine BOOLEAN DEFAULT false,
    doc_escolar BOOLEAN DEFAULT false,
    game_info JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: PAGOS Y FINANZAS (payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id BIGINT PRIMARY KEY,
    folio TEXT NOT NULL UNIQUE,
    player_id BIGINT REFERENCES public.players(id) ON DELETE SET NULL,
    player_name TEXT NOT NULL,
    tutor_name TEXT,
    concept TEXT NOT NULL,
    base_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_pct NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    final_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    method TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendiente',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: CALENDARIO Y PARTIDOS (calendar_events)
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id BIGINT PRIMARY KEY,
    type TEXT NOT NULL, -- 'partido', 'entrenamiento', 'evento'
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    result TEXT,
    match_stats JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: ENFERMERÍA Y BAJAS MÉDICAS (injuries)
CREATE TABLE IF NOT EXISTS public.injuries (
    id BIGINT PRIMARY KEY,
    player_id BIGINT REFERENCES public.players(id) ON DELETE CASCADE,
    player TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    start_date DATE NOT NULL,
    estimated_return DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'En Tratamiento', -- 'En Tratamiento', 'Alta Médica'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: HISTORIAL DIARIO DE ASISTENCIA (attendance_logs)
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    player_id BIGINT REFERENCES public.players(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Presente', 'Ausente', 'Justificado'
    checkin_time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HABILITACIÓN DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ============================================================================
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura públicas para la API Key
CREATE POLICY "Permitir todo en players" ON public.players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en calendar_events" ON public.calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en injuries" ON public.injuries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en attendance_logs" ON public.attendance_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- HABILITAR REALTIME (CAMBIOS EN VIVO MULTI-DISPOSITIVO)
-- ============================================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players, public.payments, public.calendar_events, public.injuries, public.attendance_logs;
