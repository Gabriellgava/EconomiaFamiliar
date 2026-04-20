const PageDashboard = {
  init() {
    this._renderMetricas();
    this._renderResumo();
    this._renderUltimos();
    this._atualizarMes();
  },

  _renderMetricas() {
    const el = document.getElementById('dashboard-metricas');
    if (!el) return;

    const m = State.metricas;
    const cards = [
      { label: 'Entradas totais', valor: m.entradas, hint: `Inclui ${Utils.fmtMoeda(m.rendaVariavel)} de renda variavel` },
      { label: 'Despesas', valor: m.despesas, hint: 'Lancamentos diretos do mes' },
      { label: 'Cartoes', valor: m.comprasCartao, hint: 'Parcelas que caem neste mes' },
      { label: 'Saldo projetado', valor: m.saldo, hint: m.saldo >= 0 ? 'Mes respirando bem' : 'Atencao ao fluxo de caixa' },
    ];

    el.innerHTML = cards.map(card => `
      <article class="metric-card">
        <p class="metric-label">${card.label}</p>
        <p class="metric-value">${Utils.fmtMoeda(card.valor)}</p>
        <p class="metric-hint">${card.hint}</p>
      </article>
    `).join('');
  },

  _renderResumo() {
    const el = document.getElementById('dashboard-resumo');
    if (!el) return;
    const m = State.metricas;

    const linhas = [
      ['Renda fixa', Utils.fmtMoeda(m.rendaFixa)],
      ['Renda variavel (Meiry)', Utils.fmtMoeda(m.rendaVariavel)],
      ['Despesas ativas', Utils.fmtMoeda(m.despesas)],
      ['Parcelas do cartao', Utils.fmtMoeda(m.comprasCartao)],
      ['Comprometimento', `${Math.min(m.comprometimento, 999).toFixed(1)}%`],
    ];

    el.innerHTML = linhas.map(([titulo, valor]) => `
      <div class="item-row">
        <div class="item-main">
          <p class="item-title">${titulo}</p>
          <p class="item-meta">Atualizado para ${Utils.mesRefLabel(State.mesRef)}</p>
        </div>
        <strong>${valor}</strong>
      </div>
    `).join('');
  },

  _renderUltimos() {
    const el = document.getElementById('dashboard-ultimos');
    if (!el) return;

    const itens = [
      ...State.despesas.map(item => ({
        data: item.data,
        titulo: item.descricao,
        meta: `${Utils.iconeCategoria(item.categoria)} ${item.categoria} - ${Utils.nomeResponsavel(item.responsavel)}${item.fixa ? ' - recorrente' : ''}`,
        valor: item.valor,
      })),
      ...State.compras
        .filter(item => Utils.valorParcelaMes(item, State.mesRef) > 0)
        .map(item => ({
          data: item.data_compra,
          titulo: item.descricao,
          meta: `${item.cartoes?.nome || 'Cartao'} - ${item.parcelas}x`,
          valor: Utils.valorParcelaMes(item, State.mesRef),
        })),
    ]
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 6);

    if (!itens.length) {
      el.innerHTML = `<div class="empty-state">Nenhum lancamento encontrado para este mes.</div>`;
      return;
    }

    el.innerHTML = itens.map(item => `
      <div class="item-row">
        <div class="item-main">
          <p class="item-title">${Utils.escapeHtml(item.titulo)}</p>
          <p class="item-meta">${Utils.escapeHtml(item.meta)} - ${Utils.fmtData(item.data)}</p>
        </div>
        <strong>${Utils.fmtMoeda(item.valor)}</strong>
      </div>
    `).join('');
  },

  _atualizarMes() {
    document.querySelectorAll('.mes-ref-label').forEach(el => {
      el.textContent = Utils.mesRefLabel(State.mesRef);
    });
  },
};

window.PageDashboard = PageDashboard;
