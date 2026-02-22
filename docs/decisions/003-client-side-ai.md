# ADR-003: クライアントサイド AI API 呼び出し

## ステータス

承認済み

## コンテキスト

OpenAI API を呼び出して AI 分析を実行する。
Free モード（環境変数 API キー）と Pro モード（ユーザー自身の API キー）の2モードが必要。

## 検討した選択肢

1. **サーバーサイド API ルート（Next.js API Routes 等）**
2. **クライアントサイド + プロキシ（Vite dev proxy / Vercel Serverless）**
3. **クライアントサイド直接呼び出し（CORS 回避不可）**

## 決定

**クライアントサイド + プロキシ** を採用。

## 理由

- **Free モード**: 環境変数の API キーをクライアントに露出させないため、プロキシが必要
- **Pro モード**: ユーザーの API キーをサーバーに保存しない設計（ブラウザ localStorage のみ）
- **レイテンシ**: ストリーミング対応時にクライアント直結が有利
- **デプロイ簡易性**: Vite proxy（開発）+ Vercel Serverless（本番）で対応可能
- **Next.js 不採用**（ADR-001）のため API Routes は使えない

## 結果

- 開発: `vite.config.ts` の proxy で `/api/openai` → `https://api.openai.com`
- 本番: `api/openai/[[...path]].ts` Vercel Serverless Function
- Free モードはプロキシ内で `Authorization: Bearer` ヘッダーを付与
- Pro モードは `x-api-key` ヘッダーでクライアントから送信、プロキシがフォワード
- API キーの暗号化は未実装（localStorage 平文保存）— 社内ツールとして許容
