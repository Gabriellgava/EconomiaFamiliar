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
  },

  _renderCartoes() {
    const el = document.getElementById('cc-lista-cartoes');
    if (!el) return;

    if (!State.cartoes.length) {
      el.innerHTML = `<p class="text-gray-400 text-sm text-center py-6">Nenhum cartao cadastrado</p>`;
      return;
    }

    el.innerHTML = State.cartoes.map(c => {
      const gastoMes = State.compras
        .filter(p => p.cartao_id === c.id)
        .reduce((s, p) => s + Utils.valorParcelaMes(p, State.mesRef), 0);

      return `
        <div class="border border-gray-100 rounded-xl p-4 mb-3 bg-gradient-to-br from-white to-emerald-50/60">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-semibold text-gray-800">${c.nome}</p>
              <p class="text-xs text-gray-400 mt-0.5">${c.empresa || 'Empresa nao informada'}</p>
            </div>
            <button onclick="PageCartoes._deletarCartao('${c.id}')" class="text-gray-300 hover:text-red-400 transition-colors text-xl leading-none ml-2" title="Remover cartao">×</button>
          </div>

          <div class="mt-4 rounded-xl bg-white/80 border border-emerald-100 px-3 py-2">
            <p class="text-xs text-gray-500">Impacto das parcelas neste mes</p>
            <p class="text-base font-semibold text-gray-800 mt-0.5">${Utils.fmtMoeda(gastoMes)}</p>
          </div>
        </div>
      `;
    }).join('');
  },

  _renderCompras() {
    const el = document.getElementById('cc-lista-compras');
    if (!el) return;

    if (!State.compras.length) {
      el.innerHTML = `
        <div class="text-center py-12 text-gray-400">
          <p class="text-4xl mb-3">💳</p>
          <p class="text-sm">Nenhuma compra registrada</p>
        </div>
      `;
      return;
    }

    const sorted = [...State.compras].sort((a, b) => new Date(b.data_compra) - new Date(a.data_compra));

    el.innerHTML = sorted.map(c => {
      const parcelaMes = Utils.valorParcelaMes(c, State.mesRef);
      const cartaoNome = c.cartoes?.nome || 'Cartao';
      const cartaoEmpresa = c.cartoes?.empresa || '';

      return `
        <div class="flex items-start justify-between py-3 border-b border-gray-50 last:border-0 group">
          <div class="flex items-start gap-3">
            <span class="text-xl mt-0.5">${Utils.iconeCategoria(c.categoria)}</span>
            <div>
              <p class="text-sm font-medium text-gray-800">
                ${c.descricao}
                ${c.parcelas > 1
                  ? `<span class="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">${c.parcelas}x de ${Utils.fmtMoeda(c.valor_total / c.parcelas)}</span>`
                  : '<span class="ml-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">a vista</span>'}
              </p>
              <p class="text-xs text-gray-400 mt-0.5">${cartaoNome}${cartaoEmpresa ? ` · ${cartaoEmpresa}` : ''} · ${c.categoria} · ${Utils.fmtData(c.data_compra)}</p>
              ${parcelaMes > 0 ? `<p class="text-xs text-blue-600 mt-0.5">Impacto neste mes: ${Utils.fmtMoeda(parcelaMes)}</p>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-gray-700">${Utils.fmtMoeda(c.valor_total)}</span>
            <button onclick="PageCartoes._deletarCompra('${c.id}')" class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 text-lg leading-none" title="Remover compra">×</button>
          </div>
        </div>
      `;
    }).join('');
  },

  _populaSelectCartoes() {
    const sel = document.getElementById('cc-compra-cartao');
    if (!sel) return;

    if (!State.cartoes.length) {
      sel.innerHTML = `<option value="">— Cadastre um cartao primeiro —</option>`;
      return;
    }

    sel.innerHTML = State.cartoes
      .map(c => `<option value="${c.id}">${c.nome} - ${c.empresa || 'Sem empresa'}</option>`)
      .join('');
  },

  _populaCategorias() {
    const sel = document.getElementById('cc-compra-categoria');
    if (!sel) return;

    sel.innerHTML = Utils.CATEGORIAS_DESPESA.map(c => `
      <option value="${c.nome}">${c.icone} ${c.nome}</option>
    `).join('');
  },

  _setDataHoje() {
    const input = document.getElementById('cc-compra-data');
    if (input && !input.value) input.value = Utils.hoje();
  },

  _bindFormCartao() {
    const form = document.getElementById('form-cartao');
    if (!form || this._formCartaoBound) return;
    this._formCartaoBound = true;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      const dados = {
        nome: document.getElementById('cc-nome').value.trim(),
        empresa: document.getElementById('cc-empresa').value.trim(),
      };

      if (!dados.nome) return Utils.toast('Informe o nome do cartao', 'warn');
      if (!dados.empresa) return Utils.toast('Informe a empresa do cartao', 'warn');

      Utils.setLoading(btn, true);
      try {
        const novo = await DB.addCartao(dados);
        State.cartoes.push(novo);
        this._renderCartoes();
        this._populaSelectCartoes();
        form.reset();
        Utils.toast('Cartao adicionado!');
      } catch (err) {
        Utils.toast(err.message, 'error');
      } finally {
        Utils.setLoading(btn, false, 'Adicionar cartao');
      }
    });
  },

  _bindFormCompra() {
    const form = document.getElementById('form-compra-cc');
    if (!form || this._formCompraBound) return;
    this._formCompraBound = true;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      const dados = {
        cartao_id: document.getElementById('cc-compra-cartao').value,
        descricao: document.getElementById('cc-compra-descricao').value.trim(),
        valor_total: parseFloat(document.getElementById('cc-compra-valor').value),
        parcelas: parseInt(document.getElementById('cc-compra-parcelas').value, 10),
        categoria: document.getElementById('cc-compra-categoria').value,
        data_compra: document.getElementById('cc-compra-data').value,
        observacao: document.getElementById('cc-compra-obs').value.trim() || null,
      };

      if (!dados.cartao_id) return Utils.toast('Selecione um cartao', 'warn');
      if (!dados.descricao) return Utils.toast('Informe a descricao', 'warn');
      if (!dados.valor_total || dados.valor_total <= 0) return Utils.toast('Valor invalido', 'warn');
      if (!dados.data_compra) return Utils.toast('Informe a data', 'warn');

      Utils.setLoading(btn, true);
      try {
        const nova = await DB.addCompraCartao(dados);
        State.compras.unshift(nova);
        State.allCompras.unshift(nova);
        this._renderCompras();
        this._renderCartoes();
        State.emit('mes-changed');
        form.reset();
        document.getElementById('cc-compra-data').value = Utils.hoje();
        document.getElementById('cc-compra-parcelas').value = '1';
        document.getElementById('cc-parcela-preview')?.classList.add('hidden');
        Utils.toast('Compra registrada!');
      } catch (err) {
        Utils.toast(err.message, 'error');
      } finally {
        Utils.setLoading(btn, false, 'Registrar compra');
      }
    });

    if (this._previewBound) return;
    this._previewBound = true;

    const calcParcela = () => {
      const total = parseFloat(document.getElementById('cc-compra-valor').value) || 0;
      const parc = parseInt(document.getElementById('cc-compra-parcelas').value, 10) || 1;
      const preview = document.getElementById('cc-parcela-preview');
      if (!preview) return;

      if (total > 0) {
        preview.textContent = parc > 1 ? `${parc}x de ${Utils.fmtMoeda(total / parc)}` : `A vista: ${Utils.fmtMoeda(total)}`;
        preview.classList.remove('hidden');
      } else {
        preview.classList.add('hidden');
      }
    };

    document.getElementById('cc-compra-valor')?.addEventListener('input', calcParcela);
    document.getElementById('cc-compra-parcelas')?.addEventListener('change', calcParcela);
  },

  async _deletarCartao(id) {
    if (!confirm('Remover este cartao? As compras associadas serao mantidas.')) return;

    try {
      await DB.deleteCartao(id);
      State.cartoes = State.cartoes.filter(c => c.id !== id);
      this._renderCartoes();
      this._populaSelectCartoes();
      Utils.toast('Cartao removido', 'info');
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  },

  async _deletarCompra(id) {
    if (!confirm('Remover esta compra?')) return;

    try {
      await DB.deleteCompraCartao(id);
      State.compras = State.compras.filter(c => c.id !== id);
      State.allCompras = State.allCompras.filter(c => c.id !== id);
      this._renderCompras();
      this._renderCartoes();
      State.emit('mes-changed');
      Utils.toast('Compra removida', 'info');
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  },
};

window.PageCartoes = PageCartoes;
