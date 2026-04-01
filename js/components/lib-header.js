'use strict';

/**
 * <lib-header active="home|books|login|my">
 * sticky ナビゲーションバー。active 属性でカレントページを指定。
 */
class LibHeader extends HTMLElement {
  static get observedAttributes() { return ['active']; }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback()          { this._render(); }
  attributeChangedCallback()   { this._render(); }

  get _activePage() { return this.getAttribute('active') || 'home'; }

  _render() {
    const user   = Store.getSession();
    const active = this._activePage;

    this._shadow.innerHTML = `
      <style>
        header {
          background: #1a3a5c;
          color: #fff;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          min-height: 64px;
          box-shadow: 0 2px 8px rgba(0,0,0,.25);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .logo {
          font-size: 1.2rem; font-weight: 700; flex: 1;
          display: flex; align-items: center; gap: 8px;
          color: #fff; text-decoration: none;
        }
        nav { display: flex; gap: 4px; }
        .nav-btn {
          background: transparent;
          color: rgba(255,255,255,.8);
          border: 1px solid transparent;
          border-radius: 6px;
          padding: 7px 18px;
          cursor: pointer;
          font-size: .88rem;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          transition: all .15s;
        }
        .nav-btn:hover { background: rgba(255,255,255,.12); color: #fff; }
        .nav-btn.active {
          background: rgba(255,255,255,.18); color: #fff;
          border-color: rgba(255,255,255,.3); font-weight: 700;
        }
        .sep { width: 1px; background: rgba(255,255,255,.2); height: 28px; }
        .user-badge { font-size: .88rem; color: rgba(255,255,255,.85); display: flex; align-items: center; gap: 6px; }
        .logout-btn { background: rgba(220,38,38,.25); border-color: rgba(220,38,38,.4); color: #fca5a5; }
        .logout-btn:hover { background: rgba(220,38,38,.45); color: #fff; }
      </style>
      <header>
        <a class="logo" href="index.html">📚 市立図書館 予約システム</a>
        <nav>
          <a class="nav-btn ${active === 'home'  ? 'active' : ''}" href="index.html">🏠 ホーム</a>
          <a class="nav-btn ${active === 'books' ? 'active' : ''}" href="books.html">📖 蔵書一覧</a>
          ${user ? `<a class="nav-btn ${active === 'my' ? 'active' : ''}" href="my-page.html">🔖 マイ予約</a>` : ''}
        </nav>
        <div class="sep"></div>
        ${user
          ? `<div class="user-badge">${user.avatar} ${user.name}</div>
             <nav><button class="nav-btn logout-btn" id="logout-btn">ログアウト</button></nav>`
          : `<nav><a class="nav-btn ${active === 'login' ? 'active' : ''}" href="login.html">🔑 ログイン</a></nav>`
        }
      </header>
    `;

    this._shadow.getElementById('logout-btn')?.addEventListener('click', () => {
      Store.clearSession();
      window.location.href = 'index.html';
    });
  }
}

customElements.define('lib-header', LibHeader);
