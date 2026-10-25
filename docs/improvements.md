# 改善点・不良（優先度付き）

現行コードで対応を検討すべき項目です。設計の説明は各 [architecture/](architecture/) ドキュメントを参照してください。

優先度の目安: **High** = セキュリティ/事故リスクや即効性が高い、**Medium** = 品質/保守性、**Low** = 軽微・本家由来・体感影響小。

## 未対応（推奨対応順）

| # | 優先度 | 項目 | 種別 |
| --- | --- | --- | --- |
| 1 | Medium | `@skyway-sdk/core` 1.x 経由の依存に脆弱性が残っている | セキュリティ |
| 2 | Medium | skyway2023 接続層の SDK 連携テストが薄い | テスト |
| 3 | Medium | skyway2023 実装が SDK 内部 API に依存している | 保守性 |
| 4 | Low | `ACCESS_CONTROL_ALLOW_ORIGIN` 未設定時の案内が弱い | 運用 |
| 5 | Low | フォークコードに保存互換を伴う命名タイポが残っている | 可読性 |

---

### 1. `@skyway-sdk/core` 1.x 経由の依存に脆弱性が残っている（Medium）

- 現状: `npm audit --omit=dev` で、`@skyway-sdk/core` 1.x が依存する `uuid` 9.x（GHSA-w5hq-g745-h8pq）と `@skyway-sdk/token` の `zod` 3.x（GHSA-mrhx-c7xc-m3w5）が検出されます。`lodash` は `package.json` の `overrides` で修正版（4.18.1）に固定済みです。
- リスク: `uuid` は v3/v5/v6 にバッファを渡す使い方、`zod` は巨大なコレクションの検証で問題になるもので、SDK の用途（v4 の ID 生成、自前バックエンドが発行したトークンの検証）では悪用の経路は限定的です。
- 対応: `@skyway-sdk/core` 2.x への更新で `uuid` は解消しますが、メジャー更新で 項目 3 の内部 API 依存が壊れる可能性があるため、実接続での動作確認とあわせて行います。`zod` は SDK 側が zod 4 系へ移行するまで残ります。
- 開発時のみの依存（`@angular/build` の `undici`、`webpack-dev-server` の `sockjs`/`uuid` など）にも指摘が残りますが、本番バンドルには含まれません。

### 2. skyway2023 接続層の SDK 連携テストが薄い（Medium）

- 現状: トークン API、`PeerContext`、ファイル共有のチャンク分割/結合は自動テストがあります。
- 不足: `network/skyway2023/*` の実 SDK 接続、ロビー参加、トークン自動更新、再接続、Publication/Subscription の張り替えはブラウザ実行と SkyWay 側状態に依存しており、単体テストでは十分に押さえられていません。
- 対応: `SkyWayBackend` の HTTP 境界をモックしたテスト、`SkyWayFacade` の SDK 呼び出しを薄く差し替えたユニットテスト、手動確認手順の Playwright 化を検討します。
- 参照: [architecture/03-messaging-and-network.md](architecture/03-messaging-and-network.md)、[architecture/04-backend.md](architecture/04-backend.md)。

### 3. skyway2023 実装が SDK 内部 API に依存している（Medium）

- 現状: `skyway-data-stream.ts` で `_getOrCreateConnection`、`_datachannel`、`_getRTCPeerConnection` など、`@skyway-sdk/core` の内部メンバーを参照しています。
- リスク: SDK の minor/major 更新で内部構造が変わると、接続状態監視や DataChannel 取得が壊れる可能性があります。
- 対応: 公開 API で代替できる箇所を切り分け、SDK 更新時は `network/skyway2023/` を重点的に動作確認します。必要に応じて `@skyway-sdk/room` など現行 SDK の推奨構成も検証します。

### 4. `ACCESS_CONTROL_ALLOW_ORIGIN` 未設定時の案内が弱い（Low/運用）

- 現状: Token API は Origin 不許可時に `403` を返します。フェイルクローズとしては安全ですが、未設定のままデプロイするとルーム接続だけが失敗して見えます。
- 対応: 起動時に `GET /v1/status` と Token API の疎通結果を UI に出し、Origin 設定の不足が分かる案内を表示します。設定値は [skyway-netlify-env-setup.md](skyway-netlify-env-setup.md) を参照してください。

### 5. フォークコードに保存互換を伴う命名タイポが残っている（Low）

- 例: `GamePanel.nicknameFillter`、`AppComponent.isSaveing` / `progresPercent` など。
- 注意: `nicknameFillter` は `@SyncVar`（XML 属性名）なので、単純リネームは既存セーブデータと非互換になります。変更する場合は読み込み時の旧名フォールバックを用意します。
- 対応: 同期・保存形式に絡まないローカル名から順に直し、`@SyncVar` 名は互換移行の設計がある場合だけ変更します。
