'use strict';

/**
 * <lib-book-list>
 * 蔵書一覧グリッド。テキスト検索・ジャンルフィルタ機能付き。
 * 初回表示は即時（Loading なし）。検索・フィルタ変更時のみ 2〜5 秒 Loading を発生させる。
 */
class LibBookList extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });

    // 入力ボックスに表示される値（即時反映）
    this._inputQuery = '';
    this._inputGenre = 'all';

    // 実際にフィルタへ適用される値（Loading 完了後に更新）
    this._appliedQuery = '';
    this._appliedGenre = 'all';

    this._loading     = false; // 初回は Loading なし
    this._searchTimer = null;
  }

  connectedCallback() {
    this._render();
    on('reservation-change', () => {
      if (!this._loading) this._render();
    });
  }

  /** フィルタを適用して再描画（Loading 終了） */
  _applyFilter() {
    this._appliedQuery = this._inputQuery;
    this._appliedGenre = this._inputGenre;
    this._loading      = false;
    this._render();
  }

  /** 検索 or フィルタ変更: Loading を開始（タイマーリスタート） */
  _triggerLoading() {
    this._loading = true;
    clearTimeout(this._searchTimer);
    this._render(); // Loading 表示
    this._searchTimer = setTimeout(() => {
      this._applyFilter();
    }, randomDelay());
  }

  get _genres() {
    return ['all', ...new Set(Store.getBooks().map(b => b.genre))];
  }

  get _filtered() {
    const q = this._appliedQuery.toLowerCase();
    return Store.getBooks().filter(b => {
      const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      const matchG = this._appliedGenre === 'all' || b.genre === this._appliedGenre;
      return matchQ && matchG;
    });
  }

  _render() {
    const genres = this._genres;

    this._shadow.innerHTML = `
      <style>
        .toolbar {
          display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;
          background: #fff; padding: 16px 20px; border-radius: 10px;
          box-shadow: 0 1px 4px rgba(0,0,0,.08); align-items: center;
        }
        .search-wrap { flex: 1; min-width: 200px; position: relative; }
        .search-icon {
          position: absolute; left: 11px; top: 50%;
          transform: translateY(-50%); pointer-events: none;
        }
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
        .count { font-size: .88rem; color: #94a3b8; white-space: nowrap; }
        .toolbar.is-loading input,
        .toolbar.is-loading select { opacity: .6; }

        .grid-wrap { position: relative; }

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

        /* Loading オーバーレイ */
        .loading-overlay {
          position: absolute; inset: 0;
          background: rgba(240,244,248,.88);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px; border-radius: 12px; z-index: 10;
          min-height: 200px;
        }
        .spinner {
          width: 48px; height: 48px;
          border: 5px solid #e2e8f0;
          border-top-color: #1a3a5c;
          border-radius: 50%;
          animation: spin .85s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-size: .9rem; font-weight: 600; color: #475569; }
      </style>

      <div class="toolbar ${this._loading ? 'is-loading' : ''}">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            id="search-input"
            placeholder="タイトル・著者で検索…"
            value="${this._inputQuery.replace(/"/g, '&quot;')}"
            data-testid="search-input"
          />
        </div>
        <select id="genre-select" data-testid="genre-select">
          ${genres.map(g =>
            `<option value="${g}" ${g === this._inputGenre ? 'selected' : ''}>${g === 'all' ? 'すべてのジャンル' : g}</option>`
          ).join('')}
        </select>
        <span class="count" data-testid="book-count">
          ${this._loading ? '...' : `${this._filtered.length} 件`}
        </span>
      </div>

      <div class="grid-wrap">
        ${this._loading ? `
          <div class="loading-overlay" data-testid="book-list-loading">
            <div class="spinner"></div>
            <div class="loading-text">検索中...</div>
          </div>
        ` : ''}

        <div class="grid" data-testid="book-grid">
          ${(() => {
            const books = this._filtered;
            if (!this._loading && books.length === 0) {
              return `<div class="empty"><div class="empty-icon">📭</div>該当する蔵書が見つかりません</div>`;
            }
            return books.map(b => `<lib-book-card book-id="${b.id}"></lib-book-card>`).join('');
          })()}
        </div>
      </div>
    `;

    this._shadow.getElementById('search-input').addEventListener('input', e => {
      this._inputQuery = e.target.value;
      this._triggerLoading();
    });

    this._shadow.getElementById('genre-select').addEventListener('change', e => {
      this._inputGenre = e.target.value;
      this._triggerLoading();
    });
  }
}

customElements.define('lib-book-list', LibBookList);
