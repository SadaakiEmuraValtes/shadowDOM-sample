'use strict';

/**
 * ページ内コンポーネント間通信用イベントバス
 * Shadow DOM 境界を越えてカスタムイベントを流す
 */
const _bus = new EventTarget();

function emit(name, detail) {
  _bus.dispatchEvent(new CustomEvent(name, { detail }));
}

function on(name, fn) {
  _bus.addEventListener(name, fn);
}

/**
 * テスト自動化練習用: 2〜5秒のランダム待ち時間を返す（ミリ秒）
 */
function randomDelay() {
  return Math.floor(Math.random() * 3000) + 2000;
}
