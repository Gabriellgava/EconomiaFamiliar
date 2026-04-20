const PageCartoes = {
  _formCartaoBound: false,
  _formCompraBound: false,
  _previewBound: false,
  _subnavBound: false,
  _filtrosBound: false,
  _viewAtual: 'cadastro',

  init() {
    this._renderCartoes();
    this._renderResumoMes();
    this._renderConsulta();
    this._populaSelectCartoes();
    this._populaFiltroCartoes();
    this._populaCategorias();
    this._setDataHoje();
    this._bindSubnav();
    this._bindFormCartao();
    this._bindFormCompra();
    this._bindFiltros();
    this._atualizarMes();
    this._mostrarTela(this._viewAtual);
  },

  _bindSubnav() {
    if (this._subnavBound) return;
    this._subnavBound = true;

    document.querySelectorAll('[data-cc-view]').forEach(botao => {
      botao.addEventListener('click', () => {
        this._mostrarTela(botao.dataset.ccView);
      });
    });
  },

  _mostrarTela(view) {
    this._viewAtual = view;

    document.querySelectorAll('[data-cc-screen]').forEach(screen => {
      const ativo = screen.id === `cc-view-${view}`;
      screen.classList.toggle('hidden', !ativo);
    });

    document.querySelectorAll('[data-cc-view]').forEach(botao => {
      botao.classList.toggle('is-active', botao.dataset.ccView === view);
    });
  },

  _renderCartoes() {
    const el = document.getElementById('cc-lista-cartoes');
    if (!el) return;

    if (!State.cartoes.length) {
      el.innerHTML = `<div class="empty-state">Nenhum cartao cadastrado.</div>`;
      return;
    }

    el.innerHTML = State.cartoes.map(item => {
      const gastoMes = State.compras
        .filter(compra => compra.cartao_id === item.id)
        .reduce((acc, compra) => acc + Utils.valorParcelaMes(compra, State.mesRef), 0);

      return `
        <div class="item-row">
          <div class="item-main">
            <p class="item-title">${Utils.escapeHtml(item.nome)}</p>
            <p class="item-meta">${Utils.escapeHtml(item.empresa || 'Empresa nao informada')}</p>
            <span class="badge">Impacto no mes: ${Utils.fmtMoeda(gastoMes)}</span>
          </div>
          <button type="button" class="btn-icon" onclick="PageCartoes._deletarCartao('${item.id}')">×</button>
        </div>
      `;
    }).join('');
  },

  _renderResumoMes() {
    const el = document.getElementById('cc-resumo-mes');
    if (!el) return;

    if (!State.cartoes.length) {
      el.innerHTML = `<div class="empty-state">Cadastre um cartao para comecar a lancar despesas.</div>`;
      return;
    }

    const linhas = State.cartoes.map(item => {
      const impacto = State.compras
        .filter(compra => compra.cartao_id === item.id)
        .reduce((acc, compra) => acc + Utils.valorParcelaMes(compra, State.mesRef), 0);

      return `
        <div class="item-row">
          <div class="item-main">
            <p class="item-title">${Utils.escapeHtml(item.nome)}</p>
            <p class="item-meta">${Utils.escapeHtml(item.empresa || 'Empresa nao informada')}</p>
          </div>
          <strong>${Utils.fmtMoeda(impacto)}</strong>
        </div>
      `;
    });

    el.innerHTML = linhas.join('');
  },

  _renderConsulta() {
    const lista = document.getElementById('cc-lista-compras');
    const resumo = document.getElementById('cc-resumo-consulta');
    if (!lista || !resumo) return;

    const filtroCartao = document.getElementById('cc-filtro-cartao')?.value || 'todos';
    const compras = [...State.allCompras]
      .filter(item => filtroCartao === 'todos' || item.cartao_id === filtroCartao)
      .sort((a, b) => new Date(b.data_compra) - new Date(a.data_compra));

    const total = compras.reduce((acc, item) => acc + Number(item.valor_total || 0), 0);
    const totalMes = compras.reduce((acc, item) => acc + Utils.valorParcelaMes(item, State.mesRef), 0);
    const cartaoSelecionado = filtroCartao === 'todos'
      ? 'Todos os cartoes'
      : State.cartoes.find(item => item.id === filtroCartao)?.nome || 'Cartao';

    resumo.innerHTML = `
      <div class="item-row">
        <div class="item-main">
          <p class="item-title">${cartaoSelecionado}</p>
          <p class="item-meta">${compras.length} despesa(s) encontrada(s)</p>
        </div>
        <div class="item-actions">
          <span class="badge">Total geral: ${Utils.fmtMoeda(total)}</span>
          <span class="badge">Impacto no mes: ${Utils.fmtMoeda(totalMes)}</span>
        </div>
      </div>
    `;

    if (!compras.length) {
      lista.innerHTML = `<div class="empty-state">Nenhuma despesa encontrada para esse filtro.</div>`;
      return;
    }

    lista.innerHTML = compras.map(item => {
      const cartaoNome = item.cartoes?.nome || 'Cartao';
      const cartaoEmpresa = item.cartoes?.empresa ? ` - ${item.cartoes.empresa}` : '';
      const parcelaTexto = item.parcelas > 1
        ? `${item.parcelas}x de ${Utils.fmtMoeda(item.valor_total / item.parcelas)}`
        : 'A vista';

      return `
        <div class="item-row">
          <div class="item-main">
            <p class="item-title">${Utils.escapeHtml(item.descricao)}</p>
            <p class="item-meta">
              ${Utils.escapeHtml(cartaoNome)}${Utils.escapeHtml(cartaoEmpresa)} - ${Utils.escapeHtml(item.categoria)} - ${Utils.fmtData(item.data_compra)}
            </p>
            <p class="item-meta">
              ${parcelaTexto} - Impacto no mes: ${Utils.fmtMoeda(Utils.valorParcelaMes(item, State.mesRef))}
            </p>
          </div>
          <div class="item-actions">
            <strong>${Utils.fmtMoeda(item.valor_total)}</strong>
            <button type="button" class="btn-icon" onclick="PageCartoes._deletarCompra('${item.id}')">×</button>
          </div>
        </div>
      `;
    }).join('');
  },

  _populaSelectCartoes() {
    const select = document.getElementById('cc-compra-cartao');
    if (!select) return;

    if (!State.cartoes.length) {
      select.innerHTML = `<option value="">Cadastre um cartao primeiro</option>`;
      return;
    }

    select.innerHTML = State.cartoes
      .map(item => `<option value="${item.id}">${item.nome} - ${item.empresa || 'Sem empresa'}</option>`)
      .join('');
  },

  _populaFiltroCartoes() {
    const select = document.getElementById('cc-filtro-cartao');
    if (!select) return;

    const atual = select.value || 'todos';
    select.innerHTML = `
      <option value="todos">Todos os cartoes</option>
      ${State.cartoes.map(item => `<option value="${item.id}">${item.nome} - ${item.empresa || 'Sem empresa'}</option>`).join('')}
    `;
    select.value = State.cartoes.some(item => item.id === atual) || atual === 'todos' ? atual : 'todos';
  },

  _bindFiltros() {
    const select = document.getElementById('cc-filtro-cartao');
    if (!select || this._filtrosBound) return;
    this._filtrosBound = true;

    select.addEventListener('change', () => this._renderConsulta());
  },

  _populaCategorias() {
    const select = document.getElementById('cc-compra-categoria');
    if (!select) return;

    select.innerHTML = Utils.CATEGORIAS_DESPESA
      .map(item => `<option value="${item.nome}">${item.icone} ${item.nome}</option>`)
      .join('');
  },

  _setDataHoje() {
    const input = document.getElementById('cc-compra-data');
    if (input && !input.value) input.value = Utils.hoje();
  },

  _bindFormCartao() {
    const form = document.getElementById('form-cartao');
    if (!form || this._formCartaoBound) return;
    this._formCartaoBound = true;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const botao = form.querySelector('button[type="submit"]');
      const payload = {
        nome: document.getElementById('cc-nome').value.trim(),
        empresa: document.getElementById('cc-empresa').value.trim(),
      };

      if (!payload.nome) return Utils.toast('Informe o nome do cartao.', 'warn');
      if (!payload.empresa) return Utils.toast('Informe a empresa do cartao.', 'warn');

      Utils.setLoading(botao, true, 'Adicionar cartao');
      try {
        const novo = await DB.addCartao(payload);
        State.cartoes.push(novo);
        this._renderCartoes();
        this._renderResumoMes();
        this._populaSelectCartoes();
        this._populaFiltroCartoes();
        form.reset();
        Utils.toast('Cartao adicionado.');
      } catch (error) {
        Utils.toast(error.message, 'error');
      } finally {
        Utils.setLoading(botao, false, 'Adicionar cartao');
      }
    });
  },

  _bindFormCompra() {
    const form = document.getElementById('form-compra-cc');
    if (!form || this._formCompraBound) return;
    this._formCompraBound = true;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const botao = form.querySelector('button[type="submit"]');
      const payload = {
        cartao_id: document.getElementById('cc-compra-cartao').value,
        descricao: document.getElementById('cc-compra-descricao').value.trim(),
        valor_total: parseFloat(document.getElementById('cc-compra-valor').value),
        parcelas: parseInt(document.getElementById('cc-compra-parcelas').value, 10),
        categoria: document.getElementById('cc-compra-categoria').value,
        data_compra: document.getElementById('cc-compra-data').value,
        observacao: document.getElementById('cc-compra-obs').value.trim() || null,
      };

      if (!payload.cartao_id) return Utils.toast('Selecione um cartao.', 'warn');
      if (!payload.descricao) return Utils.toast('Informe a descricao da compra.', 'warn');
      if (!payload.valor_total || payload.valor_total <= 0) return Utils.toast('Informe um valor valido.', 'warn');
      if (!payload.data_compra) return Utils.toast('Informe a data da compra.', 'warn');

      Utils.setLoading(botao, true, 'Registrar compra');
      try {
        const nova = await DB.addCompraCartao(payload);
        State.compras.unshift(nova);
        State.allCompras.unshift(nova);
        this._renderResumoMes();
        this._renderConsulta();
        this._renderCartoes();
        form.reset();
        document.getElementById('cc-compra-data').value = Utils.hoje();
        document.getElementById('cc-compra-parcelas').value = '1';
        document.getElementById('cc-parcela-preview')?.classList.add('hidden');
        State.emit('mes-changed');
        Utils.toast('Compra registrada.');
        this._mostrarTela('consulta');
      } catch (error) {
        Utils.toast(error.message, 'error');
      } finally {
        Utils.setLoading(botao, false, 'Registrar compra');
      }
    });

    if (this._previewBound) return;
    this._previewBound = true;

    const calcParcela = () => {
      const total = parseFloat(document.getElementById('cc-compra-valor').value) || 0;
      const parcelas = parseInt(document.getElementById('cc-compra-parcelas').value, 10) || 1;
      const preview = document.getElementById('cc-parcela-preview');
      if (!preview) return;

      if (total > 0) {
        preview.textContent = parcelas > 1
          ? `${parcelas}x de ${Utils.fmtMoeda(total / parcelas)}`
          : `A vista: ${Utils.fmtMoeda(total)}`;
        preview.classList.remove('hidden');
      } else {
        preview.classList.add('hidden');
      }
    };

    document.getElementById('cc-compra-valor')?.addEventListener('input', calcParcela);
    document.getElementById('cc-compra-parcelas')?.addEventListener('change', calcParcela);
  },

  _atualizarMes() {
    document.querySelectorAll('.mes-ref-label').forEach(el => {
      el.textContent = Utils.mesRefLabel(State.mesRef);
    });
  },

  async _deletarCartao(id) {
    if (!window.confirm('Remover este cartao?')) return;

    try {
      await DB.deleteCartao(id);
      State.cartoes = State.cartoes.filter(item => item.id !== id);
      this._renderCartoes();
      this._renderResumoMes();
      this._populaSelectCartoes();
      this._populaFiltroCartoes();
      this._renderConsulta();
      Utils.toast('Cartao removido.');
    } catch (error) {
      Utils.toast(error.message, 'error');
    }
  },

  async _deletarCompra(id) {
    if (!window.confirm('Remover esta compra?')) return;

    try {
      await DB.deleteCompraCartao(id);
      State.compras = State.compras.filter(item => item.id !== id);
      State.allCompras = State.allCompras.filter(item => item.id !== id);
      this._renderResumoMes();
      this._renderConsulta();
      this._renderCartoes();
      State.emit('mes-changed');
      Utils.toast('Compra removida.');
    } catch (error) {
      Utils.toast(error.message, 'error');
    }
  },
};

window.PageCartoes = PageCartoes;
