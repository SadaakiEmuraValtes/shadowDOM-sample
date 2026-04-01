'use strict';

/**
 * <lib-my-page>
 * マイ予約ページ。現在の予約一覧（返却・キャンセル）と利用履歴タブを提供。
 * 未ログインの場合は login.html へリダイレクト。
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
  }

  _fmtDate(iso) {
    return new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  }

  _daysLeft(iso) {
    return Math.ceil((new Date(iso) - new Date()) / 86400000);
  }

  _statusBadge(r) {
    if (r.status === 'reserved' && this._daysLeft(r.dueDate) < 0)
      return '<span class="badge overdue">期限切れ</span>';
    if (r.status === 'reserved')  return '<span class="badge reserved">予約中</span>';
    if (r.status === 'returned')  return '<span class="badge returned">返却済</span>';
    return '<span class="badge cancelled">キャンセル</span>';
  }

  _render() {
    const user  = Store.getSession();
    if (!user) return;

    const books   = Store.getBooks();
    const allRs   = Store.getReservations().filter(r => r.userId === user.id);
    const active  = allRs.filter(r => r.status === 'reserved');
    const history = allRs.filter(r => r.status !== 'reserved');
    const list    = this._tab === 'active' ? active : history;

    this._shadow.innerHTML = `
      <style>
        h2 { color: #1a3a5c; font-size: 1.3rem; margin-bottom: 20px; }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
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
          padding: 10px 24px; background: transparent; border: none;
          font-size: .92rem; cursor: pointer; color: #94a3b8;
          border-bottom: 2px solid transparent; margin-bottom: -2px;
          font-weight: 500; transition: all .15s;
        }
        .tab-btn.active { color: #1a3a5c; border-bottom-color: #1a3a5c; font-weight: 700; }

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
      </style>

      <h2>📋 マイ予約 — ${user.avatar} ${user.name}</h2>

      <div class="stats" data-testid="stats">
        <div class="stat"><div class="stat-num" data-testid="stat-active">${active.length}</div><div class="stat-label">現在の予約</div></div>
        <div class="stat"><div class="stat-num">${history.filter(r=>r.status==='returned').length}</div><div class="stat-label">返却済み</div></div>
        <div class="stat"><div class="stat-num">${history.filter(r=>r.status==='cancelled').length}</div><div class="stat-label">キャンセル</div></div>
        <div class="stat"><div class="stat-num">${allRs.length}</div><div class="stat-label">累計利用</div></div>
      </div>

      <div class="tabs">
        <button class="tab-btn ${this._tab==='active'?'active':''}" id="tab-active" data-testid="tab-active">
          現在の予約 (${active.length})
        </button>
        <button class="tab-btn ${this._tab==='history'?'active':''}" id="tab-history" data-testid="tab-history">
          利用履歴 (${history.length})
        </button>
      </div>

      <div class="table-wrap">
        ${list.length === 0
          ? `<div class="empty">📭 ${this._tab==='active' ? '現在予約している本はありません' : '利用履歴はありません'}</div>`
          : `<table data-testid="reservation-table">
              <thead>
                <tr>
                  <th>書籍</th>
                  <th>著者</th>
                  <th>予約日</th>
                  ${this._tab==='active'
                    ? '<th>返却期限</th><th>状態</th><th>操作</th>'
                    : '<th>状態</th><th>返却日</th>'
                  }
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
                      ${this._tab === 'active'
                        ? `<td>
                             ${this._fmtDate(r.dueDate)}
                             ${dl >= 0
                               ? `<span class="due-ok">(あと ${dl} 日)</span>`
                               : `<span class="due-warn">⚠ 超過</span>`
                             }
                           </td>
                           <td>${this._statusBadge(r)}</td>
                           <td>
                             <button class="action-btn return" data-rid="${r.id}" data-testid="return-btn">返却</button>
                             <button class="action-btn cancel" data-rid="${r.id}" data-testid="cancel-btn">キャンセル</button>
                           </td>`
                        : `<td>${this._statusBadge(r)}</td>
                           <td>${r.returnedAt ? this._fmtDate(r.returnedAt) : '-'}</td>`
                      }
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>`
        }
      </div>
    `;

    this._shadow.getElementById('tab-active')?.addEventListener('click', () => {
      this._tab = 'active'; this._render();
    });
    this._shadow.getElementById('tab-history')?.addEventListener('click', () => {
      this._tab = 'history'; this._render();
    });

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
  }
}

customElements.define('lib-my-page', LibMyPage);
