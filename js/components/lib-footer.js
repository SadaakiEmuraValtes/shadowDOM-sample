'use strict';

/**
 * <lib-footer>
 * 免責事項・デモサイト表記フッター
 */
class LibFooter extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._shadow.innerHTML = `
      <style>
        footer {
          background: #0f2540;
          color: rgba(255,255,255,.65);
          padding: 28px 32px;
          font-size: .82rem;
          line-height: 1.85;
          margin-top: auto;
        }
        .inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .disclaimer {
          background: rgba(251,191,36,.1);
          border: 1px solid rgba(251,191,36,.3);
          border-radius: 8px;
          padding: 12px 18px;
          color: #fde68a;
        }
        .disclaimer strong { color: #fbbf24; }
        .accounts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .accounts-label { color: rgba(255,255,255,.5); margin-right: 4px; }
        .account-chip {
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 6px;
          padding: 3px 12px;
          font-size: .78rem;
          font-family: monospace;
          color: rgba(255,255,255,.7);
        }
        .copy { color: rgba(255,255,255,.3); font-size: .78rem; border-top: 1px solid rgba(255,255,255,.08); padding-top: 10px; }
      </style>
      <footer>
        <div class="inner">
          <div class="disclaimer">
            <strong>⚠ 免責事項 — テスト自動化練習用デモサイト</strong><br>
            このサイトは Playwright・Selenium・Robot Framework 等のテスト自動化練習を目的として作成された<strong>架空の図書館予約システム</strong>です。
            実在する図書館・書籍・著者・人物とは一切関係ありません。掲載されているすべての書籍・ユーザー情報はフィクションです。
            データはブラウザのローカルストレージのみに保存され、外部サーバーへの送信は一切行いません。
          </div>
          <div class="accounts">
            <span class="accounts-label">🔑 テストアカウント (パスワード共通: test1234)</span>
            <span class="account-chip">tanaka@example.com</span>
            <span class="account-chip">suzuki@example.com</span>
            <span class="account-chip">sato@example.com</span>
            <span class="account-chip">yamada@example.com</span>
            <span class="account-chip">ito@example.com</span>
          </div>
          <div class="copy">© 2026 市立図書館 予約システム — Demo Site for Test Automation Practice</div>
        </div>
      </footer>
    `;
  }
}

customElements.define('lib-footer', LibFooter);
