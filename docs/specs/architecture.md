# アーキテクチャ仕様

## 概要

AI Strategic Brainstorm は、IT人材紹介エージェント企業（営業・マーケ・経営企画）向けの
戦略ブレインストーミング SPA。ユーザーが課題・目標を入力すると、AI が状況分析と戦略アイデアを生成する。

## 技術スタック

| カテゴリ | 技術 | ADR |
|---------|------|-----|
| フレームワーク | React 18 | [ADR-001](../decisions/001-spa-with-vite.md) |
| 言語 | TypeScript（strict mode） | — |
| ビルド | Vite 5 | [ADR-001](../decisions/001-spa-with-vite.md) |
| スタイリング | Tailwind CSS 3 | [ADR-002](../decisions/002-tailwind-over-mui.md) |
| テスト | Vitest | — |
| アイコン | Lucide React | — |
| PDF | html2pdf.js | [ADR-004](../decisions/004-client-side-export.md) |
| PPTX | pptxgenjs | [ADR-004](../decisions/004-client-side-export.md) |
| パスエイリアス | `@/*` → `src/*` | — |

## コンポーネントツリー

```
App.tsx
├── HeaderBar          — タイトル、モデル選択、テーマ切替、設定ボタン
├── ProjectForm        — 入力フォーム（セッション種別、目標、課題、深度）
│   └── IssueRow       — 動的な課題行（テキスト + 詳細 + サブ課題）
├── ResultsPane        — AI分析結果表示
│   ├── AnalysisBlock  — 状況分析 + 最重要イシュー
│   ├── ResultCard[]   — アイデアカード（優先度/工数/インパクト/実現可能性）
│   │   └── FeasibilityBar — 4D 実現可能性バー
│   ├── DeepDive       — 深掘り Q&A セクション
│   └── Refinement     — ブラッシュアップセクション
├── PreviewModal       — エクスポートプレビュー
├── LogPanel           — セッション履歴
├── SettingsModal      — API キー・ログ設定
├── AppHelpModal       — 機能ツアー
└── SupportWidget      — FAQ + AI チャットサイドバー
```

## データフロー

```
[ユーザー入力]
     │
     ▼
ProjectForm (useBrainstormForm)
     │ form, dep, sesLabel
     ▼
useAI.generate()
     │ buildPrompt() → system/user メッセージ構築
     │ HR キーワード検出 → ドメインコンテキスト注入
     ▼
┌─ OpenAI モード ─────────────────────┐
│ OpenAI API (/api/openai プロキシ)    │
│   Free: 環境変数 API キー            │
│   Pro: ユーザー API キー             │
├─ ローカルLLM モード ────────────────┤
│ Ollama / LM Studio (localhost)      │
│   ブラウザから直接接続（プロキシ不要）│
│   全機能プロモード相当               │
└─────────────────────────────────────┘
     │
     ▼
parseAIJson() → AIResults
     │
     ├──→ ResultsPane で表示
     ├──→ useLogs.saveLog() → localStorage 永続化
     └──→ buildReportMd/Csv/Pdf/Pptx → エクスポート
```

## Hook 構成

| Hook | ファイル | 責務 |
|------|---------|------|
| `useAI` | `src/hooks/useAI.ts` | AI 生成・リファイン・深掘り・ドリルダウン |
| `useBrainstormForm` | `src/hooks/useBrainstormForm.ts` | フォーム状態・サジェスション・シードデータ |
| `useLogs` | `src/hooks/useLogs.ts` | セッション履歴の CRUD + localStorage |
| `useTheme` | `src/hooks/useTheme.ts` | ダーク/ライトモード切替 |
| `usePanelResize` | `src/hooks/usePanelResize.ts` | スプリットパネル比率管理 |

## LLM プロバイダー構成

3つのプロバイダーをサポート。`LLMProvider` 型で切替。

| プロバイダー | 接続先 | 認証 | モード |
|-------------|--------|------|--------|
| `openai` | `/api/openai` プロキシ or OpenAI直接 | API キー | Free / Pro |
| `ollama` | `http://localhost:11434` | 不要 | Pro相当 |
| `lmstudio` | `http://localhost:1234` | 不要 | Pro相当 |

ローカルLLM（Ollama / LM Studio）は OpenAI互換API（`/v1/chat/completions`）を使用。
ブラウザから直接 localhost に接続し、プロキシ不要。`response_format`（JSON mode）は送信しない。

### OpenAI API プロキシ

#### 開発環境（Vite dev server）

`vite.config.ts` の proxy 設定:
- `/api/openai` → `https://api.openai.com`
- Free モード: `OPENAI_API_KEY` 環境変数をプロキシ内で付与
- Pro モード: クライアントから `x-api-key` ヘッダーで送信

#### 本番環境（Vercel）

`api/openai/[[...path]].ts` の Serverless Function:
- Edge runtime でプロキシ
- 環境変数から API キーを注入

## 永続化

| キー | 保存先 | 内容 |
|------|-------|------|
| `ai-brainstorm-logs` | localStorage | LogEntry[]（最大200件） |
| `ai-brainstorm-settings` | localStorage | logMode, autoSave |
| `userApiKey` | localStorage | OpenAI API キー（Pro モード） |
| `ai-brainstorm-provider` | localStorage | LLMプロバイダー（openai/ollama/lmstudio） |
| `ai-brainstorm-endpoint` | localStorage | ローカルLLMエンドポイントURL |
| `ai-brainstorm-local-model` | localStorage | ローカルLLMモデルID |
| `theme` | localStorage | ダーク/ライト設定 |
| `ai-brainstorm-visited` | localStorage | 初回訪問フラグ |

## ディレクトリ構造

```
src/
├── components/
│   ├── form/          — 入力フォーム系
│   ├── layout/        — レイアウト（HeaderBar, ResultsPane）
│   ├── results/       — 結果表示（ResultCard, FeasibilityBar, RichText）
│   ├── modals/        — モーダル（Settings, Log, Preview, Help）
│   └── support/       — サポートウィジェット
├── hooks/             — カスタム Hooks
├── constants/         — 定数・プロンプト・モデル定義・テーマ・モックデータ
├── types/             — TypeScript 型定義
└── utils/             — ユーティリティ（JSON パース、レポート生成、フォーマッタ）
```

## 制約

- SPA のみ（ルーティングなし）
- 状態管理ライブラリ不使用（React hooks + localStorage）
- サーバーサイドレンダリング不要（SEO 不要のツール）
- localStorage 容量制限（5-10MB、ログ200件上限で管理）
