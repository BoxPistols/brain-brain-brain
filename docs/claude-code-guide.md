# Claude Code 包括ガイド

> 初めて触る人から設定を深く理解したい人まで、Claude Code の全体像を1つのドキュメントで把握する。

---

## 目次

1. [Claude Code とは](#1-claude-code-とは)
2. [基本操作](#2-基本操作)
3. [設定ファイルの階層構造](#3-設定ファイルの階層構造)
4. [CLAUDE.md — プロジェクトルール](#4-claudemd--プロジェクトルール)
5. [パーミッション（権限管理）](#5-パーミッション権限管理)
6. [Hooks — 自動実行アクション](#6-hooks--自動実行アクション)
7. [Custom Skills — 再利用ワークフロー](#7-custom-skills--再利用ワークフロー)
8. [サブエージェント（Task ツール）](#8-サブエージェントtask-ツール)
9. [MCP サーバー連携](#9-mcp-サーバー連携)
10. [ヘッドレスモード（CI/CD 連携）](#10-ヘッドレスモードcicd-連携)
11. [モデル選択とコスト](#11-モデル選択とコスト)
12. [メモリシステム](#12-メモリシステム)
13. [スラッシュコマンド一覧](#13-スラッシュコマンド一覧)
14. [キーボードショートカット](#14-キーボードショートカット)
15. [ツール一覧](#15-ツール一覧)
16. [ベストプラクティス](#16-ベストプラクティス)
17. [よくある失敗パターンと対策](#17-よくある失敗パターンと対策)
18. [本プロジェクトの設定解説](#18-本プロジェクトの設定解説)

---

## 1. Claude Code とは

Claude Code は Anthropic が提供する **CLI ベースの AI コーディングアシスタント**。ターミナルで動作し、プロジェクト全体を理解した上でコードの読み書き・コマンド実行・Git 操作を自律的に行う。

### 他の AI ツールとの違い

| 特徴 | Claude Code | インライン補完ツール |
|------|-------------|---------------------|
| 対象範囲 | プロジェクト全体 | 開いているファイル |
| 動作方式 | エージェント型（自律判断） | 補完型（提案のみ） |
| コマンド実行 | ビルド・テスト・Git を直接実行 | 不可 |
| セッション | 会話を保存・再開可能 | なし |
| 拡張性 | Skills, Hooks, MCP, サブエージェント | プラグイン程度 |

### エージェントループ

Claude Code は以下の3フェーズを **繰り返し自律的に** 実行する：

```
1. 情報収集 → ファイルを読む、コードを検索する
2. 実行     → コードを編集する、コマンドを実行する
3. 検証     → テストを実行する、ビルドして確認する
```

1回のやりとりで何十ものツールを連鎖的に使い、エラーが出れば自己修正する。

---

## 2. 基本操作

### インストールと起動

```bash
# インストール
npm install -g @anthropic-ai/claude-code

# プロジェクトディレクトリで起動
cd my-project
claude
```

### 基本的な使い方

```
> この関数のバグを直して
> テストを書いて実行して
> このPRをレビューして
> git commit して push して
```

Claude は依頼を理解し、必要なファイルを読み、コードを修正し、テストを実行する。途中で許可を求められたら `y` / `n` で応答する。

### セッションの終了と再開

```bash
# 終了
Ctrl+C または /quit

# 直前のセッションを再開
claude --continue

# 名前付きセッションを再開
claude --resume my-session
```

---

## 3. 設定ファイルの階層構造

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

---

## 4. CLAUDE.md — プロジェクトルール

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
- ビルド・テストコマンド
- コードスタイル（デフォルトと異なる場合のみ）
- Git ワークフロー（ブランチ命名、コミット規約）
- アーキテクチャの重要な判断
- ハマりやすいポイント

**書くべきでないもの:**
- 言語の標準的な慣習（Claude は既に知っている）
- ファイルごとの詳細な説明（コードから読み取れる）
- 長大な API ドキュメント（リンクで十分）

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

## コードスタイル
- インデント: スペース2つ
- const を let より優先
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

---

## 5. パーミッション（権限管理）

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

---

## 6. Hooks — 自動実行アクション

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

---

## 7. Custom Skills — 再利用ワークフロー

### Skills とは

Skills は **再利用可能なワークフローをコマンド1つで呼び出す仕組み**。`/skill-name` で実行。

CLAUDE.md との違い：
- **CLAUDE.md**: 毎セッション読み込み、広く適用
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

#### 基本例: /review

```markdown
# Review Skill

1. 現在ブランチのオープン PR を自動特定
2. diff を取得してレビュー
3. 構造化された結果を出力
4. 修正適用するか確認
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
disable-model-invocation: true  # 自動呼び出しを無効化
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

---

## 8. サブエージェント（Task ツール）

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
- レイテンシが重要

---

## 9. MCP サーバー連携

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

---

## 10. ヘッドレスモード（CI/CD 連携）

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

# モデル指定
claude -p "レビューして" --model opus

# セッション継続
claude -p "続きをやって" --resume SESSION_ID
```

### CI/CD での活用例

```yaml
# GitHub Actions
- name: PR レビュー
  run: |
    claude -p "このPRの差分をレビューして" \
      --allowedTools "Bash(git *),Read,Grep" \
      --output-format json > review.json
```

```bash
# lint エラーの自動修正
claude -p "全ての TypeScript と ESLint エラーを修正して" \
  --allowedTools "Edit,Read,Bash,Grep"
```

---

## 11. モデル選択とコスト

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

---

## 12. メモリシステム

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

---

## 13. スラッシュコマンド一覧

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
| `/permissions` | パーミッション管理 |
| `/init` | CLAUDE.md を初期化 |
| `/hooks` | Hooks 管理 |
| `/mcp` | MCP サーバー管理 |
| `/memory` | メモリファイル編集 |
| `/skills` | スキル管理 |
| `/config` | 設定 UI を開く |
| `/add-dir [パス]` | 作業ディレクトリを追加 |
| `/rewind` | 前のチェックポイントに戻る |
| `/rename [名前]` | セッション名を変更 |

---

## 14. キーボードショートカット

| ショートカット | 動作 |
|--------------|------|
| `Esc` | Claude の動作を中断 |
| `Esc` x 2 | Rewind メニュー（変更を巻き戻し） |
| `Shift+Tab` | パーミッションモード切替 |
| `Tab` | 自動補完 |
| `@` | ファイル・リソース参照 |
| `Ctrl+C` | 終了 |

---

## 15. ツール一覧

Claude Code が使えるツールの全体像：

### ファイル操作

| ツール | 用途 |
|-------|------|
| **Read** | ファイル読み込み（画像・PDF も可） |
| **Edit** | ファイルの部分的な修正 |
| **Write** | ファイルの新規作成・上書き |

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
| **TaskCreate/Update/List** | タスク管理 |
| **Skill** | スキルの実行 |

---

## 16. ベストプラクティス

### 1. 検証手段を必ず提供する

Claude に「完了」を判断させる基準を与える：

```
悪い例: メール検証関数を書いて
良い例: validateEmail 関数を書いて。
       test@example.com → true, invalid → false, @.com → false
       テスト実行して確認して。
```

### 2. 探索 → 計画 → 実行 の順で進める

```
1. Plan Mode で調査（ファイル変更なし）
2. 実装計画を確認
3. 通常モードで実装
4. テスト・コミット
```

### 3. 具体的に指示する

```
曖昧: ログインのバグを直して
具体的: セッションタイムアウト後にログインできないバグを修正。
       src/auth/ を確認、特にトークンリフレッシュ周り。
       再現テストを書いてから修正して。
```

### 4. コンテキストを積極的に管理する

コンテキストが溜まると精度が落ちる：

- 無関係なタスク間で `/clear` する
- `/compact` で手動圧縮する
- 大量出力の作業はサブエージェントに委譲する
- `/context` で使用量を監視する

### 5. 制約を先に伝える

```
X を修正して。制約:
1. ローカルでテストしてから push
2. Storybook は触らない
3. 既存のコンポーネントパターンに従う
4. コミット前に修正内容を見せて
```

### 6. 2回失敗したら方針転換

```
2回試して直らない場合は、
試した内容と推定原因を報告して方針を相談して。
```

---

## 17. よくある失敗パターンと対策

> 本プロジェクトの Insights レポート（134セッション、1,230メッセージ）から抽出。

### Wrong Approach（28件 — 最多）

**症状:** Claude が間違ったアプローチで実装を始め、やり直しが発生する。

**対策:**
- 制約と期待する結果を先に明示する
- 「X のようにして。Y のようにはしないで」と明確に伝える
- 方針を3行で説明させてから実装に入る

```
[機能] を実装して。
期待する結果: [具体的なUI/挙動の説明]
やらないこと: [設定ファイルの変更、Storybook、関係ないディレクトリ]
コードを書く前に方針を3行で説明して承認を待って。
```

### Buggy Code（11件）

**症状:** 修正が新しいバグを生む、またはエッジケースを見落とす。

**対策:**
- Hooks で編集ごとに型チェックを自動実行する
- 「変更ごとに tsc と lint を実行して」と指示する
- テスト駆動で進める（先にテストを書かせる）

### 無断マージ・デプロイ（複数件）

**症状:** ユーザーの許可なく push/マージ/デプロイしてしまう。

**対策:**
- CLAUDE.md に「マージ・push・デプロイは明示的承認必須」と記載
- PreToolUse Hook で main への push をブロック
- パーミッションの deny ルールで保護

### 本番デバッグの空振り

**症状:** ローカルでは直ったが本番で再現する問題を解決できない。

**対策:**
- 本番の環境情報（ログ、env、CSP設定）を先に提供する
- 「コードを変更する前に診断のみ行って」と指示する
- プレビューデプロイで確認してから本番に適用する

---

## 18. 本プロジェクトの設定解説

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

### Hooks

`.claude/settings.json` に設定：

```json
{
  "hooks": {
    "postToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "npx tsc --noEmit --pretty 2>&1 | head -20"
      }]
    }]
  }
}
```

Edit/Write のたびに TypeScript の型チェックが自動実行される。バグの早期発見が目的。

### パーミッション

`.claude/settings.local.json`（個人設定・Git管理外）で各自が設定：
- `npm`, `npx`, `git`, `gh` 系コマンドの許可
- WebFetch ドメインの許可
- 各開発者が自分の環境に合わせて追加する

### メモリ

`~/.claude/projects/.../memory/MEMORY.md` に以下を記録：
- Git / コミットルール
- プロジェクトコンテキスト（IT人材紹介向け）
- 技術スタック情報
- Insights レポートからの学び

---

## 参考リンク

- [Claude Code 公式ドキュメント](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)
- [MCP 仕様](https://modelcontextprotocol.io/)
