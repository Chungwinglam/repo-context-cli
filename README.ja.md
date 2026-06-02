# Repo Context CLI

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

AI コーディングエージェント向けに、決定的なリポジトリコンテキストを生成します。

Repo Context CLI はローカルリポジトリをスキャンし、Codex、Claude Code、Cursor などのツールが読みやすい再利用可能なコンテキストファイルを生成します。プロジェクト構成、検出されたコマンド、テスト方法、安全境界を毎回手作業で説明する負担を減らします。

これは LLM による要約ツールではありません。リモート AI サービスも呼び出しません。リポジトリ内のファイルから決定的に事実を抽出し、Git でレビューできるコンテキストを作るための CLI です。

## クイックスタート

まず dry run で生成予定の内容を確認します。

```bash
npx repo-context-cli pack --dry-run --for codex
npx repo-context-cli pack --for codex
```

デフォルト出力：

```text
AGENTS.md
PROJECT_MAP.md
TESTING.md
.repo-context/
  index.json
```

## 解決する課題

AI コーディングエージェントを使うたびに、ユーザーはディレクトリ構成、テストコマンド、パッケージマネージャー、編集してはいけない生成物などを説明し直すことがあります。Repo Context CLI は、それらの基本情報を安定したファイルとして生成し、次のセッションも同じ検証可能な事実から始められるようにします。

## 安全境界

- LLM 呼び出しはありません。
- リモートサービスやアカウントは不要です。
- 業務ソースコードは編集しません。
- ルートの `.gitignore` と組み込みのノイズディレクトリ無視ルールを尊重します。
- `.env`、`.npmrc`、SSH key ディレクトリ、秘密鍵ファイルのような機密パスを除外します。
- token や認証情報付き URL のように見えるコマンド値は `<redacted>` に置き換えます。
- 既存の手書きファイルは、`--force` を指定しない限り上書きしません。

## 任意の機能

- `--html-report`：JavaScript なしの静的 HTML レポートを生成します。
- `--editor-config`：Cursor、VS Code、汎用 AI エディタ向けの静的ガイドを生成します。
- `repo-context mcp`：読み取り専用の stdio MCP サーバーを起動し、互換クライアントがファイルを書き込まずにコンテキストを取得できます。

## 関連ドキュメント

- [ROADMAP.md](ROADMAP.md)：フェーズ状況と次の目標。
- [docs/adoption.md](docs/adoption.md)：既存リポジトリへ安全に導入する手順。
- [docs/examples.md](docs/examples.md)：一般的な AI-agent ワークフロー例。
- [docs/comparison.md](docs/comparison.md)：手動 prompt 貼り付け、README-only onboarding、ディレクトリツリー dump との比較。
- [docs/project-closeout.md](docs/project-closeout.md)：現在のプロジェクト収尾状態と今後の保守範囲。
- [CONTRIBUTING.md](CONTRIBUTING.md)：ローカル開発、テスト、コントリビューションの説明。
