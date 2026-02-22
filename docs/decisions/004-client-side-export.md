# ADR-004: クライアントサイドエクスポート（html2pdf.js / pptxgenjs）

## ステータス

承認済み（2025-02）

## コンテキスト

AI 分析結果を PDF / PowerPoint 形式でダウンロードする機能が必要。
サーバーサイド処理（Puppeteer, LibreOffice 等）は避けたい。

## 検討した選択肢

### PDF

1. **html2pdf.js**（html2canvas + jsPDF ラッパー）
2. **jsPDF 直接利用**
3. **React-PDF**
4. **サーバーサイド Puppeteer**

### PPTX

1. **pptxgenjs**
2. **officegen**
3. **サーバーサイド LibreOffice**

## 決定

**html2pdf.js**（PDF）+ **pptxgenjs**（PPTX）を採用。

## 理由

- **サーバーレス**: クライアントサイド完結でサーバー不要。Vercel の Function サイズ制限を回避
- **html2pdf.js**: Markdown → HTML → PDF の変換が簡潔。jsPDF 直接よりレイアウト構築が容易
- **pptxgenjs**: JavaScript のみで PPTX 生成可能。テーブル・テキスト・スライド構成 API が充実
- **React-PDF 不採用**: レンダリングコンポーネントの構築コストが高い
- **officegen 不採用**: メンテナンスが停滞、Node.js 依存が強い

## 結果

- PDF: A4 縦、scale 2x、日本語はシステムフォント依存
- PPTX: 16:9 レイアウト、テキスト長制限（600/800文字で切り捨て）
- バンドルサイズへの影響: html2pdf.js ~980KB, pptxgenjs ~370KB（動的 import で分離済み）
- 型定義: `src/types/html2pdf.d.ts` にカスタム `.d.ts` を配置（公式型定義なし）
