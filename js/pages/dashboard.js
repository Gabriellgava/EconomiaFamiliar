const PageDashboard = {
  _charts: {},

  init() {
    this._renderMetricas();
    this._renderGraficos();
    this._renderResumo();
    this._renderUltimos();
    this._atualizarMes();
  },

  _renderMetricas() {
    const el = document.getElementById('dashboard-metricas');
    if (!el) return;

    const m = State.metricas;
    const cards = [
      { label: 'Entradas totais', valor: m.entradas, hint: `Inclui ${Utils.fmtMoeda(m.rendaVariavel)} de renda vari\u00e1vel` },
      { label: 'Despesas', valor: m.despesas, hint: 'Lan\u00e7amentos diretos do m\u00eas' },
      { label: 'Cart\u00f5es', valor: m.comprasCartao, hint: 'Parcelas que caem neste m\u00eas' },
      { label: 'Saldo projetado', valor: m.saldo, hint: m.saldo >= 0 ? 'M\u00eas respirando bem' : 'Aten\u00e7\u00e3o ao fluxo de caixa' },
    ];

    el.innerHTML = cards.map(card => `
      <article class="metric-card">
        <p class="metric-label">${card.label}</p>
        <p class="metric-value">${Utils.fmtMoeda(card.valor)}</p>
        <p class="metric-hint">${card.hint}</p>
      </article>
    `).join('');
  },

  _renderGraficos() {
    if (typeof Chart === 'undefined') return;

    const colors = this._chartColors();
    this._renderChartMesAtual(colors);
    this._renderChartCategorias(colors);
    this._renderChartEvolucao(colors);
    this._renderChartCartoes(colors);
  },

  _renderChartMesAtual(colors) {
    const canvas = document.getElementById('chart-mes-atual');
    if (!canvas) return;

    const m = State.metricas;
    this._setChart('mesAtual', canvas, {
      type: 'bar',
      data: {
        labels: ['Entradas', 'Despesas', 'Cart\u00f5es', 'Saldo'],
        datasets: [{
          data: [m.entradas, m.despesas, m.comprasCartao, m.saldo],
          backgroundColor: [colors.primary, colors.warning, colors.info, m.saldo >= 0 ? colors.success : colors.danger],
          borderRadius: 12,
          borderSkipped: false,
          maxBarThickness: 44,
        }],
      },
      options: this._baseOptions({
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => Utils.fmtMoeda(ctx.raw),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.textSoft, maxRotation: 0 },
          },
          y: {
            beginAtZero: true,
            grace: '12%',
            ticks: {
              color: colors.textSoft,
              callback: value => this._compactCurrency(value),
            },
            grid: { color: colors.grid },
          },
        },
      }),
    });
  },

  _renderChartCategorias(colors) {
    const canvas = document.getElementById('chart-categorias');
    if (!canvas) return;

    const categorias = Utils.CATEGORIAS_DESPESA.map(item => {
      const total = State.despesas
        .filter(despesa => Utils.corrigirTexto(despesa.categoria) === item.nome)
        .reduce((acc, despesa) => acc + Number(despesa.valor || 0), 0);

      return { label: item.nome, total };
    }).filter(item => item.total > 0);

    const data = categorias.length ? categorias : [{ label: 'Sem despesas', total: 1 }];
    const totalCategorias = categorias.reduce((acc, item) => acc + item.total, 0);
    const palette = [colors.primary, colors.info, colors.warning, colors.success, '#ef4444', '#8b5cf6', '#f97316', '#14b8a6', '#64748b'];

    this._setChart('categorias', canvas, {
      type: 'doughnut',
      plugins: [
        this._createCenterTextPlugin(totalCategorias > 0 ? this._compactCurrency(totalCategorias) : 'R$ 0', colors),
      ],
      data: {
        labels: data.map(item => item.label),
        datasets: [{
          data: data.map(item => item.total),
          backgroundColor: palette.slice(0, data.length),
          hoverOffset: 8,
          borderWidth: 0,
        }],
      },
      options: this._baseOptions({
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: colors.textSoft,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 14,
              boxWidth: 10,
              boxHeight: 10,
            },
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}: ${Utils.fmtMoeda(ctx.raw)}`,
            },
          },
        },
      }),
    });
  },

  _renderChartEvolucao(colors) {
    const canvas = document.getElementById('chart-evolucao');
    if (!canvas) return;

    const serie = this._buildSeries6Meses();
    this._setChart('evolucao', canvas, {
      type: 'line',
      data: {
        labels: serie.map(item => item.label),
        datasets: [
          {
            label: 'Saldo',
            data: serie.map(item => item.saldo),
            borderColor: colors.primary,
            backgroundColor: this._alpha(colors.primary, 0.18),
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: colors.primary,
          },
          {
            label: 'Despesas',
            data: serie.map(item => item.despesas),
            borderColor: colors.warning,
            backgroundColor: this._alpha(colors.warning, 0.12),
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: colors.warning,
          },
          {
            label: 'Cart\u00f5es',
            data: serie.map(item => item.cartoes),
            borderColor: colors.info,
            backgroundColor: this._alpha(colors.info, 0.12),
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: colors.info,
          },
        ],
      },
      options: this._baseOptions({
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: colors.textSoft,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16,
              boxWidth: 10,
              boxHeight: 10,
            },
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${Utils.fmtMoeda(ctx.raw)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.textSoft },
          },
          y: {
            ticks: {
              color: colors.textSoft,
              callback: value => this._compactCurrency(value),
            },
            grid: { color: colors.grid },
          },
        },
      }),
    });
  },

  _renderChartCartoes(colors) {
    const canvas = document.getElementById('chart-cartoes');
    if (!canvas) return;

    const items = State.cartoes.map(cartao => ({
      nome: Utils.corrigirTexto(cartao.nome),
      valor: State.compras
        .filter(compra => compra.cartao_id === cartao.id)
        .reduce((acc, compra) => acc + Utils.valorParcelaMes(compra, State.mesRef), 0),
    })).filter(item => item.valor > 0);

    const data = items.length ? items : [{ nome: 'Sem compras', valor: 0 }];
    this._setChart('cartoes', canvas, {
      type: 'bar',
      data: {
        labels: data.map(item => item.nome),
        datasets: [{
          data: data.map(item => item.valor),
          backgroundColor: colors.info,
          borderRadius: 12,
          borderSkipped: false,
          maxBarThickness: 36,
        }],
      },
      options: this._baseOptions({
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => Utils.fmtMoeda(ctx.raw),
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grace: '10%',
            ticks: {
              color: colors.textSoft,
              callback: value => this._compactCurrency(value),
            },
            grid: { color: colors.grid },
          },
          y: {
            ticks: { color: colors.textSoft },
            grid: { display: false },
          },
        },
      }),
    });
  },

  _renderResumo() {
    const el = document.getElementById('dashboard-resumo');
    if (!el) return;
    const m = State.metricas;

    const linhas = [
      ['Renda fixa', Utils.fmtMoeda(m.rendaFixa)],
      ['Renda vari\u00e1vel (Meiry)', Utils.fmtMoeda(m.rendaVariavel)],
      ['Despesas ativas', Utils.fmtMoeda(m.despesas)],
      ['Parcelas do cart\u00e3o', Utils.fmtMoeda(m.comprasCartao)],
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
        meta: `${Utils.iconeCategoria(item.categoria)} ${Utils.corrigirTexto(item.categoria)} - ${Utils.nomeResponsavel(item.responsavel)}${item.fixa ? ' - recorrente' : ''}`,
        valor: item.valor,
      })),
      ...State.compras
        .filter(item => Utils.valorParcelaMes(item, State.mesRef) > 0)
        .map(item => ({
          data: item.data_compra,
          titulo: item.descricao,
          meta: `${Utils.corrigirTexto(item.cartoes?.nome || 'Cart\u00e3o')} - ${item.parcelas}x`,
          valor: Utils.valorParcelaMes(item, State.mesRef),
        })),
    ]
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 6);

    if (!itens.length) {
      el.innerHTML = `<div class="empty-state">Nenhum lan\u00e7amento encontrado para este m\u00eas.</div>`;
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

  _buildSeries6Meses() {
    return Array.from({ length: 6 }, (_, idx) => Utils.avancaMes(State.mesRef, -5 + idx)).map(mes => {
      const rendaFixa = State.rendimentosFixos.reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const rendaVariavel = State.rendimentosVariaveis
        .filter(item => item.mes_ref === mes)
        .reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const despesas = State.allDespesas
        .filter(item => Utils.despesaAtivaNoMes(item, mes))
        .reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const cartoes = State.allCompras.reduce((acc, item) => acc + Utils.valorParcelaMes(item, mes), 0);

      return {
        mes,
        label: Utils.mesRefLabel(mes),
        saldo: rendaFixa + rendaVariavel - despesas - cartoes,
        despesas,
        cartoes,
      };
    });
  },

  _setChart(key, canvas, config) {
    if (this._charts[key]) {
      this._charts[key].destroy();
    }

    this._charts[key] = new Chart(canvas, config);
  },

  _chartColors() {
    const style = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.dataset.theme === 'dark';

    return {
      primary: style.getPropertyValue('--primary').trim() || '#0f9f6e',
      success: isDark ? '#4ade80' : '#16a34a',
      warning: style.getPropertyValue('--warning').trim() || '#f59e0b',
      danger: style.getPropertyValue('--danger').trim() || '#ef4444',
      info: isDark ? '#38bdf8' : '#2563eb',
      textSoft: style.getPropertyValue('--text-soft').trim() || '#53657b',
      grid: isDark ? 'rgba(168, 186, 208, 0.16)' : 'rgba(115, 133, 154, 0.16)',
    };
  },

  _baseOptions(extra = {}) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          labels: {
            font: {
              family: 'DM Sans',
              size: 12,
              weight: '600',
            },
          },
        },
      },
      ...extra,
    };
  },

  _compactCurrency(value) {
    const num = Number(value) || 0;
    if (Math.abs(num) >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toFixed(0);
  },

  _alpha(hex, opacity) {
    if (!hex.startsWith('#')) return hex;
    const value = hex.replace('#', '');
    const normalized = value.length === 3
      ? value.split('').map(char => char + char).join('')
      : value;
    const int = Number.parseInt(normalized, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  _createCenterTextPlugin(value, colors) {
    return {
      id: 'centerTextPlugin',
      afterDraw: chart => {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta?.data?.length) return;

        const { x, y } = meta.data[0];
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = colors.textSoft;
        ctx.font = '600 12px "DM Sans", sans-serif';
        ctx.fillText('Total do m\u00eas', x, y - 6);
        ctx.fillStyle = colors.primary;
        ctx.font = '700 18px "Sora", sans-serif';
        ctx.fillText(value, x, y + 18);
        ctx.restore();
      },
    };
  },

  _atualizarMes() {
    document.querySelectorAll('.mes-ref-label').forEach(el => {
      el.textContent = Utils.mesRefLabel(State.mesRef);
    });
  },
};

window.PageDashboard = PageDashboard;
