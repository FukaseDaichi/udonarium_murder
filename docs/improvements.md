# 改善点・不良（優先度付き）

現行コードを見直して洗い出した、**いま対応を検討すべき** 項目です。設計の説明は各 [architecture/](architecture/) ドキュメントを参照してください。

> 確認時点: 本リポジトリは並行して活発に更新されています（新 SkyWay / Netlify 対応が直近コミットで進行）。本書はその時点のコードを実地確認した結果です。着手前に最新コードで再確認してください。

優先度の目安: **High** = セキュリティ/事故リスクや即効性が高い、**Medium** = 品質/保守性、**Low** = 軽微・本家由来・体感影響小。

## 未対応（推奨対応順）

| # | 優先度 | 項目 | 種別 |
| --- | --- | --- | --- |
| 1 | Medium | 新バックエンド / skyway2023 接続層に自動テストが無い | テスト |
| 2 | Medium | 認証トークン TTL が 24h 固定（環境変数で可変化したい） | セキュリティ/運用 |
| 3 | Medium | skyway2023 実装が SDK 内部 API に依存（SDK 更新で破損し得る） | 保守性 |
| 4 | Low | `ACCESS_CONTROL_ALLOW_ORIGIN` 未設定だと全リクエスト 403（運用の落とし穴） | 運用 |
| 5 | Low | フォークコードの命名タイポ（`nicknameFillter` 等） | 可読性 |
| 6 | Low | `ObjectStore._garbageCollection()` のデッドループ（GC が実質無効） | 不具合（本家由来） |
| 7 | Low | `GamePanelViewerComponent.pdfSrc` の null ガード欠如 | 堅牢性 |
| 8 | Low | `README.md` に残る軽微な誤り（本家 clone URL 等）※本タスクで修正 | ドキュメント |

---

### 1. バックエンド / skyway2023 にテストが無い（Medium）

- 事実: 既存 `.spec.ts` は旧来のコア中心で、`netlify/functions/udonarium-backend.ts` と `network/skyway2023/*` のテストが無い（確認済み）。移行計画のテスト計画（Origin 許可/拒否、トークン入力検証、env 不足時 400、`PeerContext`、チャンク分割）が未消化。
- 対応（最小セット）:
  - トークン API: `formatVersion`/`channelName`/`peerId` の検証、`udonarium-lobby-` 拒否、`*` 拒否、env 不足時 400、CORS 許可/拒否。
  - `PeerContext` の生成/parse/パスワード由来チャンネル名。
  - `BufferSharingTask` のチャンク分割/結合。
- 参照: [architecture/04-backend.md](architecture/04-backend.md)、[architecture/03-messaging-and-network.md](architecture/03-messaging-and-network.md)。

### 2. 認証トークン TTL が 24h 固定（Medium）

- 事実: `udonarium-backend.ts` の `tokenLifetimeSeconds = 60*60*24` がハードコード（確認済み）。
- 背景: フロントは `onTokenUpdateReminder` で失効前に自動再取得するため、**TTL を短くしても再ログインは不要**。長い TTL は漏洩時の影響を広げる。
- 対応: `SKYWAY_TOKEN_TTL_SECONDS`（環境変数）で可変化し、既定をより短く（例 1〜2 時間）。

### 3. skyway2023 が SDK 内部 API に依存（Medium）

- 事実: 移行計画自身が「安全化フェーズ」として **SDK 内部プロパティ参照の削減** を課題に挙げている（本家 `skyway2023` 由来）。
- リスク: `@skyway-sdk/core` の更新で動作が壊れ得る。
- 対応: 公開 API 中心へ寄せる。`@skyway-sdk/core` 1 系→2 系、Auth Token v3、`@skyway-sdk/room` 化の検証（移行計画 Phase 6）。当面は本家追従で安定運用。

### 4. `ACCESS_CONTROL_ALLOW_ORIGIN` 未設定で全 403（Low/運用）

- 事実: 未設定だと CORS 判定が通らず、ブラウザからの `POST /v1/skyway2023/token` が一律 403（フェイルクローズ自体は安全側）。
- 影響: デプロイ直後に「接続できない」と誤認しやすい。Netlify の cold start と重なると切り分けが難しい。
- 対応: `GET /v1/status`（`SkyWayBackend.alive()`）を起動時チェックに使い、失敗時に分かりやすい案内を出す。設定例は `README.md` と [architecture/04-backend.md](architecture/04-backend.md) に記載済み。

### 5. フォークコードの命名タイポ（Low）

- 例: `GamePanel.nicknameFillter`（→ `filter`）、`isShortcutView` 内の `matchCont`（→ `count`）、`AppComponent.isSaveing` / `progresPercent`（確認済み）。
- 注意: `nicknameFillter` は **`@SyncVar`（= XML 属性名 = セーブ互換）** のため、単純リネームは過去セーブデータと非互換になる。リネームするなら読み込み時の旧名フォールバックを用意する。
- 対応: 同期に絡まないローカル変数（`matchCont` 等）は即リネーム可。同期フィールドは互換を保ったうえで段階的に。

### 6. `ObjectStore._garbageCollection()` のデッドループ（Low/本家由来）

- 事実: `let checkLength = size - 100000; if (checkLength < 1) return;` の直後に `while (checkLength < 1) { ... }` があり、早期 return を抜けた時点で `checkLength >= 1` のため **ループ本体が一度も実行されない**（`object-store.ts` で確認）。内部の `if (timeStamp + ms < nowDate) continue; delete` も条件が反転しているように見える。
- 影響: 削除履歴（`garbageMap`）の自動回収が機能しない。ただし 10 万件超の削除でのみ顕在化するため実害は限定的。本家由来。
- 対応: 余裕があるときに本家の最新実装と突き合わせて修正。`clearDeleteHistory()` が別途あるため緊急度は低い。

### 7. `GamePanelViewerComponent.pdfSrc` の null ガード欠如（Low）

- 事実: `get pdfSrc() { return this.pdfFile.url; }` だが `@Input() pdfFile` は既定 `null`（確認済み）。設定前に評価されるとテンプレートエラー。
- 対応: `this.pdfFile?.url ?? ''` 等のガードを入れる。

### 8. `README.md` の軽微な誤り（Low・本タスクで修正）

- 事実: 「実際の開発手順コマンド」の `git clone` が本家リポジトリ URL を指している、`Set-ExecutionPolicy`（Windows PowerShell 専用）が文脈不明に並ぶ、「今後の開発」に旧前提（`config.yaml` に API キー記載）が残る。
- 対応: 本タスクで fork URL・注記・設計ドキュメントへの導線を修正済み。

---

## 解決済み（参考）

レビュー中に並行コミットで解消された項目です。記録として残します。

- **`.env` の Git 追跡リスク**: `.gitignore` に `.env`（および `.netlify`）が追加され、`.env.example` も用意済み（`git check-ignore .env` で確認）。シークレットは Netlify 環境変数にのみ置く運用。万一、過去に有効な `SKYWAY_SECRET` / SkyWay キーをコミットしていた場合は履歴削除だけでなく**失効・再発行**を行うこと。
- **ドキュメントの陳腐化**: `README.md` は新 SkyWay + Netlify 構成へ更新済み。`AGENTS.md` と `docs/new-skyway-migration-plan.md` は本タスクで現行構成へ更新（移行完了を明記、現行の正は [architecture/03](architecture/03-messaging-and-network.md)・[04](architecture/04-backend.md)）。
