'use strict';

/**
 * <lib-toast>
 * emit('toast', 'メッセージ') または
 * emit('toast', { message: '...', type: 'success' | 'error' | 'default' })
 * でトースト通知を表示する。
 */
class LibToast extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._shadow.innerHTML = `
      <style>
        .toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: #1e293b;
          color: #fff;
          padding: 12px 28px;
          border-radius: 28px;
          font-size: .9rem;
          font-weight: 600;
          box-shadow: 0 6px 24px rgba(0,0,0,.28);
          opacity: 0;
          transition: transform .35s cubic-bezier(.34,1.56,.64,1), opacity .25s;
          z-index: 9999;
          pointer-events: none;
          white-space: nowrap;
        }
        .toast.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        .toast.success { background: #166534; }
        .toast.error   { background: #991b1b; }
      </style>
      <div class="toast" id="t"></div>
    `;

    on('toast', e => {
      const { message, type = 'default' } =
        typeof e.detail === 'string' ? { message: e.detail } : e.detail;
      this._show(message, type);
    });
  }

  _show(msg, type = 'default') {
    const t = this._shadow.getElementById('t');
    t.textContent = msg;
    t.className   = 'toast' + (type !== 'default' ? ' ' + type : '');
    t.classList.add('show');
    clearTimeout(this._timer);
    this._timer = setTimeout(() => t.classList.remove('show'), 2800);
  }
}

customElements.define('lib-toast', LibToast);
