const App = {
  _rotas: {
    '#dashboard': () => PageDashboard.init(),
    '#despesas': () => PageDespesas.init(),
    '#cartoes': () => PageCartoes.init(),
    '#rendimentos': () => PageRendimentos.init(),
    '#saude': () => PageSaude.init(),
  },

  _rotaAtual: null,
  _listenersRegistrados: false,
  _themeKey: 'familia-financas-theme',

  async init() {
    this._aplicarTemaSalvo();
    Layout.renderAppShell();
    this._bindThemeToggle();

    window.addEventListener('hashchange', () => this._rotear());
    this._registrarOuvintes();

    try {
      await DB.bootstrap();
      await State.carregarTudo();
      this._renderNav();
      this._rotear();
    } catch (error) {
      console.error('Erro ao iniciar a aplicacao:', error);
      this._mostrarErroInicial(error);
    }
  },

  _rotear() {
    const hash = window.location.hash || '#dashboard';
    const fn = this._rotas[hash];

    if (!fn) {
      window.location.hash = '#dashboard';
      return;
    }

    document.querySelectorAll('[data-nav-link]').forEach(el => {
      const ativo = el.getAttribute('href') === hash;
      el.classList.toggle('nav-active', ativo);
      el.classList.toggle('text-emerald-600', ativo);
      el.classList.toggle('font-semibold', ativo);
      el.classList.toggle('text-gray-600', !ativo);
    });

    document.querySelectorAll('[data-screen]').forEach(screen => screen.classList.add('hidden'));
    const screenId = hash.replace('#', 'screen-');
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.remove('hidden');

    this._rotaAtual = hash;
    fn();
  },

  _renderNav() {
    const el = document.getElementById('nav-user-nome');
    if (!el) return;

    el.textContent = State.perfil?.nome || 'Minha casa';
  },

  _registrarOuvintes() {
    if (this._listenersRegistrados) return;
    this._listenersRegistrados = true;

    State.on('mes-changed', () => {
      const fn = this._rotas[this._rotaAtual];
      if (fn) fn();
    });

    State.on('loading', ativo => {
      const el = document.getElementById('loading-global');
      if (el) el.classList.toggle('hidden', !ativo);
    });

    State.on('perfil-updated', () => this._renderNav());
  },

  _mostrarErroInicial(error) {
    const main = document.querySelector('main');
    if (!main) return;

    const mensagem = error?.message || 'Falha ao conectar ao banco de dados.';

    main.innerHTML = `
      <section class="max-w-3xl mx-auto py-8">
        <div class="bg-white rounded-2xl border border-red-200 p-6 shadow-sm mobile-card">
          <div class="flex items-start gap-3">
            <div class="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xl flex-shrink-0">!</div>
            <div>
              <h1 class="font-display text-xl font-semibold text-gray-900">Nao foi possivel carregar os dados</h1>
              <p class="text-sm text-gray-500 mt-2">
                O app abriu, mas nao conseguiu concluir a conexao com o Supabase.
              </p>
              <p class="text-sm text-gray-700 mt-4"><strong>Erro:</strong> ${mensagem}</p>
              <div class="mt-5 space-y-2 text-sm text-gray-600">
                <p>Verifique se voce executou o arquivo <code>supabase/schema.sql</code> no SQL Editor do Supabase.</p>
                <p>Confirme tambem se a URL e a chave em <code>js/config.js</code> estao corretas.</p>
                <p>Depois de corrigir, recarregue a pagina.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  _aplicarTemaSalvo() {
    const salvo = window.localStorage.getItem(this._themeKey);
    const tema = salvo || 'light';
    this._definirTema(tema, false);
  },

  _bindThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    this._atualizarToggleTema();

    btn.addEventListener('click', () => {
      const atual = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      const proximo = atual === 'dark' ? 'light' : 'dark';
      this._definirTema(proximo, true);
    });
  },

  _definirTema(tema, persistir = true) {
    document.documentElement.dataset.theme = tema;
    if (persistir) {
      window.localStorage.setItem(this._themeKey, tema);
    }
    this._atualizarToggleTema();
  },

  _atualizarToggleTema() {
    const isDark = document.documentElement.dataset.theme === 'dark';
    const label = document.getElementById('theme-toggle-label');
    const icon = document.getElementById('theme-toggle-icon');
    if (label) label.textContent = isDark ? 'Modo claro' : 'Modo escuro';
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
