'use strict';

/**
 * <lib-book-card book-id="1">
 * 個別書籍カード。在庫状況・予約状態を表示し、予約ボタンを提供する。
 */
class LibBookCard extends HTMLElement {
  static get observedAttributes() { return ['book-id']; }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { if (this.isConnected) this._render(); }

  get _bookId() { return parseInt(this.getAttribute('book-id')); }

  _render() {
    const book = Store.getBooks().find(b => b.id === this._bookId);
    if (!book) return;

    const user            = Store.getSession();
    const available       = Store.availableStock(this._bookId);
    const alreadyReserved = user ? Store.isReservedByUser(this._bookId, user.id) : false;
    const statusText      = available > 0 ? `貸出可 (残 ${available} 冊)` : '貸出不可';
    const statusColor     = available > 0 ? '#16a34a' : '#dc2626';

    let btnClass, btnText, btnDisabled;
    if (!user) {
      btnClass = 'btn-login';    btnText = 'ログインして予約'; btnDisabled = false;
    } else if (alreadyReserved) {
      btnClass = 'btn-reserved'; btnText = '✓ 予約済み';      btnDisabled = true;
    } else if (available > 0) {
      btnClass = 'btn-can';      btnText = '予約する';         btnDisabled = false;
    } else {
      btnClass = 'btn-none';     btnText = '貸出不可';         btnDisabled = true;
    }

    this._shadow.innerHTML = `
      <style>
        .card {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,.08);
          display: flex;
          flex-direction: column;
          gap: 10px;
          height: 100%;
          transition: transform .15s, box-shadow .15s;
        }
        .card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,.12); }
        .cover  { font-size: 3rem; text-align: center; line-height: 1; }
        .genre  {
          display: inline-block;
          background: #eff6ff; color: #1d4ed8;
          font-size: .74rem; padding: 2px 10px;
          border-radius: 20px; font-weight: 500;
        }
        .title  { font-weight: 700; font-size: 1rem; color: #1e293b; line-height: 1.4; }
        .author { font-size: .84rem; color: #64748b; }
        .status { font-size: .82rem; font-weight: 600; color: ${statusColor}; }
        .reserve-btn {
          margin-top: auto; padding: 9px 12px; border: none;
          border-radius: 8px; font-size: .88rem; font-weight: 600;
          cursor: pointer; transition: all .15s; width: 100%;
        }
        .btn-can      { background: #1a3a5c; color: #fff; }
        .btn-can:hover { background: #1e4a7a; }
        .btn-login    { background: #fef9c3; color: #854d0e; border: 1px solid #fde68a; }
        .btn-login:hover { background: #fef08a; }
        .btn-reserved { background: #dcfce7; color: #166534; cursor: default; }
        .btn-none     { background: #f1f5f9; color: #94a3b8; cursor: default; }
      </style>
      <div class="card">
        <div class="cover">${book.cover}</div>
        <span class="genre">${book.genre}</span>
        <div class="title">${book.title}</div>
        <div class="author">${book.author}</div>
        <div class="status">${statusText}</div>
        <button
          class="reserve-btn ${btnClass}"
          id="res-btn"
          ${btnDisabled ? 'disabled' : ''}
          data-testid="reserve-btn-${book.id}"
        >${btnText}</button>
      </div>
    `;

    const btn = this._shadow.getElementById('res-btn');
    if (btn && !btnDisabled) {
      btn.addEventListener('click', () => {
        if (!user) { window.location.href = 'login.html'; return; }
        const result = Store.reserve(this._bookId, user.id);
        if (result.ok) {
          emit('reservation-change');
          emit('toast', { message: `「${book.title}」を予約しました`, type: 'success' });
        }
      });
    }
  }
}

customElements.define('lib-book-card', LibBookCard);
