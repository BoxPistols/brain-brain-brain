# Push Skill

変更をコミット → プッシュ → PR更新まで一括で実行する。

## 手順

1. `git status` と `git diff --staged` で変更内容を確認する
2. 変更内容を要約した conventional commit メッセージを作成する（feat:, fix:, refactor: 等）
3. mainブランチにいる場合はブランチ作成を促す（mainへの直接pushは禁止）
4. `git add` で関連ファイルを個別にステージングする（`git add -A` は .env や不要ファイルの誤コミット防止のため使わない）
5. コミットを実行する
6. リモートブランチにpushする
7. このブランチにオープンPRがあれば、PR説明文を最新の変更に合わせて更新する

## ルール

- コミットメッセージに絵文字、"Generated with Claude Code"、"Co-Authored-By" を含めない
- force push はユーザーの明示的な承認なしに実行しない
- .env や credentials を含むファイルはコミットしない
