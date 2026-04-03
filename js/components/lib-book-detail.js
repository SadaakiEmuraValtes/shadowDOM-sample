'use strict';

/**
 * <lib-book-detail>
 * URL クエリ ?id=N から書籍IDを取得して詳細を表示する。
 *
 * 構成（テスト自動化練習用の二重構造）:
 *   [book-detail.html]
 *     └─ <lib-book-detail>  ← Shadow DOM (mode: open)
 *           ├─ ヘッダー（タイトル・著者・在庫状況・お気に入り）
 *           ├─ アクション（予約カート・順番待ち）
 *           ├─ <iframe src="book-widget.html?id=N">  ← iframe
 *           │    └─ <lib-book-widget>  ← Shadow DOM (mode: open)
 *           │         ├─ 書籍紹介文
 *           │         └─ 発行情報テーブル
 *           └─ 同じ著者の本リスト
 */
class LibBookDetail extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._bookId = parseInt(new URLSearchParams(location.search).get('id'));
    this._render();
    on('reservation-change', () => this._render());
    on('favorite-change',    () => this._render());

    // iframe から postMessage で高さが通知されたらリサイズ
    window.addEventListener('message', e => {
      if (e.data?.type === 'widget-height') {
        const iframe = this._shadow.getElementById('book-info-iframe');
        if (iframe) iframe.style.height = e.data.height + 'px';
      }
    });
  }

  get _book() {
    return Store.getBooks().find(b => b.id === this._bookId) || null;
  }

  _render() {
    const book = this._book;

    if (!book) {
      this._shadow.innerHTML = `
        <style>
          .not-found { text-align: center; padding: 80px 20px; color: #94a3b8; }
          .nf-icon   { font-size: 3rem; margin-bottom: 12px; }
          a          { color: #1a3a5c; }
        </style>
        <div class="not-found">
          <div class="nf-icon">📭</div>
          <p>書籍が見つかりませんでした。</p>
          <a href="books.html">← 蔵書一覧へ戻る</a>
        </div>`;
      return;
    }

    const user            = Store.getSession();
    const available       = Store.availableStock(book.id);
    const alreadyReserved = user ? Store.isReservedByUser(book.id, user.id) : false;
    const isInCart        = Store.getCart().includes(book.id);
    const isFav           = user ? Store.isFavorite(user.id, book.id) : false;
    const waitingCount    = Store.getWaitingCount(book.id);
    const isWaiting       = user ? Store.isWaitingByUser(book.id, user.id) : false;
    const waitingPos      = isWaiting ? Store.getUserWaitingPosition(book.id, user.id) : 0;

    const waitEntry = isWaiting
      ? Store.getReservations().find(r => r.bookId === book.id && r.userId === user?.id && r.status === 'waiting')
      : null;

    // 同著者の他の本
    const sameAuthor = Store.getBooks()
      .filter(b => b.author === book.author && b.id !== book.id);

    this._shadow.innerHTML = `
      <style>
        * { box-sizing: border-box; }

        .back-link {
          display: inline-flex; align-items: center; gap: 6px;
          color: #64748b; font-size: .88rem; text-decoration: none;
          margin-bottom: 20px; transition: color .15s;
        }
        .back-link:hover { color: #1a3a5c; }

        /* ヘッダーカード */
        .header-card {
          background: #fff; border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,.08);
          padding: 28px 32px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 24px;
          align-items: start;
          margin-bottom: 20px;
        }
        @media (max-width: 600px) {
          .header-card { grid-template-columns: 1fr; }
          .cover-col   { text-align: center; }
          .action-col  { justify-self: stretch; }
        }

        .cover-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .cover     { font-size: 5rem; line-height: 1; }
        .fav-btn   {
          background: none; border: 1px solid #e2e8f0; border-radius: 20px;
          padding: 5px 14px; cursor: pointer; font-size: .88rem;
          display: flex; align-items: center; gap: 5px;
          transition: all .15s; white-space: nowrap; color: #64748b;
        }
        .fav-btn:hover           { border-color: #f43f5e; color: #f43f5e; }
        .fav-btn.active          { background: #fff1f2; border-color: #fda4af; color: #be123c; }

        .info-col { display: flex; flex-direction: column; gap: 10px; }
        .genre-badge {
          display: inline-block; font-size: .75rem; font-weight: 600;
          background: #eff6ff; color: #1d4ed8;
          padding: 3px 12px; border-radius: 20px;
        }
        .title  { font-size: 1.5rem; font-weight: 800; color: #1e293b; line-height: 1.3; margin: 0; }
        .author { font-size: 1rem; color: #475569; }
        .status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: .82rem; font-weight: 600; padding: 5px 14px; border-radius: 20px;
        }
        .status-badge.ok { background: #dcfce7; color: #166534; }
        .status-badge.ng { background: #fee2e2; color: #991b1b; }

        /* アクションカラム */
        .action-col { display: flex; flex-direction: column; gap: 10px; min-width: 200px; }

        .action-btn {
          width: 100%; padding: 11px 16px; border: none; border-radius: 10px;
          font-size: .9rem; font-weight: 700; cursor: pointer; transition: all .15s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .btn-cart       { background: #1a3a5c; color: #fff; }
        .btn-cart:hover { background: #1e4a7a; }
        .btn-cart.in-cart { background: #0f766e; }
        .btn-wait       { background: #f59e0b; color: #fff; }
        .btn-wait:hover { background: #d97706; }
        .btn-cancel-wait { background: #fce7f3; color: #9d174d; border: 1px solid #fda4af; }
        .btn-cancel-wait:hover { background: #fbcfe8; }
        .btn-to-reserve {
          width: 100%; padding: 10px 16px; border-radius: 10px;
          background: transparent; border: 1px solid #1a3a5c; color: #1a3a5c;
          font-size: .85rem; font-weight: 600; cursor: pointer; transition: all .15s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .btn-to-reserve:hover { background: #f0f4ff; }
        .badge-reserved {
          text-align: center; padding: 8px; border-radius: 8px;
          background: #dcfce7; color: #166534; font-size: .85rem; font-weight: 600;
        }
        .wait-pos-badge {
          text-align: center; padding: 8px; border-radius: 8px;
          background: #fef3c7; color: #92400e; font-size: .83rem; font-weight: 700;
        }
        .wait-count-info {
          text-align: center; font-size: .78rem; color: #9a3412;
          background: #fff7ed; border-radius: 8px; padding: 6px;
        }
        .login-hint {
          display: block; text-align: center;
          color: #1d4ed8; font-size: .85rem; text-decoration: none; padding: 8px;
          background: #eff6ff; border-radius: 8px;
        }
        .login-hint:hover { background: #dbeafe; }

        /* iframeセクション */
        .iframe-section {
          background: #fff; border-radius: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,.07);
          padding: 24px 28px;
          margin-bottom: 20px;
          position: relative;
        }
        .iframe-section-label {
          font-size: .7rem; font-weight: 700; letter-spacing: .08em;
          color: #94a3b8; text-transform: uppercase;
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 12px;
        }
        .iframe-section-label::after {
          content: ''; flex: 1; height: 1px; background: #e2e8f0;
        }
        .iframe-badge {
          font-size: .68rem; font-weight: 700;
          background: #fef3c7; color: #92400e;
          padding: 2px 8px; border-radius: 10px;
        }
        #book-info-iframe {
          width: 100%; border: none; display: block;
          min-height: 200px; overflow: hidden;
          transition: height .2s;
        }

        /* セクションカード */
        .section-card {
          background: #fff; border-radius: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,.07);
          padding: 24px 28px;
          margin-bottom: 20px;
        }
        .section-title {
          font-size: .95rem; font-weight: 700; color: #1a3a5c;
          margin-bottom: 14px; padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
          display: flex; align-items: center; gap: 8px;
        }

        /* 同著者リスト */
        .same-author-list { display: flex; flex-direction: column; gap: 8px; }
        .same-author-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; background: #f8fafc; border-radius: 10px;
          text-decoration: none; color: inherit;
          border: 1px solid transparent; transition: all .15s;
        }
        .same-author-item:hover { background: #eff6ff; border-color: #93c5fd; }
        .sa-cover  { font-size: 1.5rem; flex-shrink: 0; }
        .sa-title  { font-weight: 600; font-size: .9rem; color: #1e293b; }
        .sa-genre  { font-size: .75rem; color: #64748b; }
        .sa-status { margin-left: auto; font-size: .75rem; font-weight: 600; white-space: nowrap; }
        .sa-status.ok { color: #16a34a; }
        .sa-status.ng { color: #dc2626; }

        .no-same-author { color: #94a3b8; font-size: .88rem; }
      </style>

      <a class="back-link" href="books.html" data-testid="back-to-books">← 蔵書一覧へ戻る</a>

      <!-- ヘッダーカード（Shadow DOM） -->
      <div class="header-card">
        <!-- 表紙＋お気に入り -->
        <div class="cover-col">
          <div class="cover">${book.cover}</div>
          ${user ? `
            <button class="fav-btn ${isFav ? 'active' : ''}" id="fav-btn" data-testid="detail-fav-btn">
              ${isFav ? '❤️ お気に入り済み' : '🤍 お気に入り'}
            </button>
          ` : ''}
        </div>

        <!-- 書籍情報 -->
        <div class="info-col">
          <span class="genre-badge" data-testid="detail-genre">${book.genre}</span>
          <h1 class="title" data-testid="detail-title">${book.title}</h1>
          <div class="author" data-testid="detail-author">著者: ${book.author}</div>
          <span class="status-badge ${available > 0 ? 'ok' : 'ng'}" data-testid="detail-status">
            ${available > 0 ? `✓ 貸出可（残 ${available} 冊）` : '✗ 貸出中'}
          </span>
        </div>

        <!-- アクション（Shadow DOM） -->
        <div class="action-col">
          ${!user ? `
            <a class="login-hint" href="login.html" data-testid="detail-login-hint">🔑 ログインして予約 / 順番待ち</a>
          ` : alreadyReserved ? `
            <div class="badge-reserved" data-testid="detail-reserved-badge">✓ 予約済み</div>
            <button class="btn-to-reserve" id="to-reserve-btn" data-testid="detail-to-reserve">📋 予約確認へ</button>
          ` : isWaiting ? `
            <div class="wait-pos-badge" data-testid="detail-wait-pos">⏳ ${waitingPos} 番目待ち（全 ${waitingCount} 人）</div>
            <button class="action-btn btn-cancel-wait" id="cancel-wait-btn" data-rid="${waitEntry?.id}" data-testid="detail-cancel-wait">
              順番待ちをキャンセル
            </button>
          ` : available > 0 ? `
            <button class="action-btn btn-cart ${isInCart ? 'in-cart' : ''}" id="cart-btn" data-testid="detail-cart-btn">
              ${isInCart ? '✓ カートに入っています' : '＋ 予約カートに追加'}
            </button>
            ${isInCart ? `<button class="btn-to-reserve" id="to-reserve-btn" data-testid="detail-to-reserve">📋 予約確認へ →</button>` : ''}
          ` : `
            <div class="wait-count-info" data-testid="detail-wait-count">
              ${waitingCount > 0 ? `現在 ${waitingCount} 人が順番待ちです` : '現在貸出中（順番待ちなし）'}
            </div>
            <button class="action-btn btn-wait" id="wait-btn" data-testid="detail-wait-btn">
              ⏳ 順番待ちに登録
            </button>
          `}
        </div>
      </div>

      <!-- 書籍紹介・発行情報（iframe + Shadow DOM） -->
      <div class="iframe-section">
        <div class="iframe-section-label">
          書籍詳細情報
          <span class="iframe-badge">iframe 内 Shadow DOM</span>
        </div>
        <iframe
          id="book-info-iframe"
          src="book-widget.html?id=${book.id}"
          data-testid="book-info-iframe"
          title="書籍情報ウィジェット"
        ></iframe>
      </div>

      <!-- 同じ著者の本（Shadow DOM） -->
      <div class="section-card">
        <div class="section-title">✍️ 同じ著者の本</div>
        ${sameAuthor.length === 0
          ? `<div class="no-same-author">同じ著者の他の蔵書はありません</div>`
          : `<div class="same-author-list" data-testid="same-author-list">
              ${sameAuthor.map(b => {
                const avail = Store.availableStock(b.id);
                return `
                  <a class="same-author-item" href="book-detail.html?id=${b.id}" data-testid="same-author-${b.id}">
                    <span class="sa-cover">${b.cover}</span>
                    <div>
                      <div class="sa-title">${b.title}</div>
                      <div class="sa-genre">${b.genre}</div>
                    </div>
                    <span class="sa-status ${avail > 0 ? 'ok' : 'ng'}">
                      ${avail > 0 ? `貸出可 (残 ${avail})` : '貸出中'}
                    </span>
                  </a>`;
              }).join('')}
            </div>`
        }
      </div>
    `;

    // お気に入りボタン
    const favBtn = this._shadow.getElementById('fav-btn');
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        const nowFav = Store.toggleFavorite(user.id, book.id);
        emit('favorite-change', { bookId: book.id, isFav: nowFav });
        emit('toast', { message: nowFav ? '❤️ お気に入りに追加しました' : '🤍 お気に入りを解除しました' });
      });
    }

    // 予約カートに追加
    const cartBtn = this._shadow.getElementById('cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        const added = Store.toggleCart(book.id);
        emit('cart-change', { bookId: book.id, added });
        emit('toast', { message: added ? '📚 予約カートに追加しました' : '📚 予約カートから取り除きました' });
        this._render();
      });
    }

    // 予約確認へ
    const toReserveBtn = this._shadow.getElementById('to-reserve-btn');
    if (toReserveBtn) {
      toReserveBtn.addEventListener('click', () => {
        window.location.href = 'reserve.html';
      });
    }

    // 順番待ち登録
    const waitBtn = this._shadow.getElementById('wait-btn');
    if (waitBtn) {
      waitBtn.addEventListener('click', () => {
        const result = Store.joinWaitingList(book.id, user.id);
        if (result.ok) {
          emit('reservation-change');
          const pos = Store.getUserWaitingPosition(book.id, user.id);
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
  }
}

customElements.define('lib-book-detail', LibBookDetail);
