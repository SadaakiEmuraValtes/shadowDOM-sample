'use strict';

/**
 * <lib-reserve>
 * 予約確認ページ。
 * - カートの書籍一覧を表示
 * - カレンダーで返却期限日を選択（明日〜30日後）
 * - 「予約を確定する」で Store.reserveMultiple() → カートクリア → マイ予約へ
 */
class LibReserve extends HTMLElement {
  constructor() {
    super();
    this._shadow    = this.attachShadow({ mode: 'open' });
    this._confirming = false;
  }

  connectedCallback() {
    if (!Store.getSession()) { window.location.href = 'login.html'; return; }
    this._render();
  }

  /** Date → YYYY-MM-DD（input[type=date] 用） */
  _toInputDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  _render() {
    const user  = Store.getSession();
    const cart  = Store.getCart();
    const books = Store.getBooks();

    const tomorrow   = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const maxDay     = new Date(); maxDay.setDate(maxDay.getDate() + 30);
    const defaultDay = new Date(); defaultDay.setDate(defaultDay.getDate() + 14);

    const minStr     = this._toInputDate(tomorrow);
    const maxStr     = this._toInputDate(maxDay);
    const defaultStr = this._toInputDate(defaultDay);

    // カートの書籍情報を検証
    const cartBooks = cart.map(id => {
      const book      = books.find(b => b.id === id);
      const available = Store.availableStock(id);
      const reserved  = user ? Store.isReservedByUser(id, user.id) : false;
      return { id, book, available, reserved };
    }).filter(x => x.book);

    const reservable = cartBooks.filter(x => x.available > 0 && !x.reserved);
    const blocked    = cartBooks.filter(x => x.available <= 0 || x.reserved);

    if (this._confirming) { this._renderConfirming(); return; }

    this._shadow.innerHTML = `
      <style>
        .page { max-width: 680px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
        h2 { color: #1a3a5c; font-size: 1.3rem; display: flex; align-items: center; gap: 8px; }

        .card {
          background: #fff; border-radius: 14px; padding: 24px 28px;
          box-shadow: 0 2px 10px rgba(0,0,0,.07);
        }
        .card-title {
          font-size: .95rem; font-weight: 700; color: #374151;
          margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9;
          display: flex; align-items: center; gap: 8px;
        }

        /* 書籍リスト */
        .book-list { display: flex; flex-direction: column; gap: 10px; }
        .book-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 14px; border-radius: 10px; background: #f8fafc;
        }
        .book-row.blocked { background: #fef2f2; opacity: .7; }
        .cover  { font-size: 2rem; flex-shrink: 0; }
        .book-info { flex: 1; }
        .title  { font-weight: 700; font-size: .95rem; color: #1e293b; }
        .author { font-size: .82rem; color: #64748b; margin-top: 2px; }
        .book-status { font-size: .78rem; font-weight: 600; }
        .book-status.ok  { color: #16a34a; }
        .book-status.ng  { color: #dc2626; }
        .book-status.dup { color: #d97706; }

        .empty-cart {
          text-align: center; padding: 60px 20px; color: #94a3b8;
        }
        .empty-icon { font-size: 3rem; margin-bottom: 12px; }

        /* 日付選択 */
        .date-section { display: flex; flex-direction: column; gap: 8px; }
        .date-label {
          font-size: .85rem; font-weight: 600; color: #374151;
          display: flex; align-items: center; gap: 6px;
        }
        .date-input-wrap { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        input[type="date"] {
          padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: 1rem; outline: none; cursor: pointer; transition: border-color .2s;
          color: #1e293b;
        }
        input[type="date"]:focus { border-color: #1a3a5c; box-shadow: 0 0 0 3px rgba(26,58,92,.08); }
        .date-hint { font-size: .8rem; color: #94a3b8; }

        /* アクション */
        .actions { display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap; }
        .btn {
          padding: 11px 28px; border-radius: 8px; border: none;
          font-size: .95rem; font-weight: 700; cursor: pointer; transition: all .15s;
        }
        .btn-back    { background: #f1f5f9; color: #475569; }
        .btn-back:hover    { background: #e2e8f0; }
        .btn-confirm { background: #1a3a5c; color: #fff; }
        .btn-confirm:hover { background: #1e4a7a; }
        .btn-confirm:disabled { background: #94a3b8; cursor: not-allowed; }

        .warn {
          background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px;
          padding: 10px 14px; font-size: .84rem; color: #9a3412;
        }
      </style>

      <div class="page">
        <h2>📋 予約確認</h2>

        ${cart.length === 0 ? `
          <div class="card">
            <div class="empty-cart">
              <div class="empty-icon">🛒</div>
              予約カートが空です<br>
              <a href="books.html" style="color:#1d4ed8; font-size:.9rem; margin-top:8px; display:inline-block;">← 蔵書一覧に戻る</a>
            </div>
          </div>
        ` : `

          <!-- 選択書籍一覧 -->
          <div class="card">
            <div class="card-title">📚 選択した書籍（${cart.length} 冊）</div>
            <div class="book-list" data-testid="reserve-book-list">
              ${reservable.map(x => `
                <div class="book-row" data-testid="reserve-book-${x.id}">
                  <span class="cover">${x.book.cover}</span>
                  <div class="book-info">
                    <div class="title">${x.book.title}</div>
                    <div class="author">${x.book.author}</div>
                  </div>
                  <span class="book-status ok">貸出可</span>
                </div>
              `).join('')}
              ${blocked.map(x => `
                <div class="book-row blocked" data-testid="reserve-book-blocked-${x.id}">
                  <span class="cover">${x.book.cover}</span>
                  <div class="book-info">
                    <div class="title">${x.book.title}</div>
                    <div class="author">${x.book.author}</div>
                  </div>
                  <span class="book-status ${x.reserved ? 'dup' : 'ng'}">
                    ${x.reserved ? '既に予約済み' : '貸出不可'}
                  </span>
                </div>
              `).join('')}
            </div>
            ${blocked.length > 0 ? `
              <div class="warn" style="margin-top:12px;">
                ⚠ 「貸出不可」または「既に予約済み」の本は予約できません。確定時にスキップされます。
              </div>` : ''
            }
          </div>

          <!-- 返却期限選択 -->
          <div class="card">
            <div class="card-title">📅 返却期限日を選択</div>
            <div class="date-section">
              <div class="date-label">返却予定日</div>
              <div class="date-input-wrap">
                <input
                  type="date"
                  id="due-date"
                  min="${minStr}"
                  max="${maxStr}"
                  value="${defaultStr}"
                  data-testid="due-date-input"
                />
                <span class="date-hint">明日〜30日以内で選択してください（デフォルト: 14日後）</span>
              </div>
            </div>
          </div>

          <!-- アクションボタン -->
          <div class="actions">
            <button class="btn btn-back" id="back-btn" data-testid="back-btn">← 戻る</button>
            <button class="btn btn-confirm" id="confirm-btn" data-testid="confirm-btn"
              ${reservable.length === 0 ? 'disabled' : ''}>
              予約を確定する（${reservable.length} 冊）
            </button>
          </div>
        `}
      </div>
    `;

    this._shadow.getElementById('back-btn')?.addEventListener('click', () => {
      history.back();
    });

    this._shadow.getElementById('confirm-btn')?.addEventListener('click', () => {
      const dueDateStr = this._shadow.getElementById('due-date').value;
      if (!dueDateStr) { emit('toast', { message: '返却期限日を選択してください', type: 'error' }); return; }

      // ローカル日時として解釈して ISO 文字列に変換
      const dueDateIso = new Date(dueDateStr + 'T23:59:59').toISOString();
      const reservable = Store.getCart().filter(
        id => Store.availableStock(id) > 0 && !Store.isReservedByUser(id, user.id)
      );

      this._confirming = true;
      this._render();

      setTimeout(() => {
        const results = Store.reserveMultiple(reservable, user.id, dueDateIso);
        Store.clearCart();
        const count = results.filter(r => r.ok).length;
        emit('toast', { message: `✅ ${count} 冊を予約しました`, type: 'success' });
        emit('reservation-change');
        window.location.href = 'my-page.html';
      }, 800);
    });
  }

  _renderConfirming() {
    this._shadow.innerHTML = `
      <style>
        .wrap {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 20px; gap: 20px;
        }
        .spinner {
          width: 52px; height: 52px;
          border: 5px solid #e2e8f0; border-top-color: #1a3a5c;
          border-radius: 50%; animation: spin .85s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        p { font-size: 1rem; font-weight: 600; color: #475569; }
      </style>
      <div class="wrap" data-testid="reserve-confirming">
        <div class="spinner"></div>
        <p>予約を処理中...</p>
      </div>
    `;
  }
}

customElements.define('lib-reserve', LibReserve);
