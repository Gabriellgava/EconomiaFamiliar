const PageCartoes = {
  _formCartaoBound: false,
  _formCompraBound: false,
  _previewBound: false,

  init() {
    this._renderCartoes();
    this._renderCompras();
    this._populaSelectCartoes();
    this._populaCategorias();
    this._setDataHoje();
    this._bindFormCartao();
    this._bindFormCompra();
    this._atualizarMes();
  },

  _renderCartoes() {
    const el = document.getElementById('cc-lista-cartoes');
    if (!el) return;

    if (!State.cartoes.length) {
      el.innerHTML = `<div class="empty-state">Nenhum cartão cadastrado.</div>`;
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
            <p class="item-meta">${Utils.escapeHtml(item.empresa || 'Empresa não informada')}</p>
            <span class="badge">Impacto no mês: ${Utils.fmtMoeda(gastoMes)}</span>
          </div>
          <button type="button" class="btn-icon" onclick="PageCartoes._deletarCartao('${item.id}')">×</button>
        </div>
      `;
    }).join('');
  },

  _renderCompras() {
    const el = document.getElementById('cc-lista-compras');
    if (!el) return;

    const itens = [...State.compras]
      .filter(item => Utils.valorParcelaMes(item, State.mesRef) > 0)
      .sort((a, b) => new Date(b.data_compra) - new Date(a.data_compra));

    if (!itens.length) {
      el.innerHTML = `<div class="empty-state">Nenhuma compra registrada.</div>`;
      return;
    }

    el.innerHTML = itens.map(item => {
      const parcelaMes = Utils.valorParcelaMes(item, State.mesRef);
      const cartaoNome = item.cartoes?.nome || 'Cartão';
      const cartaoEmpresa = item.cartoes?.empresa ? ` · ${item.cartoes.empresa}` : '';

      return `
        <div class="item-row">
          <div class="item-main">
            <p class="item-title">${Utils.escapeHtml(item.descricao)}</p>
            <p class="item-meta">
              ${Utils.iconeCategoria(item.categoria)} ${Utils.escapeHtml(item.categoria)} ·
              💳 ${Utils.escapeHtml(cartaoNome)}${Utils.escapeHtml(cartaoEmpresa)} ·
              ${Utils.fmtData(item.data_compra)}
            </p>
            <p class="item-meta">
              ${item.parcelas > 1 ? `${item.parcelas}x de ${Utils.fmtMoeda(item.valor_total / item.parcelas)}` : 'À vista'}
              · Impacto no mês: ${Utils.fmtMoeda(parcelaMes)}
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
      select.innerHTML = `<option value="">Cadastre um cartão primeiro</option>`;
      return;
    }

    select.innerHTML = State.cartoes
      .map(item => `<option value="${item.id}">${item.nome} - ${item.empresa || 'Sem empresa'}</option>`)
      .join('');
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

      if (!payload.nome) return Utils.toast('Informe o nome do cartão.', 'warn');
      if (!payload.empresa) return Utils.toast('Informe a empresa do cartão.', 'warn');

      Utils.setLoading(botao, true, 'Adicionar cartão');
      try {
        const novo = await DB.addCartao(payload);
        State.cartoes.push(novo);
        this._renderCartoes();
        this._populaSelectCartoes();
        form.reset();
        Utils.toast('Cartão adicionado.');
      } catch (error) {
        Utils.toast(error.message, 'error');
      } finally {
        Utils.setLoading(botao, false, 'Adicionar cartão');
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

      if (!payload.cartao_id) return Utils.toast('Selecione um cartão.', 'warn');
      if (!payload.descricao) return Utils.toast('Informe a descrição da compra.', 'warn');
      if (!payload.valor_total || payload.valor_total <= 0) return Utils.toast('Informe um valor válido.', 'warn');
      if (!payload.data_compra) return Utils.toast('Informe a data da compra.', 'warn');

      Utils.setLoading(botao, true, 'Registrar compra');
      try {
        const nova = await DB.addCompraCartao(payload);
        State.compras.unshift(nova);
        State.allCompras.unshift(nova);
        this._renderCompras();
        this._renderCartoes();
        form.reset();
        document.getElementById('cc-compra-data').value = Utils.hoje();
        document.getElementById('cc-compra-parcelas').value = '1';
        document.getElementById('cc-parcela-preview')?.classList.add('hidden');
        State.emit('mes-changed');
        Utils.toast('Compra registrada.');
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
        preview.textContent = parcelas > 1 ? `${parcelas}x de ${Utils.fmtMoeda(total / parcelas)}` : `À vista: ${Utils.fmtMoeda(total)}`;
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
    if (!window.confirm('Remover este cartão?')) return;

    try {
      await DB.deleteCartao(id);
      State.cartoes = State.cartoes.filter(item => item.id !== id);
      this._renderCartoes();
      this._populaSelectCartoes();
      Utils.toast('Cartão removido.');
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
      this._renderCompras();
      this._renderCartoes();
      State.emit('mes-changed');
      Utils.toast('Compra removida.');
    } catch (error) {
      Utils.toast(error.message, 'error');
    }
  },
};

window.PageCartoes = PageCartoes;
