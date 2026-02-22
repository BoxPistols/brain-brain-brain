# 機能: レポートエクスポート

## 概要

AI 分析結果を複数のファイル形式でダウンロードする。
すべてクライアントサイドで生成（サーバー不要）。

## ユーザーストーリー

- 営業担当として、AI 分析結果を PDF で共有し、社内会議の配布資料にしたい
- 経営企画として、アイデア一覧を CSV でエクスポートし、Excel で優先順位を再整理したい
- マネージャーとして、PowerPoint 形式で経営会議に提出したい

## エクスポート形式

### Markdown (.md)

- `buildReportMd()` で生成
- セクション構成: プロジェクトメタ → 目標 → 課題 → 最重要イシュー → AI分析 → 戦略アイデア → ブラッシュアップ → 深掘り
- アイデアテーブル: 優先度 / 工数 / インパクト / 実現可能性
- BOM 付き UTF-8

### テキスト (.txt)

- `mdToTxt()` で Markdown から変換
- `#` → タイトル、`##` → `■`、`###` → インデント、`**` → 除去
- 印刷用フォーマット（`printReport()` でブラウザ印刷ダイアログ）

### CSV (.csv)

- `buildReportCsv()` で生成
- ヘッダ: No, タイトル, 説明, 優先度, 工数, インパクト, 実現可能性(総合), リソース, 技術容易性, 組織受容性
- 末尾にプロジェクトメタ情報
- BOM 付き UTF-8（Excel 日本語対応）

### PDF (.pdf)

- `downloadPdf()` で生成
- html2pdf.js によるクライアントサイド変換
- Markdown → 簡易 HTML → PDF（A4 縦向き）
- スタイル: ヒラギノ角ゴ系フォント、見出し・テーブル・blockquote 整形

### PowerPoint (.pptx)

- `downloadPptx()` で生成
- pptxgenjs によるクライアントサイド生成
- スライド構成:
  1. タイトル（プロジェクト名 + メタ情報）
  2. 目標 & 課題
  3. AI 状況分析
  4. 戦略アイデア一覧テーブル
  5. 各アイデア詳細（N枚）
- 16:9 レイアウト

## 制約

- クライアントサイド完結（サーバーサイド処理なし）
- PDF: html2pdf.js の制限で複雑なテーブルレイアウトが崩れる場合がある
- PPTX: テキスト長 600/800 文字で切り捨て（スライド溢れ防止）
- 日本語フォント: システムフォントに依存（-apple-system, Hiragino Sans）

## 実装ファイル

| ファイル | 関数 |
|---------|------|
| `src/utils/report.ts` | `buildReportMd()`, `mdToTxt()`, `buildReportCsv()`, `downloadPdf()`, `downloadPptx()`, `printReport()`, `dlFile()` |
| `src/types/html2pdf.d.ts` | html2pdf.js 型定義 |
| `src/components/modals/PreviewModal.tsx` | エクスポートプレビュー UI |

## 受入基準

- [ ] Markdown エクスポートが BOM 付き UTF-8 でダウンロードされる
- [ ] CSV が Excel で日本語文字化けなく開ける
- [ ] PDF が A4 サイズに収まり、日本語が正しく表示される
- [ ] PPTX が PowerPoint で開け、全スライドが正しく表示される
- [ ] 印刷機能でブラウザ印刷ダイアログが表示される
- [ ] 実現可能性スコアがある場合、全形式で正しく出力される
