# 📚 市立図書館 予約システム

**テスト自動化練習用デモサイト** — Shadow DOM で構築した架空の図書館予約システムです。  
Playwright / Selenium / Robot Framework などのテスト自動化ツールの練習を目的として作成しています。

🌐 **デモURL:** https://sadaakiemuravaltes.github.io/shadowDOM-sample/

---

## ⚠ 免責事項

このサイトは**テスト自動化の練習専用の架空サイト**です。  
実在する図書館・書籍・著者・人物とは一切関係ありません。  
データはブラウザのローカルストレージのみに保存され、外部サーバーへの送信は行いません。

---

## 🗺 ページ構成

| ページ | URL | 説明 |
|--------|-----|------|
| **ホーム** | `index.html` | サイト概要・ガイド・テストアカウント一覧（Loading なし） |
| **蔵書一覧** | `books.html` | 100冊の書籍を検索・予約できる一覧ページ |
| **予約確認** | `reserve.html` | 選択書籍の確認・返却期限指定・予約確定 |
| **ログイン** | `login.html` | フォームログイン + クイックログイン（5アカウント） |
| **マイページ** | `my-page.html` | 予約/待機の確認・返却・キャンセル・履歴・お気に入り（要ログイン） |

---

## ⏳ Loading 発生タイミング

| 操作 | 待機時間 |
|------|---------|
| ログイン試行 | **2〜5 秒**（ランダム） |
| 蔵書検索・フィルタ変更 | **2〜5 秒**（ランダム） |

ホームページには Loading は発生しません。

---

## 🎯 主な機能

| 機能 | 説明 |
|------|------|
| 蔵書一覧 | 100冊の書籍をカード表示（複数ジャンル・著者） |
| テキスト検索 | タイトル・著者でリアルタイム検索 |
| ジャンルフィルタ | ドロップダウンで絞り込み |
| お気に入りフィルタ | お気に入り登録済みの本だけ表示 |
| **複数選択予約** | チェックボックスで複数選択 → reserve.html で一括予約 |
| **返却期限指定** | 予約確認ページでカレンダーから返却期限日を指定（明日〜30日後）|
| **順番待ち** | 全冊貸出中の本に順番待ち登録。待ち人数・自分の順位を表示 |
| **初期貸出データ** | 起動時に一部書籍が既に貸出中・延滞・順番待ちの状態をシードで生成。返却期限は起動日時基準で動的に算出 |
| お気に入り | ハートボタンで登録/解除。マイページで一覧管理 |
| マイページ | 予約中/待機中/履歴タブ + お気に入りタブ |

---

## 📖 蔵書データ（100冊）

| ジャンル | 主な著者 |
|----------|---------|
| 小説 | 夏目漱石・川端康成・三島由紀夫・村上春樹・村田沙耶香・凪良ゆう 他 |
| 短編小説 | 芥川龍之介・太宰治・森鴎外・志賀直哉 他 |
| ミステリー | 松本清張・東野圭吾・伊坂幸太郎・宮部みゆき |
| SF | 伊藤計劃・劉慈欣・G.オーウェル・A.C.クラーク 他 |
| 歴史小説 | 司馬遼太郎・吉川英治 |
| 童話 | 宮沢賢治 |
| ライトノベル | 新海誠・谷川流・川原礫 他 |
| 詩集 | 宮沢賢治・石川啄木・高村光太郎 他 |
| エッセイ | 谷崎潤一郎 |
| 世界文学 | ドストエフスキー・トルストイ・カミュ・カフカ・ヘミングウェイ 他 |

---

## 🔑 テストアカウント

パスワードはすべて共通: **`test1234`**

| 名前 | メールアドレス |
|------|--------------|
| 田中 一郎 | tanaka@example.com |
| 鈴木 花子 | suzuki@example.com |
| 佐藤 次郎 | sato@example.com |
| 山田 美咲 | yamada@example.com |
| 伊藤 健太 | ito@example.com |

ログインページの **「クイックログイン」** からワンクリックでもログイン可能です。

---

## 🗂 ファイル構成

