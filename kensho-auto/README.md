# kensho-auto（懸賞自動応募システム）

懸賞を自動で集め、Web の応募フォームへの入力から送信までを自動で行い、結果をスマホ対応の Web アプリで確認するためのツールです。

```
sources.yaml ──(収集)──▶ data/campaigns.json ──(応募エンジン/Playwright)──▶ data/entries.json
                               ▲                                                 │
                               │ URL手動追加・収集元オン/オフ                         │
                     Webアプリ（GitHub Pages・データなし） ◀──── GitHub API（PAT）─┘
```

| 構成 | 内容 |
|---|---|
| 応募エンジン | TypeScript + Playwright（Chromium・headless）。`src/engine/` |
| 定期実行 | GitHub Actions（JST 7:00 / 19:00 ＋ 手動実行）。`.github/workflows/kensho-auto.yml` |
| データ | `data/campaigns.json`（懸賞一覧）、`data/entries.json`（応募結果）、`data/settings.json`（収集元のオン/オフ）。**個人情報は含まない** |
| 個人情報 | GitHub Secrets の `PROFILE_JSON` からのみ読む。ログはマスクされ、スクショは artifact（7日で自動削除）にだけ保存 |
| Web アプリ | `web/`（静的サイト、データを含まない）。`.github/workflows/kensho-pages.yml` で GitHub Pages に公開 |
| 収集 | `sources.yaml`（RSS / 一覧ページ）。`src/collect/` |
| X モジュール | フォロー＆リポスト型。**初期設定はオフ**。`src/x/` |

> [!IMPORTANT]
> **このリポジトリは非公開（private）にしてください。** `data/*.json` には応募した懸賞の一覧が、Actions の artifact には個人情報が写ったスクリーンショットが入ります。公開リポジトリの artifact やファイルは第三者が閲覧できます。

---

## セットアップ

### 1. Secrets を登録する

リポジトリの **Settings → Secrets and variables → Actions → New repository secret** から登録します。

#### `PROFILE_JSON`（必須）

応募フォームに入力するプロフィールです。次の形式の JSON をそのまま貼り付けます（改行があっても構いません）。

```json
{
  "lastName": "山田",
  "firstName": "太郎",
  "lastNameKana": "ヤマダ",
  "firstNameKana": "タロウ",
  "zip": "100-0001",
  "prefecture": "東京都",
  "city": "千代田区",
  "address1": "千代田1-1",
  "address2": "〇〇マンション101",
  "phone": "090-1234-5678",
  "email": "you@example.com",
  "birthDate": "1990-04-15",
  "gender": "male"
}
```

| 項目 | 説明 |
|---|---|
| `lastNameKana` / `firstNameKana` | カタカナ・ひらがなどちらでも可（フォームに合わせて自動変換） |
| `zip` | 7桁。ハイフンの有無は自由（分割入力・ハイフンあり/なしに自動対応） |
| `city` / `address1` / `address2` | 市区町村 / 町名・番地 / 建物名・部屋番号（`address2` は省略可） |
| `phone` | ハイフンの有無は自由（3分割入力にも対応） |
| `birthDate` | `YYYY-MM-DD` |
| `gender` | `male` / `female` / `other` |

#### `X_COOKIES_JSON`（任意・X モジュールを使う場合のみ）

