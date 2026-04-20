const PageSaude = {
  init() {
    this._renderIndicadores();
    this._renderHistorico();
    this._atualizarMes();
  },

  _renderIndicadores() {
    const el = document.getElementById('saude-indicadores');
    if (!el) return;

    const m = State.metricas;
    const comprometimento = Math.min(Math.max(m.comprometimento, 0), 100);
    const status = comprometimento <= 70 ? 'Confortável' : comprometimento <= 90 ? 'Atenção' : 'Crítico';
    const statusClass = comprometimento <= 70 ? 'success' : comprometimento <= 90 ? 'warning' : 'danger';

    el.innerHTML = `
      <div class="item-row">
        <div class="item-main">
          <p class="item-title">Comprometimento da renda</p>
          <p class="item-meta">${status} em ${Utils.mesRefLabel(State.mesRef)}</p>
          <div class="progress"><span style="width: ${comprometimento}%;"></span></div>
        </div>
        <span class="badge ${statusClass}">${comprometimento.toFixed(1)}%</span>
      </div>

      <div class="item-row">
        <div class="item-main">
          <p class="item-title">Saldo do mês</p>
          <p class="item-meta">Entradas ${Utils.fmtMoeda(m.entradas)} · saídas ${Utils.fmtMoeda(m.saidas)}</p>
        </div>
        <strong>${Utils.fmtMoeda(m.saldo)}</strong>
      </div>

      <div class="item-row">
        <div class="item-main">
          <p class="item-title">Responsáveis monitorados</p>
          <p class="item-meta">Gabriel e Meiry</p>
        </div>
        <span class="badge">2 pessoas</span>
      </div>
    `;
  },

  _renderHistorico() {
    const el = document.getElementById('saude-historico');
    if (!el) return;

    const meses = Array.from({ length: 6 }, (_, idx) => Utils.avancaMes(State.mesRef, -idx)).reverse();
    const linhas = meses.map(mes => {
      const rendaFixa = State.rendimentosFixos.reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const rendaVariavel = State.rendimentosVariaveis
        .filter(item => item.mes_ref === mes && item.responsavel === 'meiry')
        .reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const despesas = State.allDespesas
        .filter(item => Utils.despesaAtivaNoMes(item, mes))
        .reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const compras = State.allCompras.reduce((acc, item) => acc + Utils.valorParcelaMes(item, mes), 0);
      const saldo = rendaFixa + rendaVariavel - despesas - compras;

      return { mes, despesas, compras, saldo };
    });

    el.innerHTML = linhas.map(item => `
      <div class="item-row">
        <div class="item-main">
          <p class="item-title">${Utils.mesRefLabel(item.mes)}</p>
          <p class="item-meta">Despesas ${Utils.fmtMoeda(item.despesas)} · Cartões ${Utils.fmtMoeda(item.compras)}</p>
        </div>
        <div class="item-actions">
          <span class="badge ${item.saldo >= 0 ? 'success' : 'danger'}">${item.saldo >= 0 ? 'Positivo' : 'Negativo'}</span>
          <strong>${Utils.fmtMoeda(item.saldo)}</strong>
        </div>
      </div>
    `).join('');
  },

  _atualizarMes() {
    document.querySelectorAll('.mes-ref-label').forEach(el => {
      el.textContent = Utils.mesRefLabel(State.mesRef);
    });
  },
};

window.PageSaude = PageSaude;
