// ============================================================
// js/utils.js — Funções utilitárias globais
// ============================================================
// Formatação de moeda, datas, cálculos financeiros.
// Nenhuma lógica de UI aqui — apenas funções puras.
// ============================================================

const Utils = {

  // ----------------------------------------------------------
  // FORMATAÇÃO
  // ----------------------------------------------------------

  /** Formata valor em Real Brasileiro */
  fmtMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(Number(valor) || 0);
  },

  /** Formata valor curto: R$ 1.2k, R$ 3.4k */
  fmtMoedaCurta(valor) {
    const v = Number(valor) || 0;
    if (Math.abs(v) >= 1000) {
      return 'R$ ' + (v / 1000).toFixed(1) + 'k';
    }
    return this.fmtMoeda(v);
  },

  /** Formata porcentagem: 75.3% */
  fmtPct(valor) {
    return (Number(valor) || 0).toFixed(1) + '%';
  },

  /** Formata data 'YYYY-MM-DD' → '15/04/2025' */
  fmtData(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  },

  /** Mês abreviado por número (1-12) */
  mesAbrev(num) {
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return meses[(num - 1) % 12] || '';
  },

  /** Nome completo do mês */
  mesNome(num) {
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return meses[(num - 1) % 12] || '';
  },

  /** 'YYYY-MM' → 'Janeiro 2025' */
  mesRefLabel(mesRef) {
    if (!mesRef) return '';
    const [y, m] = mesRef.split('-').map(Number);
    return `${this.mesNome(m)} ${y}`;
  },

  /** Mês atual como 'YYYY-MM' */
  mesAtual() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  /** Avança/recua mês: Utils.avancaMes('2025-01', -1) → '2024-12' */
  avancaMes(mesRef, delta) {
    const [y, m] = mesRef.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  /** Lista os últimos N meses incluindo o atual */
  ultimosMeses(n = 12) {
    const resultado = [];
    let ref = this.mesAtual();
    for (let i = 0; i < n; i++) {
      resultado.push(ref);
      ref = this.avancaMes(ref, -1);
    }
    return resultado;
  },


  // ----------------------------------------------------------
  // CÁLCULOS FINANCEIROS
  // ----------------------------------------------------------

  /**
   * Calcula o valor que uma compra parcelada impacta em um mês específico.
   * Retorna 0 se a parcela não cai naquele mês.
   *
   * @param {Object} compra - { mes_ref: 'YYYY-MM', parcelas: N, valor_total: X }
   * @param {string} mesAlvo - 'YYYY-MM'
   * @returns {number} valor da parcela naquele mês (ou 0)
   */
  valorParcelaMes(compra, mesAlvo) {
    const [cyStr, cmStr] = compra.mes_ref.split('-');
    const cy = parseInt(cyStr);
    const cm = parseInt(cmStr);
    const valorParcela = Number(compra.valor_total) / Number(compra.parcelas);

    for (let i = 0; i < compra.parcelas; i++) {
      const d = new Date(cy, cm - 1 + i, 1);
      const parcelaMes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (parcelaMes === mesAlvo) return valorParcela;
    }
    return 0;
  },

  /**
   * Soma total de compras do cartão que incidem em um mês.
   *
   * @param {Array} compras - lista de compras_cartao
   * @param {string} mesRef - 'YYYY-MM'
   * @returns {number}
   */
  totalCartaoMes(compras, mesRef) {
    return compras.reduce((soma, c) => soma + this.valorParcelaMes(c, mesRef), 0);
  },

  /**
   * Soma total de despesas de um mês (inclui fixas).
   *
   * @param {Array} despesas - lista de despesas
   * @returns {number}
   */
  totalDespesasMes(despesas) {
    return despesas.reduce((soma, d) => soma + Number(d.valor), 0);
  },

  /**
   * Calcula métricas financeiras completas para um mês.
   *
   * @param {Object} param
   * @param {Array}  param.despesas         - despesas do mês (incluindo fixas)
   * @param {Array}  param.compras          - compras_cartao (todas, filtro por mês feito aqui)
   * @param {Array}  param.rendimentosFixos - rendimentos_fixos ativos
   * @param {Array}  param.rendimentosVar   - rendimentos_variaveis
   * @param {string} param.mesRef           - 'YYYY-MM'
   * @returns {Object} métricas calculadas
   */
  calcMetricas({ despesas, compras, rendimentosFixos, rendimentosVar, mesRef }) {
    // Receitas
    const rendFixoTotal  = rendimentosFixos.reduce((s, r) => s + Number(r.valor), 0);
    const rendVarMes     = rendimentosVar.find(v => v.mes_ref === mesRef);
    const rendVarTotal   = rendVarMes ? Number(rendVarMes.valor) : 0;
    const totalReceita   = rendFixoTotal + rendVarTotal;

    // Despesas
    const totalDesp      = this.totalDespesasMes(despesas);
    const totalCC        = this.totalCartaoMes(compras, mesRef);
    const totalGastos    = totalDesp + totalCC;

    // Saldo e indicadores
    const saldo          = totalReceita - totalGastos;
    const pctComprometido = totalReceita > 0
      ? Math.min(100, (totalGastos / totalReceita) * 100)
      : (totalGastos > 0 ? 100 : 0);

    // Metas de poupança
    const meta20pct      = totalReceita * 0.20;
    const meta10pct      = totalReceita * 0.10;

    // Quanto precisaria ganhar (para 70% comprometido)
    const rendaIdeal     = totalGastos / 0.70;
    const rendaConfort   = totalGastos / 0.60;
    const gapRenda       = Math.max(0, rendaIdeal - totalReceita);

    // Status de saúde financeira
    let statusSaude;
    if (pctComprometido <= 50)       statusSaude = 'excelente';
    else if (pctComprometido <= 70)  statusSaude = 'bom';
    else if (pctComprometido <= 90)  statusSaude = 'atencao';
    else                              statusSaude = 'critico';

    // Despesas por categoria (para gráfico)
    const porCategoria = {};
    despesas.forEach(d => {
      porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + Number(d.valor);
    });
    // Adicionar cartão por categoria
    compras.forEach(c => {
      const val = this.valorParcelaMes(c, mesRef);
      if (val > 0) {
        porCategoria[c.categoria] = (porCategoria[c.categoria] || 0) + val;
      }
    });

    return {
      totalReceita, rendFixoTotal, rendVarTotal,
      totalDesp, totalCC, totalGastos,
      saldo, pctComprometido,
      meta20pct, meta10pct,
      rendaIdeal, rendaConfort, gapRenda,
      statusSaude, porCategoria,
    };
  },


  // ----------------------------------------------------------
  // CONSTANTES DE CATEGORIAS
  // ----------------------------------------------------------

  /** Categorias padrão de despesas */
  CATEGORIAS_DESPESA: [
    { nome: 'Moradia',         icone: '🏠', cor: '#378ADD' },
    { nome: 'Alimentação',     icone: '🛒', cor: '#639922' },
    { nome: 'Transporte',      icone: '🚗', cor: '#BA7517' },
    { nome: 'Saúde',           icone: '❤️', cor: '#E24B4A' },
    { nome: 'Educação',        icone: '📚', cor: '#1D9E75' },
    { nome: 'Lazer',           icone: '🎉', cor: '#7F77DD' },
    { nome: 'Contas fixas',    icone: '📄', cor: '#D4537E' },
    { nome: 'Vestuário',       icone: '👕', cor: '#EF9F27' },
    { nome: 'Eletrodoméstico', icone: '🔌', cor: '#5DCAA5' },
    { nome: 'Outros',          icone: '💡', cor: '#888780' },
  ],

  /** Retorna cor de uma categoria pelo nome */
  corCategoria(nome) {
    const cat = this.CATEGORIAS_DESPESA.find(c => c.nome === nome);
    return cat ? cat.cor : '#888780';
  },

  /** Retorna ícone de uma categoria pelo nome */
  iconeCategoria(nome) {
    const cat = this.CATEGORIAS_DESPESA.find(c => c.nome === nome);
    return cat ? cat.icone : '💡';
  },

  /** Status de saúde → classe Tailwind de cor */
  corStatus(status) {
    return {
      excelente: 'text-emerald-600',
      bom:       'text-green-600',
      atencao:   'text-amber-600',
      critico:   'text-red-600',
    }[status] || 'text-gray-600';
  },

  corStatusBg(status) {
    return {
      excelente: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      bom:       'bg-green-50 text-green-800 border-green-200',
      atencao:   'bg-amber-50 text-amber-800 border-amber-200',
      critico:   'bg-red-50 text-red-800 border-red-200',
    }[status] || 'bg-gray-50 text-gray-800';
  },

  /** Porcentagem → cor da barra */
  corBarra(pct) {
    if (pct <= 60) return 'bg-emerald-500';
    if (pct <= 80) return 'bg-amber-500';
    return 'bg-red-500';
  },


  // ----------------------------------------------------------
  // DOM HELPERS
  // ----------------------------------------------------------

  /** Mostra um elemento */
  show(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  },

  /** Esconde um elemento */
  hide(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  },

  /** Alterna visibilidade */
  toggle(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden');
  },

  /** Mostra toast de feedback */
  toast(mensagem, tipo = 'success') {
    const cores = {
      success: 'bg-emerald-600 text-white',
      error:   'bg-red-600 text-white',
      warn:    'bg-amber-500 text-white',
      info:    'bg-blue-600 text-white',
    };
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all duration-300 ${cores[tipo] || cores.info}`;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /** Loading state num botão */
  setLoading(btn, loading, textoOriginal) {
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Aguarde...';
      btn.classList.add('opacity-60', 'cursor-not-allowed');
    } else {
      btn.disabled = false;
      btn.textContent = textoOriginal || btn.dataset.originalText || btn.textContent;
      btn.classList.remove('opacity-60', 'cursor-not-allowed');
    }
  },

  /** Data de hoje em formato 'YYYY-MM-DD' */
  hoje() {
    return new Date().toISOString().split('T')[0];
  },

  nomeResponsavel(valor) {
    return {
      familia: 'Familia',
      eu: 'Eu',
      esposa: 'Esposa',
    }[valor] || valor || 'Nao informado';
  },
};

// Exporta para uso global
window.Utils = Utils;
