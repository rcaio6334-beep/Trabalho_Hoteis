'use strict';
(() => {
  const $ = id => document.getElementById(id);
  let reservas = [];
  const dinheiro = valor => valor.toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
  const dados = () => Object.fromEntries(new FormData($('reserva')));
  function avisar(texto, erro = false) {
    $('mensagem').textContent = texto;
    $('mensagem').className = erro ? 'erro' : 'sucesso';
  }
  function elemento(tag, texto) { const el = document.createElement(tag); el.textContent = texto; return el; }
  function listar() {
    $('lista').replaceChildren();
    const ativas = reservas.filter(r => r.status === 'Ativa');
    $('resumo').textContent = `${ativas.length} reserva(s) ativa(s) · Total previsto: ${dinheiro(ativas.reduce((s,r)=>s+r.total,0))}`;
    if (!reservas.length) $('lista').append(elemento('p','Nenhuma reserva cadastrada.'));
    for (const r of reservas) {
      const item = document.createElement('article'); item.dataset.id = r.id;
      item.append(elemento('h3',`Reserva #${r.id} · ${r.status}`),
        elemento('p',`${r.nome} · ${r.email}`),
        elemento('p',`Quarto ${r.quarto} · ${r.entrada} a ${r.saida} · ${r.pessoas} hóspede(s)`),
        elemento('p',`${r.noites} diária(s) · ${dinheiro(r.total)}`));
      if (r.status === 'Ativa') {
        const botao = elemento('button',`Cancelar reserva #${r.id}`); botao.type = 'button';
        botao.addEventListener('click',()=>{
          try {
            reservas = Hotel.cancelar(reservas,r.id); listar(); $('disponibilidade').replaceChildren();
            avisar(`Reserva #${r.id} cancelada. O quarto voltou a ficar disponível.`);
          } catch(e){avisar(e.message,true);}
        });
        item.append(botao);
      }
      $('lista').append(item);
    }
  }
  function estimar() {
    const d = dados(); $('disponibilidade').replaceChildren();
    try {
      const c = Hotel.calcular(d.quarto,d.entrada,d.saida);
      $('estimativa').textContent = `${c.noites} diária(s) · Total: ${dinheiro(c.total)}`;
    } catch(e){$('estimativa').textContent = 'Selecione um período válido para calcular o total.';}
  }
  $('reserva').addEventListener('input',estimar);
  $('reserva').addEventListener('change',estimar);
  $('consultar').addEventListener('click',()=>{
    try {
      const d=dados(), livres=Hotel.consultar(reservas,d.entrada,d.saida,d.pessoas);
      $('disponibilidade').replaceChildren(...livres.map(q=>elemento('li',`${q.id} · ${q.nome} · ${dinheiro(q.diaria)} por diária`)));
      avisar(`${livres.length} quarto(s) disponível(is) para o período e a quantidade de hóspedes.`);
    } catch(e){$('disponibilidade').replaceChildren();avisar(e.message,true);}
  });
  $('reserva').addEventListener('submit',ev=>{
    ev.preventDefault();
    try {
      reservas=Hotel.criar(reservas,dados()); listar(); $('disponibilidade').replaceChildren();
      avisar(`Reserva #${reservas.at(-1).id} confirmada com sucesso.`);
    } catch(e){avisar(e.message,true);}
  });
  listar();
})();
