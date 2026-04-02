'use strict';

/* -------------------------------------------------------
 *  マスターデータ
 * ----------------------------------------------------- */
const BOOKS_KEY        = 'lib_books';
const RESERVATIONS_KEY = 'lib_reservations';
const SESSION_KEY      = 'lib_session';
const CART_KEY         = 'lib_cart';

const DEFAULT_BOOKS = [
  { id:  1, title: '吾輩は猫である',              author: '夏目漱石',        genre: '小説',       stock: 3, cover: '📗' },
  { id:  2, title: '坊っちゃん',                  author: '夏目漱石',        genre: '小説',       stock: 2, cover: '📘' },
  { id:  3, title: '銀河鉄道の夜',                author: '宮沢賢治',        genre: '童話',       stock: 2, cover: '📙' },
  { id:  4, title: 'こころ',                      author: '夏目漱石',        genre: '小説',       stock: 1, cover: '📕' },
  { id:  5, title: '羅生門',                      author: '芥川龍之介',      genre: '短編小説',   stock: 3, cover: '📗' },
  { id:  6, title: '人間失格',                    author: '太宰治',          genre: '小説',       stock: 2, cover: '📘' },
  { id:  7, title: '走れメロス',                  author: '太宰治',          genre: '短編小説',   stock: 4, cover: '📙' },
  { id:  8, title: 'ノルウェイの森',              author: '村上春樹',        genre: '小説',       stock: 2, cover: '📕' },
  { id:  9, title: '1Q84',                        author: '村上春樹',        genre: '小説',       stock: 1, cover: '📗' },
  { id: 10, title: 'コンビニ人間',                author: '村田沙耶香',      genre: '小説',       stock: 3, cover: '📘' },
  { id: 11, title: '君の名は。',                  author: '新海誠',          genre: 'ライトノベル', stock: 2, cover: '📙' },
  { id: 12, title: 'キャッチャー・イン・ザ・ライ', author: 'J.D.サリンジャー', genre: '小説',      stock: 1, cover: '📕' },
];

// テストアカウント（パスワード共通: test1234）
const USERS = [
  { id: 1, name: '田中 一郎', email: 'tanaka@example.com',  password: 'test1234', avatar: '👨' },
  { id: 2, name: '鈴木 花子', email: 'suzuki@example.com',  password: 'test1234', avatar: '👩' },
  { id: 3, name: '佐藤 次郎', email: 'sato@example.com',    password: 'test1234', avatar: '👨' },
  { id: 4, name: '山田 美咲', email: 'yamada@example.com',  password: 'test1234', avatar: '👩' },
  { id: 5, name: '伊藤 健太', email: 'ito@example.com',     password: 'test1234', avatar: '👨' },
];

/* -------------------------------------------------------
 *  Store — localStorage / sessionStorage ラッパー
 * ----------------------------------------------------- */
class Store {
  // ----- Books -----
  static getBooks() {
    const saved = localStorage.getItem(BOOKS_KEY);
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_BOOKS));
  }

  // ----- Reservations -----
  static getReservations() {
    const saved = localStorage.getItem(RESERVATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  }
  static _saveReservations(rs) {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(rs));
  }

  // ----- Session -----
  static getSession() {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  }
  static setSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
  static clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    Store.clearCart(); // ログアウト時はカートもクリア
  }

  // ----- Auth -----
  static login(email, password) {
    return USERS.find(u => u.email === email && u.password === password) || null;
  }
  /** パスワードなしで ID 指定ログイン（テスト用クイックログイン専用） */
  static loginById(userId) {
    return USERS.find(u => u.id === userId) || null;
  }

  // ----- Cart（予約選択カゴ・sessionStorage）-----
  static getCart() {
    const saved = sessionStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  }
  /** カートにトグル。追加したら true、削除したら false を返す */
  static toggleCart(bookId) {
    const cart = Store.getCart();
    const idx  = cart.indexOf(bookId);
    if (idx >= 0) cart.splice(idx, 1);
    else cart.push(bookId);
    sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
    return idx < 0;
  }
  static clearCart() {
    sessionStorage.removeItem(CART_KEY);
  }

  // ----- Favorites（お気に入り・localStorage per user）-----
  static _favKey(userId) { return `lib_favs_${userId}`; }
  static getFavorites(userId) {
    if (!userId) return [];
    const saved = localStorage.getItem(Store._favKey(userId));
    return saved ? JSON.parse(saved) : [];
  }
  /** お気に入りをトグル。追加したら true、削除したら false を返す */
  static toggleFavorite(userId, bookId) {
    const favs = Store.getFavorites(userId);
    const idx  = favs.indexOf(bookId);
    if (idx >= 0) favs.splice(idx, 1);
    else favs.push(bookId);
    localStorage.setItem(Store._favKey(userId), JSON.stringify(favs));
    return idx < 0;
  }
  static isFavorite(userId, bookId) {
    return Store.getFavorites(userId).includes(bookId);
  }

  // ----- Availability -----
  static availableStock(bookId) {
    const book = Store.getBooks().find(b => b.id === bookId);
    if (!book) return 0;
    const taken = Store.getReservations().filter(
      r => r.bookId === bookId && r.status === 'reserved'
    ).length;
    return book.stock - taken;
  }
  static isReservedByUser(bookId, userId) {
    return Store.getReservations().some(
      r => r.bookId === bookId && r.userId === userId && r.status === 'reserved'
    );
  }

  // ----- Mutations -----
  /**
   * 単冊予約。dueDateIso を省略すると今日から 14 日後になる。
   * idOffset: 同一ミリ秒で複数予約する際の ID 衝突回避
   */
  static reserve(bookId, userId, dueDateIso = null, idOffset = 0) {
    if (Store.availableStock(bookId) <= 0)      return { ok: false, reason: 'stock' };
    if (Store.isReservedByUser(bookId, userId)) return { ok: false, reason: 'duplicate' };
    const rs = Store.getReservations();
    let dueDate = dueDateIso;
    if (!dueDate) {
      const d = new Date(); d.setDate(d.getDate() + 14);
      dueDate = d.toISOString();
    }
    rs.push({
      id:         Date.now() + idOffset,
      bookId,
      userId,
      reservedAt: new Date().toISOString(),
      dueDate,
      status:     'reserved',
    });
    Store._saveReservations(rs);
    return { ok: true };
  }

  /** 複数冊を同一返却期限で一括予約 */
  static reserveMultiple(bookIds, userId, dueDateIso) {
    return bookIds.map((bookId, i) => ({
      bookId,
      ...Store.reserve(bookId, userId, dueDateIso, i),
    }));
  }

  static cancel(reservationId, userId) {
    const rs  = Store.getReservations();
    const idx = rs.findIndex(r => r.id === reservationId && r.userId === userId);
    if (idx < 0) return false;
    rs[idx].status = 'cancelled';
    Store._saveReservations(rs);
    return true;
  }

  static return_(reservationId, userId) {
    const rs  = Store.getReservations();
    const idx = rs.findIndex(r => r.id === reservationId && r.userId === userId);
    if (idx < 0) return false;
    rs[idx].status     = 'returned';
    rs[idx].returnedAt = new Date().toISOString();
    Store._saveReservations(rs);
    return true;
  }
}
