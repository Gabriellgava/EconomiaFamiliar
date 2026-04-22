const Utils = {
  RESPONSAVEIS: [
    { value: 'gabriel', label: 'Gabriel', emoji: '\u{1F468}' },
    { value: 'meiry', label: 'Meiry', emoji: '\u{1F469}' },
  ],

  CATEGORIAS_DESPESA: [
    { nome: 'Moradia', icone: '\u{1F3E0}' },
    { nome: 'Alimentação', icone: '\u{1F6D2}' },
    { nome: 'Transporte', icone: '\u{1F697}' },
    { nome: 'Saúde', icone: '\u{1F48A}' },
    { nome: 'Educação', icone: '\u{1F4DA}' },
    { nome: 'Lazer', icone: '\u{1F389}' },
    { nome: 'Contas', icone: '\u{1F4A1}' },
    { nome: 'Assinaturas', icone: '\u{1F4FA}' },
    { nome: 'Outros', icone: '\u{1F4CC}' },
  ],

  fmtMoeda(valor = 0) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor) || 0);
  },

  fmtData(data) {
    if (!data) return '-';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(`${data}T12:00:00`));
  },

  hoje() {
    return new Date().toISOString().slice(0, 10);
  },

  mesAtual() {
    return new Date().toISOString().slice(0, 7);
  },

  avancaMes(mesRef, delta) {
    const [ano, mes] = mesRef.split('-').map(Number);
    const dt = new Date(ano, mes - 1 + delta, 1);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
  },

  mesRefLabel(mesRef) {
    const [ano, mes] = mesRef.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(ano, mes - 1, 1));
  },

  corrigirTexto(valor = '') {
    const texto = String(valor ?? '');
    if (!/[ÃÂð]/.test(texto)) return texto;

    try {
      return decodeURIComponent(escape(texto));
    } catch {
      return texto;
    }
  },

  nomeResponsavel(valor) {
    return this.RESPONSAVEIS.find(item => item.value === valor)?.label || 'Não informado';
  },

  emojiResponsavel(valor) {
    return this.RESPONSAVEIS.find(item => item.value === valor)?.emoji || '\u{1F464}';
  },

  iconeCategoria(nome) {
    const categoriaNormalizada = this.corrigirTexto(nome)
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();

    return this.CATEGORIAS_DESPESA.find(item => item.nome
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase() === categoriaNormalizada)?.icone || '\u{1F4CC}';
  },

  valorParcelaMes(compra, mesRef) {
    if (!compra?.data_compra || !compra?.parcelas) return 0;
    const inicio = compra.data_compra.slice(0, 7);
    const diff = this.diffMeses(inicio, mesRef);
    if (diff < 0 || diff >= compra.parcelas) return 0;
    return Number(compra.valor_total || 0) / Number(compra.parcelas || 1);
  },

  diffMeses(inicio, fim) {
    const [anoIni, mesIni] = inicio.split('-').map(Number);
    const [anoFim, mesFim] = fim.split('-').map(Number);
    return (anoFim - anoIni) * 12 + (mesFim - mesIni);
  },

  despesaAtivaNoMes(despesa, mesRef) {
    if (!despesa) return false;
    if (!despesa.fixa) return despesa.mes_ref === mesRef;

    const inicio = despesa.mes_ref || despesa.data?.slice(0, 7);
    if (!inicio) return false;
    if (this.diffMeses(inicio, mesRef) < 0) return false;

    const fim = despesa.recorrencia_ate ? despesa.recorrencia_ate.slice(0, 7) : null;
    if (!fim) return true;
    return this.diffMeses(mesRef, fim) >= 0;
  },

  calcMetricas({ despesas = [], compras = [], rendimentosFixos = [], rendimentosVar = [], mesRef }) {
    const rendaFixa = rendimentosFixos.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const rendaVariavel = rendimentosVar
      .filter(item => item.mes_ref === mesRef)
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const despesasFixas = despesas.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const comprasCartao = compras.reduce((acc, item) => acc + this.valorParcelaMes(item, mesRef), 0);
    const entradas = rendaFixa + rendaVariavel;
    const saidas = despesasFixas + comprasCartao;
    const saldo = entradas - saidas;
    const comprometimento = entradas > 0 ? (saidas / entradas) * 100 : 0;

    return {
      rendaFixa,
      rendaVariavel,
      despesas: despesasFixas,
      comprasCartao,
      entradas,
      saidas,
      saldo,
      comprometimento,
    };
  },

  setLoading(botao, ativo, textoNormal = 'Salvar') {
    if (!botao) return;
    botao.disabled = ativo;
    botao.dataset.originalText ||= botao.textContent;
    botao.textContent = ativo ? 'Salvando...' : textoNormal || botao.dataset.originalText;
  },

  toast(mensagem, tipo = 'success') {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;

    const el = document.createElement('div');
    el.className = `toast ${tipo}`;
    el.textContent = this.corrigirTexto(mensagem);
    stack.appendChild(el);
    window.setTimeout(() => el.remove(), 3200);
  },

  escapeHtml(valor = '') {
    return String(this.corrigirTexto(valor))
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  },
};

window.Utils = Utils;

