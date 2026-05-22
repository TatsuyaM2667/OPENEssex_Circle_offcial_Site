# OPEN Essex Circle Members Site

Cloudflare Pages でホストされる、Open Essex コミュニティ向けのメンバーポータルサイトです。サークルメンバー同士が企画、資料、おすすめの書籍などを共有し合い、活発に交流できるプラットフォームです。

## ✨ 主な機能 (Features)

- **セキュアな認証**: Firebase Auth を用いたログイン機能。
- **マイページ & プロフィール**: 自分の自己紹介やアイコン、SNSリンクを設定でき、各メンバーの「活動履歴（過去の投稿一覧）」も表示されます。
- **タイムライン (Timeline)**: サークル内の最新情報や活動をリアルタイムに共有。
- **課題・資料 (Documents)**: 技術資料や課題の解決策を Markdown 形式で投稿・共有。
- **カレンダー (Calender)**: メンバー各自の予定などを共有させるカレンダー機能。
- **企画 (Projects)**: やってみたい企画を提案し、ステータス（企画中・進行中・完了）を管理。
- **ガイド (Guides)**: サークル内のルールや重要な案内を共有。
- **おすすめ本 (Books)**: メンバーが推薦する書籍とその理由を紹介。
- **共同投稿機能**: 共同投稿者（Co-authors）をサジェスト機能で簡単に追加でき、追加されたユーザーも投稿の「編集・削除」が可能。
- **UI/UX の最適化**:
  - グラスモーフィズム（Glassmorphism）を取り入れたモダンなデザイン。
  - 長い文章の自動折りたたみ（続きを読む / 折りたたむ）機能。
  - 投稿に対する「いいね（♥/👍）」のトグル機能。

## 🛠 技術スタック (Tech Stack)

- **Frontend**: React + TypeScript + Vite
- **Styling**: Vanilla CSS (CSS Variables によるテーマ管理)
- **Backend API**: Cloudflare Pages/Workers
- **Database**: Cloudflare D1 (SQLiteベースのサーバーレスDB)
- **Authentication**: Firebase Authentication

---

## 🚀 ローカル開発のセットアップ (Local Setup)

### 1. リポジトリのクローンとインストール
```bash
git clone https://github.com/Open-Essex-Tech-Society/OPENEssex_Circle_MenbersSite.git
cd OPENEssex_Circle_MenbersSite
npm install
```

### 2. 環境変数の設定
プロジェクトのルートに `.env` ファイルを作成し、Firebaseの認証情報を設定してください。(コントリビューターは指定されたAPIキーを入力)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. ローカルデータベース（D1）の準備
開発用にローカル環境のデータベースを作成します。
```bash
# データベースのテーブル（枠）を作成
npx wrangler d1 execute open-essex-db --local --file=schema.sql
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

---

## ☁️ 本番環境のデータベース操作 (Production DB Setup)

本番環境（Cloudflare）のデータベースを操作する場合は、以下のコマンドを使用します。実行前に `npx wrangler login` で Cloudflare へのログインが必要です。

### 初回セットアップ
```bash
npx wrangler d1 execute open-essex-db --remote --file=schema.sql
```

### 機能追加時のマイグレーション（共同投稿者など）
もし他ページで「共同投稿者」機能による投稿エラーが発生した場合（`no such column` 等）は、以下のコマンドでカラムを追加してください。
*(※ エラーが `duplicate column name` と表示された場合は、既に適用済みなので実行不要です)*
```bash
npx wrangler d1 execute open-essex-db --remote --file=db_add_coauthors_others.sql
```

---

## 📦 デプロイ (Deployment)

本番環境へのデプロイは、Cloudflare Pages に接続された GitHub リポジトリの `main` ブランチへプッシュすることで**自動的**に行われます。手動でビルドを確認する場合は以下のコマンドを使用します。
```bash
npm run build
```
## Contributor
- [TatsuyaM2667](https://github.com/TatsuyaM2667)
- [Mitsuifaisalss](https://github.com/Mitsuifaisalss)
- 
