# Claude Code 包括ガイド

> 初めて触る人から設定を深く理解したい人まで、Claude Code の全体像を1つのドキュメントで把握する。
> 公式ドキュメント（[code.claude.com/docs](https://docs.anthropic.com/en/docs/claude-code)）に基づく。

---

## 目次

### Part I — 基礎
1. [Claude Code とは](#1-claude-code-とは)
2. [インストール・認証](#2-インストール認証)
3. [基本操作・セッション管理](#3-基本操作セッション管理)
4. [CLI リファレンス](#4-cli-リファレンス)

### Part II — 開発環境
5. [ターミナル設定](#5-ターミナル設定)
6. [IDE 統合 — VS Code / JetBrains](#6-ide-統合--vs-code--jetbrains)
7. [デスクトップアプリ・Web 版](#7-デスクトップアプリweb-版)
8. [キーボードショートカット](#8-キーボードショートカット)

### Part III — 設定・カスタマイズ
9. [設定ファイルの階層構造](#9-設定ファイルの階層構造)
10. [CLAUDE.md — プロジェクトルール](#10-claudemd--プロジェクトルール)
11. [パーミッション（権限管理）](#11-パーミッション権限管理)
12. [モデル選択・高速モード](#12-モデル選択高速モード)
13. [出力スタイル・ステータスライン](#13-出力スタイルステータスライン)
14. [メモリシステム](#14-メモリシステム)

### Part IV — 拡張機能
15. [ツール一覧](#15-ツール一覧)
16. [Hooks — 自動実行アクション](#16-hooks--自動実行アクション)
17. [Custom Skills — 再利用ワークフロー](#17-custom-skills--再利用ワークフロー)
18. [サブエージェント（Task ツール）](#18-サブエージェントtask-ツール)
19. [エージェントチーム](#19-エージェントチーム)
20. [MCP サーバー連携](#20-mcp-サーバー連携)
21. [Plugins — 拡張プラグイン](#21-plugins--拡張プラグイン)

### Part V — 自動化・CI/CD
22. [ヘッドレスモード](#22-ヘッドレスモード)
23. [GitHub Actions / GitLab CI/CD](#23-github-actions--gitlab-cicd)
24. [Slack / Chrome 連携](#24-slack--chrome-連携)

### Part VI — セキュリティ・運用
25. [セキュリティ・サンドボックス](#25-セキュリティサンドボックス)
26. [コスト管理・使用状況モニタリング](#26-コスト管理使用状況モニタリング)
27. [トラブルシューティング](#27-トラブルシューティング)

### Part VII — 実践
28. [ベストプラクティス](#28-ベストプラクティス)
29. [本プロジェクトの設定解説](#29-本プロジェクトの設定解説)

### Part VIII — 発展編
30. [仕様駆動開発（SDD）× AI エージェント](#30-仕様駆動開発sdd-ai-エージェント)

### [参考リンク](#参考リンク)

---

# Part I — 基礎

## 1. Claude Code とは

Claude Code は Anthropic が提供する **CLI ベースの AI コーディングアシスタント**。ターミナルで動作し、プロジェクト全体を理解した上でコードの読み書き・コマンド実行・Git 操作を自律的に行う。

### 他の AI ツールとの違い

| 特徴 | Claude Code | インライン補完ツール |
|------|-------------|---------------------|
| 対象範囲 | プロジェクト全体 | 開いているファイル |
| 動作方式 | エージェント型（自律判断） | 補完型（提案のみ） |
| コマンド実行 | ビルド・テスト・Git を直接実行 | 不可 |
| セッション | 会話を保存・再開可能 | なし |
| 拡張性 | Skills, Hooks, MCP, サブエージェント, Plugins | プラグイン程度 |

### エージェントループ

Claude Code は以下の3フェーズを **繰り返し自律的に** 実行する：

```
1. 情報収集 → ファイルを読む、コードを検索する
2. 実行     → コードを編集する、コマンドを実行する
3. 検証     → テストを実行する、ビルドして確認する
```

1回のやりとりで何十ものツールを連鎖的に使い、エラーが出れば自己修正する。

> 📖 公式: [Overview](https://docs.anthropic.com/en/docs/claude-code/overview)

---

## 2. インストール・認証

### インストール方法

**ネイティブインストール（推奨）:**

```bash
# macOS / Linux / WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex
```

`~/.local/bin/claude` にインストールされる。

**npm 経由:**

```bash
npm install -g @anthropic-ai/claude-code
```

Node.js 18+ が必要。

### 認証方式

| 方式 | 対象 | 特徴 |
|------|------|------|
| Claude Pro/Max/Teams | 個人・チーム | 月額定額、ブラウザ認証 |
| Anthropic API キー | 開発者 | 従量課金、`ANTHROPIC_API_KEY` 環境変数 |
| Amazon Bedrock | エンタープライズ | AWS 認証情報で接続 |
| Google Vertex AI | エンタープライズ | GCP 認証情報で接続 |
| Microsoft Foundry | エンタープライズ | Azure 認証情報で接続 |

```bash
# 起動してブラウザ認証
claude

# API キーで認証
export ANTHROPIC_API_KEY=sk-ant-...
claude

# ログアウト
claude logout
```

### 診断コマンド

```bash
# インストール・設定の診断
claude doctor
```

> 📖 公式: [Setup](https://docs.anthropic.com/en/docs/claude-code/setup), [Authentication](https://docs.anthropic.com/en/docs/claude-code/authentication)

---

## 3. 基本操作・セッション管理

### 起動

```bash
cd my-project
claude

# 初期プロンプト付き
claude "このプロジェクトの構成を説明して"
```

### 基本的な使い方

```
> この関数のバグを直して
> テストを書いて実行して
> このPRをレビューして
> git commit して push して
```

Claude は依頼を理解し、必要なファイルを読み、コードを修正し、テストを実行する。途中で許可を求められたら `y` / `n` で応答する。

### セッション管理

```bash
# 終了
Ctrl+C または /quit

# 直前のセッションを再開
claude --continue     # or -c

# セッション一覧から選択
claude --resume       # or -r

# 名前付きセッションを再開
claude --resume my-session

# セッション名を変更
/rename auth-refactor
```

### チェックポイント（/rewind）

Claude Code は **全てのファイル編集をチェックポイントとして自動記録** する。誤った変更を簡単に巻き戻せる。

```
Esc → Esc（ダブルタップ）  または  /rewind
```

| 操作 | 動作 |
|------|------|
| Restore code and conversation | コードと会話の両方を復元 |
| Restore conversation | 会話のみ復元（コードは現在のまま） |
| Restore code | コードのみ復元（会話は現在のまま） |
| Summarize from here | 選択地点以降をAI要約に圧縮 |

**注意:** Bash コマンドで変更されたファイル（`rm`, `mv` 等）はチェックポイントの追跡対象外。Git との併用が推奨。

### コンテキスト管理

```
/clear                   # コンテキストをリセット
/compact [テーマ]         # コンテキストを手動圧縮
/context                 # 使用量を表示
```

コンテキストウィンドウが溜まると精度が落ちるため、無関係なタスク間では `/clear` を推奨。

> 📖 公式: [Quickstart](https://docs.anthropic.com/en/docs/claude-code/quickstart), [Checkpointing](https://docs.anthropic.com/en/docs/claude-code/checkpointing)

---

## 4. CLI リファレンス

### 主要コマンド

| コマンド | 説明 |
|---------|------|
| `claude` | 対話型 REPL を起動 |
| `claude "query"` | 初期プロンプト付きで起動 |
| `claude -p "query"` | 非対話モードで実行して終了 |
| `cat file \| claude -p "query"` | パイプ入力を処理 |
| `claude -c` | 直前の会話を再開 |
| `claude -r "name"` | 名前付きセッションを再開 |
| `claude update` | 最新版に更新 |
| `claude agents` | 設定済みサブエージェント一覧 |
| `claude mcp` | MCP サーバー管理 |

### 主要フラグ

| フラグ | 説明 |
|-------|------|
| `-p`, `--print` | 非対話モード（ヘッドレス） |
| `-c`, `--continue` | 直前の会話を再開 |
| `-r`, `--resume` | セッション ID/名前で再開 |
| `--model` | モデル指定（`sonnet`, `opus`, `haiku`） |
| `--allowedTools` | 自動許可するツール |
| `--disallowedTools` | 無効化するツール |
| `--tools` | 利用可能ツールを制限 |
| `--output-format` | 出力形式（`text`, `json`, `stream-json`） |
| `--max-turns` | 最大ターン数（`-p` モード） |
| `--max-budget-usd` | 最大コスト上限（`-p` モード） |
| `--permission-mode` | パーミッションモード指定 |
| `--add-dir` | 追加の作業ディレクトリ |
| `-w`, `--worktree` | Git worktree で隔離起動 |
| `--verbose` | 詳細ログ出力 |
| `--debug` | デバッグモード（カテゴリ指定可） |
| `--json-schema` | JSON Schema に準拠した出力を取得 |
| `--fallback-model` | オーバーロード時のフォールバック |
| `--append-system-prompt` | システムプロンプトに追加 |
| `--system-prompt` | システムプロンプトを完全置換 |
| `--mcp-config` | MCP 設定ファイルを読み込み |
| `--plugin-dir` | プラグインディレクトリを指定 |
| `--agent` | カスタムエージェントを指定 |
| `--agents` | カスタムエージェントを JSON で定義 |
| `--chrome` | Chrome ブラウザ連携を有効化 |
| `--remote` | claude.ai でリモートセッションを作成 |
| `--teleport` | Web セッションをローカルに移行 |
| `--init-only` | 初期化 Hook のみ実行して終了 |
| `--dangerously-skip-permissions` | 全許可（隔離環境のみ） |

### システムプロンプトフラグの使い分け

| フラグ | 動作 | 推奨用途 |
|-------|------|---------|
| `--system-prompt` | デフォルトを**完全置換** | Claude の基本動作を変えたい場合 |
| `--append-system-prompt` | デフォルトに**追記** | 追加ルールのみ与えたい場合（推奨） |
| `--system-prompt-file` | ファイルから読み込み＆置換 | `-p` モードでの再現性確保 |
| `--append-system-prompt-file` | ファイルから読み込み＆追記 | `-p` モードでの追加ルール |

> 📖 公式: [CLI Reference](https://docs.anthropic.com/en/docs/claude-code/cli-reference)

---

# Part II — 開発環境

## 5. ターミナル設定

### 改行の入力

```
\ + Enter          どのターミナルでも改行
Shift + Enter       iTerm2, WezTerm, Ghostty, Kitty はネイティブ対応
/terminal-setup     VS Code, Alacritty 等で Shift+Enter を設定
```

### Vim モード

```
/vim     # 有効化（/config からも切替可能）
```

NORMAL / INSERT モード切替、`hjkl` 移動、`dw`/`cw`/`dd` 等の編集、`yy`/`p` コピペ、テキストオブジェクト（`iw`, `a"` 等）をサポート。

### 大量入力の取り扱い

ターミナルに長文を直接ペーストすると切り詰められる場合がある（特に VS Code ターミナル）。代わりにファイルに書き出して Claude に読ませる。

### 通知設定

iTerm2: Preferences → Profiles → Terminal → "Silence bell" を有効化 + "Send escape sequence-generated alerts"。

カスタム通知は Hooks で設定可能（[§16 参照](#16-hooks--自動実行アクション)）。

> 📖 公式: [Terminal Config](https://docs.anthropic.com/en/docs/claude-code/terminal-config)

---

## 6. IDE 統合 — VS Code / JetBrains

### VS Code 拡張

**インストール:** `Cmd+Shift+X` → "Claude Code" を検索 → Install（VS Code 1.98.0+ 必要）

**起動方法:**
- エディタ右上の Spark アイコン
- `Cmd+Shift+P` → "Claude Code"
- ステータスバーの "Claude Code"

**主なショートカット:**

| ショートカット | 動作 |
|--------------|------|
| `Cmd+Esc` / `Ctrl+Esc` | エディタ ↔ Claude にフォーカス移動 |
| `Option+K` / `Alt+K` | `@ファイル#行` 参照を挿入 |
| `Cmd+Shift+Esc` | 新しい会話をタブで開く |

**主な機能:**
- 選択テキストが自動的に Claude のコンテキストに含まれる
- `@` でファイル・フォルダをファジー参照
- サイドバイサイドの diff 表示で変更をレビュー
- `/plugins` でプラグイン管理

**拡張設定:**

| 設定 | デフォルト | 説明 |
|------|-----------|------|
| `useTerminal` | `false` | ターミナルモードで動作 |
| `initialPermissionMode` | `default` | 初期パーミッション |
| `autosave` | `true` | Claude の読み書き前に自動保存 |
| `useCtrlEnterToSend` | `false` | Enter → Ctrl+Enter に変更 |

### JetBrains プラグイン

**対応 IDE:** IntelliJ IDEA, PyCharm, Android Studio, WebStorm, PhpStorm, GoLand

**インストール:** JetBrains Marketplace → "Claude Code" → Install → IDE 再起動

**主なショートカット:**

| ショートカット | 動作 |
|--------------|------|
| `Cmd+Esc` / `Ctrl+Esc` | パネルにフォーカス |
| `Cmd+Option+K` / `Alt+Ctrl+K` | `@File#L1-99` 参照を挿入 |

**Escape キー問題の解決:**
Settings → Tools → Terminal → "Move focus to the editor with Escape" のチェックを外す。

### CLI ↔ IDE 連携

```bash
# CLI から IDE に接続
claude
/ide

# IDE の会話を CLI で続行
claude --resume
```

> 📖 公式: [VS Code](https://docs.anthropic.com/en/docs/claude-code/vs-code), [JetBrains](https://docs.anthropic.com/en/docs/claude-code/jetbrains)

---

## 7. デスクトップアプリ・Web 版

### Claude Desktop（Code タブ）

Claude Desktop アプリの **Code タブ** は Claude Code の GUI 版。CLI にはない追加機能がある：

- **ビジュアル diff レビュー** — インラインコメント付き
- **ライブプレビュー** — dev サーバーを起動して埋め込みブラウザで確認
- **PR モニタリング** — CI ステータス監視、自動修正、自動マージ
- **並列セッション** — 各セッションが自動で Git worktree 分離
- **コネクター** — GitHub, Slack, Linear, Notion 等との統合
- **SSH セッション** — リモートマシンでの実行

**ライブプレビュー設定（`.claude/launch.json`）:**
```json
{
  "version": "0.0.1",
  "configurations": [{
    "name": "my-app",
    "runtimeExecutable": "npm",
    "runtimeArgs": ["run", "dev"],
    "port": 3000
  }]
}
```

### Web 版（claude.ai/code）

ブラウザから [claude.ai/code](https://claude.ai/code) でアクセス。Anthropic のクラウド VM 上で動作し、ローカル環境のセットアップ不要。GitHub リポジトリ接続が必要。

**ローカルとの使い分け:**

| 用途 | ローカル（CLI/Desktop） | Web 版 |
|------|----------------------|--------|
| 既存プロジェクトの開発 | ○ | △（GitHub 経由） |
| 環境セットアップ不要 | × | ○ |
| リアルタイムの対話 | ○ | ○ |
| PR の作成・レビュー | ○ | ○ |
| オフライン作業 | ○ | × |

> 📖 公式: [Desktop](https://docs.anthropic.com/en/docs/claude-code/desktop), [Claude Code on the Web](https://docs.anthropic.com/en/docs/claude-code/claude-code-on-the-web)

---

## 8. キーボードショートカット

| ショートカット | 動作 |
|--------------|------|
| `Esc` | Claude の動作を中断 |
| `Esc` x 2 | Rewind メニュー（変更を巻き戻し） |
| `Shift+Tab` | パーミッションモード切替 |
| `Tab` | 自動補完 |
| `@` | ファイル・リソース参照 |
| `Ctrl+C` | 終了 |
| `Ctrl+G` | Plan Mode のプランをエディタで開く |

キーバインドは `~/.claude/keybindings.json` でカスタマイズ可能。

> 📖 公式: [Keybindings](https://docs.anthropic.com/en/docs/claude-code/keybindings)

---

# Part III — 設定・カスタマイズ

## 9. 設定ファイルの階層構造

Claude Code の設定は**階層的に適用**される。上位が優先。

```
優先度: 高 ← → 低

管理者設定（組織） > CLI引数 > ローカル設定 > 共有設定 > ユーザー設定
```

### 設定ファイル一覧

| ファイル | スコープ | Git管理 | 用途 |
|---------|---------|--------|------|
| `managed-settings.json` | 組織全体 | 管理者が配布 | セキュリティポリシー |
| `~/.claude/settings.json` | 全プロジェクト共通 | しない | 個人の全体設定 |
| `.claude/settings.json` | プロジェクト | **する** | チーム共有設定 |
| `.claude/settings.local.json` | プロジェクト（個人） | しない（.gitignore） | 個人のプロジェクト設定 |

### 設定ファイルの使い分け

```
チーム全員に適用したいルール
  → .claude/settings.json（Git管理）

自分だけの設定（API キー参照など）
  → .claude/settings.local.json

全プロジェクト共通の個人設定
  → ~/.claude/settings.json
```

### 管理者設定ファイルの場所

| OS | パス |
|---|------|
| macOS | `/Library/Application Support/ClaudeCode/` |
| Linux/WSL | `/etc/claude-code/` |
| Windows | `C:\Program Files\ClaudeCode\` |

> 📖 公式: [Settings](https://docs.anthropic.com/en/docs/claude-code/settings)

---

## 10. CLAUDE.md — プロジェクトルール

CLAUDE.md は **Claude にプロジェクトのルールを伝えるファイル**。セッション開始時に自動で読み込まれる。

### 配置場所と優先度

| 場所 | スコープ | Git管理 | 読み込みタイミング |
|------|---------|--------|-------------------|
| `~/.claude/CLAUDE.md` | 個人・全プロジェクト | しない | 常に |
| `CLAUDE.md`（プロジェクトルート） | プロジェクト | **する** | 常に |
| `.claude/CLAUDE.md` | プロジェクト | **する** | 常に |
| `.claude/CLAUDE.local.md` | 個人・プロジェクト | しない | 常に |
| `~/.claude/projects/<path>/CLAUDE.md` | 個人・特定プロジェクト | しない | 常に |
| サブディレクトリの `CLAUDE.md` | ディレクトリ限定 | **する** | そのディレクトリを参照時 |

### 書き方のコツ

**書くべきもの:**
- ビルド・テストコマンド（Claude が推測できないもの）
- コードスタイル（デフォルトと異なる場合のみ）
- Git ワークフロー（ブランチ命名、コミット規約）
- アーキテクチャの重要な判断
- ハマりやすいポイント

**書くべきでないもの:**
- 言語の標準的な慣習（Claude は既に知っている）
- ファイルごとの詳細な説明（コードから読み取れる）
- 長大な API ドキュメント（リンクで十分）
- 頻繁に変わる情報

**強調:** 重要なルールには `IMPORTANT:` や `YOU MUST` を使うと遵守率が上がる。

**500行以下を推奨。** 長くなる場合は Skills に移行する。

### 実例

```markdown
# プロジェクトルール

## ビルド・テスト
- ビルド: `npm run build`
- テスト: `npm test`（単体） / `npm run test:all`（全体）
- 型チェック: `npx tsc --noEmit`

## Git
- ブランチ命名: `feature/説明` or `fix/説明`
- コミット: conventional commit（feat:, fix:, refactor:）
- main への直接 push 禁止
```

### ファイル参照（@構文）

CLAUDE.md から他のファイルを参照できる：

```markdown
プロジェクト概要は @README.md を参照。
Git ルールは @docs/git-workflow.md に従う。
```

### モジュラールール（.claude/rules/）

大規模プロジェクトでは、ルールをファイルに分割できる：

```
.claude/rules/
├── code-style.md
├── testing.md
├── security.md
└── frontend/
    ├── react.md
    └── styles.md
```

パス条件付きで読み込みを制御：

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API ルール
- 全エンドポイントにバリデーションを含める
```

> 📖 公式: [Memory (CLAUDE.md)](https://docs.anthropic.com/en/docs/claude-code/memory)

---

## 11. パーミッション（権限管理）

### 仕組み

Claude がツールを使う際、**危険度に応じて許可を求める**：

| ツール種別 | 例 | 自動実行 |
|-----------|---|---------|
| 読み取り専用 | ファイル読み込み、Grep | 許可不要 |
| コマンド実行 | Bash | 初回に許可が必要 |
| ファイル変更 | Edit, Write | セッション内で許可が必要 |

### パーミッションモード

`Shift+Tab` で切り替え：

| モード | 動作 |
|-------|------|
| `default` | 都度確認 |
| `acceptEdits` | ファイル編集を自動許可 |
| `plan` | 読み取り専用（Plan Mode） |
| `bypassPermissions` | 全許可（隔離環境のみ推奨） |

### 許可ルールの書き方

`.claude/settings.json` や `settings.local.json` に記述：

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npm test)",
      "Bash(git commit *)",
      "Bash(git push *)",
      "Read"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Edit(.env*)"
    ]
  }
}
```

### パターン構文

```
Tool                    → そのツール全体を許可/拒否
Tool(パターン)           → パターンに一致する場合のみ
Bash(npm run *)         → npm run で始まるコマンド
Edit(/src/**/*.ts)      → src 配下の .ts ファイルの編集
WebFetch(domain:*.com)  → 特定ドメインへのアクセス
mcp__server__*          → MCP サーバーのツール全体
```

### 評価順序

**deny > ask > allow** — deny が常に最優先。

> 📖 公式: [Permissions](https://docs.anthropic.com/en/docs/claude-code/permissions)

---

## 12. モデル選択・高速モード

### 利用可能なモデル

| エイリアス | モデル | 特徴 |
|-----------|-------|------|
| `sonnet` | Claude Sonnet 4.6 | コーディングのバランス型（デフォルト） |
| `opus` | Claude Opus 4.6 | 高度な推論力（Pro/Max/Teams） |
| `haiku` | Claude Haiku 4.5 | 高速・低コスト |

### 切り替え方法

```bash
# セッション中
/model opus

# 起動時
claude --model opus

# 環境変数
export ANTHROPIC_MODEL=opus
```

### ハイブリッドモード

```bash
/model opusplan
```

Plan Mode では Opus、通常コーディングでは Sonnet を自動切替。

### 拡張コンテキスト（100万トークン）

```bash
/model sonnet[1m]
```

大規模リポジトリや長いセッション向け。200K トークン以降は長文コンテキスト料金が適用。

### 高速モード（Fast Mode）

```
/fast    # Toggle で有効化/無効化
```

Claude Opus 4.6 の **2.5倍高速** な設定。モデルは同一だが、速度優先の API 構成で動作する。

| モード | 特徴 | 推奨用途 |
|-------|------|---------|
| 高速モード | 低レイテンシ、高コスト | ライブデバッグ、高速イテレーション |
| 通常モード | 標準速度、標準コスト | 長時間の自律タスク、CI/CD |

**注意:** Bedrock / Vertex AI / Foundry では利用不可。セッション途中で有効化するとキャッシュ未適用の入力トークン全額が課金されるため、セッション開始時の有効化を推奨。

> 📖 公式: [Model Config](https://docs.anthropic.com/en/docs/claude-code/model-config), [Fast Mode](https://docs.anthropic.com/en/docs/claude-code/fast-mode)

---

## 13. 出力スタイル・ステータスライン

### 出力スタイル

Claude Code の応答フォーマットをカスタマイズできる。

```
/output-style              # メニューから選択
/output-style explanatory  # 直接指定
```

**組み込みスタイル:**

| スタイル | 特徴 |
|---------|------|
| Default | 標準的なソフトウェアエンジニアリング向け |
| Explanatory | 実装の選択理由を解説する「Insights」を挟む |
| Learning | 協調学習モード。`TODO(human)` マーカーでユーザーに実装を促す |

**カスタムスタイルの作成:**

`~/.claude/output-styles/` または `.claude/output-styles/` に Markdown ファイルを配置：

```markdown
---
name: My Style
description: カスタムスタイルの説明
keep-coding-instructions: false
---

# カスタム指示

ここに Claude の動作を定義...
```

`keep-coding-instructions: false`（デフォルト）で、ソフトウェアエンジニアリング向けのデフォルト指示が除外される。

### 出力スタイル vs CLAUDE.md vs --append-system-prompt

| 手段 | 効果 | 用途 |
|------|------|------|
| 出力スタイル | デフォルトのシステムプロンプトを**変更** | 応答フォーマット・トーンの変更 |
| CLAUDE.md | システムプロンプトの後にユーザーメッセージとして**追加** | プロジェクトルール |
| `--append-system-prompt` | システムプロンプトに**追記** | 一時的な追加ルール |

### ステータスライン

セッション中に表示される情報行。`/config` からカスタマイズ可能。

> 📖 公式: [Output Styles](https://docs.anthropic.com/en/docs/claude-code/output-styles), [Statusline](https://docs.anthropic.com/en/docs/claude-code/statusline)

---

## 14. メモリシステム

### 2種類のメモリ

| 種類 | 場所 | 内容 | 管理者 |
|------|------|------|--------|
| CLAUDE.md | プロジェクト内 | ルール・指示 | ユーザーが書く |
| Auto Memory | `~/.claude/projects/<path>/memory/` | Claude の学習記録 | Claude が自動更新 |

### Auto Memory の構造

```
~/.claude/projects/<project-path>/memory/
├── MEMORY.md       # 毎セッション読み込み（200行まで）
├── debugging.md    # トピック別の詳細メモ
└── patterns.md     # 発見したパターン
```

**MEMORY.md に保存すべきもの:**
- 複数セッションで確認された安定したパターン
- 重要なアーキテクチャ決定
- ユーザーのワークフロー嗜好
- 再発する問題の解決策

**保存すべきでないもの:**
- セッション固有の一時的な情報
- 未検証の推測
- CLAUDE.md と重複する内容

> 📖 公式: [Memory](https://docs.anthropic.com/en/docs/claude-code/memory)

---

# Part IV — 拡張機能

## 15. ツール一覧

Claude Code が使えるツールの全体像：

### ファイル操作

| ツール | 用途 |
|-------|------|
| **Read** | ファイル読み込み（画像・PDF も可） |
| **Edit** | ファイルの部分的な修正 |
| **Write** | ファイルの新規作成・上書き |
| **NotebookEdit** | Jupyter ノートブックの編集 |

### 検索

| ツール | 用途 |
|-------|------|
| **Glob** | ファイル名パターンで検索（`**/*.ts`） |
| **Grep** | ファイル内容を正規表現で検索 |

### 実行

| ツール | 用途 |
|-------|------|
| **Bash** | シェルコマンドの実行 |

### Web

| ツール | 用途 |
|-------|------|
| **WebFetch** | URL からコンテンツ取得 |
| **WebSearch** | Web 検索 |

### オーケストレーション

| ツール | 用途 |
|-------|------|
| **Task** | サブエージェントの起動 |
| **AskUserQuestion** | ユーザーへの質問 |
| **EnterPlanMode** | Plan Mode への移行 |
| **TaskCreate/Update/List/Get** | タスク管理 |
| **Skill** | スキルの実行 |
| **EnterWorktree** | Git worktree での隔離作業 |

> 📖 公式: [Features Overview](https://docs.anthropic.com/en/docs/claude-code/features-overview)

---

## 16. Hooks — 自動実行アクション

### Hooks とは

Hooks は Claude Code のライフサイクルの特定タイミングで **確実に実行されるシェルコマンド**。CLAUDE.md のルールは「お願い」だが、Hooks は「強制」。

### イベント一覧

| イベント | 発火タイミング |
|---------|-------------|
| `SessionStart` | セッション開始時 |
| `UserPromptSubmit` | ユーザー入力処理前 |
| `PreToolUse` | ツール実行前（ブロック可能） |
| `PostToolUse` | ツール実行成功後 |
| `PostToolUseFailure` | ツール実行失敗後 |
| `Notification` | Claude が注意を求める時 |
| `Stop` | Claude が応答完了時 |
| `PreCompact` | コンテキスト圧縮前 |
| `SubagentStop` | サブエージェント完了時 |
| `TeammateIdle` | チームメイトがアイドル状態になった時 |
| `TaskCompleted` | タスクが完了マークされた時 |
| `ConfigChange` | 設定変更時 |
| `SessionEnd` | セッション終了時 |

### 設定例

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsc --noEmit --pretty 2>&1 | head -20"
          }
        ]
      }
    ]
  }
}
```

この設定は **ファイル編集のたびに型チェックを自動実行** する。

### Hook の種類

| 種類 | 説明 | 用途 |
|------|------|------|
| `command` | シェルコマンド | フォーマッター、バリデーション |
| `prompt` | Haiku による判定 | 完了チェック、品質ゲート |
| `agent` | サブエージェント | テスト実行、複雑な検証 |

### ブロック機能（PreToolUse）

`PreToolUse` Hook で **exit code 2** を返すとアクションをブロックできる：

```bash
#!/bin/bash
# .claude/hooks/protect-main.sh
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q "git push.*main"; then
  echo "main への直接 push はブロックされました" >&2
  exit 2  # ブロック
fi
exit 0  # 許可
```

### 実用的な Hook パターン

**編集後に自動フォーマット:**
```json
{
  "PostToolUse": [{
    "matcher": "Edit|Write",
    "hooks": [{"type": "command", "command": "npx prettier --write $FILE_PATH"}]
  }]
}
```

**デスクトップ通知（macOS）:**
```json
{
  "Notification": [{
    "matcher": "",
    "hooks": [{"type": "command", "command": "osascript -e 'display notification \"Claude Code\" with title \"入力待ち\"'"}]
  }]
}
```

> 📖 公式: [Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks), [Hooks Guide](https://docs.anthropic.com/en/docs/claude-code/hooks-guide)

---

## 17. Custom Skills — 再利用ワークフロー

### Skills とは

Skills は **再利用可能なワークフローをコマンド1つで呼び出す仕組み**。`/skill-name` で実行。

CLAUDE.md との違い：
- **CLAUDE.md**: 毎セッション読み込み、広く適用（500行以下推奨）
- **Skills**: 必要時にオンデマンドで読み込み、特定タスクに特化

### 作成方法

```
.claude/skills/<skill名>/SKILL.md
```

#### 基本例: /push

```markdown
# Push Skill

1. `git status` で変更を確認
2. conventional commit メッセージを作成
3. main にいる場合はブランチ作成を促す
4. ステージング → コミット → プッシュ
5. オープン PR があれば説明を更新
```

### 配置場所

| 場所 | スコープ |
|------|---------|
| `~/.claude/skills/<name>/SKILL.md` | 個人・全プロジェクト |
| `.claude/skills/<name>/SKILL.md` | プロジェクト（Git管理） |

### フロントマター（メタデータ）

```yaml
---
name: deploy
description: 本番デプロイを実行する
disable-model-invocation: true
---
```

| フィールド | 説明 |
|-----------|------|
| `name` | スキル名 |
| `description` | Claude が自動判断するための説明 |
| `disable-model-invocation` | true で `/名前` でのみ呼び出し可能に |
| `user-invocable` | false で `/` メニューから非表示 |
| `context` | `fork` でサブエージェントとして実行 |

### 変数置換

```markdown
GitHub Issue $ARGUMENTS を修正:
1. `gh issue view $0` で内容を確認
2. 実装
3. テスト
```

`/fix-issue 42` → `$ARGUMENTS` = "42", `$0` = "42"

> 📖 公式: [Skills](https://docs.anthropic.com/en/docs/claude-code/skills)

---

## 18. サブエージェント（Task ツール）

### サブエージェントとは

Task ツールで起動される **独立したエージェント**。メインの会話とは別のコンテキストで動作するため、メインのコンテキストを消費しない。

### 組み込みエージェント

| 種類 | モデル | ツール | 用途 |
|------|-------|-------|------|
| **Explore** | Haiku（高速） | 読み取り専用 | コードベースの探索・検索 |
| **Plan** | メインと同じ | 読み取り専用 | 設計・計画の立案 |
| **general-purpose** | メインと同じ | 全ツール | 複雑なマルチステップタスク |
| **Bash** | メインと同じ | Bash のみ | コマンド実行 |

### カスタムエージェントの作成

`.claude/agents/<name>.md` に配置：

```markdown
---
name: security-reviewer
description: セキュリティ観点でコードをレビュー
tools: Read, Grep, Glob
model: opus
---

セキュリティの専門家として、コードを以下の観点でレビュー:
- XSS, SQLインジェクション
- 認証・認可の漏れ
- 機密情報の露出
```

### 使い分けの指針

**サブエージェントを使う場合:**
- 大量の出力が出る作業（テスト実行、ログ解析）
- メインのコンテキストを節約したい
- 並列で複数の作業を同時実行したい

**メイン会話で行う場合:**
- 頻繁なやりとりが必要
- 短時間で完了する作業

> 📖 公式: [Sub-agents](https://docs.anthropic.com/en/docs/claude-code/sub-agents)

---

## 19. エージェントチーム

### 概要

**実験的機能**。1つのセッション（チームリーダー）から複数の Claude Code インスタンス（チームメイト）を生成し、並列に作業させる。各チームメイトは独立したコンテキストウィンドウを持ち、共有タスクリストと相互メッセージングで協調する。

### 有効化

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### サブエージェント vs エージェントチーム

| | サブエージェント | エージェントチーム |
|---|---|---|
| コンテキスト | 結果だけメインに返す | 完全に独立 |
| コミュニケーション | メインにのみ報告 | チームメイト同士で直接通信 |
| 調整方式 | メインが全体を管理 | 共有タスクリストで自己調整 |
| 適した用途 | 結果だけ必要な単発タスク | 議論・協調が必要な複雑な作業 |
| トークンコスト | 低い | 高い（各チームメイト = 別インスタンス） |

### 使い方

```
PR #142 をレビューするチームを作って。
- セキュリティ担当
- パフォーマンス担当
- テストカバレッジ担当
```

**操作:**
- `Shift+Down` — チームメイト間を移動
- `Ctrl+T` — タスクリスト表示
- 表示モード: `in-process`（1ターミナル）/ `tmux` / `iTerm2`（分割ペイン）

### 品質ゲート Hook

- **TeammateIdle** — チームメイトがアイドル状態になった時に実行。exit code 2 でフィードバックを送り作業続行を指示
- **TaskCompleted** — タスク完了時に実行。exit code 2 で完了を差し戻し

### 注意事項

- トークン消費は通常セッションの約 **7倍**
- チームは小さく保つ（各チームメイトに5-6タスクが理想）
- ファイル競合を避けるため、各チームメイトに異なるファイルを担当させる
- セッション再開時に in-process チームメイトは復元されない

> 📖 公式: [Agent Teams](https://docs.anthropic.com/en/docs/claude-code/agent-teams)

---

## 20. MCP サーバー連携

### MCP（Model Context Protocol）とは

AI ツールを外部サービスに接続するオープン標準。Claude Code に DB クエリ、GitHub 操作、Slack 通知などの能力を追加できる。

### サーバーの追加

```bash
# HTTP サーバー
claude mcp add --transport http github https://api.githubcopilot.com/mcp/

# ローカルサーバー
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub --dsn "postgresql://..."

# 認証付き
claude mcp add --transport http api --header "Authorization: Bearer TOKEN" https://api.example.com/mcp
```

### 管理コマンド

```bash
claude mcp list       # 一覧
claude mcp get name   # 詳細
claude mcp remove name # 削除
```

セッション内では `/mcp` で対話的に管理可能。

### インストールスコープ

| スコープ | ファイル | 用途 |
|---------|---------|------|
| ローカル | `~/.claude.json` | 個人・現在のプロジェクト |
| プロジェクト | `.mcp.json` | チーム共有 |
| ユーザー | `~/.claude.json` | 個人・全プロジェクト |

### コスト削減のヒント

MCP サーバーは使われていなくてもツール定義がコンテキストを消費する。`/context` で確認し、不要なサーバーは `/mcp` で無効化する。ツール定義がコンテキストの10%を超えると自動的にオンデマンド読み込みに切り替わる。

> 📖 公式: [MCP](https://docs.anthropic.com/en/docs/claude-code/mcp)

---

## 21. Plugins — 拡張プラグイン

### Plugins とは

Skills, Hooks, サブエージェント, MCP サーバーを **パッケージとして配布・インストール** できる仕組み。

### Plugins vs スタンドアロン（.claude/ ディレクトリ）

| アプローチ | コマンド名 | 適した用途 |
|-----------|-----------|-----------|
| スタンドアロン | `/hello` | 個人・プロジェクト固有 |
| Plugin | `/plugin-name:hello` | 共有・配布・バージョン管理 |

### Plugin の構造

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json         # マニフェスト（必須）
├── skills/                 # スキル
│   └── review/SKILL.md
├── agents/                 # カスタムエージェント
├── hooks/
│   └── hooks.json          # Hook 定義
├── .mcp.json               # MCP サーバー設定
├── .lsp.json               # LSP サーバー設定
└── settings.json           # デフォルト設定
```

### マニフェスト（plugin.json）

```json
{
  "name": "my-plugin",
  "description": "プラグインの説明",
  "version": "1.0.0",
  "author": { "name": "Author Name" }
}
```

### インストール

```bash
# テスト用（ローカルディレクトリから）
claude --plugin-dir ./my-plugin

# セッション内でマーケットプレイスから
/plugins
```

インストールスコープ: ユーザー / プロジェクト / ローカル（リポジトリのみ）

### マーケットプレイス

VS Code の `/plugins` → Marketplaces タブから GitHub リポジトリ URL を追加してプラグインを検索・インストールできる。

> 📖 公式: [Plugins](https://docs.anthropic.com/en/docs/claude-code/plugins), [Plugins Reference](https://docs.anthropic.com/en/docs/claude-code/plugins-reference)

---

# Part V — 自動化・CI/CD

## 22. ヘッドレスモード

### 基本的な使い方

`-p` フラグで非対話的に実行：

```bash
claude -p "src/auth.ts のバグを修正して"
```

### オプション

```bash
# ツールの自動許可
claude -p "テストを実行して修正" --allowedTools "Bash,Read,Edit"

# JSON 出力
claude -p "関数一覧を抽出" --output-format json

# JSON Schema で構造化出力
claude -p "APIエンドポイント一覧" --json-schema '{"type":"object",...}'

# モデル指定
claude -p "レビューして" --model opus

# コスト上限
claude -p "リファクタリング" --max-budget-usd 5.00

# ターン数制限
claude -p "テスト修正" --max-turns 10

# フォールバックモデル
claude -p "分析して" --fallback-model sonnet

# セッション継続
claude -p "続きをやって" --resume SESSION_ID
```

### 出力形式

| 形式 | 用途 |
|------|------|
| `text` | 人間が読むテキスト（デフォルト） |
| `json` | プログラム処理用 JSON |
| `stream-json` | リアルタイムストリーミング JSON |

### バッチ処理の例

```bash
# ファイル群を並列処理
for file in $(cat files.txt); do
  claude -p "Migrate $file to TypeScript" \
    --allowedTools "Edit,Bash(git commit *)"
done
```

> 📖 公式: [Headless](https://docs.anthropic.com/en/docs/claude-code/headless)

---

## 23. GitHub Actions / GitLab CI/CD

### GitHub Actions

Claude Agent SDK をベースにした公式アクション。PR や Issue で `@claude` をメンションすると Claude が応答する。

**セットアップ:**

```bash
# CLI から自動設定
/install-github-app
```

**手動設定:**
1. [GitHub App](https://github.com/apps/claude) をインストール
2. `ANTHROPIC_API_KEY` をリポジトリ Secrets に追加
3. ワークフローファイルを作成

**基本ワークフロー:**

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

**スキルを使ったレビュー:**

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt: "/review"
    claude_args: "--max-turns 5"
```

**定時実行:**

```yaml
on:
  schedule:
    - cron: "0 9 * * *"
# ...
    prompt: "昨日のコミットとオープン Issue のサマリを生成"
```

### 主要パラメータ

| パラメータ | 説明 |
|-----------|------|
| `prompt` | 指示テキストまたはスキル名（`/review`） |
| `claude_args` | CLI フラグ（`--max-turns`, `--model` 等） |
| `anthropic_api_key` | API キー（Secrets 経由） |
| `trigger_phrase` | トリガーフレーズ（デフォルト: `@claude`） |
| `use_bedrock` | AWS Bedrock を使用 |
| `use_vertex` | Google Vertex AI を使用 |

### GitLab CI/CD

同様の構成で GitLab CI/CD パイプラインからも実行可能。`claude -p` をジョブステップとして呼び出す。

> 📖 公式: [GitHub Actions](https://docs.anthropic.com/en/docs/claude-code/github-actions), [GitLab CI/CD](https://docs.anthropic.com/en/docs/claude-code/gitlab-ci-cd)

---

## 24. Slack / Chrome 連携

### Slack 連携

Slack で `@Claude` をメンションすると、コーディング意図を検知して [claude.ai/code](https://claude.ai/code) 上に Claude Code セッションを自動作成する。

**前提条件:**
- Claude Pro/Max/Teams/Enterprise プラン
- Claude Code on the Web が有効
- GitHub アカウント接続済み

**セットアップ:**
1. [Slack App Marketplace](https://slack.com/marketplace/A08SF47R6P4) から Claude App をインストール
2. App Home タブで Claude アカウントに接続
3. claude.ai/code で GitHub リポジトリを認証
4. ルーティングモードを選択（Code only / Code + Chat）
5. チャンネルに `/invite @Claude`

**フロー:** Slack でメンション → Claude Code セッション作成 → 進捗を Slack スレッドに投稿 → 完了通知 + PR 作成ボタン

### Chrome 連携

[Claude in Chrome 拡張](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) をインストールし、`@browser` で参照：

```
@browser localhost:3000 を開いてコンソールエラーを確認して
```

ブラウザのログイン状態を共有するため、認証済みページの操作も可能。

```bash
# CLI 起動時に有効化
claude --chrome
```

> 📖 公式: [Slack](https://docs.anthropic.com/en/docs/claude-code/slack), [Chrome](https://docs.anthropic.com/en/docs/claude-code/chrome)

---

# Part VI — セキュリティ・運用

## 25. セキュリティ・サンドボックス

### セキュリティの基本方針

- デフォルトで**読み取り専用**権限
- ファイル編集・コマンド実行時に**明示的な許可**を要求
- 作業ディレクトリとそのサブフォルダのみ**書き込み可能**
- `curl`, `wget` 等のリスクのあるコマンドはデフォルトでブロック

### プロンプトインジェクション対策

- パーミッションシステムで機密操作に承認を要求
- コンテキスト分析で有害な指示を検出
- 入力サニタイズでコマンドインジェクションを防止
- Web Fetch は分離されたコンテキストウィンドウで処理
- 不審な Bash コマンドは allowlist 設定済みでも手動承認を要求

### サンドボックス

サンドボックスは **OS レベルのファイルシステム・ネットワーク隔離** を提供する。

```
/sandbox    # サンドボックスメニューを開く
```

| OS | 技術 |
|---|------|
| macOS | Seatbelt |
| Linux/WSL2 | bubblewrap |

**前提条件（Linux/WSL2）:**
```bash
sudo apt-get install bubblewrap socat
```

**2つのモード:**

| モード | 動作 |
|-------|------|
| Auto-allow | サンドボックス内のコマンドを自動許可 |
| Regular | すべてのコマンドに通常の許可フローを適用 |

**重要:** 効果的なサンドボックスにはファイルシステム隔離と**ネットワーク隔離の両方**が必要。片方だけではデータ流出や悪意あるスクリプトのダウンロードを防げない。

### クラウド実行のセキュリティ

- 隔離された仮想マシンでセッション実行
- ネットワークアクセスはデフォルトで制限
- 認証はスコープ付きクレデンシャルによるセキュアプロキシ
- Git push は現在のブランチのみに制限
- セッション完了後に環境を自動クリーンアップ

> 📖 公式: [Security](https://docs.anthropic.com/en/docs/claude-code/security), [Sandboxing](https://docs.anthropic.com/en/docs/claude-code/sandboxing)

---

## 26. コスト管理・使用状況モニタリング

### コストの目安

| 指標 | 金額 |
|------|------|
| 開発者あたり平均 | $6/日 |
| 90パーセンタイル | $12/日 以下 |
| 月平均 | $100-200/月（Sonnet 4.6 ベース） |

### コストの確認

```
/cost     # API ユーザー向け — セッションのトークン使用量を表示
/stats    # Pro/Max サブスクリプション向け
```

### トークン削減の戦略

**コンテキスト管理:**
- `/clear` でタスク間をリセット
- `/compact 要約のフォーカス` で手動圧縮
- CLAUDE.md を500行以下に保ち、長い指示は Skills に移行

**モデルの使い分け:**
- 大半のタスクは Sonnet（安価）、複雑なアーキテクチャ判断は Opus
- サブエージェントには `model: haiku` を指定

**MCP サーバーの最適化:**
- 未使用サーバーは `/mcp` で無効化
- ツール定義がコンテキストの10%を超えると自動オンデマンド化
- CLI ツール（`gh`, `aws`, `gcloud`）のほうがコンテキスト効率が高い

**拡張思考（Extended Thinking）の調整:**
- デフォルト有効（31,999トークン）。思考トークンは出力トークンとして課金
- 簡単なタスク: `/config` で無効化、または `MAX_THINKING_TOKENS=8000`

**サブエージェントの活用:**
- テスト実行やログ解析など大量出力はサブエージェントに委譲
- 結果の要約のみメインコンテキストに返る

### 使用状況モニタリング（OpenTelemetry）

組織全体の使用状況を追跡するには OTel テレメトリをエクスポートする。

```bash
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

**主要メトリクス:**

| メトリクス | 説明 |
|-----------|------|
| `claude_code.session.count` | セッション数 |
| `claude_code.lines_of_code.count` | 変更行数 |
| `claude_code.cost.usage` | セッションコスト（USD） |
| `claude_code.token.usage` | トークン使用量 |
| `claude_code.commit.count` | コミット数 |
| `claude_code.pull_request.count` | PR 作成数 |

管理者は `managed-settings.json` の `env` で全社的にテレメトリを有効化できる。

> 📖 公式: [Costs](https://docs.anthropic.com/en/docs/claude-code/costs), [Monitoring Usage](https://docs.anthropic.com/en/docs/claude-code/monitoring-usage)

---

## 27. トラブルシューティング

### インストール問題

| 症状 | 対処 |
|------|------|
| WSL で OS/platform エラー | `npm config set os linux` または `--force --no-os-check` |
| WSL で Node not found | nvm を Linux 側でインストール |
| Linux/Mac で permission denied | ネイティブインストール推奨: `curl -fsSL https://claude.ai/install.sh \| bash` |
| Windows で "requires git-bash" | Git for Windows をインストール |

### 認証問題

```bash
# 認証のリセット
/logout
# ターミナルを閉じて再起動
claude
# ブラウザが開かない場合
# → c を押して OAuth URL をコピー
# 問題が続く場合
rm -rf ~/.config/claude-code/auth.json && claude
```

### パフォーマンス問題

| 症状 | 対処 |
|------|------|
| CPU/メモリ使用量が高い | `/compact` でコンテキスト縮小、タスク間で再起動 |
| コマンドがハングする | `Ctrl+C` で中断、端末を閉じて再起動 |
| 検索が遅い/見つからない | ripgrep をシステムインストール + `USE_BUILTIN_RIPGREP=0` |
| WSL で検索が遅い | プロジェクトを Linux ファイルシステム（`/home/`）に移動 |

### IDE 固有の問題

| 症状 | 対処 |
|------|------|
| JetBrains で IDE が検出されない | プラグイン有効確認、IDE 再起動、WSL はネットワーク設定確認 |
| JetBrains で Escape が効かない | Settings → Tools → Terminal → "Move focus..." のチェックを外す |
| VS Code で Spark アイコンが見えない | ファイルを開く、VS Code バージョン確認、リロード |

### 診断コマンド

```bash
/doctor    # インストール、設定、MCP、プラグイン等を診断
/bug       # 問題報告
```

> 📖 公式: [Troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)

---

# Part VII — 実践

## 28. ベストプラクティス

### 核心原則

ほとんどのベストプラクティスは1つの制約に基づく：**コンテキストウィンドウは急速に埋まり、埋まると性能が低下する。**

### 1. 検証手段を必ず提供する

Claude に「完了」を判断させる基準を与える：

```
悪い例: メール検証関数を書いて
良い例: validateEmail 関数を書いて。
       test@example.com → true, invalid → false, @.com → false
       テスト実行して確認して。
```

UI 変更の場合はスクリーンショットを貼り、結果と比較させる。

### 2. 探索 → 計画 → 実行 → コミット

```
1. Plan Mode で調査（Shift+Tab でファイル変更なし）
2. 実装計画を確認（Ctrl+G でエディタで表示）
3. 通常モードで実装
4. テスト・コミット
```

スコープが明確で小さな修正はスキップ可。

### 3. 具体的に指示する

```
曖昧: ログインのバグを直して
具体的: セッションタイムアウト後にログインできないバグを修正。
       src/auth/ を確認、特にトークンリフレッシュ周り。
       再現テストを書いてから修正して。
```

**リッチコンテンツの活用:**
- `@` でファイルを参照
- 画像を直接貼り付け
- URL を提供（`/permissions` でドメインを許可）
- パイプ: `cat error.log | claude`

### 4. 制約を先に伝える

```
X を修正して。制約:
1. ローカルでテストしてから push
2. Storybook は触らない
3. 既存のコンポーネントパターンに従う
4. コミット前に修正内容を見せて
```

### 5. コンテキストを積極的に管理する

- 無関係なタスク間で `/clear`
- `/compact` で手動圧縮
- 大量出力の作業はサブエージェントに委譲
- `/context` で使用量を監視
- `Esc+Esc` → "Summarize from here" で部分圧縮

### 6. 2回失敗したら方針転換

```
2回試して直らない場合は、
試した内容と推定原因を報告して方針を相談して。
```

2回以上の修正が同じ問題にかかった場合、`/clear` して改善したプロンプトで再開する。

### よくある失敗パターン

| パターン | 症状 | 対策 |
|---------|------|------|
| Kitchen sink session | 無関係なタスクの混在 | `/clear` でタスクを分離 |
| 繰り返し修正 | 失敗アプローチでコンテキスト汚染 | 2回で `/clear`、プロンプト改善 |
| 過大な CLAUDE.md | ルールが多すぎて無視される | 500行以下に削減、Hooks に移行 |
| 検証不足 | もっともらしいが誤った実装 | 必ず検証手段を提供 |
| 無限探索 | スコープなしの調査でコンテキスト消費 | スコープを絞るかサブエージェント使用 |

### Writer/Reviewer パターン

セッション A で実装、セッション B で新しいコンテキストからレビュー。自分のコードへのバイアスなくレビューできる。

> 📖 公式: [Best Practices](https://docs.anthropic.com/en/docs/claude-code/best-practices)

---

## 29. 本プロジェクトの設定解説

本プロジェクト（ai-strategic-brainstorm）で採用している Claude Code 設定：

### CLAUDE.md

プロジェクトルートに配置。以下のルールを定義：
- Git ワークフロー（conventional commit、main push 禁止）
- コード品質（型チェック、テスト実行）
- デバッグ方針（2回で報告、過度な質問禁止）
- PR 運用（自動選択、承認なしマージ禁止）

### Custom Skills

| スキル | コマンド | 用途 |
|-------|---------|------|
| push | `/push` | commit → push → PR更新のフルワークフロー |
| review | `/review` | 現在ブランチ PR の自動レビュー |
| fix-issue | `/fix-issue N` | GitHub Issue の自動修正 |

### Hooks

`.claude/settings.json` に設定：

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": ".claude/hooks/protect-main.sh"
      }]
    }],
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "npx tsc --noEmit --pretty 2>&1 | head -20"
      }]
    }],
    "Notification": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "osascript -e 'display notification \"$CLAUDE_NOTIFICATION\" with title \"Claude Code\"'"
      }]
    }]
  }
}
```

- **PreToolUse**: main への直接 push をブロック
- **PostToolUse**: Edit/Write のたびに TypeScript 型チェックを自動実行
- **Notification**: macOS デスクトップ通知

### パーミッション

`.claude/settings.local.json`（個人設定・Git管理外）で各自が設定：
- `npm`, `npx`, `git`, `gh` 系コマンドの許可
- WebFetch ドメインの許可

### メモリ

`~/.claude/projects/.../memory/MEMORY.md` に以下を記録：
- Git / コミットルール
- プロジェクトコンテキスト（IT人材紹介向け）
- 技術スタック情報
- Insights レポートからの学び

---

# Part VIII — 発展編

## 30. 仕様駆動開発（SDD）× AI エージェント

### SDD（Spec-Driven Development）とは

**仕様駆動開発**は、コードを書く前に**仕様（Spec）を先に定義**し、その仕様をもとにコードを生成・検証する開発手法。AI エージェント（Claude Code 等）との相性が極めて高い。

従来の開発では「コードが仕様を定義する」ことが多かったが、SDD では**仕様がコードを制約する**。

### なぜ AI 時代に SDD が重要か

| 課題 | SDD なし | SDD あり |
|------|---------|---------|
| AI への指示が曖昧 | 間違ったアプローチで実装、やり直し | 仕様が明確なので正確に実装 |
| コンテキスト消費 | 探索に大量のトークンを使う | 仕様ファイルを読むだけで方針が確定 |
| 一貫性の維持 | セッション間で方針がブレる | 仕様が Single Source of Truth |
| レビュー品質 | 「意図」が分からず表面的なレビュー | 仕様と実装の差分をレビュー |
| オンボーディング | コードを読み解く必要がある | 仕様を読めばシステム全体を理解 |

### SDD の構成要素

```
docs/
├── specs/                    # 仕様ファイル群
│   ├── architecture.md       # システム全体のアーキテクチャ
│   ├── data-model.md         # データモデル定義
│   ├── api/                  # API 仕様
│   │   ├── auth.md
│   │   └── users.md
│   └── features/             # 機能仕様
│       ├── login.md
│       └── export.md
├── decisions/                # ADR（Architecture Decision Records）
│   ├── 001-use-react.md
│   └── 002-auth-strategy.md
└── claude-code-guide.md      # Claude Code ガイド（本ドキュメント）
```

### 仕様ファイルの書き方

**機能仕様の例:**

```markdown
# 機能: PDF エクスポート

## 概要
分析結果を PDF 形式でダウンロードする。

## ユーザーストーリー
営業担当者として、AI分析結果をPDFで共有したい。
社内会議資料として印刷可能な形式が必要。

## 入力
- AIResults オブジェクト（ideas[], understanding, suggestions）
- プロジェクト名

## 出力
- A4 縦向き PDF ファイル
- ファイル名: `{プロジェクト名}_{YYYY-MM-DD}.pdf`

## 制約
- クライアントサイドで生成（サーバー不要）
- 日本語フォントを正しく表示
- テーブル・見出し・箇条書きを整形

## 受入基準
- [ ] ダウンロードメニューから「PDF (.pdf)」を選択できる
- [ ] 生成された PDF が正しく開ける
- [ ] 日本語テキストが文字化けしない
- [ ] A4 サイズに収まる
```

### CLAUDE.md との連携

CLAUDE.md に仕様ファイルへの参照を追加する：

```markdown
## 仕様ファイル
機能を実装・修正する前に、該当する仕様ファイルを確認すること:
- アーキテクチャ: @docs/specs/architecture.md
- データモデル: @docs/specs/data-model.md
- 各機能仕様: @docs/specs/features/ 配下

仕様に記載がない変更を行う場合は、先に仕様を更新してからコードを変更する。
```

### SDD ワークフロー（AI エージェントとの協働）

```
1. 仕様作成    — 人間が要件を仕様ファイルに記述
2. 仕様レビュー — Claude に仕様の矛盾・漏れを指摘させる
3. 実装計画    — Claude が仕様を読み、Plan Mode で実装計画を立てる
4. 実装        — 仕様に基づいてコードを生成
5. 検証        — 受入基準をテストケースに変換して実行
6. 仕様更新    — 実装で判明した事項を仕様にフィードバック
```

### SDD を支える Claude Code の機能

| 機能 | SDD での役割 |
|------|------------|
| CLAUDE.md の `@` 参照 | 仕様ファイルをコンテキストに自動読み込み |
| Plan Mode | 仕様を読んだ上で実装計画を立案 |
| Skills | `/implement-spec features/login.md` のような仕様起点のワークフロー |
| Hooks | 仕様と実装の整合性チェックを自動化 |
| サブエージェント | 仕様レビュー・テスト生成を並列実行 |
| チェックポイント | 仕様変更に伴う実装の巻き戻し |

### ADR（Architecture Decision Records）

重要なアーキテクチャ判断を記録するドキュメント。

```markdown
# ADR-002: 認証方式の選定

## ステータス
承認済み（2025-01-15）

## コンテキスト
SPA アプリケーションでユーザー認証が必要。

## 検討した選択肢
1. JWT + ローカルストレージ
2. セッション Cookie
3. OAuth 2.0 + PKCE

## 決定
OAuth 2.0 + PKCE を採用。

## 理由
- SPA との相性が良い
- トークンリフレッシュが標準化されている
- サードパーティ認証プロバイダとの統合が容易

## 結果
- 認証フローの実装が複雑になるが、セキュリティが向上
- PKCE 対応のライブラリ選定が必要
```

### 実践のヒント

1. **小さく始める** — 全機能の仕様を一度に書かない。新機能から仕様ファイルを作り始める
2. **仕様の粒度** — 1ファイル = 1機能 or 1コンポーネント。大きすぎると更新が滞る
3. **生きたドキュメント** — 実装後に仕様を更新する習慣をつける。CI で仕様と実装の乖離をチェックする仕組みも有効
4. **CLAUDE.md は薄く** — 仕様の詳細は仕様ファイルに、CLAUDE.md には参照リンクと基本ルールのみ

---

## 参考リンク

### 公式ドキュメント
- [Claude Code 公式ドキュメント](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)
- [MCP 仕様](https://modelcontextprotocol.io/)
- [Anthropic Trust Center](https://trust.anthropic.com)

### スラッシュコマンド一覧

| コマンド | 用途 |
|---------|------|
| `/help` | ヘルプ表示 |
| `/clear` | コンテキストをリセット |
| `/compact [テーマ]` | コンテキストを手動圧縮 |
| `/continue` | 直前のセッションを再開 |
| `/resume [名前]` | 名前付きセッションを再開 |
| `/model [名前]` | モデル切り替え |
| `/context` | コンテキスト使用量を表示 |
| `/cost` | セッションコストを表示 |
| `/stats` | 使用統計（Pro/Max） |
| `/permissions` | パーミッション管理 |
| `/sandbox` | サンドボックス設定 |
| `/init` | CLAUDE.md を初期化 |
| `/hooks` | Hooks 管理 |
| `/mcp` | MCP サーバー管理 |
| `/memory` | メモリファイル編集 |
| `/skills` | スキル管理 |
| `/plugins` | プラグイン管理 |
| `/config` | 設定 UI を開く |
| `/add-dir [パス]` | 作業ディレクトリを追加 |
| `/rewind` | チェックポイントに戻る |
| `/rename [名前]` | セッション名を変更 |
| `/output-style` | 出力スタイル切替 |
| `/fast` | 高速モード切替 |
| `/vim` | Vim モード切替 |
| `/terminal-setup` | ターミナル設定 |
| `/doctor` | 診断 |
| `/bug` | 問題報告 |
| `/ide` | IDE に接続 |
| `/install-github-app` | GitHub App をセットアップ |
