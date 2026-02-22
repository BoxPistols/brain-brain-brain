# 機能: AI 分析・戦略アイデア生成

## 概要

ユーザーが入力した課題・目標・セッション種別をもとに、AI が状況分析と戦略アイデアを生成する。
本アプリのコア機能。

## ユーザーストーリー

- 経営企画担当として、チームの課題を入力し、AI から構造化された戦略提案を受け取りたい
- 営業マネージャーとして、業務改善のアイデアを優先度・工数・インパクト付きで比較したい

## 入力

- `BrainstormForm`: projectName, productService, teamGoals, sessionType, issues[]
- `depth`: 分析深度（Free: 1-3, Pro: 1-4）
- `apiKey`: OpenAI API キー（Pro モード時）

## 出力

- `AIResults`: understanding, ideas[], suggestions[], keyIssue?, funnelStage?
- 各アイデアに priority / effort / impact 評価
- Pro depth≥2: FeasibilityScore（4次元スコア）

## 処理フロー

1. `buildPrompt()` でセッション種別に応じた役割（コンサルタント設定）を構築
2. HR キーワード検出時、ドメインコンテキストを注入（→ [domain-context.md](./domain-context.md)）
3. 深度に応じたアイデア数・分析品質を調整
4. OpenAI API 呼び出し（`/api/openai` プロキシ経由）
5. `parseAIJson()` で JSON パース（切り捨て耐性あり）
6. FeasibilityScore の正規化（clamp 0-100、欠損時 50）

## 深度別出力

| モード | 深度 | ラベル | アイデア数 | 特徴 |
|--------|------|--------|-----------|------|
| Free | 1 | Lite | 3 | 基本分析 |
| Free | 2 | Standard | 5 | 標準分析 |
| Free | 3 | Deep | 7 | 詳細分析 |
| Pro | 1 | Quick | 3 | 高速分析 |
| Pro | 2 | Standard | 6 | 実現可能性スコア付き |
| Pro | 3 | Deep | 8 | 戦略コンサルタント水準 |
| Pro | 4 | High-Class | 10 | McKinsey/BCG パートナー水準 |

## 制約

- JSON のみ出力（Markdown 混在不可）
- max_tokens: モデル・深度依存（1,500-8,000）
- レート制限: 429 エラー時はリトライ案内
- Free モードは環境変数 API キーを使用（ユーザーキー不要）

## 実装ファイル

| ファイル | 関数/行 |
|---------|---------|
| `src/hooks/useAI.ts` | `generate()` (L154-214), `buildPrompt()` (L32-151) |
| `src/constants/models.ts` | `callAI()`, `callAIWithKey()` |
| `src/utils/parseAIJson.ts` | `tryParse()`, `tryRepairTruncated()` |
| `src/constants/prompts.ts` | `TYPES`, `PRO_DEPTH`, `FREE_DEPTH` |

## 受入基準

- [ ] セッション種別ごとに異なるコンサルタント役割が設定される
- [ ] 指定深度に応じた数のアイデアが生成される
- [ ] 各アイデアに priority / effort / impact が含まれる
- [ ] Pro depth≥2 で feasibility スコアが出力される
- [ ] JSON パースエラー時に切り捨て修復が機能する
- [ ] API エラー（429, 401, 500）に日本語メッセージで対応する
