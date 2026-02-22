# ADR-001: React SPA + Vite の採用

## ステータス

承認済み

## コンテキスト

IT人材紹介エージェント企業向けの戦略ブレインストーミングツールを構築する。
ユーザーは社内の営業・マーケ・経営企画担当者。
AI API を呼び出して分析結果を表示する単一画面のツール。

## 検討した選択肢

1. **Next.js（SSR/SSG）**
2. **React SPA + Vite**
3. **React SPA + Create React App（CRA）**

## 決定

**React 18 SPA + Vite 5** を採用。

## 理由

- **SEO 不要**: 社内ツールのため SSR/SSG のメリットがない
- **単一画面**: ルーティングが不要で、Next.js のファイルベースルーティングは過剰
- **高速 HMR**: Vite の ESM ベース HMR で開発体験が良い
- **シンプルなデプロイ**: 静的ファイル + API プロキシのみ（Vercel で対応可能）
- **CRA は非推奨**: React 公式が CRA から離れており、Vite が推奨
- **バンドルサイズ**: Vite の Tree-shaking で最終バンドルが小さい

## 結果

- サーバーサイドロジックは Vercel Serverless Function で API プロキシのみ
- ルーティングライブラリ不要（React Router 等を導入しない）
- 状態管理は React hooks + localStorage で完結
