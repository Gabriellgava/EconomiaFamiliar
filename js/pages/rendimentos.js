const PageRendimentos = {
  _formFixoBound: false,
  _formVariavelBound: false,

  init() {
    this._renderFixos();
    this._renderVariaveis();
    this._populaMesSelect();
    this._bindFormFixo();
    this._bindFormVariavel();
  },

  _renderFixos() {
    const el = document.getElementById('rend-fixos-lista');
    if (!el) return;

    if (!State.rendimentosFixos.length) {
      el.innerHTML = `
        <div class="text-center py-10 text-gray-400">
          <p class="text-3xl mb-2">💵</p>
          <p class="text-sm">Nenhum rendimento fixo cadastrado</p>
        </div>
      `;
      return;
    }

    const total = State.rendimentosFixos.reduce((s, r) => s + Number(r.valor), 0);

    el.innerHTML = `
      ${State.rendimentosFixos.map(r => `
        <div class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 group">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700 flex-shrink-0">
              ${r.responsavel === 'esposa' ? '👩' : r.responsavel === 'eu' ? '👨' : '👨‍👩‍👧'}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-800">${r.descricao}</p>
              <p class="text-xs text-gray-400">${Utils.nomeResponsavel(r.responsavel)} · recebe dia ${r.dia_recebimento}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-emerald-600">${Utils.fmtMoeda(r.valor)}</span>
            <button onclick="PageRendimentos._deletarFixo('${r.id}')" class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 text-xl leading-none" title="Remover">×</button>
          </div>
        </div>
      `).join('')}
      <div class="flex justify-between items-center pt-3 mt-1 border-t border-gray-200">
        <span class="text-sm font-semibold text-gray-700">Total fixo mensal</span>
        <span class="font-bold text-emerald-600">${Utils.fmtMoeda(total)}</span>
      </div>
    `;
  },

  _renderVariaveis() {
    const el = document.getElementById('rend-var-lista');
    if (!el) return;

    if (!State.rendimentosVariaveis.length) {
      el.innerHTML = `
        <div class="text-center py-10 text-gray-400">
          <p class="text-3xl mb-2">🗓</p>
          <p class="text-sm">Nenhum registro de renda variavel</p>
          <p class="text-xs mt-1">Registre mes a mes as substituicoes</p>
        </div>
      `;
      return;
    }

    const sorted = [...State.rendimentosVariaveis].sort((a, b) => b.mes_ref.localeCompare(a.mes_ref));
    const total12 = sorted.slice(0, 12).reduce((s, v) => s + Number(v.valor), 0);
    const media = sorted.length ? total12 / Math.min(12, sorted.length) : 0;

    el.innerHTML = `
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-emerald-50 rounded-xl p-3">
          <p class="text-xs text-emerald-600">Media mensal (12m)</p>
          <p class="text-lg font-semibold text-emerald-700">${Utils.fmtMoeda(media)}</p>
        </div>
        <div class="bg-blue-50 rounded-xl p-3">
          <p class="text-xs text-blue-600">Total acumulado</p>
          <p class="text-lg font-semibold text-blue-700">${Utils.fmtMoeda(total12)}</p>
        </div>
      </div>
      ${sorted.map(v => `
        <div class="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
          <div>
            <p class="text-sm font-medium text-gray-700">${Utils.mesRefLabel(v.mes_ref)}</p>
            ${v.descricao ? `<p class="text-xs text-gray-400">${v.descricao}</p>` : ''}
          </div>
          <span class="text-sm font-semibold text-emerald-600">${Utils.fmtMoeda(v.valor)}</span>
        </div>
      `).join('')}
    `;
  },

  _populaMesSelect() {
    const sel = document.getElementById('rend-var-mes');
    if (!sel) return;

    const meses = Utils.ultimosMeses(24);
    sel.innerHTML = meses.map(m => `
      <option value="${m}" ${m === State.mesRef ? 'selected' : ''}>${Utils.mesRefLabel(m)}</option>
    `).join('');
  },

  _bindFormFixo() {
    const form = document.getElementById('form-rendimento-fixo');
    if (!form || this._formFixoBound) return;
    this._formFixoBound = true;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      const dados = {
        descricao: document.getElementById('rendfix-descricao').value.trim(),
        valor: parseFloat(document.getElementById('rendfix-valor').value),
        responsavel: document.getElementById('rendfix-responsavel').value,
        dia_recebimento: parseInt(document.getElementById('rendfix-dia').value, 10) || 5,
      };

      if (!dados.descricao) return Utils.toast('Informe a descricao', 'warn');
      if (!dados.valor || dados.valor <= 0) return Utils.toast('Informe um valor valido', 'warn');

      Utils.setLoading(btn, true);
      try {
        const novo = await DB.addRendimentoFixo(dados);
        State.rendimentosFixos.push(novo);
        this._renderFixos();
        State.emit('mes-changed');
        form.reset();
        Utils.toast('Rendimento adicionado!');
      } catch (err) {
        Utils.toast(err.message, 'error');
      } finally {
        Utils.setLoading(btn, false, 'Adicionar rendimento');
      }
    });
  },

  _bindFormVariavel() {
    const form = document.getElementById('form-rendimento-var');
    if (!form || this._formVariavelBound) return;
    this._formVariavelBound = true;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      const dados = {
        mes_ref: document.getElementById('rend-var-mes').value,
        valor: parseFloat(document.getElementById('rendvar-valor').value),
        responsavel: 'esposa',
        descricao: document.getElementById('rendvar-obs').value.trim() || null,
      };

      if (!dados.valor || dados.valor < 0) return Utils.toast('Informe um valor valido', 'warn');

      Utils.setLoading(btn, true);
      try {
        const salvo = await DB.upsertRendimentoVariavel(dados);
        const idx = State.rendimentosVariaveis.findIndex(v => v.mes_ref === dados.mes_ref);
        if (idx >= 0) State.rendimentosVariaveis[idx] = salvo;
        else State.rendimentosVariaveis.push(salvo);

        this._renderVariaveis();
        State.emit('mes-changed');
        form.reset();
        this._populaMesSelect();
        Utils.toast('Renda variavel registrada!');
      } catch (err) {
        Utils.toast(err.message, 'error');
      } finally {
        Utils.setLoading(btn, false, 'Salvar');
      }
    });
  },

  async _deletarFixo(id) {
    if (!confirm('Remover este rendimento fixo?')) return;

    try {
      await DB.deleteRendimentoFixo(id);
      State.rendimentosFixos = State.rendimentosFixos.filter(r => r.id !== id);
      this._renderFixos();
      State.emit('mes-changed');
      Utils.toast('Rendimento removido', 'info');
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  },
};

window.PageRendimentos = PageRendimentos;
