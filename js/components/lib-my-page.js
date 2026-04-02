'use strict';

/**
 * <lib-my-page>
 * マイページ。3 タブ構成:
 *   1. 現在の予約  — 返却・キャンセル操作
 *   2. 利用履歴    — 過去の予約履歴
 *   3. お気に入り  — お気に入り書籍一覧・カートへ追加・解除
 * 未ログインなら login.html へリダイレクト。
 */
class LibMyPage extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._tab    = 'active';
  }

  connectedCallback() {
    if (!Store.getSession()) { window.location.href = 'login.html'; return; }
    this._render();
    on('reservation-change', () => this._render());
    on('favorite-change',    () => { if (this._tab === 'favorites') this._render(); });
  }

  _fmtDate(iso) {
    return new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  }
  _daysLeft(iso) { return Math.ceil((new Date(iso) - new Date()) / 86400000); }

  _statusBadge(r) {
    if (r.status === 'reserved' && this._daysLeft(r.dueDate) < 0)
      return '<span class="badge overdue">期限切れ</span>';
    if (r.status === 'reserved')  return '<span class="badge reserved">予約中</span>';
    if (r.status === 'returned')  return '<span class="badge returned">返却済</span>';
    return '<span class="badge cancelled">キャンセル</span>';
  }

  _render() {
    const user    = Store.getSession();
    if (!user) return;

    const books   = Store.getBooks();
    const allRs   = Store.getReservations().filter(r => r.userId === user.id);
    const active  = allRs.filter(r => r.status === 'reserved');
    const history = allRs.filter(r => r.status !== 'reserved');
    const favIds  = Store.getFavorites(user.id);
    const favBooks = favIds.map(id => books.find(b => b.id === id)).filter(Boolean);

    this._shadow.innerHTML = `
      <style>
        h2 { color: #1a3a5c; font-size: 1.3rem; margin-bottom: 20px; }

        .stats {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px; margin-bottom: 24px;
        }
        .stat {
          background: #fff; border-radius: 10px; padding: 16px;
          text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,.07);
        }
        .stat-num   { font-size: 2rem; font-weight: 700; color: #1a3a5c; }
        .stat-label { font-size: .78rem; color: #94a3b8; margin-top: 4px; }

        .tabs {
          display: flex; gap: 0;
          border-bottom: 2px solid #e2e8f0; margin-bottom: 20px;
        }
        .tab-btn {
          padding: 10px 22px; background: transparent; border: none;
          font-size: .9rem; cursor: pointer; color: #94a3b8;
          border-bottom: 2px solid transparent; margin-bottom: -2px;
          font-weight: 500; transition: all .15s; white-space: nowrap;
        }
        .tab-btn.active { color: #1a3a5c; border-bottom-color: #1a3a5c; font-weight: 700; }

        /* テーブル */
        .table-wrap {
          background: #fff; border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,.07); overflow: hidden;
        }
        table  { width: 100%; border-collapse: collapse; }
        th {
          background: #1a3a5c; color: #fff;
          padding: 12px 16px; text-align: left; font-size: .85rem; font-weight: 600;
        }
        td {
          padding: 12px 16px; border-bottom: 1px solid #f1f5f9;
          font-size: .88rem; vertical-align: middle; color: #374151;
        }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #f8fafc; }

        .badge {
          display: inline-block; padding: 3px 10px;
          border-radius: 20px; font-size: .75rem; font-weight: 700;
        }
        .badge.reserved  { background: #dcfce7; color: #166534; }
        .badge.returned  { background: #dbeafe; color: #1d4ed8; }
        .badge.cancelled { background: #fce7f3; color: #9d174d; }
        .badge.overdue   { background: #fff7ed; color: #c2410c; }

        .action-btn {
          padding: 5px 14px; border: none; border-radius: 6px;
          font-size: .8rem; font-weight: 600; cursor: pointer;
          transition: all .15s; margin: 0 3px;
        }
        .action-btn.return  { background: #dbeafe; color: #1d4ed8; }
        .action-btn.return:hover  { background: #bfdbfe; }
        .action-btn.cancel  { background: #fce7f3; color: #9d174d; }
        .action-btn.cancel:hover  { background: #fbcfe8; }

        .due-warn { color: #c2410c; font-size: .78rem; margin-left: 4px; }
        .due-ok   { color: #94a3b8; font-size: .78rem; margin-left: 4px; }
        .empty    { text-align: center; padding: 60px; color: #94a3b8; font-size: .95rem; }

        /* お気に入りグリッド */
        .fav-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px;
        }
        .fav-card {
          background: #fff; border-radius: 12px; padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,.07);
          display: flex; flex-direction: column; gap: 8px;
        }
        .fav-cover  { font-size: 2.4rem; text-align: center; line-height: 1; }
        .fav-genre  {
          font-size: .72rem; background: #eff6ff; color: #1d4ed8;
          padding: 2px 8px; border-radius: 20px; font-weight: 500;
          display: inline-block; align-self: flex-start;
        }
        .fav-title  { font-weight: 700; font-size: .92rem; color: #1e293b; line-height: 1.4; }
        .fav-author { font-size: .8rem; color: #64748b; }
        .fav-status { font-size: .78rem; font-weight: 600; margin-top: auto; }
        .fav-status.ok { color: #16a34a; }
        .fav-status.ng { color: #dc2626; }
        .fav-actions { display: flex; gap: 8px; margin-top: 4px; }
        .fav-btn {
          flex: 1; padding: 7px 8px; border: none; border-radius: 7px;
          font-size: .78rem; font-weight: 600; cursor: pointer; transition: all .15s;
        }
        .fav-btn.cart    { background: #1a3a5c; color: #fff; }
        .fav-btn.cart:hover    { background: #1e4a7a; }
        .fav-btn.cart.in-cart  { background: #dcfce7; color: #166534; cursor: default; }
        .fav-btn.cart.reserved { background: #f1f5f9; color: #94a3b8; cursor: default; }
        .fav-btn.remove  { background: #fce7f3; color: #9d174d; }
        .fav-btn.remove:hover  { background: #fbcfe8; }
        .fav-empty { grid-column: 1/-1; text-align: center; padding: 60px; color: #94a3b8; }
        .fav-empty-icon { font-size: 3rem; margin-bottom: 12px; }
      </style>

      <h2>📋 マイページ — ${user.avatar} ${user.name}</h2>

      <!-- サマリー統計 -->
      <div class="stats" data-testid="stats">
        <div class="stat">
          <div class="stat-num" data-testid="stat-active">${active.length}</div>
          <div class="stat-label">現在の予約</div>
        </div>
        <div class="stat">
          <div class="stat-num">${history.filter(r => r.status === 'returned').length}</div>
          <div class="stat-label">返却済み</div>
        </div>
        <div class="stat">
          <div class="stat-num">${history.filter(r => r.status === 'cancelled').length}</div>
          <div class="stat-label">キャンセル</div>
        </div>
        <div class="stat">
          <div class="stat-num">${favIds.length}</div>
          <div class="stat-label">お気に入り</div>
        </div>
      </div>

      <!-- タブ -->
      <div class="tabs">
        <button class="tab-btn ${this._tab === 'active'    ? 'active' : ''}" id="tab-active"    data-testid="tab-active">
          現在の予約 (${active.length})
        </button>
        <button class="tab-btn ${this._tab === 'history'   ? 'active' : ''}" id="tab-history"   data-testid="tab-history">
          利用履歴 (${history.length})
        </button>
        <button class="tab-btn ${this._tab === 'favorites' ? 'active' : ''}" id="tab-favorites" data-testid="tab-favorites">
          ❤️ お気に入り (${favIds.length})
        </button>
      </div>

      <!-- タブコンテンツ -->
      ${this._tab === 'favorites'
        ? this._renderFavoritesTab(favBooks, user)
        : this._renderReservationTab(this._tab === 'active' ? active : history, user, books)
      }
    `;

    this._shadow.getElementById('tab-active')?.addEventListener('click', () => { this._tab = 'active'; this._render(); });
    this._shadow.getElementById('tab-history')?.addEventListener('click', () => { this._tab = 'history'; this._render(); });
    this._shadow.getElementById('tab-favorites')?.addEventListener('click', () => { this._tab = 'favorites'; this._render(); });

    // 現在の予約 — 返却・キャンセルボタン
    this._shadow.querySelectorAll('.action-btn.return').forEach(btn => {
      btn.addEventListener('click', () => {
        Store.return_(parseInt(btn.dataset.rid), user.id);
        emit('reservation-change');
        emit('toast', { message: '📗 返却しました', type: 'success' });
      });
    });
    this._shadow.querySelectorAll('.action-btn.cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        Store.cancel(parseInt(btn.dataset.rid), user.id);
        emit('reservation-change');
        emit('toast', { message: '予約をキャンセルしました' });
      });
    });

    // お気に入り — カート追加ボタン
    this._shadow.querySelectorAll('.fav-btn.cart[data-book-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('in-cart') || btn.classList.contains('reserved')) return;
        Store.toggleCart(parseInt(btn.dataset.bookId));
        emit('cart-change');
        window.location.href = 'reserve.html';
      });
    });

    // お気に入り — 解除ボタン
    this._shadow.querySelectorAll('.fav-btn.remove').forEach(btn => {
      btn.addEventListener('click', () => {
        Store.toggleFavorite(user.id, parseInt(btn.dataset.bookId));
        emit('favorite-change', { bookId: parseInt(btn.dataset.bookId), isFav: false });
        emit('toast', { message: '🤍 お気に入りを解除しました' });
        this._render();
      });
    });
  }

  _renderFavoritesTab(favBooks, user) {
    if (favBooks.length === 0) {
      return `
        <div class="fav-grid" data-testid="favorites-grid">
          <div class="fav-empty">
            <div class="fav-empty-icon">🤍</div>
            お気に入りに登録した書籍はありません<br>
            <a href="books.html" style="color:#1d4ed8; font-size:.88rem; margin-top:8px; display:inline-block;">← 蔵書一覧でお気に入りを追加する</a>
          </div>
        </div>`;
    }
    return `
      <div class="fav-grid" data-testid="favorites-grid">
        ${favBooks.map(book => {
          const available   = Store.availableStock(book.id);
          const isReserved  = Store.isReservedByUser(book.id, user.id);
          const isInCart    = Store.getCart().includes(book.id);
          const statusText  = available > 0 ? `貸出可 (残 ${available} 冊)` : '貸出不可';
          let cartBtnClass  = 'cart';
          let cartBtnText   = '予約カートへ';
          if (isReserved) { cartBtnClass = 'cart reserved'; cartBtnText = '予約済み'; }
          else if (isInCart) { cartBtnClass = 'cart in-cart'; cartBtnText = 'カート追加済'; }
          else if (available <= 0) { cartBtnClass = 'cart reserved'; cartBtnText = '貸出不可'; }
          return `
            <div class="fav-card" data-testid="fav-card-${book.id}">
              <div class="fav-cover">${book.cover}</div>
              <span class="fav-genre">${book.genre}</span>
              <div class="fav-title">${book.title}</div>
              <div class="fav-author">${book.author}</div>
              <div class="fav-status ${available > 0 ? 'ok' : 'ng'}">${statusText}</div>
              <div class="fav-actions">
                <button class="fav-btn ${cartBtnClass}" data-book-id="${book.id}" data-testid="fav-cart-btn-${book.id}">${cartBtnText}</button>
                <button class="fav-btn remove" data-book-id="${book.id}" data-testid="fav-remove-btn-${book.id}">🗑 解除</button>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }

  _renderReservationTab(list, user, books) {
    const isActive = this._tab === 'active';
    if (list.length === 0) {
      return `<div class="table-wrap"><div class="empty">📭 ${isActive ? '現在予約している本はありません' : '利用履歴はありません'}</div></div>`;
    }
    return `
      <div class="table-wrap">
        <table data-testid="reservation-table">
          <thead>
            <tr>
              <th>書籍</th><th>著者</th><th>予約日</th>
              ${isActive ? '<th>返却期限</th><th>状態</th><th>操作</th>' : '<th>状態</th><th>返却日</th>'}
            </tr>
          </thead>
          <tbody>
            ${list.map(r => {
              const book = books.find(b => b.id === r.bookId);
              const dl   = this._daysLeft(r.dueDate);
              return `
                <tr data-reservation-id="${r.id}">
                  <td>${book ? book.cover + ' ' + book.title : '不明'}</td>
                  <td>${book ? book.author : '-'}</td>
                  <td>${this._fmtDate(r.reservedAt)}</td>
                  ${isActive
                    ? `<td>
                         ${this._fmtDate(r.dueDate)}
                         ${dl >= 0
                           ? `<span class="due-ok">(あと ${dl} 日)</span>`
                           : `<span class="due-warn">⚠ 超過</span>`}
                       </td>
                       <td>${this._statusBadge(r)}</td>
                       <td>
                         <button class="action-btn return" data-rid="${r.id}" data-testid="return-btn">返却</button>
                         <button class="action-btn cancel" data-rid="${r.id}" data-testid="cancel-btn">キャンセル</button>
                       </td>`
                    : `<td>${this._statusBadge(r)}</td>
                       <td>${r.returnedAt ? this._fmtDate(r.returnedAt) : '-'}</td>`
                  }
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }
}

customElements.define('lib-my-page', LibMyPage);
