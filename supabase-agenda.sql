-- Agenda de atendimentos do EmiliaCare.
-- Rode isso no SQL Editor do Supabase DEPOIS do supabase-schema.sql e do supabase-rls.sql.
-- Pode ser rodado mais de uma vez sem erro.

-- Paciente que recebeu alta deixa de aparecer na agenda, mas o histórico fica.
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

-- Horário fixo semanal de cada paciente (ex.: segunda às 14:00).
-- dia_semana segue o JavaScript: 0 = domingo ... 6 = sábado.
CREATE TABLE IF NOT EXISTS horarios_fixos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora TIME NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_horarios_fixos_dia ON horarios_fixos (dia_semana);

-- Agendamento avulso (reposição, sessão extra) numa data específica.
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  observacao VARCHAR(255),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos (data);

ALTER TABLE horarios_fixos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total para autenticados" ON horarios_fixos;
CREATE POLICY "Acesso total para autenticados" ON horarios_fixos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total para autenticados" ON agendamentos;
CREATE POLICY "Acesso total para autenticados" ON agendamentos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- A tabela consultas continua sendo o registro do atendimento: uma linha por clique em
-- "Iniciar atendimento". As colunas de áudio/IA (audio_url, transcricao_bruta,
-- evolucao_tecnica, relatorio_familia, horario_fim, duracao_minutos) deixaram de ser
-- usadas pelo app, mas não são removidas para não perder dados antigos.
