# ユドナリウムマーダー 設計ドキュメント

このディレクトリは、`udonarium_murder`（[TK11235/udonarium](https://github.com/TK11235/udonarium) のフォーク）の **現行の設計** をまとめたものです。

- 対象は「いま動いているコードの設計」です。過去の実装経緯・変更履歴は扱いません（履歴は Git とコミットメッセージを参照）。
- 言語は日本語に統一しています。
- コードを変更したら、関連する設計ドキュメントも更新してください。

## 読む順番

初めて読む場合は次の順番を推奨します。

1. [architecture/01-overview.md](architecture/01-overview.md) — 全体像・技術スタック・起動とデータ同期の流れ
2. [architecture/02-synchronized-object-model.md](architecture/02-synchronized-object-model.md) — **最重要**。同期オブジェクトモデル（このアプリの核）
3. [architecture/03-messaging-and-network.md](architecture/03-messaging-and-network.md) — EventSystem と Network（SkyWay）
4. 以降は関心のあるサブシステムから読んでください。

## ドキュメント一覧

| ファイル | 内容 |
| --- | --- |
| [architecture/01-overview.md](architecture/01-overview.md) | 全体アーキテクチャ、技術スタック、レイヤー構成、起動シーケンス、同期の全体フロー |
| [architecture/02-synchronized-object-model.md](architecture/02-synchronized-object-model.md) | `GameObject` / `@SyncObject` / `@SyncVar` / `ObjectStore` / シリアライズ / 同期プロトコル |
| [architecture/03-messaging-and-network.md](architecture/03-messaging-and-network.md) | `EventSystem`（pub/sub）と `Network`、旧 SkyWay / 新 SkyWay(skyway2023)、ルーム・ロビー・再接続 |
| [architecture/04-backend.md](architecture/04-backend.md) | Netlify Functions バックエンド（`/v1/status`・`/v1/skyway2023/token`）、CORS、環境変数、トークン設計 |
| [architecture/05-file-sharing-and-save.md](architecture/05-file-sharing-and-save.md) | 画像・音声の P2P チャンク共有、`ImageStorage`/`AudioStorage`、ルームの ZIP セーブ/ロード |
| [architecture/06-ui-and-services.md](architecture/06-ui-and-services.md) | Angular UI 層（コンポーネント、サービス、パネル/モーダル、変更検知戦略） |
| [architecture/07-domain-objects.md](architecture/07-domain-objects.md) | 卓上オブジェクト階層、`DataElement`、チャット、ダイス（BCDice）、音声などのドメインモデル |
| [architecture/08-murder-mystery-extensions.md](architecture/08-murder-mystery-extensions.md) | フォーク固有機能（GM/ビューアモード、ゲームパネル、PDF 閲覧、タイマー、OGP） |
| [conventions.md](conventions.md) | コーディング規約、パスエイリアス、ビルド/テスト、アップストリーム同期手順 |
| [improvements.md](improvements.md) | いま改善すべき不良・改善点（優先度付き） |

## 関連資料

- [skyway-netlify-env-setup.md](skyway-netlify-env-setup.md) — 新 SkyWay / Netlify の環境変数とブラウザ設定の **実務手順**（セットアップ時に参照）。
- [new-skyway-migration-plan.md](new-skyway-migration-plan.md) — 新 SkyWay 移行の計画書（背景・設計判断の記録）。**移行自体はおおむね完了済み**で、現行の構成は上記 03・04 を正とします。
- リポジトリ直下の [AGENTS.md](../AGENTS.md) — エージェント/開発者向けの要約（このドキュメント群への入口）。
