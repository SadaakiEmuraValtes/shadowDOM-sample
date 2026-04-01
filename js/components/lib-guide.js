'use strict';

/**
 * <lib-guide>
 * トップページ用ガイドコンポーネント。
 * サイト概要・各ページの説明・テストアカウント・テスト自動化のポイントを掲載。
 * Loading なし・書籍表示なし。
 */
class LibGuide extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    const user = Store.getSession();

    this._shadow.innerHTML = `
      <style>
        .hero {
          background: linear-gradient(135deg, #1a3a5c 0%, #1e5490 100%);
          color: #fff;
          border-radius: 16px;
          padding: 48px 40px;
          margin-bottom: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          box-shadow: 0 4px 20px rgba(26,58,92,.3);
        }
        .hero-icon { font-size: 4rem; line-height: 1; }
        .hero h1  { font-size: 1.7rem; font-weight: 800; margin: 0; }
        .hero p   { font-size: 1rem; color: rgba(255,255,255,.8); max-width: 500px; margin: 0; }
        .hero-badge {
          background: rgba(251,191,36,.2);
          border: 1px solid rgba(251,191,36,.4);
          color: #fde68a;
          font-size: .8rem; font-weight: 600;
          padding: 4px 16px; border-radius: 20px; margin-top: 4px;
        }
        .cta-btn {
          margin-top: 12px;
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #1a3a5c;
          padding: 12px 32px; border-radius: 30px;
          font-size: 1rem; font-weight: 700; text-decoration: none;
          box-shadow: 0 4px 12px rgba(0,0,0,.15);
          transition: all .2s;
        }
        .cta-btn:hover { background: #f0f9ff; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,.2); }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        .card {
          background: #fff;
          border-radius: 14px;
          padding: 24px 28px;
          box-shadow: 0 2px 10px rgba(0,0,0,.07);
        }
        .card-title {
          font-size: 1rem; font-weight: 700; color: #1a3a5c;
          margin-bottom: 16px; padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
          display: flex; align-items: center; gap: 8px;
        }

        /* ページガイド */
        .page-list { display: flex; flex-direction: column; gap: 12px; }
        .page-item {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 12px; border-radius: 10px; background: #f8fafc;
          text-decoration: none; color: inherit;
          border: 1px solid transparent;
          transition: all .15s;
        }
        .page-item:hover { background: #eff6ff; border-color: #93c5fd; }
        .page-icon { font-size: 1.6rem; flex-shrink: 0; margin-top: 2px; }
        .page-name { font-weight: 700; font-size: .9rem; color: #1a3a5c; margin-bottom: 3px; }
        .page-desc { font-size: .82rem; color: #64748b; line-height: 1.5; }
        .page-loading {
          display: inline-block; font-size: .73rem; font-weight: 600;
          background: #fef9c3; color: #854d0e;
          padding: 1px 8px; border-radius: 10px; margin-top: 4px;
        }

        /* テストアカウント */
        .account-list { display: flex; flex-direction: column; gap: 8px; }
        .account-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px; background: #f8fafc; border-radius: 8px;
          font-size: .85rem;
        }
        .account-avatar { font-size: 1.2rem; }
        .account-name   { font-weight: 600; color: #1e293b; flex: 0 0 90px; }
        .account-email  { color: #64748b; font-family: monospace; flex: 1; }
        .account-pass   {
          font-size: .75rem; font-family: monospace;
          background: #e2e8f0; padding: 1px 8px; border-radius: 4px; color: #475569;
        }
        .quick-link {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 14px; padding: 8px 20px;
          background: #1a3a5c; color: #fff; border-radius: 8px;
          text-decoration: none; font-size: .88rem; font-weight: 600;
          transition: background .15s;
        }
        .quick-link:hover { background: #1e4a7a; }

        /* テスト自動化ポイント */
        .tip-list { display: flex; flex-direction: column; gap: 10px; }
        .tip-item {
          padding: 10px 14px; border-radius: 8px;
          border-left: 3px solid #1a3a5c;
          background: #f8fafc; font-size: .84rem; color: #374151; line-height: 1.6;
        }
        .tip-item strong { color: #1a3a5c; }
        code {
          background: #e2e8f0; padding: 1px 6px; border-radius: 4px;
          font-family: monospace; font-size: .82rem; color: #1e293b;
        }

        /* Loading 仕様 */
        .loading-spec {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px;
        }
        .loading-item {
          background: #fff7ed; border: 1px solid #fed7aa;
          border-radius: 8px; padding: 10px 14px; font-size: .82rem;
        }
        .loading-item .trigger { font-weight: 700; color: #c2410c; margin-bottom: 3px; }
        .loading-item .time    { color: #9a3412; }
      </style>

      <!-- ヒーローセクション -->
      <div class="hero">
        <div class="hero-icon">📚</div>
        <h1>市立図書館 予約システム</h1>
        <p>Shadow DOM で構築した図書館の予約システムです。蔵書の検索・予約・返却が行えます。</p>
        <div class="hero-badge">⚠ テスト自動化練習用デモサイト — 架空のシステムです</div>
        <a class="cta-btn" href="books.html" data-testid="go-to-books">📖 蔵書一覧を見る</a>
      </div>

      <div class="grid">

        <!-- ページガイド -->
        <div class="card" style="grid-column: 1 / -1;">
          <div class="card-title">🗺 ページガイド</div>
          <div class="page-list" data-testid="page-guide">

            <a class="page-item" href="index.html" data-testid="guide-home">
              <span class="page-icon">🏠</span>
              <div>
                <div class="page-name">ホーム（このページ）</div>
                <div class="page-desc">サイトの概要・各ページの説明・テストアカウント情報を掲載しています。</div>
              </div>
            </a>

            <a class="page-item" href="books.html" data-testid="guide-books">
              <span class="page-icon">📖</span>
              <div>
                <div class="page-name">蔵書一覧</div>
                <div class="page-desc">
                  12冊の書籍をカード表示します。タイトル・著者でのテキスト検索、ジャンルでの絞り込みが可能です。
                  ログイン後は「予約する」ボタンから予約できます。
                </div>
                <span class="page-loading">⏳ 検索・フィルタ変更時に Loading 発生（2〜5秒）</span>
              </div>
            </a>

            <a class="page-item" href="login.html" data-testid="guide-login">
              <span class="page-icon">🔑</span>
              <div>
                <div class="page-name">ログイン</div>
                <div class="page-desc">
                  メールアドレス＋パスワードのフォームログインと、テストアカウントを1クリックで切り替えられる
                  「クイックログイン」を提供します。
                </div>
                <span class="page-loading">⏳ ログイン試行時に Loading 発生（2〜5秒）</span>
              </div>
            </a>

            <a class="page-item" href="my-page.html" data-testid="guide-my">
              <span class="page-icon">🔖</span>
              <div>
                <div class="page-name">マイ予約（要ログイン）</div>
                <div class="page-desc">
                  現在の予約一覧（返却・キャンセル操作可）と利用履歴をタブ切り替えで確認できます。
                  未ログインでアクセスするとログインページへリダイレクトされます。
                </div>
              </div>
            </a>

          </div>
        </div>

        <!-- テストアカウント -->
        <div class="card">
          <div class="card-title">👤 テストアカウント</div>
          <div class="account-list" data-testid="account-list">
            ${USERS.map(u => `
              <div class="account-row">
                <span class="account-avatar">${u.avatar}</span>
                <span class="account-name">${u.name}</span>
                <span class="account-email">${u.email}</span>
                <span class="account-pass">test1234</span>
              </div>
            `).join('')}
          </div>
          <a class="quick-link" href="login.html">⚡ クイックログインへ</a>
        </div>

        <!-- テスト自動化ポイント -->
        <div class="card">
          <div class="card-title">🤖 テスト自動化のポイント</div>
          <div class="tip-list">
            <div class="tip-item">
              <strong>Shadow DOM の貫通</strong><br>
              各コンポーネントは Shadow DOM でカプセル化されています。<br>
              Playwright では <code>pierce/</code> セレクタ、<br>
              Selenium では <code>execute_script</code> + <code>shadowRoot</code> を使います。
            </div>
            <div class="tip-item">
              <strong>data-testid 属性</strong><br>
              主要な操作対象要素に <code>data-testid</code> を付与済みです。<br>
              例: <code>search-input</code> / <code>login-submit</code> / <code>return-btn</code>
            </div>
            <div class="tip-item">
              <strong>Loading の待機</strong><br>
              Playwright: <code>toBeHidden({ timeout: 10000 })</code><br>
              Selenium: <code>WebDriverWait</code> + <code>invisibility_of_element</code>
            </div>
          </div>
        </div>

        <!-- Loading 仕様 -->
        <div class="card" style="grid-column: 1 / -1;">
          <div class="card-title">⏳ Loading 発生タイミング</div>
          <div class="loading-spec">
            <div class="loading-item">
              <div class="trigger">🔑 ログイン試行時</div>
              <div class="time">待機時間: 2〜5 秒（ランダム）</div>
            </div>
            <div class="loading-item">
              <div class="trigger">🔍 蔵書検索・フィルタ変更時</div>
              <div class="time">待機時間: 2〜5 秒（ランダム）</div>
            </div>
          </div>
        </div>

      </div>
    `;
  }
}

customElements.define('lib-guide', LibGuide);
