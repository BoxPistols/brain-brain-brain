# コントリビューションガイド

AI Strategic Brainstorm へのコントリビューションを歓迎します。

## 開発環境のセットアップ

```bash
git clone https://github.com/BoxPistols/ai-strategic-brainstorm.git
cd ai-strategic-brainstorm
npm install
npm run dev      # 開発サーバー起動
npm run build    # ビルド確認
npm test         # テスト実行
```

## ブランチとPRの流れ

1. リポジトリをフォークする
2. フィーチャーブランチを作成する（`feat/機能名`、`fix/修正内容` など）
3. 変更をコミットする
4. フォーク先にプッシュし、Pull Request を作成する
5. PR の説明に変更内容と動作確認方法を記載する

`main` ブランチへの直接プッシュは行わないでください。

## コミットメッセージ

Conventional Commits 形式を使用してください。メッセージは日本語で簡潔に記述します。

```
feat: セッション種別にDX推進を追加
fix: エクスポート時のPDF生成エラーを修正
refactor: useAIフックの責務を整理
docs: README にデプロイ手順を追記
```

- 絵文字は使用しない
- 1行目は50文字以内を目安に

## コードスタイル

- **TypeScript strict モード** で記述する
- スタイリングは **Tailwind CSS** を使用する
- パスエイリアス `@/*` は `src/*` に対応（例: `import { useAI } from '@/hooks/useAI'`）
- 新規ファイルは TypeScript（`.ts` / `.tsx`）で作成する

## テスト

- テストフレームワークは **Vitest**
- 機能追加・バグ修正時は、可能な範囲でテストを追加する
- PR 提出前に `npm test` と `npm run build` が通ることを確認する

## 質問・相談

Issue や Discussion で気軽にどうぞ。
