// Rodar com: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('./regras.js');

const ana = { id: 'p1', nome: 'Ana Souza', carteira_unimed: '0012345', ativo: true };
const bia = { id: 'p2', nome: 'Bia Lima', carteira_unimed: null, ativo: true };
const caio = { id: 'p3', nome: 'Caio Alta', ativo: false };

// 2026-11-16 é segunda-feira (dia_semana 1).
const SEGUNDA = '2026-11-16';

test('dataISO usa a data local, não UTC', () => {
  assert.equal(R.dataISO(new Date(2026, 10, 16, 23, 30)), '2026-11-16');
});

test('intervaloDoMes cobre o mês inteiro, inclusive fevereiro', () => {
  assert.deepEqual(R.intervaloDoMes('2026-11'), { inicio: '2026-11-01', fim: '2026-11-30' });
  assert.deepEqual(R.intervaloDoMes('2028-02'), { inicio: '2028-02-01', fim: '2028-02-29' });
});

test('agendaDoDia junta fixos do dia da semana e avulsos da data, em ordem de hora', () => {
  const fixos = [
    { id: 'h1', paciente_id: 'p1', dia_semana: 1, hora: '14:00:00' },
    { id: 'h2', paciente_id: 'p2', dia_semana: 3, hora: '09:00:00' },
  ];
  const avulsos = [
    { id: 'a1', paciente_id: 'p2', data: SEGUNDA, hora: '08:30:00' },
    { id: 'a2', paciente_id: 'p2', data: '2026-11-17', hora: '08:30:00' },
  ];
  const itens = R.agendaDoDia(SEGUNDA, [ana, bia], fixos, avulsos, []);
  assert.deepEqual(itens.map(i => [i.origem, i.paciente.nome, i.hora]), [
    ['avulso', 'Bia Lima', '08:30:00'],
    ['fixo', 'Ana Souza', '14:00:00'],
  ]);
  assert.ok(itens.every(i => i.atendimento === null));
});

test('agendaDoDia ignora horário fixo de paciente inativo', () => {
  const fixos = [{ id: 'h1', paciente_id: 'p3', dia_semana: 1, hora: '10:00:00' }];
  assert.equal(R.agendaDoDia(SEGUNDA, [caio], fixos, [], []).length, 0);
});

test('agendaDoDia liga o atendimento ao horário e mostra o que veio fora da agenda', () => {
  const fixos = [{ id: 'h1', paciente_id: 'p1', dia_semana: 1, hora: '14:00:00' }];
  const atend = [
    { id: 'c1', paciente_id: 'p1', data_atendimento: SEGUNDA, horario_inicio: '2026-11-16T17:05:00Z' },
    { id: 'c2', paciente_id: 'p2', data_atendimento: SEGUNDA, horario_inicio: '2026-11-16T19:00:00Z' },
    { id: 'c3', paciente_id: 'p1', data_atendimento: '2026-11-15', horario_inicio: '2026-11-15T17:00:00Z' },
  ];
  const itens = R.agendaDoDia(SEGUNDA, [ana, bia], fixos, [], atend);
  assert.equal(itens.length, 2);
  assert.equal(itens[0].atendimento.id, 'c1');
  assert.equal(itens[1].origem, 'extra');
  assert.equal(itens[1].atendimento.id, 'c2');
});

test('textoObservacao lista as datas em ordem e o total no plural', () => {
  const atend = [
    { data_atendimento: '2026-11-18' },
    { data_atendimento: '2026-11-04' },
    { data_atendimento: '2026-11-11' },
  ];
  assert.equal(
    R.textoObservacao(ana, '2026-11', atend),
    'Sessões de fonoaudiologia referentes a 11/2026 — Paciente: Ana Souza (Carteira Unimed 0012345). '
      + 'Datas: 04/11/2026, 11/11/2026, 18/11/2026. Total: 3 sessões.'
  );
});

test('textoObservacao no singular e sem carteira', () => {
  assert.equal(
    R.textoObservacao(bia, '2026-11', [{ data_atendimento: '2026-11-04' }]),
    'Sessões de fonoaudiologia referentes a 11/2026 — Paciente: Bia Lima. Datas: 04/11/2026. Total: 1 sessão.'
  );
});
