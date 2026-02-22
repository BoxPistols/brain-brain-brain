# AI Strategic Brainstorm - Claude Code ルール

## Critical Rules

- PRのマージ、mainへのpush、本番デプロイは必ずユーザーの明示的な承認を得てから実行する
- ローカルで動作確認してからpush/デプロイする。未検証の変更をデプロイしない
- 過剰な変更をしない。依頼された範囲だけを修正する

## Git Workflow

- mainへの直接pushは禁止。必ずブランチ作成 → PR → マージ
- コミットメッセージ: conventional commit 形式（feat:, fix:, refactor: 等）
- コミットメッセージに絵文字、"Generated with Claude Code"、"Co-Authored-By: Claude" を含めない
- 冗長な文言やファイル数・変更数の定量値をコミットメッセージに含めない
- 「push して」と言われたら commit → push → PR更新 のフルワークフローを完了する（ファイル編集だけで止めない）

## Tech Stack

- React 18 + TypeScript + Vite + Tailwind CSS 3
- テスト: Vitest
- パスエイリアス: `@/*` → `src/*`
- 新規ファイルはTypeScriptで作成する

## Code Quality

- ビルド確認: `npm run build`
- 型チェック: `npx tsc --noEmit`（Hooks で自動実行済み）
- テスト: `npm test`
- UI/スタイリングの修正時は正しいコンポーネントとCSS詳細度を確認してから変更する

## Debugging

- 過度な質問で時間を浪費しない。ログ・ソースコード・設定を先に調査する
- 2回試して解決しない場合は、試した内容と推定原因をユーザーに報告して方針を相談する

## PR Review

- PRレビュー時は、ユーザーが指定しない限り現在のブランチの最新PRを自動で選択する（どのPRかは聞かない）

## 仕様ファイル

機能を実装・修正する前に、該当する仕様ファイルを確認すること:
- アーキテクチャ: @docs/specs/architecture.md
- データモデル: @docs/specs/data-model.md
- 各機能仕様: @docs/specs/features/ 配下
- 設計判断: @docs/decisions/ 配下

仕様に記載がない変更を行う場合は、先に仕様を更新してからコードを変更する。

## Documentation

- ドキュメント・UIテキストは日本語をデフォルトとする
- 不自然な直訳を避け、自然な日本語を使う
