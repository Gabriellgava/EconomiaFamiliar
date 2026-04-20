const PageSaude = {
  init() {
    this._renderInsights();
    this._renderPoupanca();
    this._renderMetaRenda();
    this._renderInvestimentos();
    this._renderHistorico();
  },

  _renderInsights() {
    const el = document.getElementById('saude-insights');
    if (!el) return;

    const m = State.metricas;

    if (m.totalReceita === 0) {
      el.innerHTML = `
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>📊 Configure seus rendimentos</strong><br>
          Cadastre seus rendimentos na aba <strong>Rendimentos</strong> para ver a analise completa de saude financeira.
        </div>
      `;
      return;
    }

    const labels = {
      excelente: {
        emoji: '🌟',
        titulo: 'Situacao excelente!',
        msg: `Apenas ${Utils.fmtPct(m.pctComprometido)} da renda comprometida. Voces tem otima margem para poupar e investir.`,
      },
      bom: {
        emoji: '✅',
        titulo: 'Situacao boa',
        msg: `${Utils.fmtPct(m.pctComprometido)} comprometido. Esta dentro do ideal. Vale manter o controle e buscar ficar abaixo de 60%.`,
      },
      atencao: {
        emoji: '⚠️',
        titulo: 'Atencao necessaria',
        msg: `${Utils.fmtPct(m.pctComprometido)} da renda comprometida e alto. Revisem despesas variaveis e cartoes.`,
      },
      critico: {
        emoji: '🚨',
        titulo: 'Situacao critica',
        msg: `${Utils.fmtPct(m.pctComprometido)} comprometido. As despesas estao muito proximas ou acima da renda.`,
      },
    };

    const insights = [{ tipo: m.statusSaude, ...labels[m.statusSaude] }];

    if (m.saldo > 0) {
      insights.push({
        tipo: 'bom',
        emoji: '💰',
        titulo: 'Saldo positivo',
        msg: `Sobram ${Utils.fmtMoeda(m.saldo)} neste mes. Reservar ao menos ${Utils.fmtMoeda(m.meta20pct)} ja coloca voces em uma faixa saudavel.`,
      });
    } else if (m.saldo < 0) {
      insights.push({
        tipo: 'critico',
        emoji: '🔴',
        titulo: 'Deficit mensal',
        msg: `O mes fechou com deficit de ${Utils.fmtMoeda(Math.abs(m.saldo))}. O caminho mais rapido e cortar esse valor ou elevar a renda na mesma medida.`,
      });
    }

    const rendVarMes = State.rendimentosVariaveis.find(v => v.mes_ref === State.mesRef);
    if (!rendVarMes) {
      insights.push({
        tipo: 'atencao',
        emoji: '🗓',
        titulo: 'Renda variavel pendente',
        msg: `A renda variavel da esposa ainda nao foi registrada para ${State.mesLabel}.`,
      });
    }

    if (m.totalCC > 0 && m.totalReceita > 0) {
      const pctCC = (m.totalCC / m.totalReceita) * 100;
      if (pctCC > 30) {
        insights.push({
          tipo: 'atencao',
          emoji: '💳',
          titulo: 'Uso alto de cartao',
          msg: `${Utils.fmtPct(pctCC)} da renda esta indo para parcelas de cartao (${Utils.fmtMoeda(m.totalCC)}).`,
        });
      }
    }

    const bgMap = {
      excelente: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      bom: 'bg-green-50 border-green-200 text-green-900',
      atencao: 'bg-amber-50 border-amber-200 text-amber-900',
      critico: 'bg-red-50 border-red-200 text-red-900',
    };

    el.innerHTML = insights.map(i => `
      <div class="border rounded-xl p-4 mb-3 ${bgMap[i.tipo] || 'bg-gray-50 border-gray-200 text-gray-800'}">
        <p class="font-semibold text-sm mb-1">${i.emoji} ${i.titulo}</p>
        <p class="text-sm leading-relaxed">${i.msg}</p>
      </div>
    `).join('');
  },

  _renderPoupanca() {
    const el = document.getElementById('saude-poupanca');
    if (!el) return;

    const m = State.metricas;
    const disponivel = Math.max(0, m.saldo);

    el.innerHTML = `
      <div class="space-y-3">
        <div class="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
          <div>
            <p class="text-xs text-emerald-600 font-medium">Regra dos 20% (recomendado)</p>
            <p class="text-xs text-emerald-500 mt-0.5">Referencia simples para formar reserva e investir.</p>
          </div>
          <span class="text-lg font-bold text-emerald-700">${Utils.fmtMoeda(m.meta20pct)}/mes</span>
        </div>

        <div class="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
          <div>
            <p class="text-xs text-blue-600 font-medium">Minimo 10%</p>
            <p class="text-xs text-blue-500 mt-0.5">Bom ponto de partida enquanto o orcamento se ajusta.</p>
          </div>
          <span class="text-lg font-bold text-blue-700">${Utils.fmtMoeda(m.meta10pct)}/mes</span>
        </div>

        <div class="flex justify-between items-center p-3 ${disponivel >= m.meta10pct ? 'bg-gray-50' : 'bg-red-50'} rounded-xl">
          <p class="text-xs ${disponivel >= m.meta10pct ? 'text-gray-600' : 'text-red-600'} font-medium">Disponivel neste mes</p>
          <span class="text-lg font-bold ${disponivel >= m.meta10pct ? 'text-gray-700' : 'text-red-600'}">${Utils.fmtMoeda(disponivel)}</span>
        </div>

        <div class="border-t pt-3 mt-2">
          <p class="text-xs text-gray-500 font-medium mb-2">Projecao acumulada guardando 20%:</p>
          <div class="grid grid-cols-3 gap-2">
            ${[
              { label: '6 meses', val: m.meta20pct * 6 },
              { label: '1 ano', val: m.meta20pct * 12 },
              { label: '5 anos', val: m.meta20pct * 60 },
            ].map(p => `
              <div class="text-center p-2 bg-gray-50 rounded-lg">
                <p class="text-xs text-gray-400">${p.label}</p>
                <p class="text-sm font-semibold text-gray-700 mt-0.5">${Utils.fmtMoedaCurta(p.val)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  _renderMetaRenda() {
    const el = document.getElementById('saude-meta-renda');
    if (!el) return;

    const m = State.metricas;

    el.innerHTML = `
      <p class="text-sm text-gray-500 mb-3">
        Para gastos atuais de <strong class="text-gray-700">${Utils.fmtMoeda(m.totalGastos)}/mes</strong>:
      </p>
      <div class="space-y-3">
        <div class="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
          <div>
            <p class="text-xs text-amber-700 font-medium">Renda minima</p>
            <p class="text-xs text-amber-500">70% comprometido.</p>
          </div>
          <span class="text-base font-bold text-amber-700">${Utils.fmtMoeda(m.rendaIdeal)}/mes</span>
        </div>
        <div class="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
          <div>
            <p class="text-xs text-blue-700 font-medium">Renda confortavel</p>
            <p class="text-xs text-blue-500">60% comprometido.</p>
          </div>
          <span class="text-base font-bold text-blue-700">${Utils.fmtMoeda(m.rendaConfort)}/mes</span>
        </div>
        <div class="flex justify-between items-center p-3 ${m.totalReceita >= m.rendaIdeal ? 'bg-emerald-50' : 'bg-red-50'} rounded-xl">
          <p class="text-xs ${m.totalReceita >= m.rendaIdeal ? 'text-emerald-700' : 'text-red-700'} font-medium">Renda atual</p>
          <span class="text-base font-bold ${m.totalReceita >= m.rendaIdeal ? 'text-emerald-700' : 'text-red-600'}">${Utils.fmtMoeda(m.totalReceita)}/mes</span>
        </div>
        ${m.gapRenda > 0 ? `
          <div class="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p class="text-xs text-red-700 font-semibold">Aumentar a renda em:</p>
            <p class="text-xl font-bold text-red-700 mt-0.5">${Utils.fmtMoeda(m.gapRenda)}/mes</p>
          </div>
        ` : `
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p class="text-xs text-emerald-700 font-semibold">Renda dentro do recomendado.</p>
          </div>
        `}
      </div>
    `;
  },

  _renderInvestimentos() {
    const el = document.getElementById('saude-investimentos');
    if (!el) return;

    const m = State.metricas;
    const reservaIdeal = m.totalGastos * 6;
    const guardar = Math.max(0, m.saldo * 0.7);

    const investimentos = [
      {
        pct: 50,
        titulo: 'Reserva de emergencia',
        desc: `Meta: 6 meses de despesas = ${Utils.fmtMoeda(reservaIdeal)}`,
        detalhe: 'Prioridade maxima. Liquidez diaria e baixo risco.',
        emoji: '🛡️',
        classe: 'text-emerald-600',
      },
      {
        pct: 30,
        titulo: 'Renda fixa',
        desc: 'Titulos e produtos mais previsiveis.',
        detalhe: 'Serve para fazer o dinheiro render acima da poupanca com mais estabilidade.',
        emoji: '📈',
        classe: 'text-blue-600',
      },
      {
        pct: 10,
        titulo: 'Fundos imobiliarios',
        desc: 'Foco em renda mensal.',
        detalhe: 'Faz sentido depois da reserva pronta e do orcamento controlado.',
        emoji: '🏢',
        classe: 'text-fuchsia-600',
      },
      {
        pct: 10,
        titulo: 'Acoes e ETFs',
        desc: 'Pensando no longo prazo.',
        detalhe: 'Melhor para horizontes mais longos e com maior tolerancia a oscilacao.',
        emoji: '📊',
        classe: 'text-amber-600',
      },
    ];

    el.innerHTML = `
      <p class="text-sm text-gray-500 mb-4">
        Com ${Utils.fmtMoeda(guardar)}/mes disponivel para investir, uma distribuicao conservadora seria:
      </p>
      <div class="space-y-3">
        ${investimentos.map(inv => {
          const valMes = guardar * (inv.pct / 100);
          return `
            <div class="border border-gray-100 rounded-xl p-4">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xl">${inv.emoji}</span>
                  <div>
                    <p class="text-sm font-semibold text-gray-800">${inv.titulo}</p>
                    <p class="text-xs text-gray-500">${inv.desc}</p>
                  </div>
                </div>
                <div class="text-right ml-3">
                  <span class="text-sm font-bold ${inv.classe}">${inv.pct}%</span>
                  <p class="text-xs text-gray-400">${Utils.fmtMoeda(valMes)}/mes</p>
                </div>
              </div>
              <p class="text-xs text-gray-400 mt-2 pl-7">${inv.detalhe}</p>
            </div>
          `;
        }).join('')}
      </div>
      <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <strong>Ordem de prioridade:</strong><br>
        1. Formar reserva de emergencia<br>
        2. Quitar dividas caras<br>
        3. Diversificar aos poucos
      </div>
    `;
  },

  _renderHistorico() {
    const el = document.getElementById('saude-historico');
    if (!el) return;

    const meses = Utils.ultimosMeses(6).reverse();
    const fixoTotal = State.rendimentosFixos.reduce((s, r) => s + Number(r.valor), 0);

    el.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-400 border-b border-gray-100">
              <th class="pb-2 font-medium">Mes</th>
              <th class="pb-2 font-medium text-right">Receita</th>
              <th class="pb-2 font-medium text-right">Gastos</th>
              <th class="pb-2 font-medium text-right">Saldo</th>
              <th class="pb-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            ${meses.map(mes => {
              const rendVar = State.rendimentosVariaveis.find(v => v.mes_ref === mes);
              const receita = fixoTotal + (rendVar ? Number(rendVar.valor) : 0);
              const despesasMes = State.allDespesas
                .filter(d => d.fixa || d.mes_ref === mes)
                .reduce((s, d) => s + Number(d.valor), 0);
              const comprasMes = State.allCompras.reduce((s, c) => s + Utils.valorParcelaMes(c, mes), 0);
              const gastos = despesasMes + comprasMes;
              const saldo = receita - gastos;
              const comprometido = receita > 0 ? (gastos / receita) * 100 : (gastos > 0 ? 100 : 0);
              const status = comprometido <= 70 ? 'bg-emerald-100 text-emerald-700' : comprometido <= 90 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
              const isCurrent = mes === State.mesRef;

              return `
                <tr class="border-b border-gray-50 last:border-0 ${isCurrent ? 'bg-emerald-50' : ''}">
                  <td class="py-2.5 font-medium ${isCurrent ? 'text-emerald-700' : 'text-gray-700'}">
                    ${Utils.mesRefLabel(mes)} ${isCurrent ? '<span class="text-xs">(atual)</span>' : ''}
                  </td>
                  <td class="py-2.5 text-right text-emerald-600 font-medium">${Utils.fmtMoeda(receita)}</td>
                  <td class="py-2.5 text-right text-red-500 font-medium">${Utils.fmtMoeda(gastos)}</td>
                  <td class="py-2.5 text-right font-medium ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}">${Utils.fmtMoeda(saldo)}</td>
                  <td class="py-2.5 text-right">
                    <span class="text-xs px-2 py-0.5 rounded-full ${status}">${Utils.fmtPct(comprometido)}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
};

window.PageSaude = PageSaude;
