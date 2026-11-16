-- Schema inicial do EmiliaCare.
-- Rode isso no SQL Editor do Supabase ANTES do supabase-rls.sql.

-- Tabela de Pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  carteira_unimed VARCHAR(50),
  telefone_responsavel VARCHAR(20),
  email_responsavel VARCHAR(255),
  logradouro VARCHAR(255),
  numero VARCHAR(20),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Consultas / Atendimentos
CREATE TABLE consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  data_atendimento DATE DEFAULT CURRENT_DATE,
  horario_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  horario_fim TIMESTAMP WITH TIME ZONE,
  duracao_minutos INTEGER,
  audio_url TEXT,
  transcricao_bruta TEXT,
  evolucao_tecnica TEXT,
  relatorio_familia TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para acelerar o filtro do Relatório Mensal Unimed (paciente + mês)
CREATE INDEX idx_consultas_paciente_data ON consultas (paciente_id, data_atendimento);

-- Storage: criar manualmente em Storage > New bucket
-- Nome: "audios-evolucoes" (pode ser privado — veja supabase-rls.sql)
