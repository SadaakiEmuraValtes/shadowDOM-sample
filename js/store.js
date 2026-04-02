'use strict';

/* -------------------------------------------------------
 *  定数
 * ----------------------------------------------------- */
const BOOKS_KEY        = 'lib_books';
const RESERVATIONS_KEY = 'lib_reservations';
const SESSION_KEY      = 'lib_session';
const CART_KEY         = 'lib_cart';
const SEED_KEY         = 'lib_seed_v3'; // バージョンを上げるとシードを再生成

/* -------------------------------------------------------
 *  マスターデータ — 蔵書 100 冊
 * ----------------------------------------------------- */
const DEFAULT_BOOKS = [
  // ── 夏目漱石 ──
  { id:  1, title: '吾輩は猫である',              author: '夏目漱石',        genre: '小説',       stock: 3, cover: '📗' },
  { id:  2, title: '坊っちゃん',                  author: '夏目漱石',        genre: '小説',       stock: 3, cover: '📘' },
  { id:  3, title: 'こころ',                      author: '夏目漱石',        genre: '小説',       stock: 2, cover: '📕' },
  { id:  4, title: '三四郎',                      author: '夏目漱石',        genre: '小説',       stock: 2, cover: '📗' },
  { id:  5, title: 'それから',                    author: '夏目漱石',        genre: '小説',       stock: 2, cover: '📘' },
  { id:  6, title: '門',                          author: '夏目漱石',        genre: '小説',       stock: 2, cover: '📙' },
  { id:  7, title: '草枕',                        author: '夏目漱石',        genre: '小説',       stock: 1, cover: '📕' },
  // ── 芥川龍之介 ──
  { id:  8, title: '羅生門',                      author: '芥川龍之介',      genre: '短編小説',   stock: 3, cover: '📗' },
  { id:  9, title: '藪の中',                      author: '芥川龍之介',      genre: '短編小説',   stock: 2, cover: '📘' },
  { id: 10, title: 'トロッコ',                    author: '芥川龍之介',      genre: '短編小説',   stock: 3, cover: '📙' },
  { id: 11, title: '鼻',                          author: '芥川龍之介',      genre: '短編小説',   stock: 2, cover: '📕' },
  { id: 12, title: '地獄変',                      author: '芥川龍之介',      genre: '短編小説',   stock: 1, cover: '📗' },
  // ── 太宰治 ──
  { id: 13, title: '人間失格',                    author: '太宰治',          genre: '小説',       stock: 3, cover: '📘' },
  { id: 14, title: '走れメロス',                  author: '太宰治',          genre: '短編小説',   stock: 4, cover: '📙' },
  { id: 15, title: '斜陽',                        author: '太宰治',          genre: '小説',       stock: 2, cover: '📕' },
  { id: 16, title: '津軽',                        author: '太宰治',          genre: '小説',       stock: 2, cover: '📗' },
  { id: 17, title: 'ヴィヨンの妻',                author: '太宰治',          genre: '短編小説',   stock: 1, cover: '📘' },
  // ── 宮沢賢治 ──
  { id: 18, title: '銀河鉄道の夜',                author: '宮沢賢治',        genre: '童話',       stock: 3, cover: '📙' },
  { id: 19, title: '風の又三郎',                  author: '宮沢賢治',        genre: '童話',       stock: 2, cover: '📕' },
  { id: 20, title: 'セロ弾きのゴーシュ',          author: '宮沢賢治',        genre: '童話',       stock: 2, cover: '📗' },
  { id: 21, title: '注文の多い料理店',            author: '宮沢賢治',        genre: '童話',       stock: 3, cover: '📘' },
  // ── 川端康成 ──
  { id: 22, title: '雪国',                        author: '川端康成',        genre: '小説',       stock: 2, cover: '📙' },
  { id: 23, title: '伊豆の踊子',                  author: '川端康成',        genre: '小説',       stock: 2, cover: '📕' },
  { id: 24, title: '古都',                        author: '川端康成',        genre: '小説',       stock: 1, cover: '📗' },
  { id: 25, title: '千羽鶴',                      author: '川端康成',        genre: '小説',       stock: 1, cover: '📘' },
  // ── 三島由紀夫 ──
  { id: 26, title: '金閣寺',                      author: '三島由紀夫',      genre: '小説',       stock: 2, cover: '📙' },
  { id: 27, title: '仮面の告白',                  author: '三島由紀夫',      genre: '小説',       stock: 2, cover: '📕' },
  { id: 28, title: '潮騒',                        author: '三島由紀夫',      genre: '小説',       stock: 3, cover: '📗' },
  // ── 村上春樹 ──
  { id: 29, title: 'ノルウェイの森',              author: '村上春樹',        genre: '小説',       stock: 3, cover: '📘' },
  { id: 30, title: '1Q84',                        author: '村上春樹',        genre: '小説',       stock: 2, cover: '📙' },
  { id: 31, title: '海辺のカフカ',                author: '村上春樹',        genre: '小説',       stock: 2, cover: '📕' },
  { id: 32, title: 'ねじまき鳥クロニクル',        author: '村上春樹',        genre: '小説',       stock: 1, cover: '📗' },
  { id: 33, title: '羊をめぐる冒険',              author: '村上春樹',        genre: '小説',       stock: 2, cover: '📘' },
  { id: 34, title: 'スプートニクの恋人',          author: '村上春樹',        genre: '小説',       stock: 1, cover: '📙' },
  // ── 松本清張 ──
  { id: 35, title: '点と線',                      author: '松本清張',        genre: 'ミステリー', stock: 3, cover: '📕' },
  { id: 36, title: '砂の器',                      author: '松本清張',        genre: 'ミステリー', stock: 2, cover: '📗' },
  { id: 37, title: 'ゼロの焦点',                  author: '松本清張',        genre: 'ミステリー', stock: 2, cover: '📘' },
  { id: 38, title: '黒い画集',                    author: '松本清張',        genre: 'ミステリー', stock: 1, cover: '📙' },
  // ── 東野圭吾 ──
  { id: 39, title: '容疑者Xの献身',               author: '東野圭吾',        genre: 'ミステリー', stock: 3, cover: '📕' },
  { id: 40, title: '白夜行',                      author: '東野圭吾',        genre: 'ミステリー', stock: 2, cover: '📗' },
  { id: 41, title: '幻夜',                        author: '東野圭吾',        genre: 'ミステリー', stock: 2, cover: '📘' },
  { id: 42, title: 'ナミヤ雑貨店の奇蹟',          author: '東野圭吾',        genre: '小説',       stock: 3, cover: '📙' },
  { id: 43, title: '秘密',                        author: '東野圭吾',        genre: '小説',       stock: 2, cover: '📕' },
  // ── 伊坂幸太郎 ──
  { id: 44, title: 'アヒルと鴨のコインロッカー',  author: '伊坂幸太郎',      genre: 'ミステリー', stock: 2, cover: '📗' },
  { id: 45, title: 'ゴールデンスランバー',        author: '伊坂幸太郎',      genre: 'ミステリー', stock: 2, cover: '📘' },
  { id: 46, title: 'オーデュボンの祈り',          author: '伊坂幸太郎',      genre: '小説',       stock: 2, cover: '📙' },
  { id: 47, title: '重力ピエロ',                  author: '伊坂幸太郎',      genre: 'ミステリー', stock: 1, cover: '📕' },
  // ── 宮部みゆき ──
  { id: 48, title: '火車',                        author: '宮部みゆき',      genre: 'ミステリー', stock: 2, cover: '📗' },
  { id: 49, title: '模倣犯',                      author: '宮部みゆき',      genre: 'ミステリー', stock: 2, cover: '📘' },
  { id: 50, title: 'ソロモンの偽証',              author: '宮部みゆき',      genre: 'ミステリー', stock: 1, cover: '📙' },
  // ── 森鴎外 ──
  { id: 51, title: '舞姫',                        author: '森鴎外',          genre: '小説',       stock: 2, cover: '📕' },
  { id: 52, title: '山椒大夫',                    author: '森鴎外',          genre: '短編小説',   stock: 2, cover: '📗' },
  { id: 53, title: '阿部一族',                    author: '森鴎外',          genre: '歴史小説',   stock: 1, cover: '📘' },
  // ── 谷崎潤一郎 ──
  { id: 54, title: '細雪',                        author: '谷崎潤一郎',      genre: '小説',       stock: 2, cover: '📙' },
  { id: 55, title: '痴人の愛',                    author: '谷崎潤一郎',      genre: '小説',       stock: 2, cover: '📕' },
  { id: 56, title: '陰翳礼讃',                    author: '谷崎潤一郎',      genre: 'エッセイ',   stock: 2, cover: '📗' },
  // ── 志賀直哉 ──
  { id: 57, title: '暗夜行路',                    author: '志賀直哉',        genre: '小説',       stock: 1, cover: '📘' },
  { id: 58, title: '城の崎にて',                  author: '志賀直哉',        genre: '短編小説',   stock: 2, cover: '📙' },
  // ── 現代作家 ──
  { id: 59, title: 'コンビニ人間',                author: '村田沙耶香',      genre: '小説',       stock: 3, cover: '📕' },
  { id: 60, title: '消滅世界',                    author: '村田沙耶香',      genre: '小説',       stock: 2, cover: '📗' },
  { id: 61, title: '蜜蜂と遠雷',                  author: '恩田陸',          genre: '小説',       stock: 3, cover: '📘' },
  { id: 62, title: '夜のピクニック',              author: '恩田陸',          genre: '小説',       stock: 2, cover: '📙' },
  { id: 63, title: '流浪の月',                    author: '凪良ゆう',        genre: '小説',       stock: 3, cover: '📕' },
  { id: 64, title: '汝、星のごとく',              author: '凪良ゆう',        genre: '小説',       stock: 2, cover: '📗' },
  { id: 65, title: '52ヘルツのクジラたち',        author: '町田そのこ',      genre: '小説',       stock: 2, cover: '📘' },
  { id: 66, title: 'おいしいご飯が食べられますように', author: '高瀬隼子',  genre: '小説',       stock: 2, cover: '📙' },
  // ── SF ──
  { id: 67, title: '夏への扉',                    author: 'R.A.ハインライン', genre: 'SF',        stock: 2, cover: '📕' },
  { id: 68, title: '幼年期の終わり',              author: 'A.C.クラーク',   genre: 'SF',         stock: 2, cover: '📗' },
  { id: 69, title: '銀河ヒッチハイク・ガイド',    author: 'D.アダムス',     genre: 'SF',         stock: 2, cover: '📘' },
  { id: 70, title: 'アルジャーノンに花束を',      author: 'D.キイス',       genre: 'SF',         stock: 3, cover: '📙' },
  { id: 71, title: 'ハーモニー',                  author: '伊藤計劃',        genre: 'SF',         stock: 2, cover: '📕' },
  { id: 72, title: '虐殺器官',                    author: '伊藤計劃',        genre: 'SF',         stock: 2, cover: '📗' },
  { id: 73, title: '三体',                        author: '劉慈欣',          genre: 'SF',         stock: 3, cover: '📘' },
  { id: 74, title: '折りたたみ北京',              author: '郝景芳',          genre: 'SF',         stock: 1, cover: '📙' },
  // ── 世界文学 ──
  { id: 75, title: 'キャッチャー・イン・ザ・ライ', author: 'J.D.サリンジャー', genre: '小説',     stock: 2, cover: '📕' },
  { id: 76, title: '老人と海',                    author: 'E.ヘミングウェイ', genre: '小説',      stock: 2, cover: '📗' },
  { id: 77, title: '武器よさらば',                author: 'E.ヘミングウェイ', genre: '小説',      stock: 1, cover: '📘' },
  { id: 78, title: 'グレート・ギャツビー',        author: 'F.S.フィッツジェラルド', genre: '小説', stock: 2, cover: '📙' },
  { id: 79, title: '1984年',                      author: 'G.オーウェル',   genre: 'SF',         stock: 3, cover: '📕' },
  { id: 80, title: '動物農場',                    author: 'G.オーウェル',   genre: '小説',       stock: 2, cover: '📗' },
  { id: 81, title: '変身',                        author: 'F.カフカ',       genre: '短編小説',   stock: 2, cover: '📘' },
  { id: 82, title: '城',                          author: 'F.カフカ',       genre: '小説',       stock: 1, cover: '📙' },
  { id: 83, title: '罪と罰',                      author: 'F.ドストエフスキー', genre: '小説',    stock: 2, cover: '📕' },
  { id: 84, title: 'カラマーゾフの兄弟',          author: 'F.ドストエフスキー', genre: '小説',    stock: 1, cover: '📗' },
  { id: 85, title: '戦争と平和',                  author: 'L.トルストイ',   genre: '小説',       stock: 1, cover: '📘' },
  { id: 86, title: 'アンナ・カレーニナ',          author: 'L.トルストイ',   genre: '小説',       stock: 1, cover: '📙' },
  { id: 87, title: '百年の孤独',                  author: 'G.G.マルケス',   genre: '小説',       stock: 2, cover: '📕' },
  { id: 88, title: '異邦人',                      author: 'A.カミュ',       genre: '小説',       stock: 2, cover: '📗' },
  { id: 89, title: 'ペスト',                      author: 'A.カミュ',       genre: '小説',       stock: 2, cover: '📘' },
  // ── ライトノベル ──
  { id: 90, title: '君の名は。',                  author: '新海誠',          genre: 'ライトノベル', stock: 3, cover: '📙' },
  { id: 91, title: '涼宮ハルヒの憂鬱',            author: '谷川流',          genre: 'ライトノベル', stock: 2, cover: '📕' },
  { id: 92, title: 'ソードアート・オンライン',    author: '川原礫',          genre: 'ライトノベル', stock: 2, cover: '📗' },
  { id: 93, title: 'この素晴らしい世界に祝福を！', author: '暁なつめ',       genre: 'ライトノベル', stock: 2, cover: '📘' },
  // ── 詩集・エッセイ ──
  { id: 94, title: '春と修羅',                    author: '宮沢賢治',        genre: '詩集',       stock: 2, cover: '📙' },
  { id: 95, title: '一握の砂',                    author: '石川啄木',        genre: '詩集',       stock: 2, cover: '📕' },
  { id: 96, title: '智恵子抄',                    author: '高村光太郎',      genre: '詩集',       stock: 1, cover: '📗' },
  { id: 97, title: 'わたしが一番きれいだったとき', author: '茨木のり子',     genre: '詩集',       stock: 1, cover: '📘' },
  // ── 歴史小説 ──
  { id: 98, title: '竜馬がゆく',                  author: '司馬遼太郎',      genre: '歴史小説',   stock: 3, cover: '📙' },
  { id: 99, title: '坂の上の雲',                  author: '司馬遼太郎',      genre: '歴史小説',   stock: 2, cover: '📕' },
  { id:100, title: '宮本武蔵',                    author: '吉川英治',        genre: '歴史小説',   stock: 3, cover: '📗' },
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
    return JSON.parse(JSON.stringify(DEFAULT_BOOKS)); // 常にマスターを返す
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
    Store.clearCart();
  }

  // ----- Auth -----
  static login(email, password) {
    return USERS.find(u => u.email === email && u.password === password) || null;
  }
  static loginById(userId) {
    return USERS.find(u => u.id === userId) || null;
  }

  // ----- Cart（予約選択カゴ・sessionStorage）-----
  static getCart() {
    const saved = sessionStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  }
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

  // ----- Favorites -----
  static _favKey(userId) { return `lib_favs_${userId}`; }
  static getFavorites(userId) {
    if (!userId) return [];
    const saved = localStorage.getItem(Store._favKey(userId));
    return saved ? JSON.parse(saved) : [];
  }
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

  // ----- Waiting List（順番待ち）-----
  static getWaitingCount(bookId) {
    return Store.getReservations().filter(
      r => r.bookId === bookId && r.status === 'waiting'
    ).length;
  }
  static isWaitingByUser(bookId, userId) {
    return Store.getReservations().some(
      r => r.bookId === bookId && r.userId === userId && r.status === 'waiting'
    );
  }
  /** 1 始まりの待ち順位を返す（待っていなければ 0） */
  static getUserWaitingPosition(bookId, userId) {
    const list = Store.getReservations()
      .filter(r => r.bookId === bookId && r.status === 'waiting')
      .sort((a, b) => a.id - b.id); // ID昇順 = 登録順（シードIDは負値なので先頭）
    const idx = list.findIndex(r => r.userId === userId);
    return idx >= 0 ? idx + 1 : 0;
  }
  static joinWaitingList(bookId, userId) {
    if (Store.isWaitingByUser(bookId, userId))  return { ok: false, reason: 'duplicate' };
    if (Store.isReservedByUser(bookId, userId)) return { ok: false, reason: 'reserved' };
    const rs = Store.getReservations();
    rs.push({
      id:         Date.now(),
      bookId,
      userId,
      reservedAt: new Date().toISOString(),
      dueDate:    null,
      status:     'waiting',
    });
    Store._saveReservations(rs);
    return { ok: true };
  }
  static cancelWaiting(reservationId, userId) {
    const rs  = Store.getReservations();
    const idx = rs.findIndex(r => r.id === reservationId && r.userId === userId && r.status === 'waiting');
    if (idx < 0) return false;
    rs[idx].status = 'cancelled';
    Store._saveReservations(rs);
    return true;
  }

  // ----- Mutations -----
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

  // ----- シードデータ初期化 -----
  /**
   * 初回起動時のみ「貸し出し中」状態を生成する。
   * 返却期限は起動日時基準の相対日数で動的に決まる。
   * localStorage の SEED_KEY が存在する場合はスキップ。
   */
  static initSeedData() {
    if (localStorage.getItem(SEED_KEY)) return;

    const now     = new Date();
    const makeIso = days => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return d.toISOString();
    };

    // ── 貸し出し中シード ──
    // { bookId, daysUntilDue } daysUntilDue < 0 = 延滞
    const loanSeeds = [
      // こころ (stock:2) → 全冊貸出中
      { bookId:  3, days:  5 }, { bookId:  3, days: -2 },
      // 人間失格 (stock:3) → 全冊貸出中
      { bookId: 13, days: 10 }, { bookId: 13, days:  4 }, { bookId: 13, days: -1 },
      // 1Q84 (stock:2) → 全冊貸出中
      { bookId: 30, days:  3 }, { bookId: 30, days: -3 },
      // 容疑者Xの献身 (stock:3) → 全冊貸出中
      { bookId: 39, days:  4 }, { bookId: 39, days: -1 }, { bookId: 39, days: 11 },
      // アルジャーノンに花束を (stock:3) → 全冊貸出中
      { bookId: 70, days:  6 }, { bookId: 70, days:  2 }, { bookId: 70, days: -4 },
      // 1984年 (stock:3) → 全冊貸出中
      { bookId: 79, days:  8 }, { bookId: 79, days:  5 }, { bookId: 79, days: 13 },
      // 吾輩は猫である (stock:3) → 2冊貸出中・1冊残
      { bookId:  1, days:  7 }, { bookId:  1, days:  3 },
      // ノルウェイの森 (stock:3) → 2冊貸出中・1冊残
      { bookId: 29, days:  6 }, { bookId: 29, days: 12 },
      // 点と線 (stock:3) → 2冊貸出中・1冊残
      { bookId: 35, days:  9 }, { bookId: 35, days:  2 },
      // 蜜蜂と遠雷 (stock:3) → 1冊貸出中・2冊残
      { bookId: 61, days:  9 },
      // 三体 (stock:3) → 2冊貸出中・1冊残
      { bookId: 73, days:  7 }, { bookId: 73, days:  3 },
      // 竜馬がゆく (stock:3) → 1冊貸出中・2冊残
      { bookId: 98, days: 11 },
    ];

    // ── 順番待ちシード（全冊貸出中の本に設定）──
    const waitSeeds = [
      { bookId:  3, count: 2 }, // こころ: 2人待ち
      { bookId: 13, count: 3 }, // 人間失格: 3人待ち
      { bookId: 30, count: 1 }, // 1Q84: 1人待ち
      { bookId: 39, count: 2 }, // 容疑者X: 2人待ち
      { bookId: 70, count: 4 }, // アルジャーノン: 4人待ち
      { bookId: 79, count: 2 }, // 1984年: 2人待ち
    ];

    const rs = Store.getReservations();
    let id   = -1001; // 負値ID = シードデータ

    for (const s of loanSeeds) {
      rs.push({
        id:         id--,
        bookId:     s.bookId,
        userId:     -1, // ダミーユーザー（画面には表示されない）
        reservedAt: makeIso(s.days - 14),
        dueDate:    makeIso(s.days),
        status:     'reserved',
      });
    }

    for (const w of waitSeeds) {
      for (let i = 0; i < w.count; i++) {
        rs.push({
          id:         id--,
          bookId:     w.bookId,
          userId:     -(10 + i), // ダミーユーザー
          reservedAt: makeIso(-7),
          dueDate:    null,
          status:     'waiting',
        });
      }
    }

    Store._saveReservations(rs);
    localStorage.setItem(SEED_KEY, '1');
  }
}

/* -------------------------------------------------------
 *  起動時にシードデータを初期化
 * ----------------------------------------------------- */
Store.initSeedData();
