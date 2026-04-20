const PageDashboard = {
  _navBound: false,

  init() {
    this._renderMesLabel();
    this._renderMetricas();
    this._renderGraficoCategorias();
    this._renderResumoMes();
    this._renderUltimas();
    this._bindNavMes();
  },

  _renderMesLabel() {
    const el = document.getElementById('dash-mes-label');
    if (el) el.textContent = State.mesLabel;
  },

  _renderMetricas() {
    const m = State.metricas;
    const cards = [
      { id: 'dash-receita', val: Utils.fmtMoeda(m.totalReceita), label: 'Receita total', cor: 'text-emerald-600' },
      { id: 'dash-gastos', val: Utils.fmtMoeda(m.totalGastos), label: 'Total de gastos', cor: 'text-red-500' },
      { id: 'dash-saldo', val: Utils.fmtMoeda(m.saldo), label: 'Saldo livre', cor: m.saldo >= 0 ? 'text-emerald-600' : 'text-red-500' },
      { id: 'dash-comprometido', val: Utils.fmtPct(m.pctComprometido), label: 'Comprometido', cor: Utils.corStatus(m.statusSaude) },
    ];

    cards.forEach(({ id, val, label, cor }) => {
      const valEl = document.getElementById(`${id}-val`);
      const labelEl = document.getElementById(`${id}-label`);
      if (valEl) {
        valEl.textContent = val;
        valEl.className = `text-2xl font-semibold mt-1 ${cor}`;
      }
      if (labelEl) labelEl.textContent = label;
    });

    const barra = document.getElementById('dash-barra-comprometido');
    if (barra) {
      barra.style.width = `${Math.min(100, m.pctComprometido).toFixed(1)}%`;
      barra.className = `h-2 rounded-full transition-all duration-500 ${Utils.corBarra(m.pctComprometido)}`;
    }
  },

  _renderGraficoCategorias() {
    const el = document.getElementById('dash-grafico-cats');
    if (!el) return;

    const sorted = Object.entries(State.metricas.porCategoria).sort((a, b) => b[1] - a[1]);
    const max = sorted.length ? sorted[0][1] : 1;

    if (!sorted.length) {
      el.innerHTML = `<p class="text-gray-400 text-sm text-center py-8">Nenhuma despesa neste mes</p>`;
      return;
    }

    el.innerHTML = sorted.map(([cat, val]) => {
      const pct = Math.round((val / max) * 100);
      return `
        <div class="flex items-center gap-3 mb-3">
          <span class="text-base w-6 flex-shrink-0">${Utils.iconeCategoria(cat)}</span>
          <span class="text-sm text-gray-600 w-28 flex-shrink-0 truncate">${cat}</span>
          <div class="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div class="h-2.5 rounded-full transition-all duration-500" style="width:${pct}%; background:${Utils.corCategoria(cat)}"></div>
          </div>
          <span class="text-sm font-medium text-gray-700 w-24 text-right flex-shrink-0">${Utils.fmtMoeda(val)}</span>
        </div>
      `;
    }).join('');
  },

  _renderResumoMes() {
    const m = State.metricas;
    const el = document.getElementById('dash-resumo');
    if (!el) return;

    const linha = (label, val, cor = 'text-gray-700') => `
      <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
        <span class="text-sm text-gray-500">${label}</span>
        <span class="text-sm font-medium ${cor}">${Utils.fmtMoeda(val)}</span>
      </div>
    `;

    el.innerHTML = `
      ${linha('Renda fixa', m.rendFixoTotal, 'text-emerald-600')}
      ${linha('Renda variavel (esposa)', m.rendVarTotal, 'text-emerald-600')}
      ${linha('Despesas do mes', m.totalDesp, 'text-red-500')}
      ${linha('Cartoes (parcelas do mes)', m.totalCC, 'text-red-500')}
      <div class="flex justify-between items-center pt-3 mt-1">
        <span class="text-sm font-semibold text-gray-800">Saldo final</span>
        <span class="text-lg font-bold ${m.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}">${Utils.fmtMoeda(m.saldo)}</span>
      </div>
      <div class="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div class="h-2 rounded-full transition-all duration-700 ${Utils.corBarra(m.pctComprometido)}" style="width:${Math.min(100, m.pctComprometido).toFixed(1)}%"></div>
      </div>
      <p class="text-xs text-gray-400 mt-1 text-right">${Utils.fmtPct(m.pctComprometido)} da renda comprometida</p>
    `;
  },

  _renderUltimas() {
    const el = document.getElementById('dash-ultimas');
    if (!el) return;

    const items = [
      ...State.despesas.map(d => ({
        nome: d.descricao,
        valor: -Number(d.valor),
        data: d.data,
        cat: d.categoria,
        fixa: d.fixa,
      })),
      ...State.compras
        .filter(c => Utils.valorParcelaMes(c, State.mesRef) > 0)
        .map(c => ({
          nome: c.descricao,
          valor: -Utils.valorParcelaMes(c, State.mesRef),
          data: c.data_compra,
          cat: c.categoria,
          parcelas: c.parcelas,
        })),
    ]
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 10);

    if (!items.length) {
      el.innerHTML = `<p class="text-gray-400 text-sm text-center py-8">Nenhuma movimentacao neste mes</p>`;
      return;
    }

    el.innerHTML = items.map(item => `
      <div class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
        <div class="flex items-center gap-3">
          <span class="text-lg">${Utils.iconeCategoria(item.cat)}</span>
          <div>
            <p class="text-sm font-medium text-gray-800">
              ${item.nome}
              ${item.fixa ? '<span class="ml-1 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">fixo</span>' : ''}
              ${item.parcelas > 1 ? `<span class="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">${item.parcelas}x</span>` : ''}
            </p>
            <p class="text-xs text-gray-400">${item.cat} · ${Utils.fmtData(item.data)}</p>
          </div>
        </div>
        <span class="text-sm font-semibold text-red-500">${Utils.fmtMoeda(Math.abs(item.valor))}</span>
      </div>
    `).join('');
  },

  _bindNavMes() {
    if (this._navBound) return;
    this._navBound = true;

    document.getElementById('dash-btn-prev')?.addEventListener('click', () => State.navegarMes(-1));
    document.getElementById('dash-btn-next')?.addEventListener('click', () => State.navegarMes(1));
  },
};

window.PageDashboard = PageDashboard;
