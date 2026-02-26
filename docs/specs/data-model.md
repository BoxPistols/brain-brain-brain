# データモデル仕様

定義元: `src/types/index.ts`

## SessionType

セッション種別を表す文字列リテラル型。

| 値 | ラベル | 用途 |
|---|--------|------|
| `product` | サービス・事業改善 | プロダクト戦略 |
| `marketing` | マーケティング戦略 | 集客・ブランディング |
| `growth` | グロース・収益拡大 | ユニットエコノミクス改善 |
| `innovation` | 新規事業・イノベーション | PoC・PMF検証 |
| `cx` | CX・顧客体験 | カスタマージャーニー改善 |
| `ops` | 営業・業務改善 | 業務効率化・KPI改善 |
| `dx` | DX推進 | デジタル変革・チェンジマネジメント |
| `design-system` | ブランド・デザインシステム | ブランド統一・UI基盤 |
| `other` | その他 | カスタムセッション |

## BrainstormForm

ユーザー入力の全状態。

| フィールド | 型 | 必須 | 説明 |
|-----------|---|------|------|
| `projectName` | `string` | - | プロジェクト名（空の場合は自動生成） |
| `productService` | `string` | Yes | プロダクト/サービス名 |
| `teamGoals` | `string` | Yes | チーム目標 |
| `sessionType` | `SessionType` | Yes | セッション種別 |
| `customSession` | `string` | - | `sessionType='other'` の場合のカスタム名 |
| `issues` | `Issue[]` | Yes | 課題リスト（最低1件） |

## Issue

課題の1エントリ。

| フィールド | 型 | 必須 | 説明 |
|-----------|---|------|------|
| `text` | `string` | Yes | 課題の要約テキスト |
| `detail` | `string` | - | 課題の補足説明 |
| `sub` | `string[]` | - | サブ課題のリスト |

## AIResults

AI 分析結果の全体構造。

| フィールド | 型 | 必須 | 説明 |
|-----------|---|------|------|
| `understanding` | `string` | Yes | AI による状況分析テキスト |
| `ideas` | `Idea[]` | Yes | 戦略アイデアリスト |
| `suggestions` | `string[]` | - | 深掘り質問サジェスション |
| `keyIssue` | `string` | - | 最重要イシュー（HR ドメイン時） |
| `funnelStage` | `string` | - | ボトルネック段階（HR ドメイン時） |
| `deepDive` | `string` | - | 深掘り結果（レガシー: 単一回答） |
| `deepDives` | `DeepDiveEntry[]` | - | 深掘り結果（複数回答） |
| `refinement` | `string` | - | ブラッシュアップ結果（レガシー: 単一回答） |
| `refinements` | `RefinementEntry[]` | - | ブラッシュアップ結果（複数回答） |

## Idea

戦略アイデアの1エントリ。

| フィールド | 型 | 必須 | 説明 | 値域 |
|-----------|---|------|------|------|
| `title` | `string` | Yes | アイデアタイトル | — |
| `description` | `string` | Yes | アイデア詳細説明 | — |
| `priority` | `Priority` | Yes | 優先度 | `高` / `中` / `低` |
| `effort` | `Effort` | Yes | 工数 | `大` / `中` / `小` |
| `impact` | `Impact` | Yes | インパクト | `大` / `中` / `小` |
| `feasibility` | `FeasibilityScore` | - | 実現可能性（Pro depth≥2 で出力） | — |
| `subIdeas` | `Idea[]` | - | ドリルダウン時のサブアイデア | — |

## FeasibilityScore

4次元の実現可能性スコア。Pro モード depth≥2 で AI が出力。

| フィールド | 型 | 説明 | 値域 |
|-----------|---|------|------|
| `total` | `number` | 総合スコア | 0-100 |
| `resource` | `number` | リソース充足度 | 0-100 |
| `techDifficulty` | `number` | 技術的容易性 | 0-100（高いほど容易） |
| `orgAcceptance` | `number` | 組織受容性 | 0-100 |

制約: 各値は `clamp(0, 100)` で正規化。欠損時は 50 をデフォルト。

## DeepDiveEntry

深掘り Q&A の1エントリ。

| フィールド | 型 | 説明 |
|-----------|---|------|
| `question` | `string` | ユーザーの深掘り質問 |
| `answer` | `string` | AI の回答（Markdown） |

## RefinementEntry

ブラッシュアップの1エントリ。

| フィールド | 型 | 説明 |
|-----------|---|------|
| `review` | `string` | ユーザーのレビューコメント |
| `answer` | `string` | AI の回答（Markdown） |
| `results` | `AIResults` | - | 構造化された更新結果（任意） |

## LogEntry

セッション履歴の1レコード。localStorage に保存。

| フィールド | 型 | 説明 |
|-----------|---|------|
| `id` | `string` | `{timestamp}-{random}` 形式の一意ID |
| `timestamp` | `string` | ISO 8601 日時 |
| `projectName` | `string` | プロジェクト名 |
| `model` | `string` | 使用モデルID |
| `depth` | `number` | 分析深度 |
| `form` | `BrainstormForm` | 入力フォーム全体 |
| `query` | `string` | - | 送信プロンプト（logMode='all' 時のみ） |
| `results` | `AIResults` | AI 分析結果 |

制約: 最大200件。超過時は古いものから削除。

## ChatMessage

OpenAI API 送信メッセージ。

| フィールド | 型 | 値域 |
|-----------|---|------|
| `role` | `string` | `system` / `user` / `assistant` |
| `content` | `string` | メッセージ本文 |

## ConnStatus

API 接続状態。

| フィールド | 型 | 値域 |
|-----------|---|------|
| `status` | `string` | `idle` / `testing` / `ok` / `error` |
| `msg` | `string` | ステータスメッセージ |

## LLMProvider

LLMプロバイダーを表す文字列リテラル型。

| 値 | ラベル | 説明 |
|---|--------|------|
| `openai` | OpenAI | クラウドAPI（Free/Proモード） |
| `ollama` | Ollama | ローカルLLM（`localhost:11434`） |
| `lmstudio` | LM Studio | ローカルLLM（`localhost:1234`） |

ローカルプロバイダー（`ollama` / `lmstudio`）選択時は Pro モード相当として全機能解放。

## ModelInfo

モデルメタデータ。

| フィールド | 型 | 説明 |
|-----------|---|------|
| `id` | `string` | モデルID（例: `gpt-5-nano`） |
| `label` | `string` | 表示名 |
| `t` | `number` | max_tokens |
| `cost` | `string` | コスト目安（`$` / `$$` / `$$$`） |
