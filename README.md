# 📚 市立図書館 予約システム

**テスト自動化練習用デモサイト** — Shadow DOM で構築した架空の図書館予約システムです。  
Playwright / Selenium / Robot Framework などのテスト自動化ツールの練習を目的として作成しています。

🌐 **デモURL:** https://sadaakiemuravaltes.github.io/shadowDOM-sample/  
📦 **リポジトリ:** https://github.com/SadaakiEmuraValtes/shadowDOM-sample

---

## ⚠ 免責事項

このサイトは**テスト自動化の練習専用の架空サイト**です。  
実在する図書館・書籍・著者・人物とは一切関係ありません。  
データはブラウザのローカルストレージのみに保存され、外部サーバーへの送信は行いません。

---

## 🗺 ページ構成

| ページ | URL | Loading | 説明 |
|--------|-----|---------|------|
| **ホーム** | `index.html` | なし | サイト概要・ガイド・テストアカウント一覧 |
| **蔵書一覧** | `books.html` | 検索・フィルタ時 2〜5秒 | 100冊の書籍を検索・予約 |
| **予約確認** | `reserve.html` | なし | 選択書籍確認・返却期限指定・予約確定 |
| **ログイン** | `login.html` | ログイン時 2〜5秒 | フォーム + クイックログイン（5アカウント） |
| **マイページ** | `my-page.html` | なし | 予約/待機/履歴/お気に入り（要ログイン） |

---

## ⏳ Loading 発生タイミング

テスト自動化の「動的待機」練習用として、以下の操作でランダムな Loading が発生します。

| 操作 | 待機時間 | testid |
|------|---------|--------|
| ログイン試行（フォーム・クイック共通） | **2〜5 秒** | `login-loading` |
| 蔵書検索・ジャンルフィルタ変更 | **2〜5 秒** | `book-list-loading` |

> ホームページ・予約確認・マイページには Loading は発生しません。

---

## 🎯 機能一覧

### 蔵書一覧（books.html）
| 機能 | 詳細 |
|------|------|
| テキスト検索 | タイトル・著者でリアルタイム検索（変更のたびに Loading 発生） |
| ジャンルフィルタ | 10ジャンルをドロップダウンで絞り込み |
| お気に入りフィルタ | 🤍ボタンで登録した本だけ表示（ログイン時のみ） |
| チェックボックス予約 | 貸出可の本を複数チェック → カートバーから予約確認へ |
| 順番待ち登録 | 全冊貸出中の本に「順番待ちに登録」ボタンを表示。待ち人数・自分の順位を表示 |
| お気に入り | 書籍カード右上の ❤️ / 🤍 ボタンで登録/解除 |

### 予約確認（reserve.html）
| 機能 | 詳細 |
|------|------|
| 選択書籍一覧 | カートに追加した書籍と貸出可否を表示 |
| 返却期限指定 | カレンダーで返却日を指定（明日〜30日後、デフォルト14日後） |
| 一括予約 | 「予約を確定する」ボタンで全選択書籍を一括予約 → マイページへ遷移 |

### マイページ（my-page.html）
| タブ | 内容 |
|------|------|
| 現在の予約 | 予約中・待機中の書籍一覧。返却・キャンセル操作可 |
| 利用履歴 | 返却済み・キャンセル済みの履歴 |
| ❤️ お気に入り | 登録書籍の一覧。予約カートへ追加・解除ボタン付き |

---

## 📖 初期貸出状態（シードデータ）

初回起動時に自動生成されます。**返却期限は起動日時を基準に動的に算出**されるため、アクセスするたびに「あと N 日」の表示が変わります。

| 書籍 | 在庫 | 初期状態 |
|------|------|---------|
| こころ（夏目漱石） | 2冊 | **全冊貸出中**・2人待ち |
| 人間失格（太宰治） | 3冊 | **全冊貸出中**（延滞含む）・3人待ち |
| 1Q84（村上春樹） | 2冊 | **全冊貸出中**（延滞含む）・1人待ち |
| 容疑者Xの献身（東野圭吾） | 3冊 | **全冊貸出中**（延滞含む）・2人待ち |
| アルジャーノンに花束を | 3冊 | **全冊貸出中**（延滞含む）・4人待ち |
| 1984年（G.オーウェル） | 3冊 | **全冊貸出中** ・2人待ち |
| 吾輩は猫である | 3冊 | 2冊貸出中・**1冊残** |
| ノルウェイの森 | 3冊 | 2冊貸出中・**1冊残** |
| 点と線（松本清張） | 3冊 | 2冊貸出中・**1冊残** |
| 三体（劉慈欣） | 3冊 | 2冊貸出中・**1冊残** |

