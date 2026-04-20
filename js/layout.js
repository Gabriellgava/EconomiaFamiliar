const Layout = {
  renderAppShell() {
    const root = document.getElementById('app-root');
    if (!root) return;

    root.innerHTML = `
      <div class="app-shell">
        <header class="app-header">
          <div class="container header-inner">
            <div>
              <h1 class="brand-title">Economia Familiar</h1>
              <p class="brand-subtitle">Organização financeira simples para Gabriel e Meiry.</p>
            </div>

            <button id="theme-toggle" class="theme-toggle" type="button">
              <span id="theme-toggle-icon" class="icon-chip">🌙</span>
              <span id="theme-toggle-label">Modo escuro</span>
            </button>
          </div>
        </header>

        <main class="container main-grid">
          <aside class="sidebar">
            <p class="nav-title">Navegação</p>
            <nav class="nav-list">
              ${this._navLink('#dashboard', '📊', 'Painel')}
              ${this._navLink('#despesas', '🧾', 'Despesas')}
              ${this._navLink('#cartoes', '💳', 'Cartões')}
              ${this._navLink('#rendimentos', '💰', 'Rendimentos')}
              ${this._navLink('#saude', '❤️', 'Saúde financeira')}
            </nav>
          </aside>

          <section class="screen-stack">
            <section id="screen-dashboard" class="screen" data-screen></section>
            <section id="screen-despesas" class="screen" data-screen></section>
            <section id="screen-cartoes" class="screen" data-screen></section>
            <section id="screen-rendimentos" class="screen" data-screen></section>
            <section id="screen-saude" class="screen" data-screen></section>
          </section>
        </main>

        <div id="loading-global" class="hidden"></div>
        <div id="toast-stack" class="toast-stack"></div>
      </div>
    `;

    this.renderDashboardScreen();
    this.renderDespesasScreen();
    this.renderCartoesScreen();
    this.renderRendimentosScreen();
    this.renderSaudeScreen();
  },

  renderDashboardScreen() {
    const el = document.getElementById('screen-dashboard');
    if (!el) return;

    el.innerHTML = `
      <section class="hero">
        <div>
          <h2>Visão geral do mês</h2>
          <p>Acompanhe entradas, despesas e o impacto das compras no cartão.</p>
        </div>
        ${this._monthNav()}
      </section>

      <section id="dashboard-metricas" class="metrics-grid"></section>

      <section class="section-grid">
        <article class="panel span-7">
          <div class="actions-row">
            <div>
              <h3 class="section-title">Resumo do mês</h3>
              <p class="subtle">Entradas e saídas com atualização automática.</p>
            </div>
          </div>
          <div id="dashboard-resumo" class="list"></div>
        </article>

        <article class="panel span-5">
          <h3 class="section-title">Últimos lançamentos</h3>
          <p class="subtle">Despesas e compras mais recentes.</p>
          <div id="dashboard-ultimos" class="list"></div>
        </article>
      </section>
    `;
  },

  renderDespesasScreen() {
    const el = document.getElementById('screen-despesas');
    if (!el) return;

    el.innerHTML = `
      <section class="hero">
        <div>
          <h2>Despesas da casa</h2>
          <p>Cadastre despesas avulsas ou recorrentes com prazo para encerrar.</p>
        </div>
        ${this._monthNav()}
      </section>

      <section class="section-grid">
        <article class="panel span-5">
          <h3 class="section-title">Nova despesa</h3>
          <p class="subtle">Use recorrência quando a despesa se repetir mês a mês.</p>

          <form id="form-despesa">
            <div class="form-grid">
              <div class="field span-2">
                <label for="desp-descricao">Descrição</label>
                <input id="desp-descricao" type="text" placeholder="Ex.: Aluguel, internet, mercado" />
              </div>

              <div class="field">
                <label for="desp-valor">Valor</label>
                <input id="desp-valor" type="number" min="0" step="0.01" placeholder="0,00" />
              </div>

              <div class="field">
                <label for="desp-data">Data</label>
                <input id="desp-data" type="date" />
              </div>

              <div class="field">
                <label for="desp-categoria">Categoria</label>
                <select id="desp-categoria"></select>
              </div>

              <div class="field">
                <label for="desp-responsavel">Responsável</label>
                <select id="desp-responsavel"></select>
              </div>

              <div class="field">
                <label for="desp-tipo">Tipo de despesa</label>
                <select id="desp-tipo">
                  <option value="avulsa">Avulsa</option>
                  <option value="recorrente">Recorrente</option>
                </select>
              </div>

              <div id="desp-recorrencia-wrap" class="field hidden">
                <label for="desp-recorrencia-ate">Repetir até</label>
                <input id="desp-recorrencia-ate" type="date" />
                <small>Deixe em branco para continuar sem prazo final.</small>
              </div>

              <div class="field span-2">
                <label for="desp-obs">Observação</label>
                <textarea id="desp-obs" rows="3" placeholder="Detalhes opcionais"></textarea>
              </div>
            </div>

            <div class="actions-row">
              <span class="subtle">As despesas recorrentes passam a valer a partir da data informada.</span>
              <button class="btn btn-primary" type="submit">Salvar despesa</button>
            </div>
          </form>
        </article>

        <article class="panel span-7">
          <h3 class="section-title">Lançamentos do mês</h3>
          <p class="subtle">Aqui aparecem as despesas ativas no mês selecionado.</p>
          <div id="desp-lista" class="list"></div>
        </article>
      </section>
    `;
  },

  renderCartoesScreen() {
    const el = document.getElementById('screen-cartoes');
    if (!el) return;

    el.innerHTML = `
      <section class="hero">
        <div>
          <h2>Cartões</h2>
          <p>Cadastre apenas o nome do cartão e a empresa emissora.</p>
        </div>
        ${this._monthNav()}
      </section>

      <section class="section-grid">
        <article class="panel span-5">
          <h3 class="section-title">Novo cartão</h3>
          <form id="form-cartao">
            <div class="form-grid">
              <div class="field span-2">
                <label for="cc-nome">Nome do cartão</label>
                <input id="cc-nome" type="text" placeholder="Ex.: Nubank, Mercado Pago" />
              </div>
              <div class="field span-2">
                <label for="cc-empresa">Empresa</label>
                <input id="cc-empresa" type="text" placeholder="Ex.: Mastercard, Visa" />
              </div>
            </div>
            <div class="actions-row">
              <span class="subtle">Você pode usar o nome que fizer mais sentido para vocês.</span>
              <button class="btn btn-primary" type="submit">Adicionar cartão</button>
            </div>
          </form>

          <div class="panel" style="margin-top: 20px; padding: 20px;">
            <h3 class="section-title">Registrar compra</h3>
            <form id="form-compra-cc">
              <div class="form-grid">
                <div class="field span-2">
                  <label for="cc-compra-cartao">Cartão</label>
                  <select id="cc-compra-cartao"></select>
                </div>
                <div class="field span-2">
                  <label for="cc-compra-descricao">Descrição</label>
                  <input id="cc-compra-descricao" type="text" />
                </div>
                <div class="field">
                  <label for="cc-compra-valor">Valor total</label>
                  <input id="cc-compra-valor" type="number" min="0" step="0.01" />
                </div>
                <div class="field">
                  <label for="cc-compra-parcelas">Parcelas</label>
                  <select id="cc-compra-parcelas">
                    ${Array.from({ length: 24 }, (_, i) => `<option value="${i + 1}">${i + 1}x</option>`).join('')}
                  </select>
                </div>
                <div class="field">
                  <label for="cc-compra-categoria">Categoria</label>
                  <select id="cc-compra-categoria"></select>
                </div>
                <div class="field">
                  <label for="cc-compra-data">Data da compra</label>
                  <input id="cc-compra-data" type="date" />
                </div>
                <div class="field span-2">
                  <label for="cc-compra-obs">Observação</label>
                  <textarea id="cc-compra-obs" rows="3"></textarea>
                </div>
              </div>
              <div class="actions-row">
                <span id="cc-parcela-preview" class="badge hidden"></span>
                <button class="btn btn-primary" type="submit">Registrar compra</button>
              </div>
            </form>
          </div>
        </article>

        <article class="panel span-7">
          <h3 class="section-title">Cartões cadastrados</h3>
          <div id="cc-lista-cartoes" class="list"></div>

          <div style="margin-top: 24px;">
            <h3 class="section-title">Compras do mês</h3>
            <p class="subtle">Parcelas que impactam o mês selecionado.</p>
            <div id="cc-lista-compras" class="list"></div>
          </div>
        </article>
      </section>
    `;
  },

  renderRendimentosScreen() {
    const el = document.getElementById('screen-rendimentos');
    if (!el) return;

    el.innerHTML = `
      <section class="hero">
        <div>
          <h2>Rendimentos</h2>
          <p>Separe entradas fixas e a renda variável da Meiry por mês.</p>
        </div>
        ${this._monthNav()}
      </section>

      <section class="section-grid">
        <article class="panel span-6">
          <h3 class="section-title">Rendimentos fixos</h3>
          <form id="form-rendimento-fixo">
            <div class="form-grid">
              <div class="field span-2">
                <label for="rf-descricao">Descrição</label>
                <input id="rf-descricao" type="text" placeholder="Ex.: Salário Gabriel" />
              </div>
              <div class="field">
                <label for="rf-valor">Valor</label>
                <input id="rf-valor" type="number" min="0" step="0.01" />
              </div>
              <div class="field">
                <label for="rf-dia">Dia do recebimento</label>
                <input id="rf-dia" type="number" min="1" max="31" />
              </div>
              <div class="field span-2">
                <label for="rf-responsavel">Responsável</label>
                <select id="rf-responsavel"></select>
              </div>
            </div>
            <div class="actions-row">
              <span class="subtle">Entradas fixas contam todos os meses.</span>
              <button class="btn btn-primary" type="submit">Adicionar rendimento</button>
            </div>
          </form>

          <div style="margin-top: 20px;">
            <div id="rf-lista" class="list"></div>
          </div>
        </article>

        <article class="panel span-6">
          <h3 class="section-title">Renda variável da Meiry</h3>
          <form id="form-rendimento-variavel">
            <div class="form-grid">
              <div class="field">
                <label for="rv-mes">Mês</label>
                <input id="rv-mes" type="month" />
              </div>
              <div class="field">
                <label for="rv-valor">Valor</label>
                <input id="rv-valor" type="number" min="0" step="0.01" />
              </div>
              <div class="field span-2">
                <label for="rv-descricao">Descrição</label>
                <input id="rv-descricao" type="text" placeholder="Ex.: Comissão, extra" />
              </div>
            </div>
            <div class="actions-row">
              <span class="subtle">Sempre vinculado à Meiry.</span>
              <button class="btn btn-primary" type="submit">Salvar renda variável</button>
            </div>
          </form>

          <div style="margin-top: 20px;">
            <div id="rv-lista" class="list"></div>
          </div>
        </article>
      </section>
    `;
  },

  renderSaudeScreen() {
    const el = document.getElementById('screen-saude');
    if (!el) return;

    el.innerHTML = `
      <section class="hero">
        <div>
          <h2>Saúde financeira</h2>
          <p>Veja o quanto do orçamento está comprometido e como os últimos meses evoluíram.</p>
        </div>
        ${this._monthNav()}
      </section>

      <section class="section-grid">
        <article class="panel span-5">
          <h3 class="section-title">Indicadores</h3>
          <div id="saude-indicadores" class="list"></div>
        </article>
        <article class="panel span-7">
          <h3 class="section-title">Histórico recente</h3>
          <p class="subtle">Comparativo dos últimos 6 meses com despesas e compras no cartão.</p>
          <div id="saude-historico" class="list"></div>
        </article>
      </section>
    `;
  },

  _monthNav() {
    return `
      <div class="month-nav">
        <button type="button" class="btn-icon" onclick="State.navegarMes(-1)">‹</button>
        <strong class="mes-ref-label">${Utils.mesRefLabel(State?.mesRef || Utils.mesAtual())}</strong>
        <button type="button" class="btn-icon" onclick="State.navegarMes(1)">›</button>
      </div>
    `;
  },

  _navLink(href, icon, label) {
    return `<a href="${href}" data-nav-link class="nav-link"><span>${icon}</span><span>${label}</span></a>`;
  },
};

window.Layout = Layout;
