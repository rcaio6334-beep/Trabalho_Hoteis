(function (root) {
  'use strict';
  const quartos = [
    { id: '101', nome: 'Standard', capacidade: 2, diaria: 180 },
    { id: '201', nome: 'Superior', capacidade: 3, diaria: 260 },
    { id: '301', nome: 'Família', capacidade: 4, diaria: 340 }
  ];
  function dia(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor || '')) throw Error('Informe uma data válida.');
    const t = Date.parse(valor + 'T00:00:00Z');
    if (!Number.isFinite(t) || new Date(t).toISOString().slice(0, 10) !== valor)
      throw Error('Informe uma data válida.');
    return t;
  }
  function periodo(entrada, saida) {
    const noites = (dia(saida) - dia(entrada)) / 86400000;
    if (noites <= 0) throw Error('A saída deve ser posterior à entrada.');
    return noites;
  }
  function consultar(reservas, entrada, saida, pessoas) {
    periodo(entrada, saida);
    if (!Number.isInteger(Number(pessoas)) || Number(pessoas) < 1 || Number(pessoas) > 4)
      throw Error('Informe de 1 a 4 hóspedes.');
    return quartos.filter(q => q.capacidade >= Number(pessoas) && !reservas.some(r =>
      r.status === 'Ativa' && r.quarto === q.id && entrada < r.saida && saida > r.entrada));
  }
  function calcular(quarto, entrada, saida) {
    const q = quartos.find(q => q.id === quarto);
    if (!q) throw Error('Quarto inválido.');
    return { noites: periodo(entrada, saida), total: periodo(entrada, saida) * q.diaria };
  }
  function criar(reservas, dados) {
    const nome = String(dados.nome || '').trim();
    const email = String(dados.email || '').trim();
    if (nome.length < 3) throw Error('Informe o nome completo (mínimo de 3 caracteres).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('Informe um e-mail válido.');
    const disponiveis = consultar(reservas, dados.entrada, dados.saida, dados.pessoas);
    if (!disponiveis.some(q => q.id === dados.quarto))
      throw Error('Quarto indisponível ou incompatível com a quantidade de hóspedes.');
    const id = reservas.reduce((m, r) => Math.max(m, r.id), 0) + 1;
    const reserva = {id, nome, email, quarto: dados.quarto, entrada: dados.entrada,
      saida: dados.saida, pessoas: Number(dados.pessoas), status: 'Ativa',
      ...calcular(dados.quarto, dados.entrada, dados.saida)};
    return [...reservas, reserva];
  }
  function cancelar(reservas, id) {
    if (!reservas.some(r => r.id === id && r.status === 'Ativa'))
      throw Error('Reserva ativa não encontrada.');
    return reservas.map(r => r.id === id ? {...r, status: 'Cancelada'} : r);
  }
  const api = { quartos, dia, periodo, consultar, calcular, criar, cancelar };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Hotel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
