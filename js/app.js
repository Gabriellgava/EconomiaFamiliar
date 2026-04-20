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
      this._rotear();
    } catch (error) {
      console.error('Erro ao iniciar a aplicação:', error);
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
    });

    document.querySelectorAll('[data-screen]').forEach(screen => {
      screen.classList.add('hidden');
      screen.classList.remove('is-visible');
    });

    const screenId = hash.replace('#', 'screen-');
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.remove('hidden');
      screen.classList.add('is-visible');
    }

    this._rotaAtual = hash;
    fn();
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
  },

  _mostrarErroInicial(error) {
    const main = document.querySelector('main');
    if (!main) return;

    const mensagem = error?.message || 'Falha ao conectar ao banco de dados.';

    main.innerHTML = `
      <section class="container" style="padding-top: 32px;">
        <div class="panel">
          <div class="item-row" style="align-items: flex-start;">
            <div class="icon-chip" style="color: var(--danger);">!</div>
            <div>
              <h1 class="section-title">Não foi possível carregar os dados</h1>
              <p class="subtle" style="margin-top: 8px;">
                O app abriu, mas não conseguiu concluir a conexão com o Supabase.
              </p>
              <p style="margin-top: 14px;"><strong>Erro:</strong> ${mensagem}</p>
              <div class="subtle" style="margin-top: 16px; display: grid; gap: 6px;">
                <p>Verifique se você executou o arquivo <code>supabase/schema.sql</code> no SQL Editor do Supabase.</p>
                <p>Confirme também se a URL e a chave em <code>js/config.js</code> estão corretas.</p>
                <p>Depois de corrigir, recarregue a página.</p>
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
