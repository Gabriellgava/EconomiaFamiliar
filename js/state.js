const State = {
  mesRef: Utils.mesAtual(),
  rendimentosFixos: [],
  rendimentosVariaveis: [],
  despesas: [],
  compras: [],
  allDespesas: [],
  allCompras: [],
  cartoes: [],
  perfil: null,
  loading: false,
  _handlers: {},

  async navegarMes(delta) {
    this.mesRef = Utils.avancaMes(this.mesRef, delta);
    await this.recarregarMes();
    this.emit('mes-changed');
  },

  get mesLabel() {
    return Utils.mesRefLabel(this.mesRef);
  },

  async carregarTudo() {
    this.loading = true;
    this.emit('loading', true);

    try {
      const [
        rendFix,
        rendVar,
        desp,
        compras,
        cartoes,
        perfil,
        allDespesas,
        allCompras,
      ] = await Promise.all([
        DB.getRendimentosFixos(),
        DB.getRendimentosVariaveis(),
        DB.getDespesasMes(this.mesRef),
        DB.getComprasCartaoMes(this.mesRef),
        DB.getCartoes(),
        DB.getPerfil(),
        DB.getAllDespesas(),
        DB.getAllComprasCartao(),
      ]);

      this.rendimentosFixos = rendFix;
      this.rendimentosVariaveis = rendVar;
      this.despesas = desp;
      this.compras = compras;
      this.allDespesas = allDespesas;
      this.allCompras = allCompras;
      this.cartoes = cartoes;
      this.perfil = perfil;
      this.emit('perfil-updated', perfil);
    } finally {
      this.loading = false;
      this.emit('loading', false);
    }
  },

  async recarregarMes() {
    const [desp, compras] = await Promise.all([
      DB.getDespesasMes(this.mesRef),
      DB.getComprasCartaoMes(this.mesRef),
    ]);

    this.despesas = desp;
    this.compras = compras;
  },

  get metricas() {
    return Utils.calcMetricas({
      despesas: this.despesas,
      compras: this.compras,
      rendimentosFixos: this.rendimentosFixos,
      rendimentosVar: this.rendimentosVariaveis,
      mesRef: this.mesRef,
    });
  },

  on(evento, fn) {
    if (!this._handlers[evento]) this._handlers[evento] = [];
    this._handlers[evento].push(fn);
  },

  off(evento, fn) {
    if (!this._handlers[evento]) return;
    this._handlers[evento] = this._handlers[evento].filter(h => h !== fn);
  },

  emit(evento, dados) {
    (this._handlers[evento] || []).forEach(fn => fn(dados));
  },
};

window.State = State;
