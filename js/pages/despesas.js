const PageDespesas = {
  _bound: false,
  _tipoBound: false,

  init() {
    this._populaCategorias();
    this._populaResponsaveis();
    this._setDataHoje();
    this._bindTipoDespesa();
    this._bindForm();
    this._renderLista();
    this._atualizarMes();
  },

  _populaCategorias() {
    const select = document.getElementById('desp-categoria');
    if (!select) return;
    select.innerHTML = Utils.CATEGORIAS_DESPESA.map(item => `
      <option value="${item.nome}">${item.icone} ${item.nome}</option>
    `).join('');
  },

  _populaResponsaveis() {
    const select = document.getElementById('desp-responsavel');
    if (!select) return;
    select.innerHTML = Utils.RESPONSAVEIS.map(item => `
      <option value="${item.value}">${item.emoji} ${item.label}</option>
    `).join('');
  },

  _setDataHoje() {
    const input = document.getElementById('desp-data');
    if (input && !input.value) input.value = Utils.hoje();
  },

  _bindTipoDespesa() {
    const select = document.getElementById('desp-tipo');
    const wrap = document.getElementById('desp-recorrencia-wrap');
    const input = document.getElementById('desp-recorrencia-ate');
    if (!select || !wrap || this._tipoBound) return;
    this._tipoBound = true;

    const sync = () => {
      const recorrente = select.value === 'recorrente';
      wrap.classList.toggle('hidden', !recorrente);
      if (!recorrente) input.value = '';
    };

    select.addEventListener('change', sync);
    sync();
  },

  _bindForm() {
    const form = document.getElementById('form-despesa');
    if (!form || this._bound) return;
    this._bound = true;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const botao = form.querySelector('button[type="submit"]');
      const data = document.getElementById('desp-data').value;
      const recorrenciaAte = document.getElementById('desp-recorrencia-ate').value || null;
      const recorrente = document.getElementById('desp-tipo').value === 'recorrente';
      const payload = {
        descricao: document.getElementById('desp-descricao').value.trim(),
        valor: parseFloat(document.getElementById('desp-valor').value),
        categoria: document.getElementById('desp-categoria').value,
        data,
        responsavel: document.getElementById('desp-responsavel').value,
        fixa: recorrente,
        recorrencia_ate: recorrente ? recorrenciaAte : null,
        observacao: document.getElementById('desp-obs').value.trim() || null,
      };

      if (!payload.descricao) return Utils.toast('Informe a descrição da despesa.', 'warn');
      if (!payload.valor || payload.valor <= 0) return Utils.toast('Informe um valor válido.', 'warn');
      if (!payload.data) return Utils.toast('Informe a data da despesa.', 'warn');
      if (!payload.responsavel) return Utils.toast('Selecione o responsável.', 'warn');
      if (payload.recorrencia_ate && payload.recorrencia_ate < payload.data) {
        return Utils.toast('A data final da recorrência não pode ser anterior à data inicial.', 'warn');
      }

      Utils.setLoading(botao, true, 'Salvar despesa');
      try {
        const nova = await DB.addDespesa(payload);
        State.allDespesas.unshift(nova);
        if (Utils.despesaAtivaNoMes(nova, State.mesRef)) {
          State.despesas.unshift(nova);
        }
        this._renderLista();
        form.reset();
        document.getElementById('desp-data').value = Utils.hoje();
        document.getElementById('desp-tipo').value = 'avulsa';
        document.getElementById('desp-recorrencia-wrap').classList.add('hidden');
        State.emit('mes-changed');
        Utils.toast('Despesa salva com sucesso.');
      } catch (error) {
        Utils.toast(error.message, 'error');
      } finally {
        Utils.setLoading(botao, false, 'Salvar despesa');
      }
    });
  },

  _renderLista() {
    const el = document.getElementById('desp-lista');
    if (!el) return;

    if (!State.despesas.length) {
      el.innerHTML = `<div class="empty-state">Nenhuma despesa ativa em ${Utils.mesRefLabel(State.mesRef)}.</div>`;
      return;
    }

    const itens = [...State.despesas].sort((a, b) => new Date(b.data) - new Date(a.data));

    el.innerHTML = itens.map(item => {
      const recorrencia = item.fixa
        ? item.recorrencia_ate
          ? `Recorrente até ${Utils.fmtData(item.recorrencia_ate)}`
          : 'Recorrente sem prazo final'
        : 'Avulsa';

      return `
        <div class="item-row">
          <div class="item-main">
            <p class="item-title">${Utils.escapeHtml(item.descricao)}</p>
            <p class="item-meta">
              ${Utils.iconeCategoria(item.categoria)} ${Utils.escapeHtml(item.categoria)} ·
              ${Utils.emojiResponsavel(item.responsavel)} ${Utils.nomeResponsavel(item.responsavel)} ·
              ${Utils.fmtData(item.data)}
            </p>
            <p class="item-meta">${recorrencia}${item.observacao ? ` · ${Utils.escapeHtml(item.observacao)}` : ''}</p>
          </div>
          <div class="item-actions">
            <span class="badge ${item.fixa ? 'success' : ''}">${item.fixa ? 'Recorrente' : 'Avulsa'}</span>
            <strong>${Utils.fmtMoeda(item.valor)}</strong>
            <button type="button" class="btn-icon" onclick="PageDespesas._deletar('${item.id}')" aria-label="Excluir despesa">×</button>
          </div>
        </div>
      `;
    }).join('');
  },

  _atualizarMes() {
    document.querySelectorAll('.mes-ref-label').forEach(el => {
      el.textContent = Utils.mesRefLabel(State.mesRef);
    });
  },

  async _deletar(id) {
    if (!window.confirm('Deseja remover esta despesa?')) return;

    try {
      await DB.deleteDespesa(id);
      State.despesas = State.despesas.filter(item => item.id !== id);
      State.allDespesas = State.allDespesas.filter(item => item.id !== id);
      this._renderLista();
      State.emit('mes-changed');
      Utils.toast('Despesa removida.');
    } catch (error) {
      Utils.toast(error.message, 'error');
    }
  },
};

window.PageDespesas = PageDespesas;
