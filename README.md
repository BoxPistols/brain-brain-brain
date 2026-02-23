# AI Strategic Brainstorm

> 戦略会議の質を、AIで底上げする。

マルチAI対応の構造化ブレインストーミングツール

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB.svg)
![TypeScript Ready](https://img.shields.io/badge/Vite-5+-646CFF.svg)
![CI](https://github.com/BoxPistols/ai-strategic-brainstorm/actions/workflows/ci.yml/badge.svg)

**Live Demo:** https://ai-strategic-brainstorm.vercel.app

## このツールについて

事業課題の分析や新規施策の検討を進めるとき、「情報は集めたが、どこから手をつけるか決められない」「チームで議論しても、いつも同じ視点に偏る」という場面は少なくありません。

AI Strategic Brainstormは、課題をツリー構造で分解し、複数のAI（Claude / GPT / Gemini）に多角的な分析とアイデア生成を依頼できるWebツールです。

分析の深度を4段階で調整できるため、クイックな壁打ちから本格的な戦略検討まで、目的に応じた使い方ができます。

戦略コンサルタントに依頼するほどではないが、チーム内の議論だけでは視野が足りない——そのギャップを埋めることを目指しています。

### Key Features

**🤖 Multi-Provider AI**
- **Anthropic** (Built-in / APIキー不要) — Haiku 4.5, Sonnet 4.5, Sonnet 4, Opus 4
- **OpenAI** — GPT-4.1 Nano/Mini, o4-mini, GPT-5 Nano/Mini
- **Google AI** — Gemini 2.5 Flash/Pro

**📊 Expert-Grade Analysis**
- 4段階の分析深度 (Quick → BCG Grade)
- ツリー構造の課題入力（サブ課題・背景・定量データ対応）
- セッションタイプ別のサジェスト質問で深掘り
- Web検索連携による最新業界データ調査

**📝 Rich Output**
- Markdown → リッチHTML変換（見出し・テーブル・リスト・リンク）
- 参照元URLのアンカーリンク（別タブ対応）
- レポートプレビュー → Markdown / テキスト / PDF エクスポート

**💾 Session History (localStorage)**
- 全Q&A / 回答のみ / OFF の保存モード選択
- 検索・ソート・複数選択対応の履歴一覧
- 詳細ビューでのドリルダウン表示
- JSON import/export（全件・選択・個別）

**🔄 Iterative Refinement**
- レビュー入力によるブラッシュアップ
- 会話履歴を保持した連続深掘り分析
- AI自動プロジェクト命名（クリシェ回避）

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Installation

```bash
git clone https://github.com/BoxPistols/ai-strategic-brainstorm.git
cd ai-strategic-brainstorm
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173

### Build

```bash
npm run build
npm run preview
```

## Configuration

### Default (No API Key Required)

Anthropic Haiku 4.5がデフォルトで使用可能です（Claude.aiアーティファクト環境内）。

### External API Keys

スタンドアロン環境で使用する場合、設定パネルからAPIキーを入力：

| Provider | Key Format | 取得先 |
|----------|-----------|--------|
| Anthropic | `sk-ant-...` | https://console.anthropic.com |
| OpenAI | `sk-...` | https://platform.openai.com |
| Google AI | `AIza...` | https://aistudio.google.com |

> ⚠️ APIキーはlocalStorageに保存されません。セッションごとに入力が必要です。

## Project Structure

```
ai-strategic-brainstorm/
├── public/
│   └── favicon.svg
├── src/
│   ├── __tests__/             # テスト
│   │   └── parseAIJson.test.ts
│   ├── components/
│   │   ├── form/              # 入力フォーム（ProjectForm, IssueRow）
│   │   ├── layout/            # レイアウト（HeaderBar, ResultsPane）
│   │   ├── modals/            # モーダル（Settings, Log, Preview, Help）
│   │   ├── results/           # 結果表示（ResultCard, FeasibilityBar, RichText）
│   │   ├── support/           # サポートウィジェット
│   │   ├── tour/              # アプリツアー
│   │   └── ErrorBoundary.tsx
│   ├── constants/             # 定数・プロンプト・モデル定義・テーマ
│   ├── hooks/                 # カスタム Hooks（useAI, useBrainstormForm 等）
│   ├── styles/                # カスタム CSS
│   ├── types/                 # TypeScript 型定義
│   ├── utils/                 # ユーティリティ（JSON パース、レポート生成等）
│   ├── App.tsx                # メインアプリケーションコンポーネント
│   ├── main.tsx               # エントリポイント
│   └── index.css              # Tailwind インポート
├── api/                       # Vercel Serverless Functions
├── docs/                      # 仕様・設計ドキュメント
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── LICENSE
└── README.md
```

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool
- **Tailwind CSS 3** — Styling
- **Lucide React** — Icons
- **Anthropic / OpenAI / Google AI APIs** — LLM providers

## Data Privacy

- すべてのデータはブラウザのlocalStorageにのみ保存
- APIキーはメモリ内のみ（永続化なし）
- サーバーサイドのデータ収集なし
- 企業名の入力は不要（プロジェクト名で管理）

## License

MIT License — see [LICENSE](./LICENSE)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
