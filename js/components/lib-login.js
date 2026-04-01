'use strict';

/**
 * <lib-login>
 * ログインページ。クイックログイン（5ユーザー）とフォームログインを提供。
 * ログイン試行時に 3〜8 秒のランダム Loading を発生させる（テスト練習用）。
 * ログイン済みの場合は蔵書一覧へリダイレクト。
 */
class LibLogin extends HTMLElement {
  constructor() {
    super();
    this._shadow  = this.attachShadow({ mode: 'open' });
    this._error   = '';
    this._loading = false;
    this._loadingName = '';
  }

  connectedCallback() {
    if (Store.getSession()) { window.location.href = 'index.html'; return; }
    this._render();
  }

  /** ログイン処理: Loading を挟んで redirect */
  _doLogin(user, errorCallback) {
    if (!user) {
      this._error = 'メールアドレスまたはパスワードが正しくありません';
      this._render();
      if (errorCallback) errorCallback();
      return;
    }
    this._loading     = true;
    this._loadingName = user.name;
    this._error       = '';
    this._render();
    setTimeout(() => {
      Store.setSession(user);
      window.location.href = 'index.html';
    }, randomDelay());
  }

  _render() {
    if (this._loading) {
      this._renderLoading();
    } else {
      this._renderForm();
    }
  }

  _renderLoading() {
    this._shadow.innerHTML = `
      <style>
        .overlay {
          position: fixed; inset: 0;
          background: rgba(240,244,248,.92);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 20px; z-index: 999;
        }
        .spinner-wrap {
          width: 72px; height: 72px;
          background: #fff; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,.12);
        }
        .spinner {
          width: 44px; height: 44px;
          border: 5px solid #e2e8f0;
          border-top-color: #1a3a5c;
          border-radius: 50%;
          animation: spin .85s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-title {
          font-size: 1.2rem; font-weight: 700; color: #1a3a5c;
        }
        .loading-sub { font-size: .88rem; color: #64748b; }
        .loading-name {
          background: #eff6ff; color: #1d4ed8;
          padding: 4px 16px; border-radius: 20px;
          font-size: .85rem; font-weight: 600;
        }
      </style>
      <div class="overlay" data-testid="login-loading">
        <div class="spinner-wrap"><div class="spinner"></div></div>
        <div class="loading-title">ログイン中...</div>
        <div class="loading-name">${this._loadingName}</div>
        <div class="loading-sub">ユーザー認証を確認しています</div>
      </div>
    `;
  }

  _renderForm() {
    this._shadow.innerHTML = `
      <style>
        .page {
          max-width: 500px;
          margin: 32px auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .page-title { text-align: center; }
        .page-title h2 { color: #1a3a5c; font-size: 1.5rem; margin-bottom: 4px; }
        .page-title p  { color: #64748b; font-size: .9rem; }

        .card {
          background: #fff;
          border-radius: 14px;
          padding: 28px 32px;
          box-shadow: 0 2px 12px rgba(0,0,0,.08);
        }
        .card-title {
          font-size: .95rem; font-weight: 700; color: #374151;
          margin-bottom: 18px; padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        /* ---- クイックログイン ---- */
        .quick-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 10px;
        }
        .quick-btn {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 14px 8px 12px;
          cursor: pointer; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          transition: all .15s;
        }
        .quick-btn:hover {
          background: #eff6ff; border-color: #93c5fd;
          transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,.08);
        }
        .q-avatar { font-size: 2rem; line-height: 1; }
        .q-name   { font-size: .82rem; font-weight: 700; color: #1e293b; }
        .q-email  { font-size: .7rem; color: #94a3b8; word-break: break-all; }
        .q-label  {
          font-size: .7rem; font-weight: 600;
          background: #dbeafe; color: #1d4ed8;
          padding: 2px 8px; border-radius: 10px; margin-top: 2px;
        }

        /* ---- フォームログイン ---- */
        label {
          display: block; font-size: .83rem; font-weight: 600;
          color: #374151; margin-bottom: 5px; margin-top: 14px;
        }
        label:first-of-type { margin-top: 0; }
        input[type="email"], input[type="password"] {
          width: 100%; padding: 10px 14px;
          border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: .95rem; outline: none; transition: all .2s;
        }
        input:focus {
          border-color: #1a3a5c;
          box-shadow: 0 0 0 3px rgba(26,58,92,.08);
        }
        .error-msg {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 6px; color: #dc2626;
          font-size: .85rem; padding: 8px 12px; margin-top: 10px;
        }
        .login-btn {
          width: 100%; margin-top: 20px; padding: 12px;
          background: #1a3a5c; color: #fff; border: none;
          border-radius: 8px; font-size: .95rem; font-weight: 700;
          cursor: pointer; transition: background .15s;
        }
        .login-btn:hover { background: #1e4a7a; }
      </style>

      <div class="page">
        <div class="page-title">
          <h2>📚 ログイン</h2>
          <p>市立図書館 予約システム</p>
        </div>

        <!-- クイックログイン -->
        <div class="card">
          <div class="card-title">⚡ クイックログイン（テスト用）</div>
          <div class="quick-grid" data-testid="quick-login-grid">
            ${USERS.map(u => `
              <button class="quick-btn" data-user-id="${u.id}" data-testid="quick-login-${u.id}">
                <span class="q-avatar">${u.avatar}</span>
                <span class="q-name">${u.name}</span>
                <span class="q-email">${u.email}</span>
                <span class="q-label">クリックでログイン</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- フォームログイン -->
        <div class="card">
          <div class="card-title">🔑 メールアドレスでログイン</div>
          <label for="email">メールアドレス</label>
          <input type="email" id="email" placeholder="xxx@example.com" autocomplete="email" data-testid="email-input" />
          <label for="password">パスワード</label>
          <input type="password" id="password" placeholder="パスワードを入力" autocomplete="current-password" data-testid="password-input" />
          ${this._error ? `<div class="error-msg" data-testid="login-error">⚠ ${this._error}</div>` : ''}
          <button class="login-btn" id="login-btn" data-testid="login-submit">ログイン</button>
        </div>
      </div>
    `;

    // クイックログイン
    this._shadow.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const user = Store.loginById(parseInt(btn.dataset.userId));
        this._doLogin(user);
      });
    });

    // フォームログイン
    const doFormLogin = () => {
      const email = this._shadow.getElementById('email').value.trim();
      const pass  = this._shadow.getElementById('password').value;
      this._doLogin(Store.login(email, pass));
    };
    this._shadow.getElementById('login-btn').addEventListener('click', doFormLogin);
    this._shadow.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') doFormLogin(); });
    });
  }
}

customElements.define('lib-login', LibLogin);
