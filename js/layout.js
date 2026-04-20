const Layout = {
  renderAppShell(rootId = 'app-root') {
    const root = document.getElementById(rootId);
    if (!root) return;

    root.innerHTML = `
      <div id="loading-global" class="hidden fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="text-center">
          <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>

      <div id="page-app" class="min-h-screen flex flex-col">
        <header class="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="flex items-center justify-between h-16 gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-sm">💰</span>
                </div>
                <div class="min-w-0">
                  <span class="font-display font-semibold text-gray-800 block truncate">Familia Financas</span>
                  <span class="text-xs text-gray-400 hidden sm:block">Planejamento da casa em um lugar so</span>
                </div>
              </div>

              <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span id="nav-user-nome" class="text-sm text-gray-500 hidden lg:block"></span>
                <button id="theme-toggle" type="button" class="theme-toggle inline-flex items-center gap-2 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-emerald-300 hover:text-emerald-600 transition">
                  <span id="theme-toggle-icon" aria-hidden="true">🌙</span>
                  <span id="theme-toggle-label" class="theme-toggle-text">Modo escuro</span>
                </button>
                <span class="hidden sm:inline text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg">Uso local</span>
              </div>
            </div>

            <nav class="hidden md:flex items-center gap-1 pb-3 mobile-scroll overflow-x-auto">
              <a href="#dashboard" data-nav-link class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition">Dashboard</a>
              <a href="#despesas" data-nav-link class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition">Despesas</a>
              <a href="#cartoes" data-nav-link class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition">Cartoes</a>
              <a href="#rendimentos" data-nav-link class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition">Rendimentos</a>
              <a href="#saude" data-nav-link class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition">Saude Financeira</a>
            </nav>

            <nav class="md:hidden flex gap-1 pb-2 overflow-x-auto mobile-scroll">
              <a href="#dashboard" data-nav-link class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition">Dashboard</a>
              <a href="#despesas" data-nav-link class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition">Despesas</a>
              <a href="#cartoes" data-nav-link class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition">Cartoes</a>
              <a href="#rendimentos" data-nav-link class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition">Rendimentos</a>
              <a href="#saude" data-nav-link class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition">Saude</a>
            </nav>
          </div>
        </header>

        <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
          ${this._dashboard()}
          ${this._despesas()}
          ${this._cartoes()}
          ${this._rendimentos()}
          ${this._saude()}
        </main>

        <footer class="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
          Familia Financas - seus dados ficam salvos neste navegador
        </footer>
      </div>
    `;
  },

  _dashboard() {
    return `
      <div id="screen-dashboard" data-screen class="hidden">
        <div class="section-header flex items-center justify-between mb-6">
          <div>
            <h1 class="font-display font-bold text-2xl text-gray-900">Dashboard</h1>
            <p class="text-sm text-gray-400 mt-0.5">Visao geral do seu mes</p>
          </div>
          <div class="month-switcher flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <button id="dash-btn-prev" class="text-gray-400 hover:text-gray-700 transition w-7 h-7 flex items-center justify-center">‹</button>
            <span id="dash-mes-label" class="text-sm font-semibold text-gray-700 min-w-32 text-center"></span>
            <button id="dash-btn-next" class="text-gray-400 hover:text-gray-700 transition w-7 h-7 flex items-center justify-center">›</button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mobile-card">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">💵</span>
              <span class="text-xs text-gray-400 font-medium" id="dash-receita-label">Receita total</span>
            </div>
            <p id="dash-receita-val" class="text-2xl font-semibold mt-1">—</p>
          </div>
          <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mobile-card">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">💸</span>
              <span class="text-xs text-gray-400 font-medium" id="dash-gastos-label">Total de gastos</span>
            </div>
            <p id="dash-gastos-val" class="text-2xl font-semibold mt-1">—</p>
          </div>
          <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mobile-card">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">🏦</span>
              <span class="text-xs text-gray-400 font-medium" id="dash-saldo-label">Saldo livre</span>
            </div>
            <p id="dash-saldo-val" class="text-2xl font-semibold mt-1">—</p>
          </div>
          <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mobile-card">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">📊</span>
              <span class="text-xs text-gray-400 font-medium" id="dash-comprometido-label">Comprometido</span>
            </div>
            <p id="dash-comprometido-val" class="text-2xl font-semibold mt-1">—</p>
            <div class="bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
              <div id="dash-barra-comprometido" class="h-2 rounded-full w-0"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
            <h3 class="font-display font-semibold text-sm text-gray-700 mb-4">Despesas por categoria</h3>
            <div id="dash-grafico-cats"></div>
          </div>
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
            <h3 class="font-display font-semibold text-sm text-gray-700 mb-4">Resumo do mes</h3>
            <div id="dash-resumo"></div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
          <h3 class="font-display font-semibold text-sm text-gray-700 mb-4">Ultimas movimentacoes</h3>
          <div id="dash-ultimas"></div>
        </div>
      </div>
    `;
  },

  _despesas() {
    return `
      <div id="screen-despesas" data-screen class="hidden">
        <div class="section-header flex items-center justify-between mb-6">
          <div>
            <h1 class="font-display font-bold text-2xl text-gray-900">Despesas</h1>
            <p class="text-sm text-gray-400 mt-0.5">Controle seus gastos mensais</p>
          </div>
          <div class="month-switcher flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <button id="desp-btn-prev" class="text-gray-400 hover:text-gray-700 w-7 h-7 flex items-center justify-center">‹</button>
            <span id="desp-mes-label" class="text-sm font-semibold text-gray-700 min-w-32 text-center"></span>
            <button id="desp-btn-next" class="text-gray-400 hover:text-gray-700 w-7 h-7 flex items-center justify-center">›</button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24 mobile-card">
              <h3 class="font-display font-semibold text-base text-gray-800 mb-5">Nova despesa</h3>
              <form id="form-despesa" class="space-y-4">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Descricao *</label>
                  <input id="desp-descricao" type="text" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" placeholder="Ex: Conta de agua, mercado..." />
                </div>
                <div class="grid mobile-grid-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Valor (R$) *</label>
                    <input id="desp-valor" type="number" step="0.01" min="0.01" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" placeholder="0,00" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Data *</label>
                    <input id="desp-data" type="date" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Categoria</label>
                  <select id="desp-categoria" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"></select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Responsavel</label>
                  <select id="desp-responsavel" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"></select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Observacao</label>
                  <input id="desp-obs" type="text" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" placeholder="Detalhe adicional..." />
                </div>
                <label class="flex items-start gap-3 p-3 bg-teal-50 rounded-xl cursor-pointer hover:bg-teal-100 transition">
                  <input id="desp-fixa" type="checkbox" class="mt-0.5 w-4 h-4 accent-teal-600 rounded" />
                  <div>
                    <p class="text-sm font-medium text-teal-800">Repetir todo mes</p>
                    <p class="text-xs text-teal-600 mt-0.5">Para agua, luz, internet, aluguel e outras contas recorrentes.</p>
                  </div>
                </label>
                <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition text-sm">Adicionar despesa</button>
              </form>
            </div>
          </div>

          <div class="lg:col-span-3">
            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
              <div class="section-header flex items-center justify-between mb-4">
                <h3 class="font-display font-semibold text-base text-gray-800">Despesas do mes</h3>
                <span class="text-xs text-gray-400">Total: <span id="desp-total" class="font-semibold text-red-500">R$ 0,00</span></span>
              </div>
              <div id="desp-lista"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _cartoes() {
    return `
      <div id="screen-cartoes" data-screen class="hidden">
        <div class="mb-6">
          <h1 class="font-display font-bold text-2xl text-gray-900">Cartoes de Credito</h1>
          <p class="text-sm text-gray-400 mt-0.5">Gerencie seus cartoes e controle as parcelas</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-5">
            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
              <h3 class="font-display font-semibold text-base text-gray-800 mb-5">Adicionar cartao</h3>
              <form id="form-cartao" class="space-y-4">
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Nome do cartao *</label>
                    <input id="cc-nome" type="text" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Ex: Cartao principal, Cartao da casa..." />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Empresa do cartao *</label>
                    <input id="cc-empresa" type="text" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Ex: Nubank, Inter, Itau..." />
                  </div>
                </div>
                <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition text-sm">Adicionar cartao</button>
              </form>
            </div>

            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
              <h3 class="font-display font-semibold text-base text-gray-800 mb-4">Meus cartoes</h3>
              <div id="cc-lista-cartoes"></div>
            </div>
          </div>

          <div class="space-y-5">
            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
              <h3 class="font-display font-semibold text-base text-gray-800 mb-5">Registrar compra</h3>
              <form id="form-compra-cc" class="space-y-4">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Cartao *</label>
                  <select id="cc-compra-cartao" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"></select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Descricao *</label>
                  <input id="cc-compra-descricao" type="text" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Ex: supermercado, tenis..." />
                </div>
                <div class="grid mobile-grid-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Valor total (R$) *</label>
                    <input id="cc-compra-valor" type="number" step="0.01" min="0.01" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="0,00" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Parcelas</label>
                    <select id="cc-compra-parcelas" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                      <option value="1">A vista (1x)</option>
                      <option value="2">2x</option>
                      <option value="3">3x</option>
                      <option value="4">4x</option>
                      <option value="5">5x</option>
                      <option value="6">6x</option>
                      <option value="10">10x</option>
                      <option value="12">12x</option>
                      <option value="18">18x</option>
                      <option value="24">24x</option>
                    </select>
                  </div>
                </div>
                <div id="cc-parcela-preview" class="hidden text-xs text-blue-600 font-medium bg-blue-50 rounded-lg px-3 py-2"></div>
                <div class="grid mobile-grid-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Categoria</label>
                    <select id="cc-compra-categoria" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"></select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Data da compra *</label>
                    <input id="cc-compra-data" type="date" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Observacao</label>
                  <input id="cc-compra-obs" type="text" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Detalhe adicional..." />
                </div>
                <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition text-sm">Registrar compra</button>
              </form>
            </div>

            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
              <h3 class="font-display font-semibold text-base text-gray-800 mb-4">Compras registradas</h3>
              <div id="cc-lista-compras"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _rendimentos() {
    return `
      <div id="screen-rendimentos" data-screen class="hidden">
        <div class="mb-6">
          <h1 class="font-display font-bold text-2xl text-gray-900">Rendimentos</h1>
          <p class="text-sm text-gray-400 mt-0.5">Cadastre salarios, rendas fixas e rendimentos variaveis</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-5">
            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
              <h3 class="font-display font-semibold text-base text-gray-800 mb-5">Novo rendimento fixo</h3>
              <form id="form-rendimento-fixo" class="space-y-4">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Descricao *</label>
                  <input id="rendfix-descricao" type="text" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Ex: salario, aluguel recebido..." />
                </div>
                <div class="grid mobile-grid-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Valor (R$) *</label>
                    <input id="rendfix-valor" type="number" step="0.01" min="0.01" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="0,00" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Dia de recebimento</label>
                    <input id="rendfix-dia" type="number" min="1" max="31" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="5" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Responsavel</label>
                  <select id="rendfix-responsavel" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    <option value="eu">Eu</option>
                    <option value="esposa">Esposa</option>
                    <option value="familia">Familia</option>
                  </select>
                </div>
                <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition text-sm">Adicionar rendimento</button>
              </form>
            </div>

            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
              <h3 class="font-display font-semibold text-base text-gray-800 mb-4">Rendimentos fixos cadastrados</h3>
              <div id="rend-fixos-lista"></div>
            </div>
          </div>

          <div class="space-y-5">
            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
              <h3 class="font-display font-semibold text-base text-gray-800 mb-2">Renda variavel - Esposa</h3>
              <p class="text-xs text-gray-500 mb-5">Registre mes a mes os valores recebidos pelas substituicoes em escolas.</p>
              <form id="form-rendimento-var" class="space-y-4">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Mes de referencia</label>
                  <select id="rend-var-mes" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"></select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Valor recebido (R$) *</label>
                  <input id="rendvar-valor" type="number" step="0.01" min="0" required class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="0,00" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Observacao</label>
                  <input id="rendvar-obs" type="text" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Ex: 8 dias substituidos" />
                </div>
                <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition text-sm">Salvar</button>
              </form>
            </div>

            <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
              <h3 class="font-display font-semibold text-base text-gray-800 mb-4">Historico renda variavel</h3>
              <div id="rend-var-lista"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _saude() {
    return `
      <div id="screen-saude" data-screen class="hidden">
        <div class="mb-6">
          <h1 class="font-display font-bold text-2xl text-gray-900">Saude Financeira</h1>
          <p class="text-sm text-gray-400 mt-0.5">Analise completa e encaminhamentos para sua familia</p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6 mobile-card">
          <h3 class="font-display font-semibold text-base text-gray-800 mb-4">📋 Diagnostico do mes</h3>
          <div id="saude-insights"></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 tablet-stack">
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
            <h3 class="font-display font-semibold text-base text-gray-800 mb-4">💰 Quanto guardar por mes</h3>
            <div id="saude-poupanca"></div>
          </div>
          <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
            <h3 class="font-display font-semibold text-base text-gray-800 mb-4">🎯 Quanto precisa ganhar</h3>
            <div id="saude-meta-renda"></div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6 mobile-card">
          <h3 class="font-display font-semibold text-base text-gray-800 mb-4">📈 Encaminhamento de investimentos</h3>
          <div id="saude-investimentos"></div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mobile-card">
          <h3 class="font-display font-semibold text-base text-gray-800 mb-4">🗓 Historico de meses</h3>
          <div id="saude-historico"></div>
        </div>
      </div>
    `;
  },
};

window.Layout = Layout;
