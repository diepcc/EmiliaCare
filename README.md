# EmiliaCare — agenda e registro de atendimentos de fonoaudiologia

App web (PWA, uma página só) para:

1. **Cadastrar pacientes** (dados pessoais, responsável, carteira Unimed, endereço).
2. **Montar a agenda**: horários fixos semanais de cada paciente e agendamentos avulsos (reposição, sessão extra).
3. **Registrar o atendimento** com um clique em **Iniciar** ao chegar no paciente. Não há "finalizar": o clique é o registro.
4. **Gerar a observação da nota fiscal** do mês, por paciente: as datas (dd/mm/aaaa) e o total de sessões, prontas para copiar.

## Arquivos

| Arquivo | O quê |
|---|---|
| `index.html` | O app inteiro (telas + acesso ao Supabase). |
| `regras.js` | Regras sem tela nem banco: agenda do dia, texto da observação, datas. |
| `regras.test.js` | Testes unitários das regras (`node --test`). |
| `supabase-schema.sql` | Tabelas `pacientes` e `consultas` (instalação inicial). |
| `supabase-rls.sql` | Segurança: só usuário logado lê/grava. |
| `supabase-agenda.sql` | **Novo:** coluna `pacientes.ativo`, tabelas `horarios_fixos` e `agendamentos` com RLS. |

## Instalação no Supabase

No SQL Editor, nesta ordem (o terceiro pode rodar mais de uma vez):

1. `supabase-schema.sql` (se ainda não foi rodado)
2. `supabase-rls.sql` (se ainda não foi rodado)
3. `supabase-agenda.sql`

Depois, preencher `SUPABASE_URL` e `SUPABASE_KEY` (a chave **anon**) no início do `<script>` do `index.html`, e criar o usuário em Authentication > Users.

O bucket `audios-evolucoes` e a chave da Groq deixaram de ser necessários.

## Telas

- **Hoje**: lista do dia em ordem de horário (fixos daquele dia da semana + avulsos da data). Cada linha tem **▶️ Iniciar**; depois do clique aparece "✓ Iniciado às hh:mm" e um **desfazer** para clique errado. Dá para navegar para outros dias: em dia passado o botão vira **Registrar** (para quando esqueceu de clicar, usa o horário agendado), em dia futuro só mostra "Agendado". Embaixo, **Atendimento fora da agenda** registra uma sessão de qualquer paciente ativo.
- **Agenda**: cadastro e lista dos agendamentos avulsos a partir de hoje, e o resumo da semana fixa.
- **Pacientes**: cadastro e edição. Ao salvar, abre o painel de **horários fixos semanais** do paciente (dia + hora, quantos quiser). Desmarcar **Ativo** na alta tira o paciente da agenda sem apagar o histórico.
- **Nota fiscal**: paciente + mês → lista das sessões, total e o texto da observação, com botão **Copiar**. Pacientes inativos continuam na lista (alta no meio do mês).

## Regras

- Cada clique em Iniciar grava uma linha em `consultas` (`paciente_id`, `data_atendimento`, `horario_inicio`). O total da nota é a quantidade dessas linhas no mês; dois atendimentos no mesmo dia contam como duas sessões e a data aparece duas vezes.
- A data gravada é a **local** do aparelho, não a do servidor em UTC (senão um atendimento depois das 21h cairia no dia seguinte).
- Na tela do dia, o atendimento é ligado ao horário do mesmo paciente; o que não tiver horário aparece como "Fora da agenda".
- Formato da observação:

  > Sessões de fonoaudiologia referentes a 11/2026 — Paciente: Ana Souza (Carteira Unimed 0012345). Datas: 04/11/2026, 11/11/2026, 18/11/2026. Total: 3 sessões.

## O que saiu

A gravação de áudio, a transcrição (Groq/Whisper) e a evolução gerada por IA foram removidas do app. As colunas antigas de `consultas` (`audio_url`, `transcricao_bruta`, `evolucao_tecnica`, `relatorio_familia`, `horario_fim`, `duracao_minutos`) continuam no banco, sem uso, para não perder dados.

## Testes

```bash
node --test
```
