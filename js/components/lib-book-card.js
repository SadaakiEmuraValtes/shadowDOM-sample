'use strict';

/**
 * <lib-book-card book-id="N">
 * 書籍カード。
 * - 左上チェックボックスで予約カートに追加（ログイン済み・貸出可・未予約の場合のみ）
 * - 右上ハートボタンでお気に入り登録（ログイン済みの場合のみ）
 * - 個別の予約ボタンはなし（カートに入れて reserve.html で一括予約）
 *
 * Emits: 'cart-change' | 'favorite-change'
 * Listens: 'cart-cleared' (チェックを視覚的に解除)
 */
class LibBookCard extends HTMLElement {
  static get observedAttributes() { return ['book-id']; }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    // カートクリア時: チェックを外す（DOM 直接更新）
    on('cart-cleared', () => {
      const chk  = this._shadow.querySelector('.chk-btn');
      const card = this._shadow.querySelector('.card');
      if (chk)  { chk.classList.remove('on'); chk.textContent = ''; }
      if (card) { card.classList.remove('selected'); }
    });
  }
  attributeChangedCallback() { if (this.isConnected) this._render(); }

  get _bookId() { return parseInt(this.getAttribute('book-id')); }

  _render() {
    const book = Store.getBooks().find(b => b.id === this._bookId);
    if (!book) return;

    const user            = Store.getSession();
    const available       = Store.availableStock(this._bookId);
    const alreadyReserved = user ? Store.isReservedByUser(this._bookId, user.id) : false;
    const isInCart        = Store.getCart().includes(this._bookId);
    const isFav           = user ? Store.isFavorite(user.id, this._bookId) : false;
    const showCheckbox    = !!user && available > 0 && !alreadyReserved;

    const statusText  = available > 0 ? `貸出可 (残 ${available} 冊)` : '貸出不可';

    this._shadow.innerHTML = `
      <style>
        .card {
          background: #fff; border-radius: 12px; padding: 14px 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,.08);
          display: flex; flex-direction: column; gap: 8px; height: 100%;
          transition: transform .15s, box-shadow .15s, border-color .15s;
          border: 2px solid transparent;
        }
        .card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.12); }
        .card.selected { border-color: #1a3a5c; background: #f0f4ff; }

        .card-top {
          display: flex; align-items: center; gap: 8px;
        }
        .chk-btn {
          width: 22px; height: 22px; flex-shrink: 0;
          border: 2px solid #cbd5e1; border-radius: 5px;
          background: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: .78rem; font-weight: 700; color: #fff;
          transition: all .15s;
        }
        .chk-btn:hover { border-color: #1a3a5c; }
        .chk-btn.on    { background: #1a3a5c; border-color: #1a3a5c; }
        .chk-placeholder { width: 22px; flex-shrink: 0; }

        .genre {
          flex: 1; font-size: .72rem; background: #eff6ff; color: #1d4ed8;
          padding: 2px 8px; border-radius: 20px; font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .fav-btn {
          flex-shrink: 0; background: none; border: none; cursor: pointer;
          font-size: 1.15rem; padding: 2px; line-height: 1;
          transition: transform .15s;
        }
        .fav-btn:hover { transform: scale(1.3); }

        .cover  { font-size: 2.8rem; text-align: center; line-height: 1; padding: 4px 0; }
        .title  { font-weight: 700; font-size: .95rem; color: #1e293b; line-height: 1.4; }
        .author { font-size: .82rem; color: #64748b; }
        .status { font-size: .8rem; font-weight: 600; margin-top: auto; }
        .status.ok { color: #16a34a; }
        .status.ng { color: #dc2626; }
        .badge-reserved {
          font-size: .76rem; background: #dcfce7; color: #166534;
          padding: 3px 10px; border-radius: 20px; text-align: center;
        }
        .login-hint {
          font-size: .78rem; color: #1d4ed8; text-align: center;
          text-decoration: none; display: block; margin-top: 2px;
        }
        .login-hint:hover { text-decoration: underline; }
      </style>

      <div class="card ${isInCart ? 'selected' : ''}">
        <div class="card-top">
          ${showCheckbox
            ? `<button class="chk-btn ${isInCart ? 'on' : ''}" id="chk-btn" data-testid="cart-checkbox-${book.id}" title="予約カートに追加">${isInCart ? '✓' : ''}</button>`
            : `<span class="chk-placeholder"></span>`
          }
          <span class="genre">${book.genre}</span>
          <button class="fav-btn" id="fav-btn" data-testid="fav-btn-${book.id}" title="${isFav ? 'お気に入りを解除' : 'お気に入りに追加'}">${isFav ? '❤️' : '🤍'}</button>
        </div>

        <div class="cover">${book.cover}</div>
        <div class="title">${book.title}</div>
        <div class="author">${book.author}</div>
        <div class="status ${available > 0 ? 'ok' : 'ng'}">${statusText}</div>

        ${alreadyReserved ? `<div class="badge-reserved">✓ 予約済み</div>` : ''}
        ${!user && available > 0 ? `<a class="login-hint" href="login.html" data-testid="login-hint-${book.id}">🔑 ログインして予約</a>` : ''}
      </div>
    `;

    // チェックボックス
    const chkBtn = this._shadow.getElementById('chk-btn');
    if (chkBtn) {
      chkBtn.addEventListener('click', () => {
        const added = Store.toggleCart(this._bookId);
        chkBtn.classList.toggle('on', added);
        chkBtn.textContent = added ? '✓' : '';
        this._shadow.querySelector('.card').classList.toggle('selected', added);
        emit('cart-change', { bookId: this._bookId, added });
      });
    }

    // お気に入りボタン
    const favBtn = this._shadow.getElementById('fav-btn');
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        if (!user) { window.location.href = 'login.html'; return; }
        const nowFav = Store.toggleFavorite(user.id, this._bookId);
        favBtn.textContent = nowFav ? '❤️' : '🤍';
        favBtn.title = nowFav ? 'お気に入りを解除' : 'お気に入りに追加';
        emit('favorite-change', { bookId: this._bookId, isFav: nowFav });
        emit('toast', { message: nowFav ? `❤️ お気に入りに追加しました` : '🤍 お気に入りを解除しました' });
      });
    }
  }
}

customElements.define('lib-book-card', LibBookCard);
