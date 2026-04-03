'use strict';

/**
 * <lib-book-card book-id="N">
 * 書籍カード。在庫状況に応じて以下を表示:
 *   - 在庫あり(未予約)       : チェックボックス → 予約カートへ追加
 *   - 在庫あり(予約済み)     : 「✓ 予約済み」バッジ
 *   - 在庫なし(未待機)       : 「N人待ち」バッジ + 「順番待ちに登録」ボタン
 *   - 在庫なし(待機中)       : 「N番目待ち」バッジ + 「キャンセル」ボタン
 *   - 未ログイン             : 「🔑 ログインして予約 / 順番待ち」リンク
 * 右上ハートボタンでお気に入り登録。
 */
class LibBookCard extends HTMLElement {
  static get observedAttributes() { return ['book-id']; }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
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
    const waitingCount    = Store.getWaitingCount(this._bookId);
    const isWaiting       = user ? Store.isWaitingByUser(this._bookId, user.id) : false;
    const waitingPos      = isWaiting ? Store.getUserWaitingPosition(this._bookId, user.id) : 0;

    // 表示パターン決定
    let showCheckbox = false, showWaitBtn = false, showWaitStatus = false;
    if (!user) {
      // 未ログイン: 何もしない（下部にリンク）
    } else if (alreadyReserved) {
      // 予約済み
    } else if (isWaiting) {
      showWaitStatus = true;
    } else if (available > 0) {
      showCheckbox = true;
    } else {
      showWaitBtn = true; // 貸出中 → 順番待ち登録可
    }

    const statusText  = available > 0 ? `貸出可 (残 ${available} 冊)` : '貸出中';
    const statusClass = available > 0 ? 'ok' : 'ng';

    // 待機中ユーザーの待ちエントリIDを取得（キャンセル用）
    const waitEntry = isWaiting
      ? Store.getReservations().find(r => r.bookId === this._bookId && r.userId === user?.id && r.status === 'waiting')
      : null;

