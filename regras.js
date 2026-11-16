// Regras do EmiliaCare que não dependem de tela nem de banco.
// No navegador ficam em window.Regras; no Node (testes) em module.exports.
(function (Regras) {
  const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  // Data local no formato do banco (YYYY-MM-DD). toISOString() usaria UTC e,
  // à noite no Brasil, já cairia no dia seguinte.
  function dataISO(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // "2026-11-03" -> "03/11/2026"
  function fmtData(iso) {
    if (!iso) return '-';
    const [a, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${a}`;
  }

  // "14:00:00" -> "14:00"
  function fmtHora(hora) {
    return hora ? hora.slice(0, 5) : '-';
  }

  function diaDaSemana(iso) {
    const [a, m, d] = iso.split('-').map(Number);
    return new Date(a, m - 1, d).getDay();
  }

  // "2026-11" -> { inicio: "2026-11-01", fim: "2026-11-30" }
  function intervaloDoMes(mesAno) {
    const [a, m] = mesAno.split('-').map(Number);
    return { inicio: dataISO(new Date(a, m - 1, 1)), fim: dataISO(new Date(a, m, 0)) };
  }

  // Monta a lista do dia: horários fixos daquele dia da semana (só pacientes ativos),
  // agendamentos avulsos da data e, para cada um, o atendimento já registrado.
  // Atendimento sem horário correspondente entra como "extra", para não sumir da tela.
  function agendaDoDia(data, pacientes, horariosFixos, agendamentos, atendimentos) {
    const porId = new Map(pacientes.map(p => [p.id, p]));
    const dia = diaDaSemana(data);
    const itens = [];

    horariosFixos
      .filter(h => h.dia_semana === dia && porId.get(h.paciente_id)?.ativo !== false)
      .forEach(h => itens.push({ origem: 'fixo', hora: h.hora, paciente_id: h.paciente_id, ref_id: h.id }));

    agendamentos
      .filter(a => a.data === data)
      .forEach(a => itens.push({ origem: 'avulso', hora: a.hora, paciente_id: a.paciente_id, ref_id: a.id, observacao: a.observacao }));

    itens.sort((x, y) => x.hora.localeCompare(y.hora));

    const pendentes = atendimentos
      .filter(c => c.data_atendimento === data)
      .sort((x, y) => (x.horario_inicio || '').localeCompare(y.horario_inicio || ''));

    itens.forEach(item => {
      const i = pendentes.findIndex(c => c.paciente_id === item.paciente_id);
      item.atendimento = i >= 0 ? pendentes.splice(i, 1)[0] : null;
    });

    pendentes.forEach(c => itens.push({ origem: 'extra', hora: null, paciente_id: c.paciente_id, atendimento: c }));

    itens.forEach(item => { item.paciente = porId.get(item.paciente_id) || null; });
    return itens;
  }

  // Texto para o campo de observação da nota fiscal de um paciente no mês.
  function textoObservacao(paciente, mesAno, atendimentos) {
    const [a, m] = mesAno.split('-');
    const datas = atendimentos
      .map(c => c.data_atendimento)
      .sort()
      .map(fmtData);
    const total = datas.length;
    const carteira = paciente.carteira_unimed ? ` (Carteira Unimed ${paciente.carteira_unimed})` : '';

    return `Sessões de fonoaudiologia referentes a ${m}/${a} — Paciente: ${paciente.nome}${carteira}. `
      + `Datas: ${datas.join(', ')}. `
      + `Total: ${total} ${total === 1 ? 'sessão' : 'sessões'}.`;
  }

  Object.assign(Regras, { DIAS_SEMANA, dataISO, fmtData, fmtHora, diaDaSemana, intervaloDoMes, agendaDoDia, textoObservacao });
})(typeof module !== 'undefined' ? module.exports : (window.Regras = {}));