---

## 🔑 テストアカウント

パスワードはすべて共通: **`test1234`**

| 名前 | メールアドレス | クイックログイン |
|------|--------------|----------------|
| 田中 一郎 👨 | tanaka@example.com | `quick-login-1` |
| 鈴木 花子 👩 | suzuki@example.com | `quick-login-2` |
| 佐藤 次郎 👨 | sato@example.com | `quick-login-3` |
| 山田 美咲 👩 | yamada@example.com | `quick-login-4` |
| 伊藤 健太 👨 | ito@example.com | `quick-login-5` |

ログインページの **「クイックログイン」** からワンクリックでログイン可能（Loading あり）。

---

## 📋 予約フロー（操作手順）

```
1. login.html      クイックログインをクリック → Loading 待機 → books.html へ
2. books.html      書籍カードのチェックボックスで複数選択
                   （画面下部に浮動カートバーが表示される）
3. カートバー      「予約確認へ →」をクリック
4. reserve.html    書籍一覧を確認 → カレンダーで返却期限日を選択
                   → 「予約を確定する」をクリック
5. my-page.html    「現在の予約」タブで予約内容を確認
```

---

## 📖 蔵書データ（100冊）

| ジャンル | 冊数 | 主な著者 |
|----------|------|---------|
| 小説 | 40冊 | 夏目漱石・川端康成・三島由紀夫・村上春樹・村田沙耶香・凪良ゆう 他 |
| 短編小説 | 10冊 | 芥川龍之介・太宰治・森鴎外・志賀直哉 他 |
| ミステリー | 14冊 | 松本清張・東野圭吾・伊坂幸太郎・宮部みゆき |
| SF | 8冊 | 伊藤計劃・劉慈欣・G.オーウェル・A.C.クラーク 他 |
| 歴史小説 | 4冊 | 司馬遼太郎・吉川英治・森鴎外 |
| 童話 | 4冊 | 宮沢賢治 |
| ライトノベル | 4冊 | 新海誠・谷川流・川原礫 他 |
| 詩集 | 4冊 | 宮沢賢治・石川啄木・高村光太郎・茨木のり子 |
| エッセイ | 1冊 | 谷崎潤一郎 |
| 世界文学 | 15冊 | ドストエフスキー・トルストイ・カミュ・カフカ・ヘミングウェイ・サリンジャー 他 |

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
    ├── bus.js          # イベントバス・randomDelay()
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

各コンポーネントは Shadow DOM でカプセル化されています。通常の `querySelector` では内部要素に到達できません。

**Playwright（推奨）:**
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
# shadowRoot を経由して要素取得
shadow_host = driver.find_element(By.TAG_NAME, 'lib-book-list')
shadow_root = driver.execute_script('return arguments[0].shadowRoot', shadow_host)
element = shadow_root.find_element(By.CSS_SELECTOR, '[data-testid="search-input"]')

