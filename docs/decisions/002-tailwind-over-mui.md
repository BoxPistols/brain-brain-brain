# ADR-002: Tailwind CSS の採用（MUI 不使用）

## ステータス

承認済み

## コンテキスト

UI コンポーネントのスタイリング方式を選定する。
ダークモード対応、レスポンシブデザイン、カスタムデザインが必要。

## 検討した選択肢

1. **MUI（Material UI）**
2. **Tailwind CSS**
3. **CSS Modules**

## 決定

**Tailwind CSS 3** を採用。

## 理由

- **バンドルサイズ**: MUI は tree-shaking 後も大きい。Tailwind は使用クラスのみ含む
- **カスタマイズ性**: ユーティリティファーストで独自デザインが容易。MUI の Material Design に縛られない
- **ダークモード**: `dark:` プレフィックスで簡潔に実装可能
- **学習コスト**: HTML に直接記述でき、CSS ファイルの管理が不要
- **本プロジェクトの規模**: コンポーネント数が限定的（~15）で、MUI のコンポーネントライブラリの恩恵が薄い

## 結果

- Lucide React をアイコンライブラリとして併用
- テーマトークンは `src/constants/theme.ts` に集約（`T` オブジェクト）
- CSS Modules は不使用（Tailwind で完結）
- MUI 系のコンポーネント（DatePicker, DataGrid 等）は不要なため影響なし
