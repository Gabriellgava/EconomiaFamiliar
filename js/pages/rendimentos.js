const PageRendimentos = {
  _fixoBound: false,
  _variavelBound: false,

  init() {
    this._populaResponsaveis();
    this._preencheMesAtual();
    this._bindFixo();
    this._bindVariavel();
    this._renderFixos();
    this._renderVariaveis();
    this._atualizarMes();
  },

  _populaResponsaveis() {
    const select = document.getElementById('rf-responsavel');
    if (!select) return;
    select.innerHTML = Utils.RESPONSAVEIS.map(item => `
      <option value="${item.value}">${item.emoji} ${item.label}</option>
    `).join('');
  },

  _preencheMesAtual() {
    const input = document.getElementById('rv-mes');
    if (input && !input.value) input.value = State.mesRef;
  },

  _bindFixo() {
    const form = document.getElementById('form-rendimento-fixo');
    if (!form || this._fixoBound) return;
    this._fixoBound = true;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const botao = form.querySelector('button[type="submit"]');
      const payload = {
        descricao: document.getElementById('rf-descricao').value.trim(),
        valor: parseFloat(document.getElementById('rf-valor').value),
        dia_recebimento: parseInt(document.getElementById('rf-dia').value, 10),
        responsavel: document.getElementById('rf-responsavel').value,
      };

      if (!payload.descricao) return Utils.toast('Informe a descrição do rendimento.', 'warn');
      if (!payload.valor || payload.valor <= 0) return Utils.toast('Informe um valor válido.', 'warn');
      if (!payload.dia_recebimento || payload.dia_recebimento < 1 || payload.dia_recebimento > 31) {
        return Utils.toast('Informe um dia de recebimento entre 1 e 31.', 'warn');
      }

      Utils.setLoading(botao, true, 'Adicionar rendimento');
      try {
        const novo = await DB.addRendimentoFixo(payload);
        State.rendimentosFixos.push(novo);
        this._renderFixos();
        State.emit('mes-changed');
        form.reset();
        Utils.toast('Rendimento fixo adicionado.');
      } catch (error) {
        Utils.toast(error.message, 'error');
      } finally {
        Utils.setLoading(botao, false, 'Adicionar rendimento');
      }
    });
  },

  _bindVariavel() {
    const form = document.getElementById('form-rendimento-variavel');
    if (!form || this._variavelBound) return;
    this._variavelBound = true;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const botao = form.querySelector('button[type="submit"]');
      const payload = {
        mes_ref: document.getElementById('rv-mes').value,
        valor: parseFloat(document.getElementById('rv-valor').value),
        descricao: document.getElementById('rv-descricao').value.trim() || null,
      };

      if (!payload.mes_ref) return Utils.toast('Informe o mês.', 'warn');
      if (Number.isNaN(payload.valor) || payload.valor < 0) return Utils.toast('Informe um valor válido.', 'warn');

      Utils.setLoading(botao, true, 'Salvar renda variável');
      try {
        const item = await DB.upsertRendimentoVariavel({
          ...payload,
          responsavel: 'meiry',
        });

        const idx = State.rendimentosVariaveis.findIndex(row => row.id === item.id);
        if (idx >= 0) State.rendimentosVariaveis[idx] = item;
        else State.rendimentosVariaveis.unshift(item);

        this._renderVariaveis();
        State.emit('mes-changed');
        Utils.toast('Renda variável salva.');
      } catch (error) {
        Utils.toast(error.message, 'error');
      } finally {
        Utils.setLoading(botao, false, 'Salvar renda variável');
      }
    });
  },

  _renderFixos() {
    const el = document.getElementById('rf-lista');
    if (!el) return;

    if (!State.rendimentosFixos.length) {
      el.innerHTML = `<div class="empty-state">Nenhum rendimento fixo cadastrado.</div>`;
      return;
    }

    el.innerHTML = State.rendimentosFixos.map(item => `
      <div class="item-row">
        <div class="item-main">
          <p class="item-title">${Utils.escapeHtml(item.descricao)}</p>
          <p class="item-meta">${Utils.emojiResponsavel(item.responsavel)} ${Utils.nomeResponsavel(item.responsavel)} · Dia ${item.dia_recebimento}</p>
        </div>
        <div class="item-actions">
          <strong>${Utils.fmtMoeda(item.valor)}</strong>
          <button type="button" class="btn-icon" onclick="PageRendimentos._deletarFixo('${item.id}')">×</button>
        </div>
      </div>
    `).join('');
  },

  _renderVariaveis() {
    const el = document.getElementById('rv-lista');
    if (!el) return;

    const itens = [...State.rendimentosVariaveis]
      .filter(item => item.responsavel === 'meiry')
      .sort((a, b) => b.mes_ref.localeCompare(a.mes_ref));

    if (!itens.length) {
      el.innerHTML = `<div class="empty-state">Nenhuma renda variável da Meiry registrada.</div>`;
      return;
    }

    el.innerHTML = itens.map(item => `
      <div class="item-row">
        <div class="item-main">
          <p class="item-title">${Utils.mesRefLabel(item.mes_ref)}</p>
          <p class="item-meta">${item.descricao ? Utils.escapeHtml(item.descricao) : 'Sem observação'} · 👩 Meiry</p>
        </div>
        <strong>${Utils.fmtMoeda(item.valor)}</strong>
      </div>
    `).join('');
  },

  _atualizarMes() {
    document.querySelectorAll('.mes-ref-label').forEach(el => {
      el.textContent = Utils.mesRefLabel(State.mesRef);
    });
  },

  async _deletarFixo(id) {
    if (!window.confirm('Deseja remover este rendimento fixo?')) return;

    try {
      await DB.deleteRendimentoFixo(id);
      State.rendimentosFixos = State.rendimentosFixos.filter(item => item.id !== id);
      this._renderFixos();
      State.emit('mes-changed');
      Utils.toast('Rendimento fixo removido.');
    } catch (error) {
      Utils.toast(error.message, 'error');
    }
  },
};

window.PageRendimentos = PageRendimentos;
