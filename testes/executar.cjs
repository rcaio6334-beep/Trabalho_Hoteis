const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Hotel = require('../hotel.js');

const base = { nome: 'Ana Silva', email: 'ana@example.com', quarto: '101',
  entrada: '2026-12-10', saida: '2026-12-13', pessoas: 2 };
const falha = (fn, msg) => assert.throws(fn, e => e.message.includes(msg));

const testes = [
  ['CT01', () => { const r = Hotel.criar([], base); assert.equal(r.length, 1); assert.equal(r[0].id, 1);
    assert.equal(r[0].nome, 'Ana Silva'); assert.equal(r[0].status, 'Ativa'); assert.equal(r[0].total, 540); }],
  ['CT02', () => { const v = []; falha(() => Hotel.criar(v, {...base, nome: ''}), 'nome'); assert.equal(v.length, 0); }],
  ['CT03', () => assert.deepEqual(Hotel.consultar([], base.entrada, base.saida, 2).map(q => q.id), ['101','201','301'])],
  ['CT04', () => { const v = Hotel.criar([], base);
    assert.deepEqual(Hotel.consultar(v, '2026-12-11', '2026-12-14', 2).map(q => q.id), ['201','301']);
    falha(() => Hotel.criar(v, {...base, entrada: '2026-12-11', saida: '2026-12-14'}), 'indispon');
    assert.equal(v.length, 1); }],
  ['CT05', () => { let v = Hotel.criar([], base); v = Hotel.cancelar(v, 1);
    assert.equal(v[0].status, 'Cancelada');
    assert.equal(Hotel.consultar(v, base.entrada, base.saida, 2).length, 3);
    assert.equal(v.filter(r => r.status === 'Ativa').length, 0); }],
  ['CT06', () => falha(() => Hotel.cancelar([], 999), 'Reserva ativa não encontrada')],
  ['CT07', () => assert.deepEqual(Hotel.calcular('101', '2026-12-10', '2026-12-13'), {noites: 3, total: 540})],
  ['CT08', () => falha(() => Hotel.calcular('101', '2026-12-10', '2026-12-10'), 'posterior')],
  ['CT09', () => { let v = Hotel.criar([], base);
    v = Hotel.criar(v, {...base, entrada: '2026-12-13', saida: '2026-12-14'});
    assert.equal(v.length, 2); assert.equal(v[1].total, 180); }],
  ['CT10', () => falha(() => Hotel.calcular('101', '2026-02-30', '2026-03-04'), 'data válida')],
  ['CT11', () => { const v = []; falha(() => Hotel.criar(v, {...base, email: 'ana@'}), 'e-mail'); assert.equal(v.length, 0); }],
  ['CT12', () => { assert.deepEqual(Hotel.consultar([], base.entrada, base.saida, 4).map(q => q.id), ['301']);
    falha(() => Hotel.criar([], {...base, pessoas: 4}), 'incompat'); }],
];

const resultados = []; let falhou = false;
for (const [id, fn] of testes) {
  try { fn(); resultados.push({id, status: 'Aprovado'}); console.log(`${id}: Aprovado`); }
  catch (e) { falhou = true; resultados.push({id, status: 'Reprovado', erro: e.message}); console.log(`${id}: Reprovado - ${e.message}`); }
}
fs.writeFileSync(path.join(__dirname, 'resultados.json'), JSON.stringify(resultados, null, 2));
if (falhou) process.exit(1);
