-- Habilita Row Level Security e restringe o acesso a usuários autenticados.
-- Rode isso no SQL Editor do Supabase (sem isso, a anon key exposta no
-- index.html dá acesso total de leitura/escrita às tabelas pra qualquer um).

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso total para autenticados" ON pacientes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total para autenticados" ON consultas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