```
shadowDOM-sample/
├── index.html          # ホーム（ガイドページ）
├── books.html          # 蔵書一覧
├── reserve.html        # 予約確認（返却期限指定）
├── login.html          # ログイン
├── my-page.html        # マイページ
├── css/
│   └── global.css      # body・レイアウト共通スタイル
└── js/
    ├── store.js        # データ・Store クラス・シードデータ生成
    ├── bus.js          # コンポーネント間イベントバス & randomDelay()
    └── components/
        ├── lib-header.js     # sticky ナビゲーション
        ├── lib-footer.js     # 免責事項フッター
        ├── lib-toast.js      # トースト通知
        ├── lib-guide.js      # ホームガイドページ
        ├── lib-book-card.js  # 書籍カード（チェック/お気に入り/順番待ち）
        ├── lib-book-list.js  # 蔵書一覧・検索・フィルタ・カートバー
        ├── lib-login.js      # ログインフォーム + クイックログイン
        ├── lib-reserve.js    # 予約確認・返却期限カレンダー
        └── lib-my-page.js    # マイページ（予約/待機/履歴/お気に入り）
```

---

## 🤖 テスト自動化のポイント

### Shadow DOM の扱い

各コンポーネントは Shadow DOM でカプセル化されています。

**Playwright:**
```ts
// pierce セレクタで Shadow DOM を貫通
await page.locator('pierce/[data-testid="search-input"]').fill('夏目');

// Loading が消えるまで待機（最大 10 秒）
await expect(
  page.locator('lib-book-list').locator('pierce/[data-testid="book-list-loading"]')
).toBeHidden({ timeout: 10000 });

// ログイン Loading 待機
await expect(
  page.locator('lib-login').locator('pierce/[data-testid="login-loading"]')
).toBeHidden({ timeout: 10000 });
```

**Selenium (Python):**
```python
shadow_host = driver.find_element(By.TAG_NAME, 'lib-book-list')
shadow_root = driver.execute_script('return arguments[0].shadowRoot', shadow_host)
search_input = shadow_root.find_element(By.CSS_SELECTOR, '[data-testid="search-input"]')
```

### `data-testid` 一覧

| 要素 | data-testid |
|------|-------------|
| 蔵書一覧リンク（ガイド） | `go-to-books` |
| 書籍検索入力 | `search-input` |
| ジャンル選択 | `genre-select` |
| お気に入りフィルタ | `fav-toggle` |
| 書籍件数表示 | `book-count` |
| 書籍グリッド | `book-grid` |
| 書籍一覧 Loading | `book-list-loading` |
| カートチェックボックス(N) | `cart-checkbox-N` |
| お気に入りボタン(N) | `fav-btn-N` |
| 順番待ち人数表示(N) | `wait-count-N` |
| 順番待ち登録ボタン(N) | `wait-btn-N` |
| 順番待ち位置表示(N) | `wait-pos-N` |
| 順番待ちキャンセル(N) | `cancel-wait-btn-N` |
| カートバー | `cart-bar` |
| カート冊数表示 | `cart-count` |
| カートクリア | `cart-clear` |
| 予約確認へボタン | `cart-reserve` |
| 予約書籍リスト | `reserve-book-list` |
| 返却期限入力 | `due-date-input` |
| 予約確定ボタン | `confirm-btn` |
| クイックログイングリッド | `quick-login-grid` |
| クイックログインボタン(N) | `quick-login-N` (1〜5) |
| メール入力 | `email-input` |
| パスワード入力 | `password-input` |
| ログインボタン | `login-submit` |
| ログインエラー | `login-error` |
| ログイン Loading | `login-loading` |
| マイページ統計 | `stats` |
| 現在の予約タブ | `tab-active` |
| 利用履歴タブ | `tab-history` |
| お気に入りタブ | `tab-favorites` |
| 予約テーブル | `reservation-table` |
| 返却ボタン | `return-btn` |
| キャンセルボタン | `cancel-btn` |
| お気に入りグリッド | `favorites-grid` |
| お気に入りカード(N) | `fav-card-N` |
| お気に入りカート追加(N) | `fav-cart-btn-N` |
| お気に入り解除(N) | `fav-remove-btn-N` |

---

## 🛠 技術スタック

- **Vanilla JS** — フレームワークなし
- **Custom Elements v1** + **Shadow DOM v1** — Web Components 標準仕様
- **localStorage** — 予約・お気に入りデータの永続化
- **sessionStorage** — ログインセッション・予約カート管理
- サーバー・ビルドツール不要（HTML ファイルをそのまま開くだけで動作）

---

## 📝 ライセンス

MIT — テスト自動化の学習・練習目的でご自由にお使いください。
