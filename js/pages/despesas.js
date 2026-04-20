const PageDespesas = {
  _formBound: false,
  _navBound: false,

  init() {
    this._populaCategorias();
    this._setDataHoje();
    this._renderMesLabel();
    this._renderLista();
    this._bindForm();
    this._bindNavMes();
  },

  _populaCategorias() {
    const sel = document.getElementById('desp-categoria');
    if (!sel) return;

    sel.innerHTML = Utils.CATEGORIAS_DESPESA.map(c => `
      <option value="${c.nome}">${c.icone} ${c.nome}</option>
    `).join('');
  },

  _setDataHoje() {
    const input = document.getElementById('desp-data');
    if (input && !input.value) input.value = Utils.hoje();
  },

  _renderMesLabel() {
    const el = document.getElementById('desp-mes-label');
    if (el) el.textContent = State.mesLabel;
  },

  _renderLista() {
    const el = document.getElementById('desp-lista');
    const totalEl = document.getElementById('desp-total');
    if (!el) return;

    const despesas = State.despesas;

    if (!despesas.length) {
      if (totalEl) totalEl.textContent = Utils.fmtMoeda(0);
      el.innerHTML = `
        <div class="text-center py-12 text-gray-400">
          <p class="text-4xl mb-3">🧾</p>
          <p class="text-sm">Nenhuma despesa neste mes</p>
          <p class="text-xs mt-1">Use o formulario ao lado para adicionar</p>
        </div>
      `;
      return;
    }

    el.innerHTML = despesas.map(d => `
      <div class="flex items-start justify-between py-3 border-b border-gray-50 last:border-0 group">
        <div class="flex items-start gap-3">
          <span class="text-xl mt-0.5">${Utils.iconeCategoria(d.categoria)}</span>
          <div>
            <p class="text-sm font-medium text-gray-800 flex items-center gap-1">
              ${d.descricao}
              ${d.fixa ? '<span class="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">repete todo mes</span>' : ''}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">
              <span class="inline-block px-1.5 py-0.5 rounded" style="background:${Utils.corCategoria(d.categoria)}20; color:${Utils.corCategoria(d.categoria)}">
                ${d.categoria}
              </span>
              · ${Utils.nomeResponsavel(d.responsavel)} · ${Utils.fmtData(d.data)}
            </p>
            ${d.observacao ? `<p class="text-xs text-gray-400 mt-0.5 italic">${d.observacao}</p>` : ''}
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-red-500">${Utils.fmtMoeda(d.valor)}</span>
          <button onclick="PageDespesas._deletar('${d.id}')" class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 text-lg leading-none" title="Remover despesa">×</button>
        </div>
      </div>
    `).join('');

    const total = despesas.reduce((s, d) => s + Number(d.valor), 0);
    if (totalEl) totalEl.textContent = Utils.fmtMoeda(total);
  },

  _bindForm() {
    const form = document.getElementById('form-despesa');
    if (!form || this._formBound) return;
    this._formBound = true;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');

      const dados = {
        descricao: document.getElementById('desp-descricao').value.trim(),
        valor: parseFloat(document.getElementById('desp-valor').value),
        categoria: document.getElementById('desp-categoria').value,
        data: document.getElementById('desp-data').value,
        responsavel: document.getElementById('desp-responsavel').value,
        fixa: document.getElementById('desp-fixa').checked,
        observacao: document.getElementById('desp-obs').value.trim() || null,
      };

      if (!dados.descricao) return Utils.toast('Informe a descricao', 'warn');
      if (!dados.valor || dados.valor <= 0) return Utils.toast('Informe um valor valido', 'warn');
      if (!dados.data) return Utils.toast('Informe a data', 'warn');

      Utils.setLoading(btn, true);
      try {
        const nova = await DB.addDespesa(dados);
        State.despesas.unshift(nova);
        State.allDespesas.unshift(nova);
        this._renderLista();
        State.emit('mes-changed');
        form.reset();
        document.getElementById('desp-data').value = Utils.hoje();
        Utils.toast('Despesa adicionada!');
      } catch (err) {
        Utils.toast(err.message, 'error');
      } finally {
        Utils.setLoading(btn, false, 'Adicionar despesa');
      }
    });
  },

  async _deletar(id) {
    if (!confirm('Remover esta despesa?')) return;

    try {
      await DB.deleteDespesa(id);
      State.despesas = State.despesas.filter(d => d.id !== id);
      State.allDespesas = State.allDespesas.filter(d => d.id !== id);
      this._renderLista();
      State.emit('mes-changed');
      Utils.toast('Despesa removida', 'info');
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  },

  _bindNavMes() {
    if (this._navBound) return;
    this._navBound = true;

    document.getElementById('desp-btn-prev')?.addEventListener('click', () => State.navegarMes(-1));
    document.getElementById('desp-btn-next')?.addEventListener('click', () => State.navegarMes(1));
  },
};

window.PageDespesas = PageDespesas;
