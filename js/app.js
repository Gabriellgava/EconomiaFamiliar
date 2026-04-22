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
  _mobileNavOpen: false,

  async init() {
    this._aplicarTemaSalvo();
    Layout.renderAppShell();
    this._bindThemeToggle();
    this._bindMobileNav();
    this._syncMobileCollapses();

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

    this._fecharMenuMobile();

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
    this._atualizarToggleTema();
    document.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(btn => {
      btn.addEventListener('click', () => {
        const atual = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const proximo = atual === 'dark' ? 'light' : 'dark';
        this._definirTema(proximo, true);
      });
    });
  },

  _bindMobileNav() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const closers = document.querySelectorAll('[data-mobile-nav-close]');

    if (toggle) {
      toggle.addEventListener('click', () => {
        if (this._mobileNavOpen) {
          this._fecharMenuMobile();
        } else {
          this._abrirMenuMobile();
        }
      });
    }

    closers.forEach(item => {
      item.addEventListener('click', () => this._fecharMenuMobile());
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) {
        this._fecharMenuMobile();
      }
      this._syncMobileCollapses();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this._mobileNavOpen) {
        this._fecharMenuMobile();
      }
    });
  },

  _abrirMenuMobile() {
    const panel = document.getElementById('mobile-nav-panel');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const toggle = document.getElementById('mobile-menu-toggle');
    if (!panel || !backdrop || !toggle) return;

    panel.classList.remove('hidden');
    backdrop.classList.remove('hidden');
    panel.classList.add('is-open');
    backdrop.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-nav-open');
    this._mobileNavOpen = true;
  },

  _fecharMenuMobile() {
    const panel = document.getElementById('mobile-nav-panel');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const toggle = document.getElementById('mobile-menu-toggle');

    if (panel) {
      panel.classList.add('hidden');
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    }

    if (backdrop) {
      backdrop.classList.add('hidden');
      backdrop.classList.remove('is-open');
    }

    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }

    document.body.classList.remove('mobile-nav-open');
    this._mobileNavOpen = false;
  },

  _syncMobileCollapses() {
    const isMobile = window.innerWidth <= 720;
    document.querySelectorAll('.mobile-collapse').forEach(item => {
      item.open = !isMobile;
    });
  },

  _definirTema(tema, persistir = true) {
    document.documentElement.dataset.theme = tema;
    if (persistir) {
      window.localStorage.setItem(this._themeKey, tema);
    }
    this._atualizarToggleTema();
    const fn = this._rotas[this._rotaAtual];
    if (fn) fn();
  },

  _atualizarToggleTema() {
    const isDark = document.documentElement.dataset.theme === 'dark';
    const labels = [
      document.getElementById('theme-toggle-label'),
      document.getElementById('theme-toggle-mobile-label'),
    ];
    const icons = [
      document.getElementById('theme-toggle-icon'),
      document.getElementById('theme-toggle-mobile-icon'),
    ];

    labels.forEach(label => {
      if (label) label.textContent = isDark ? 'Modo claro' : 'Modo escuro';
    });

    icons.forEach(icon => {
      if (icon) icon.innerHTML = isDark ? '&#9728;' : '&#9790;';
    });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;


