# 改善点・不良（優先度付き）

現行コードで対応を検討すべき項目です。設計の説明は各 [architecture/](architecture/) ドキュメントを参照してください。

優先度の目安: **High** = セキュリティ/事故リスクや即効性が高い、**Medium** = 品質/保守性、**Low** = 軽微・本家由来・体感影響小。

## 未対応（推奨対応順）

| # | 優先度 | 項目 | 種別 |
| --- | --- | --- | --- |
| 1 | Medium | Angular component smoke spec が多数失敗する | テスト |
| 2 | Medium | skyway2023 接続層の SDK 連携テストが薄い | テスト |
| 3 | Medium | skyway2023 実装が SDK 内部 API に依存している | 保守性 |
| 4 | Low | `ACCESS_CONTROL_ALLOW_ORIGIN` 未設定時の案内が弱い | 運用 |
| 5 | Low | フォークコードに保存互換を伴う命名タイポが残っている | 可読性 |

---

### 1. Angular component smoke spec が多数失敗する（Medium）

- 現状: `ng test --watch=false --browsers=ChromeHeadless` は、生成時のままに近い component spec で多数失敗します。代表例は `NoopAnimationsModule` / `BrowserAnimationsModule` 未導入による synthetic property エラー、`ContextMenuService` / `ChatMessageService` / `ModalService` などの provider 不足です。
- 影響: 変更箇所だけを `--include` で絞れば検証できますが、フルの Karma/Jasmine スイートを回帰確認として使いにくい状態です。
- 対応: component smoke spec を実際の依存に合わせて整理し、アニメーションは `NoopAnimationsModule`、サービスは実サービスまたは明示的な stub を使う方針に統一します。

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