# ネストした Shadow DOM（lib-book-list の中の lib-book-card）
card_host = shadow_root.find_element(By.TAG_NAME, 'lib-book-card')
card_root = driver.execute_script('return arguments[0].shadowRoot', card_host)
```

### テストシナリオ例

| シナリオ | 練習できるスキル |
|----------|----------------|
| クイックログイン → Loading 待機 → books.html 遷移確認 | 動的待機・ページ遷移 |
| 検索入力 → Loading 待機 → 件数変化を確認 | 動的待機・テキスト入力 |
| 複数書籍をチェック → カートバー表示 → reserve.html で予約 | 複数操作・フォーム・日付入力 |
| 全冊貸出中の本に順番待ち登録 → マイページで確認 | 状態確認・ナビゲーション |
| お気に入り登録 → フィルタ → マイページで解除 | フィルタ・状態変化 |
| 未ログインで my-page.html へ直接アクセス → login.html リダイレクト確認 | リダイレクト処理 |

---

### `data-testid` 一覧

#### 蔵書一覧（books.html 内 `lib-book-list`）
| 要素 | data-testid |
|------|-------------|
| 検索入力 | `search-input` |
| ジャンル選択 | `genre-select` |
| お気に入りフィルタ | `fav-toggle` |
| 書籍件数表示 | `book-count` |
| 書籍グリッド | `book-grid` |
| 検索 Loading オーバーレイ | `book-list-loading` |
| カートバー | `cart-bar` |
| カート冊数表示 | `cart-count` |
| カートクリアボタン | `cart-clear` |
| 予約確認へボタン | `cart-reserve` |

#### 書籍カード（`lib-book-card`、N = book id）
| 要素 | data-testid |
|------|-------------|
| カートチェックボックス | `cart-checkbox-N` |
| お気に入りボタン | `fav-btn-N` |
| 順番待ち人数バッジ | `wait-count-N` |
| 順番待ち登録ボタン | `wait-btn-N` |
| 待ち順位バッジ | `wait-pos-N` |
| 順番待ちキャンセルボタン | `cancel-wait-btn-N` |
| ログインリンク（未ログイン時） | `login-hint-N` |

#### 予約確認（reserve.html 内 `lib-reserve`）
| 要素 | data-testid |
|------|-------------|
| 予約書籍リスト | `reserve-book-list` |
| 個別書籍行 | `reserve-book-N` |
| 貸出不可書籍行 | `reserve-book-blocked-N` |
| 返却期限日入力 | `due-date-input` |
| 戻るボタン | `back-btn` |
| 予約確定ボタン | `confirm-btn` |
| 処理中表示 | `reserve-confirming` |

#### ログイン（login.html 内 `lib-login`）
| 要素 | data-testid |
|------|-------------|
| クイックログイングリッド | `quick-login-grid` |
| クイックログインボタン | `quick-login-1` 〜 `quick-login-5` |
| メール入力 | `email-input` |
| パスワード入力 | `password-input` |
| ログインボタン | `login-submit` |
| エラーメッセージ | `login-error` |
| Loading オーバーレイ | `login-loading` |

#### マイページ（my-page.html 内 `lib-my-page`）
| 要素 | data-testid |
|------|-------------|
| 統計カードグループ | `stats` |
| 現在の予約件数 | `stat-active` |
| 現在の予約タブ | `tab-active` |
| 利用履歴タブ | `tab-history` |
| お気に入りタブ | `tab-favorites` |
| 予約テーブル | `reservation-table` |
| 返却ボタン | `return-btn` |
| キャンセルボタン | `cancel-btn` |
| お気に入りグリッド | `favorites-grid` |
| お気に入りカード | `fav-card-N` |
| お気に入りカート追加 | `fav-cart-btn-N` |
| お気に入り解除 | `fav-remove-btn-N` |

#### ホーム（index.html 内 `lib-guide`）
| 要素 | data-testid |
|------|-------------|
| 蔵書一覧ボタン | `go-to-books` |
| ページガイド | `page-guide` |
| テストアカウント一覧 | `account-list` |

---

## 🛠 技術スタック

| 分類 | 技術 |
|------|------|
| 言語 | Vanilla JavaScript（フレームワークなし） |
| コンポーネント | Custom Elements v1 + Shadow DOM v1（Web Components 標準仕様） |
| 永続化 | localStorage（予約・お気に入り）/ sessionStorage（セッション・カート） |
| ビルド | 不要（HTML ファイルをそのまま開くだけで動作） |
| サーバー | 不要（ローカルファイルまたは任意の静的ホスティング） |

---

## 🚀 起動方法

```bash
# Python 簡易サーバー
python -m http.server 8080
# → http://localhost:8080/

# Node.js
npx serve .
# → http://localhost:3000/

# VS Code: Live Server 拡張でも可
```

> ※ ローカルファイルとして直接 `index.html` を開いても動作します。

---

## 📝 ライセンス

MIT — テスト自動化の学習・練習目的でご自由にお使いください。
