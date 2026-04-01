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

## 🎯 主な機能

| 機能 | 説明 |
|------|------|
| 蔵書一覧 | 12冊の書籍をカード表示 |
| テキスト検索 | タイトル・著者でリアルタイム検索 |
| ジャンルフィルタ | ドロップダウンで絞り込み |
| ログイン | フォームログイン + クイックログイン（5アカウント） |
| 予約 | 1人1冊制限・在庫管理・返却期限14日 |
| マイ予約 | 返却・キャンセル・利用履歴タブ |
| Loading演出 | ログイン・検索時に **3〜8秒のランダム待機**（テスト練習用） |

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
├── index.html          # 蔵書一覧ページ
├── login.html          # ログインページ
├── my-page.html        # マイ予約ページ
├── css/
│   └── global.css      # body・レイアウト共通スタイル
└── js/
    ├── store.js        # データ・Store クラス（localStorage/sessionStorage）
    ├── bus.js          # コンポーネント間イベントバス & randomDelay()
    └── components/     # Shadow DOM カスタム要素
        ├── lib-header.js     # sticky ナビゲーション
        ├── lib-footer.js     # 免責事項フッター
        ├── lib-toast.js      # トースト通知
        ├── lib-book-card.js  # 書籍カード（予約ボタン付き）
        ├── lib-book-list.js  # 蔵書一覧・検索・フィルタ
        ├── lib-login.js      # ログインフォーム + クイックログイン
        └── lib-my-page.js    # マイ予約・利用履歴
```

### Shadow DOM コンポーネント一覧

| Custom Element | 役割 |
|---|---|
| `<lib-header active="...">` | ナビゲーション。`active` 属性でカレントページ指定 |
| `<lib-footer>` | 免責事項フッター |
| `<lib-toast>` | `emit('toast', ...)` で表示するトースト通知 |
| `<lib-book-list>` | 書籍一覧グリッド + 検索・フィルタ |
| `<lib-book-card book-id="N">` | 個別書籍カード |
| `<lib-login>` | ログインフォーム + クイックログイン |
| `<lib-my-page>` | マイ予約・利用履歴 |

---

## 🚀 起動方法

### ローカルで開く（サーバー不要）

```bash
# ブラウザで直接開く
open index.html        # macOS
start index.html       # Windows
```

### ローカルサーバーで開く（推奨）

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code: Live Server 拡張でも可
```

---

## 🤖 テスト自動化のポイント

### Shadow DOM の扱い

各コンポーネントは Shadow DOM でカプセル化されています。  
通常の `querySelector` では内部要素に到達できないため、以下の方法を使います。

**Playwright:**
```ts
// pierce セレクタで Shadow DOM を貫通
await page.locator('pierce/[data-testid="search-input"]').fill('夏目');

// shadowRoot を経由
const card = page.locator('lib-book-card').first().locator('pierce/button');
```

**JavaScript (shadowRoot):**
```js
document.querySelector('lib-book-list').shadowRoot.querySelector('[data-testid="search-input"]')
```

### `data-testid` 一覧

| 要素 | data-testid |
|------|-------------|
| 書籍検索入力 | `search-input` |
| ジャンル選択 | `genre-select` |
| 書籍件数表示 | `book-count` |
| 書籍グリッド | `book-grid` |
| 書籍一覧 Loading | `book-list-loading` |
| クイックログイングリッド | `quick-login-grid` |
| クイックログインボタン(N) | `quick-login-1` 〜 `quick-login-5` |
| メール入力 | `email-input` |
| パスワード入力 | `password-input` |
| ログインボタン | `login-submit` |
| ログインエラー | `login-error` |
| ログイン Loading | `login-loading` |
| マイ予約テーブル | `reservation-table` |
| 現在の予約タブ | `tab-active` |
| 利用履歴タブ | `tab-history` |
| 返却ボタン | `return-btn` |
| キャンセルボタン | `cancel-btn` |

### Loading 待機のサンプル（Playwright）

```ts
// 書籍一覧の Loading が消えるまで待つ
await expect(
  page.locator('lib-book-list').locator('pierce/[data-testid="book-list-loading"]')
).toBeHidden({ timeout: 15000 });

// ログイン Loading が消えるまで待つ
await expect(
  page.locator('lib-login').locator('pierce/[data-testid="login-loading"]')
).toBeHidden({ timeout: 15000 });
```

---

## 🛠 技術スタック

- **Vanilla JS** — フレームワークなし
- **Custom Elements v1** + **Shadow DOM v1** — Web Components 標準仕様
- **localStorage** — 予約データの永続化
- **sessionStorage** — ログインセッション管理
- サーバー・ビルドツール不要（HTML ファイルをそのまま開くだけで動作）

---

## 📝 ライセンス

MIT — テスト自動化の学習・練習目的でご自由にお使いください。