    this._shadow.innerHTML = `
      <style>
        .card {
          background: #fff; border-radius: 12px; padding: 14px 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,.08);
          display: flex; flex-direction: column; gap: 8px; height: 100%;
          transition: transform .15s, box-shadow .15s, border-color .15s;
          border: 2px solid transparent;
        }
        .card:hover       { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.12); }
        .card.selected    { border-color: #1a3a5c; background: #f0f4ff; }
        .card.is-waiting  { border-color: #f59e0b; background: #fffbeb; }

        .card-top { display: flex; align-items: center; gap: 8px; }
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
          font-size: 1.15rem; padding: 2px; line-height: 1; transition: transform .15s;
        }
        .fav-btn:hover { transform: scale(1.3); }

        .cover  { font-size: 2.8rem; text-align: center; line-height: 1; padding: 4px 0; }
        .title  { font-weight: 700; font-size: .95rem; color: #1e293b; line-height: 1.4; text-decoration: none; }
        .title:hover { color: #1a3a5c; text-decoration: underline; }
        .author { font-size: .82rem; color: #64748b; }
        .status { font-size: .8rem; font-weight: 600; margin-top: auto; }
        .status.ok { color: #16a34a; }
        .status.ng { color: #dc2626; }

        /* 各状態のバッジ・ボタン */
        .badge-reserved {
          font-size: .76rem; background: #dcfce7; color: #166534;
          padding: 3px 10px; border-radius: 20px; text-align: center;
        }

        /* 順番待ちブロック */
        .wait-block { display: flex; flex-direction: column; gap: 6px; }
        .wait-count-badge {
          font-size: .76rem; font-weight: 700;
          background: #fff7ed; color: #c2410c;
          padding: 3px 10px; border-radius: 20px; text-align: center;
        }
        .wait-btn {
          width: 100%; padding: 8px; border: none; border-radius: 7px;
          background: #f59e0b; color: #fff; font-size: .82rem; font-weight: 700;
          cursor: pointer; transition: background .15s;
        }
        .wait-btn:hover { background: #d97706; }

        /* 待機中ステータス */
        .wait-status-block { display: flex; flex-direction: column; gap: 6px; }
        .wait-pos-badge {
          font-size: .76rem; font-weight: 700;
          background: #fef3c7; color: #92400e;
          padding: 3px 10px; border-radius: 20px; text-align: center;
        }
        .cancel-wait-btn {
          width: 100%; padding: 7px; border: none; border-radius: 7px;
          background: #fce7f3; color: #9d174d; font-size: .8rem; font-weight: 600;
          cursor: pointer; transition: background .15s;
        }
        .cancel-wait-btn:hover { background: #fbcfe8; }

        .login-hint {
          font-size: .78rem; color: #1d4ed8; text-align: center;
          text-decoration: none; display: block; margin-top: 2px;
        }
        .login-hint:hover { text-decoration: underline; }
      </style>

      <div class="card ${isInCart ? 'selected' : ''} ${isWaiting ? 'is-waiting' : ''}">
        <div class="card-top">
          ${showCheckbox
            ? `<button class="chk-btn ${isInCart ? 'on' : ''}" id="chk-btn" data-testid="cart-checkbox-${book.id}" title="予約カートへ追加">${isInCart ? '✓' : ''}</button>`
            : `<span class="chk-placeholder"></span>`
          }
          <span class="genre">${book.genre}</span>
          <button class="fav-btn" id="fav-btn" data-testid="fav-btn-${book.id}" title="${isFav ? 'お気に入りを解除' : 'お気に入りに追加'}">${isFav ? '❤️' : '🤍'}</button>
        </div>

        <div class="cover">${book.cover}</div>
        <a class="title" href="book-detail.html?id=${book.id}" data-testid="book-title-link-${book.id}">${book.title}</a>
        <div class="author">${book.author}</div>
        <div class="status ${statusClass}">${statusText}</div>

        ${alreadyReserved ? `<div class="badge-reserved">✓ 予約済み</div>` : ''}

        ${showWaitBtn ? `
          <div class="wait-block">
            <span class="wait-count-badge" data-testid="wait-count-${book.id}">
              ${waitingCount > 0 ? `${waitingCount} 人待ち` : '貸出中'}
            </span>
            <button class="wait-btn" id="wait-btn" data-testid="wait-btn-${book.id}">
              順番待ちに登録
            </button>
          </div>` : ''
        }

        ${showWaitStatus ? `
          <div class="wait-status-block">
            <span class="wait-pos-badge" data-testid="wait-pos-${book.id}">
              ⏳ ${waitingPos} 番目待ち（全 ${waitingCount} 人）
            </span>
            <button class="cancel-wait-btn" id="cancel-wait-btn" data-rid="${waitEntry?.id}" data-testid="cancel-wait-btn-${book.id}">
              順番待ちをキャンセル
            </button>
          </div>` : ''
        }

        ${!user ? `<a class="login-hint" href="login.html" data-testid="login-hint-${book.id}">🔑 ログインして予約 / 順番待ち</a>` : ''}
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

    // 順番待ちに登録
    const waitBtn = this._shadow.getElementById('wait-btn');
    if (waitBtn) {
      waitBtn.addEventListener('click', () => {
        if (!user) { window.location.href = 'login.html'; return; }
        const result = Store.joinWaitingList(this._bookId, user.id);
        if (result.ok) {
          emit('reservation-change');
          const pos = Store.getUserWaitingPosition(this._bookId, user.id);
          emit('toast', { message: `⏳ 順番待ちに登録しました（${pos} 番目）` });
        }
      });
    }

    // 順番待ちキャンセル
    const cancelWaitBtn = this._shadow.getElementById('cancel-wait-btn');
    if (cancelWaitBtn) {
      cancelWaitBtn.addEventListener('click', () => {
        const rid = parseInt(cancelWaitBtn.dataset.rid);
        Store.cancelWaiting(rid, user.id);
        emit('reservation-change');
        emit('toast', { message: '順番待ちをキャンセルしました' });
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
        emit('toast', { message: nowFav ? '❤️ お気に入りに追加しました' : '🤍 お気に入りを解除しました' });
      });
    }
  }
}

customElements.define('lib-book-card', LibBookCard);
