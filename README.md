# クレジットカード コレクション管理サイト

日本で発行できるクレジットカードを網羅的に一覧化し、ログインユーザーが「所有しているカード」にチェックを付けてコレクションを可視化できるサイトです。黒基調のダークテーマで「集めたくなる」体験を狙っています。

- フロント: **Next.js (App Router) + TypeScript + Tailwind CSS v4**
- バックエンド: **Supabase**（Postgres / Auth / Storage / Row Level Security）
- 認証: メール + パスワード

## 実装状況（フェーズ）

- ✅ **フェーズ1**: DB / 認証 / RLS、シードデータ、一覧表示、所有チェック、収集率プログレス
- ✅ **フェーズ2**: フィルタ（ブランド/発行会社/ランク/年会費/還元率/PP/特典/所有状態）・並び替え・URLクエリ同期
- ✅ **フェーズ3**: 管理者画面 `/admin`（カードの追加・編集・削除、Supabase Storage への画像アップロード）
- ✅ **フェーズ4**: マイコレクション集計ダッシュボード（収集率・ランク別/ブランド別集計・実績バッジ）と所有欲を煽る演出

---

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase の用意（A: ローカル / B: クラウド）

どちらでも動きます。コードは環境変数だけで切り替わります。

#### A. ローカル（推奨 / 要 Docker Desktop）

[Supabase CLI](https://supabase.com/docs/guides/local-development) を使います。

```bash
# CLI 未導入なら
brew install supabase/tap/supabase

# 同梱の supabase/ 設定でローカルスタックを起動
supabase start
```

> `supabase/config.toml` が CLI のバージョンと合わずエラーになる場合は、一度このファイルを退避してから `supabase init` で再生成し、`supabase/migrations/` と `supabase/seed.sql` はそのまま使ってください。

起動後に表示される **API URL** と **anon key** を `.env.local` に設定します（次の手順）。

マイグレーションとシードの適用:

```bash
# migrations/ を適用し seed.sql を流す（DBをまっさらにして再構築）
supabase db reset
```

Supabase Studio（ローカル管理画面）: http://127.0.0.1:54323
確認メール等のテスト受信箱（Inbucket）: http://127.0.0.1:54324

#### B. クラウド（supabase.com）

1. [supabase.com](https://supabase.com) でプロジェクトを作成。
2. ダッシュボード → **SQL Editor** で、以下を順に貼り付けて実行:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_storage.sql`
   - `supabase/seed.sql`
3. **Project Settings → API** から `Project URL` と `anon public` key を控える（次の手順）。
4. （任意）CLI でリンクして管理する場合: `supabase link --project-ref <ref>` → `supabase db push`。

### 3. 環境変数

`.env.local.example` をコピーして `.env.local` を作成し、値を設定します。

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=...        # 例: http://127.0.0.1:54321 もしくは https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 を開きます。

---

## 管理者になる方法

このサイトでは「カードの追加・編集・削除・画像アップロード」は **管理者のみ** 可能で、RLS（Row Level Security）でDBレベルから強制しています。一般ユーザーがAPIを直接叩いてもカードは編集できません。

管理者は `profiles.is_admin` フラグで判定します。**自分のメールアドレスでサインアップした後**、SQL で一度だけ昇格させてください。

ローカルなら `supabase db ... ` の代わりに Studio (http://127.0.0.1:54323) の SQL Editor、クラウドならダッシュボードの SQL Editor で実行:

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'あなたのメールアドレス');
```

実行後、再ログイン（またはページ再読込）するとヘッダーに「管理」リンクが表示されます。

---

## データモデル概要

| テーブル | 役割 | 書き込み権限（RLS） |
|---|---|---|
| `profiles` | ユーザープロフィール / `is_admin` | 本人のみ |
| `cards` | カードマスタ | **管理者のみ**（読み取りは全員） |
| `user_cards` | 各ユーザーの所有 / 欲しいリスト（`status: owned \| want`） | 本人のみ |

- カード画像は Storage の `card-images` バケットに保存（読み取り公開・書き込みは管理者のみ）。
- 画像未登録のカードは、ランク（一般/ゴールド/プラチナ/ブラック）とブランドを反映したプレースホルダーを自動生成して表示します。後から実画像に差し替え可能です。

---

## スクリプト

```bash
npm run dev     # 開発サーバー
npm run build   # 本番ビルド
npm run start   # 本番サーバー
npm run lint    # ESLint
```

---

## デプロイ

- **フロント**: Vercel にインポートし、環境変数 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定。
- **バックエンド**: Supabase クラウドプロジェクト（上記 B）。
- 注意: 年会費・還元率などのスペックは公開情報をもとにした**目安**です。正確な条件は管理画面（フェーズ3）から随時補正してください。
