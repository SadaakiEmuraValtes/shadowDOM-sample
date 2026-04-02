'use strict';

/**
 * <lib-book-list>
 * 蔵書一覧グリッド + 検索・フィルタ + 予約カートバー。
 *
 * - 検索・フィルタ変更時に 2〜5 秒 Loading（初回は即時表示）
 * - ログイン済みの場合「お気に入りのみ」フィルタを表示
 * - カートに本が入ると画面下部に浮動バーを表示 → reserve.html へ遷移
 */
class LibBookList extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._inputQuery   = '';
    this._inputGenre   = 'all';
    this._appliedQuery = '';
    this._appliedGenre = 'all';
    this._favOnly      = false;
    this._loading      = false;
    this._searchTimer  = null;
  }

  connectedCallback() {
    this._render();
    on('reservation-change', () => { if (!this._loading) this._render(); });
    on('cart-change',        () => this._updateFloatingBar());
    on('cart-cleared',       () => this._render());
    on('favorite-change',    () => { if (this._favOnly) this._render(); });
  }

  _applyFilter() {
    this._appliedQuery = this._inputQuery;
    this._appliedGenre = this._inputGenre;
    this._loading      = false;
    this._render();
  }

  _triggerLoading() {
    this._loading = true;
    clearTimeout(this._searchTimer);
    this._render();
    this._searchTimer = setTimeout(() => this._applyFilter(), randomDelay());
  }

  get _genres() {
    return ['all', ...new Set(Store.getBooks().map(b => b.genre))];
  }

  get _filtered() {
    const user = Store.getSession();
    const q    = this._appliedQuery.toLowerCase();
    return Store.getBooks().filter(b => {
      const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      const matchG = this._appliedGenre === 'all' || b.genre === this._appliedGenre;
      const matchF = !this._favOnly || (user && Store.isFavorite(user.id, b.id));
      return matchQ && matchG && matchF;
    });
  }

  /** カートバーのみ更新（グリッドの再描画なし） */
  _updateFloatingBar() {
    const bar = this._shadow.getElementById('floating-bar');
    if (bar) this._renderFloatingBarContent(bar);
  }

  _renderFloatingBarContent(bar) {
    const cart = Store.getCart();
    if (cart.length === 0) { bar.innerHTML = ''; return; }

    const books = Store.getBooks();
    bar.innerHTML = `
      <style>
        .bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #1a3a5c; color: #fff;
          padding: 14px 24px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 -4px 20px rgba(0,0,0,.25);
          z-index: 500;
          flex-wrap: wrap;
        }
        .bar-info { flex: 1; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .bar-count {
          background: rgba(255,255,255,.15); border-radius: 20px;
          padding: 4px 14px; font-weight: 700; font-size: .9rem; white-space: nowrap;
        }
        .bar-titles { font-size: .82rem; color: rgba(255,255,255,.75); }
        .bar-actions { display: flex; gap: 10px; flex-shrink: 0; }
        .bar-btn {
          padding: 9px 22px; border-radius: 8px; border: none;
          font-size: .88rem; font-weight: 700; cursor: pointer; transition: all .15s;
        }
        .btn-reserve { background: #f59e0b; color: #1a1a1a; }
        .btn-reserve:hover { background: #fbbf24; }
        .btn-clear  { background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.25); }
        .btn-clear:hover  { background: rgba(255,255,255,.22); }
      </style>
      <div class="bar" data-testid="cart-bar">
        <div class="bar-info">
          <span class="bar-count" data-testid="cart-count">${cart.length} 冊選択中</span>
          <span class="bar-titles">
            ${cart.map(id => books.find(b => b.id === id)).filter(Boolean).map(b => b.cover + b.title).join('・')}
          </span>
        </div>
        <div class="bar-actions">
          <button class="bar-btn btn-clear"   id="clear-btn"   data-testid="cart-clear">クリア</button>
          <button class="bar-btn btn-reserve" id="reserve-btn" data-testid="cart-reserve">予約確認へ →</button>
        </div>
      </div>
    `;
    bar.querySelector('#reserve-btn').addEventListener('click', () => {
      window.location.href = 'reserve.html';
    });
    bar.querySelector('#clear-btn').addEventListener('click', () => {
      Store.clearCart();
      emit('cart-cleared');
    });
  }

  _render() {
    const user   = Store.getSession();
    const genres = this._genres;
    const cart   = Store.getCart();

    this._shadow.innerHTML = `
      <style>
        .toolbar {
          display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;
          background: #fff; padding: 16px 20px; border-radius: 10px;
          box-shadow: 0 1px 4px rgba(0,0,0,.08); align-items: center;
        }
        .search-wrap { flex: 1; min-width: 180px; position: relative; }
        .search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
        input[type="text"] {
          width: 100%; padding: 9px 12px 9px 36px;
          border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: .95rem; outline: none; transition: border-color .2s;
        }
        input[type="text"]:focus { border-color: #1a3a5c; }
        select {
          padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: .9rem; background: #fff; outline: none; cursor: pointer; color: #374151;
        }
        select:focus { border-color: #1a3a5c; }
        .fav-toggle {
          padding: 8px 14px; border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: .85rem; background: #fff; cursor: pointer; white-space: nowrap;
          transition: all .15s; color: #374151;
        }
        .fav-toggle.on { background: #fff1f2; border-color: #fda4af; color: #be123c; font-weight: 600; }
        .count { font-size: .88rem; color: #94a3b8; white-space: nowrap; }
        .toolbar.is-loading input, .toolbar.is-loading select, .toolbar.is-loading .fav-toggle { opacity: .6; }

        .grid-wrap { position: relative; padding-bottom: ${cart.length > 0 ? '80px' : '0'}; }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .empty {
          text-align: center; padding: 80px 20px;
          color: #94a3b8; font-size: 1.05rem; grid-column: 1 / -1;
        }
        .empty-icon { font-size: 3rem; margin-bottom: 12px; }

        .loading-overlay {
          position: absolute; inset: 0;
          background: rgba(240,244,248,.88);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px; border-radius: 12px; z-index: 10; min-height: 200px;
        }
        .spinner {
          width: 48px; height: 48px;
          border: 5px solid #e2e8f0; border-top-color: #1a3a5c;
          border-radius: 50%; animation: spin .85s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-size: .9rem; font-weight: 600; color: #475569; }
      </style>

      <div class="toolbar ${this._loading ? 'is-loading' : ''}">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" id="search-input" placeholder="タイトル・著者で検索…"
            value="${this._inputQuery.replace(/"/g, '&quot;')}" data-testid="search-input" />
        </div>
        <select id="genre-select" data-testid="genre-select">
          ${genres.map(g =>
            `<option value="${g}" ${g === this._inputGenre ? 'selected' : ''}>${g === 'all' ? 'すべてのジャンル' : g}</option>`
          ).join('')}
        </select>
        ${user ? `<button class="fav-toggle ${this._favOnly ? 'on' : ''}" id="fav-toggle" data-testid="fav-toggle">
          ${this._favOnly ? '❤️ お気に入りのみ' : '🤍 お気に入り'}
        </button>` : ''}
        <span class="count" data-testid="book-count">${this._loading ? '...' : `${this._filtered.length} 件`}</span>
      </div>

      <div class="grid-wrap">
        ${this._loading ? `
          <div class="loading-overlay" data-testid="book-list-loading">
            <div class="spinner"></div>
            <div class="loading-text">検索中...</div>
          </div>` : ''
        }
        <div class="grid" data-testid="book-grid">
          ${(() => {
            const books = this._filtered;
            if (!this._loading && books.length === 0)
              return `<div class="empty"><div class="empty-icon">📭</div>該当する蔵書が見つかりません</div>`;
            return books.map(b => `<lib-book-card book-id="${b.id}"></lib-book-card>`).join('');
          })()}
        </div>
      </div>

      <!-- 浮動カートバー（カートに入れたときのみ表示） -->
      <div id="floating-bar"></div>
    `;

    // カートバー初期描画
    this._updateFloatingBar();

    this._shadow.getElementById('search-input').addEventListener('input', e => {
      this._inputQuery = e.target.value; this._triggerLoading();
    });
    this._shadow.getElementById('genre-select').addEventListener('change', e => {
      this._inputGenre = e.target.value; this._triggerLoading();
    });
    this._shadow.getElementById('fav-toggle')?.addEventListener('click', () => {
      this._favOnly = !this._favOnly; this._render();
    });
  }
}

customElements.define('lib-book-list', LibBookList);
