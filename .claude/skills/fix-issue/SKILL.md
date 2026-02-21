# Fix Issue Skill

GitHub Issue を読み取り、ブランチ作成から PR 作成まで一括で実行する。

## 手順

1. `gh issue view $0` で Issue の内容を確認する
2. Issue の内容に基づいて `feature/issue-$0-<短い説明>` ブランチを作成する
3. 関連するソースコードを調査し、実装方針を3行で説明する
4. ユーザーの承認を得てから実装を開始する
5. 実装後、`npx tsc --noEmit` と `npm test` で検証する
6. conventional commit でコミットする（メッセージに `close #$0` を含める）
7. ブランチを push し、`gh pr create` で PR を作成する

## ルール

- 実装前に方針を確認する（Wrong Approach 防止）
- 2回修正して解決しない場合は原因分析を報告する
- スコープが大きい場合は分割を提案する
- main への直接 push は禁止