[X モジュール](#x-モジュール初期設定ではオフ) を参照してください。

### 2. Actions に書き込み権限を与える

ワークフローは `permissions: contents: write` を宣言して `data/*.json` をコミットします。組織の設定で制限されている場合は **Settings → Actions → General → Workflow permissions** を **Read and write permissions** にしてください。

### 3. Web アプリ用の Personal Access Token（PAT）を作る

Web アプリは、スマホのブラウザから GitHub API を直接呼び出して非公開リポジトリのデータを読み書きします。

1. GitHub 右上のアイコン → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
2. **Repository access**: *Only select repositories* でこのリポジトリだけを選ぶ
3. **Permissions → Repository permissions**:

   | 権限 | レベル | 用途 |
   |---|---|---|
   | Contents | **Read and write** | `data/*.json` と `sources.yaml` の読み込み、URL 手動追加・収集元オン/オフ・「応募済みにする」の書き込み |
   | Actions | **Read and write** | 「今すぐ実行」（workflow_dispatch）と実行履歴の表示 |
   | Metadata | Read-only | 自動で付与されます |

4. 有効期限は短め（例: 90日）にし、期限が切れたら作り直して Web アプリの ⚙ から入れ直してください。

トークンは**その端末のブラウザの localStorage にだけ**保存されます。Web アプリ自体（HTML/JS/CSS）にはデータもトークンも含まれないので、公開されても個人情報は漏れません。端末を手放すときは ⚙ →「トークンを削除」を押してください。

### 4. GitHub Pages を有効にする

1. **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にする
2. `main` ブランチに `kensho-auto/web/` の変更が入ると `kensho-pages` ワークフローが公開します（Actions タブから手動実行も可）
3. 公開された URL（`https://<ユーザー名>.github.io/<リポジトリ名>/`）をスマホで開き、オーナー・リポジトリ名・ブランチ・PAT を入力

> 非公開リポジトリから Pages を公開するには GitHub の有料プラン（Pro / Team / Enterprise）が必要です。無料プランの場合は `web/` を別の公開リポジトリや任意の静的ホスティングに置いても同じように動きます（データは常に GitHub API 経由で取得するため）。

### 5. 動作確認（dry-run）

まずは **dry-run** で、実際には送信せずに入力結果を確認してください。

**GitHub Actions で:** Actions → **kensho-auto** → **Run workflow** → `dry_run` にチェック（特定の懸賞だけ試すなら `url` に応募ページの URL）→ 実行。終わったら実行結果ページ下部の **Artifacts** から `kensho-screenshots-…` をダウンロードし、`screenshots/*-dryrun.png` で入力内容を確認します。dry-run では `data/` は更新されません。

**ローカルで:**

```bash
cd kensho-auto
```

```bash
npm ci
```

```bash
npx playwright install chromium
```

```bash
npm run dry-run -- --url "https://example.com/campaign/form"
```

`PROFILE_JSON` が未設定の場合はダミーのプロフィールで入力します。自分のプロフィールで試す場合は、`profile.local.json`（`.gitignore` 済み）に保存して次のように実行します。

```bash
PROFILE_JSON="$(cat profile.local.json)" npm run dry-run -- --url "https://example.com/campaign/form"
```

スクショは `artifacts/screenshots/` に保存されます（コミットされません）。

---

## sources.yaml の書き方

```yaml
sources:
  # RSS / Atom（推奨）
  - id: my-rss                 # 一意なID
    name: 懸賞まとめのRSS       # 表示名
    type: rss
    url: https://example.com/feed
    enabled: true
    follow: true               # 記事ページを開いて懸賞元の応募ページURLまでたどる（既定 true）
    # applyLinkSelector: ".entry-content a.official"  # 応募ページへのリンク（省略時は自動推定）
    # method: auto             # web / x / other / auto

  # 一覧ページ（CSSセレクタ）
  - id: my-list
    name: 懸賞一覧ページ
    type: html
    url: https://example.com/campaigns
    enabled: true
    itemSelector: ".campaign-list > li"   # 1件分の要素
    titleSelector: ".title"              # 省略時はリンクの文字
    linkSelector: "a"                    # 省略時は最初の a
    deadlineSelector: ".deadline"        # 「11/30まで」などを自動で日付に変換
    prizeSelector: ".prize"
    follow: true
```

- 締切は「締切：2026年11月30日」「応募期間：〜12/15」「12/10まで」などの表記から自動で読み取ります。締切を過ぎたものは追加しません。
- 応募方式は URL と本文から判定します（x.com のポスト・「フォロー＆リポスト」→ `x`、ハガキ・レシート・Instagram・LINE → `other`、それ以外 → `web`）。
- 応募ページへのリンクは、記事本文の外部リンクからシェアボタン・広告・SNS を除き、「応募」「公式」「キャンペーン」などの文字を手がかりに推定します。うまく取れないサイトは `applyLinkSelector` を指定してください。
- `robots.txt` で禁止されている URL は自動でスキップします。収集先サイトの利用規約も確認してください。
- Web アプリの「収集元のオン／オフ」は `data/settings.json` に保存され、`enabled` より優先されます。

## config.yaml（動作設定）

| 項目 | 既定値 | 説明 |
|---|---|---|
| `apply.maxPerRun` | 10 | 1回の実行で応募する上限件数（手動実行時は `max_per_run` で上書き可） |
| `apply.minIntervalSec` / `maxIntervalSec` | 5 / 30 | 応募と応募の間隔（この範囲でランダム） |
| `apply.maxAttempts` | 2 | 送信前に失敗したものの再試行上限 |
| `collect.enabled` | true | 実行時に収集もするか |
| `collect.maxNewPerSource` | 30 | 1つの収集元から1回に追加する上限 |
| `x.enabled` | **false** | X モジュール |
| `x.dailyLimit` | 10 | X の1日（日本時間）の処理上限 |
| `x.minIntervalSec` / `maxIntervalSec` | 90 / 240 | X の処理間隔 |

## 応募エンジンの動き

1. 応募ページを開く。フォームが無ければ「応募はこちら」等のリンクを最大2回たどる
2. CAPTCHA / reCAPTCHA / hCaptcha / Turnstile、ログイン（パスワード欄・「ログインしてください」）、SMS・認証コードを検出したら **回避を試みずに `manual`**
3. 各項目を label / name / id / placeholder / autocomplete と、表の見出し（th / dt / legend）から判別して入力
   - 姓・名の分割、フリガナ（カタカナ／ひらがなをラベル・placeholder から判定）、郵便番号 3+4 分割、都道府県セレクト、住所の分割（市区町村／番地／建物）、電話番号 3 分割、ハイフンあり／なし、生年月日（3つのセレクト・和暦付き・`type=date`・8桁）、年齢・年代、性別（ラジオ／セレクト）
   - 規約・個人情報の同意チェックボックスにチェック。メルマガ購読は触らない
   - 選択式アンケートは「どちらでもない」「特になし」などの無難な選択肢、無ければ「その他」以外の最初の選択肢
   - **必須の記述式設問**（自由記述・感想など）やファイル添付があれば `manual`
4. （dry-run はここでスクショを撮って終了）
5. 「確認」「次へ」→ 確認画面の「送信」「この内容で応募する」まで最大3段階進む
6. 「応募完了」「ありがとうございました」「受け付けました」などで完了を判定

| 結果 | 意味 | 再応募 |
|---|---|---|
| `success` | 完了ページを確認できた | しない |
| `failed` | 送信できない・完了を確認できない・エラー | 送信前の失敗のみ `maxAttempts` まで再試行 |
| `manual` | CAPTCHA・ログイン・SMS・必須の記述式など。**Web アプリから手動で応募** | しない |
| `closed` | 「応募受付は終了しました」等の表示、404、締切超過 | しない |

同じ懸賞への重複応募を防ぐため、URL を正規化（`www`・`utm_*` 等・末尾スラッシュ・`#`・クエリ順・twitter.com/x.com を統一）した SHA-256 ハッシュを ID にしています。

## Web アプリ

- **タブ**: 締切間近（7日以内）／要手動／応募済み／失敗／未処理／すべて
- **検索・フィルタ**: タイトル・URL・賞品・理由で検索、応募方式で絞り込み
- **統計**: 応募済み（今日の件数）、要手動、失敗（成功率）、未処理
- **今すぐ実行**: workflow_dispatch で実行（dry-run も可）。直近の実行状況も表示
- **要手動**の懸賞はタイトルをタップすると応募ページが開きます。手動で応募したら「応募済みにする」
- **URL を手動で追加**（「すぐにこの URL だけ応募」も可）、**収集元のオン／オフ**

## X モジュール（初期設定ではオフ）

フォロー＆リポスト型（`https://x.com/<アカウント>/status/<ID>`）のキャンペーンを、投稿者のフォローとポストのリポストで処理します。

> [!WARNING]
> X の自動操作は X の利用規約・自動化ルールに抵触し、**アカウントの凍結・制限の原因になり得ます**。使う場合は自己責任で、上限件数を小さく保ってください。オフのままでも、X の懸賞は Web アプリの「要手動」に並ぶので手動で応募できます。

1. PC のブラウザで X にログインし、Cookie をエクスポートする拡張機能などで `x.com` の Cookie を JSON で取り出す（少なくとも `auth_token` と `ct0`）
2. Secrets に `X_COOKIES_JSON` として登録。形式は拡張機能の出力（`[{"name": "...", "value": "...", "domain": ".x.com", ...}]`）か `{"auth_token": "...", "ct0": "..."}`
3. `config.yaml` の `x.enabled` を `true` にする

- ログイン画面・本人確認・ロック・Arkose などが出たら**その場で X の処理を止め**、その懸賞を `manual` にします（回避はしません）。Cookie を取り直してください
- 1日の上限（既定 10件）と長めの間隔（90〜240秒）で処理します。引用・リプライ・ハッシュタグ付き投稿など、フォロー＆リポスト以外の条件には対応しません

## 既知の限界

- **CAPTCHA / reCAPTCHA（v3 の見えないものを含む）があるサイトはすべて `manual`** になります。大手企業のキャンペーンは reCAPTCHA を使っていることが多く、`manual` の割合は高めです
- **ログイン・会員登録が必要なキャンペーン**（企業の会員サイト、LINE・Instagram 経由など）は `manual`
- **X のキャンペーン**は X モジュールがオフの間は `manual` 扱い。オンにしても Cookie の期限切れや本人確認ですぐ `manual` になります
- 必須の自由記述（感想・エピソードなど）、レシート画像のアップロード、ハガキ応募は自動化できません
- 完了判定はキーワードによるため、完了ページの文言が特殊なサイトでは送信できていても `failed`（「完了ページを確認できない」）になることがあります。`failed` かつ送信済みのものは再試行しないので、スクショで確認してください
- 入力判定はヒューリスティックです。新しいサイトでは最初に dry-run でスクショを確認してください
- 懸賞によっては規約で自動応募やツールの使用を禁止しています。各懸賞の応募規約を守り、禁止されているものには使わないでください

## 開発

```bash
cd kensho-auto
```

```bash
npm test
```

```bash
npm run typecheck
```

- `tests/fixtures/` に日本の懸賞フォームを模したダミー HTML（分割入力・テーブル／dl レイアウト・確認画面・同一ページ完了・CAPTCHA・ログイン・SMS・記述式・締切済み・ランディングページ）と収集用の RSS / 記事 / 一覧ページがあります
- PR と `main` への push で `kensho-test` ワークフローがテストを実行します

| ファイル | 役割 |
|---|---|
| `src/engine/classify.ts` | 項目の判別と入力計画（純粋関数） |
| `src/engine/page.ts` | ページ内の項目収集・入力 |
| `src/engine/detect.ts` | 完了・締切・CAPTCHA・ログイン・SMS の判定 |
| `src/engine/apply.ts` | 1件の応募フロー |
| `src/collect/collector.ts` | RSS / 一覧ページからの収集 |
| `src/x/xModule.ts` | X モジュール |
| `src/cli/run.ts` | 実行（`npm run run` / `npm run dry-run`） |
| `src/cli/collect.ts` | 収集（`npm run collect`） |
| `src/cli/mergeData.ts` | Actions のコミット時にリモートの変更とマージ |
