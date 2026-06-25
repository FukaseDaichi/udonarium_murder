# 新SkyWay移行計画

作成日: 2026-06-25

> **ステータス: おおむね完了済み（計画/背景の記録として保持）。**
> 本書は移行の計画と設計判断を残すための文書です。現行コードはすでに `backend.mode: skyway2023` + Netlify Functions で動作しており、本書中の「現状との差分」（旧 CDN 読み込み、`Network` が旧 skyway 固定 等）は**過去の前提**です。現行の設計は [architecture/03-messaging-and-network.md](architecture/03-messaging-and-network.md) と [architecture/04-backend.md](architecture/04-backend.md) を正としてください。未消化のフォローアップは [improvements.md](improvements.md) にまとめています。

対象: `udonarium_murder` の旧SkyWay依存を、新SkyWayへ移行する。Netlify Hosting + Netlify Functionsを前提にする。

## 結論

このフォークの移行は、本家 `TK11235/udonarium` v1.17.4 の方針を基準にします。本家はすでに `backend.mode: skyway2023` と `backend.url` を導入し、Webブラウザでは発行できないSkyWay Auth TokenをバックエンドAPIから取得する形に変わっています。

このプロジェクトでは別リポジトリの `udonarium-backend` を用意せず、Netlify Functionsを同じリポジトリに置いて本家バックエンド相当のAPIを提供します。フロントエンドは本家の `backend.mode` / `backend.url` 方式へ寄せ、Netlify Functions側で `/v1/*` を処理します。

短期実装では、本家の `skyway2023` 構成を取り込むのが最短です。つまり、旧 `webrtc.key` 依存から、`backend.mode: skyway2023` + `backend.url` + `/v1/skyway2023/token` へ移行します。その後、SDK 2系 / Auth Token v3 / Room SDK化は安全化フェーズで検討します。

無料で進める場合はSkyWay Free Planを開発・検証用に使います。Free Planは商用利用不可なので、恒常的な公開サービスとして運用する場合はEnterprise Planまたは別基盤の検討が必要です。

## 実装状況

2026-06-25時点で、この計画のPhase 1からPhase 5までの初期実装は完了しています。

- `netlify/functions/udonarium-backend.ts` で `/v1/status` と `/v1/skyway2023/token` を提供する。
- `netlify.toml` でAngular build、publish directory、Functions directoryを定義する。
- `src/assets/config.yaml` の既定値を `backend.mode: skyway2023`、`backend.url: ""` にする。
- `Network.configure(config)` とdynamic importにより、新SkyWay通信層を既定にする。
- 本家 `TK11235/udonarium` v1.17.4 の `skyway2023` 通信層を取り込み、Netlify同一オリジンAPIへ接続する。
- `src/index.html` から旧SkyWay CDNを削除する。
- `README.md` にNetlify Functions前提のローカル/本番設定を追記する。

## 参考にする本家の実装

2026-06-25時点で確認した本家 `TK11235/udonarium` master / v1.17.4 の重要点です。

- `src/assets/config.yaml` に `backend.mode: skyway2023` と `backend.url` が追加され、旧 `webrtc.key` は非推奨になっている。
- `src/index.html` から旧SkyWay CDN `cdn.webrtc.ecl.ntt.com` のscript読み込みが消えている。
- `Network` は `backend.mode` に応じて `skyway2023/skyway-connection` または旧 `skyway/skyway-connection` をdynamic importする。
- `Connection` に `configure(config)` が追加され、`SkyWayConnection.configure()` が `backend.url` を受け取る。
- `skyway2023/skyway-backend.ts` は `GET /v1/status` と `POST /v1/skyway2023/token` を呼び出す。
- `skyway2023` ではプライベート接続が無効化され、ルーム接続のみ対応になっている。
- ロビー一覧は旧 `Peer.listAllPeers()` ではなく、`udonarium-lobby-*-of-N` 形式のSkyWay Channelを使って代替している。

参考にする本家 `TK11235/udonarium-backend` の重要点です。

- APIはHonoで実装されている。
- `GET /v1/status` は疎通確認として `OK` を返す。
- `POST /v1/skyway2023/token` は `{ formatVersion, channelName, peerId }` を受け取り、`{ token }` を返す。
- 環境変数は `SKYWAY_APP_ID`、`SKYWAY_SECRET`、`ACCESS_CONTROL_ALLOW_ORIGIN`、任意で `SKYWAY_UDONARIUM_LOBBY_SIZE`。
- トークン生成時に `channelName` が `udonarium-lobby-` で始まる場合、または `channelName` / `peerId` に `*` が含まれる場合は拒否している。
- トークンには実Room用Channelと `udonarium-lobby-*-of-N` ロビー用Channelの権限を含めている。

## 現状との差分

このフォークは本家 v1.17.4 より古い通信構成が残っています。

- `src/index.html` が旧SkyWay CDNを読み込んでいる。
- `src/assets/config.yaml` が旧 `webrtc.key` 中心で、`backend` 設定がない。
- `Network.initializeConnection()` が旧 `skyway/skyway-connection` を固定で生成している。
- `skyway2023/` は存在するが、現在の本家より古く、フロント内モックの痕跡や古いパッケージ前提が残る。
- `package.json` は `@skyway-sdk/core` が `^1.4.1` で、本家 v1.17.4 は `^1.9.2`。

まず本家の新SkyWay接続構成を取り込み、そのうえでNetlify Functionsを同居させる方針にします。

## Netlify構成

### URL設計

本家フロントのAPI契約を保つため、フロントからは以下を呼びます。

- `GET {backend.url}/v1/status`
- `POST {backend.url}/v1/skyway2023/token`

NetlifyではFunctionsの実体名をフロントに意識させず、`/v1/*` を単一Functionで処理します。

`netlify.toml` の案:

```toml
[build]
  command = "npm run build"
  publish = "dist/udonarium"
  functions = "netlify/functions"
```

Functions側はNetlify Functions v2の `config.path` で `/v1/*` に割り当てます。

```ts
import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  // route /v1/status and /v1/skyway2023/token
};

export const config: Config = {
  path: "/v1/*"
};
```

これにより、`backend.url` は本番では空文字のまま同一オリジンを使えます。別ドメインのFunctionsを使う場合だけ明示します。

```yaml
backend:
  mode: skyway2023
  url: ""
webrtc:
  key: "" # deprecated
```

ローカル開発でも `netlify dev` を使う場合は空文字のままで動作します。

```yaml
backend:
  mode: skyway2023
  url: ""
```

### Functions配置

追加するファイル案:

- `netlify.toml`
- `netlify/functions/udonarium-backend.ts`
- `.env.example`

`udonarium-backend.ts` は本家 `udonarium-backend` のHono routingを参考にします。ただし、このリポジトリに大きなmonorepo構成を持ち込まず、Netlify Functionsに必要な最小実装にします。

環境変数:

- `SKYWAY_APP_ID`: SkyWay Application ID。
- `SKYWAY_SECRET`: SkyWay Secret Key。
- `ACCESS_CONTROL_ALLOW_ORIGIN`: 許可するフロントのOrigin。例 `https://your-site.netlify.app`。
- `SKYWAY_UDONARIUM_LOBBY_SIZE`: ロビー数。未指定時は `4` 程度。

Netlify UIまたはNetlify CLIでSecretを設定し、リポジトリにはコミットしません。

## API仕様

### `GET /v1/status`

用途: フロントがバックエンド疎通を確認する。

レスポンス:

```text
OK
```

ステータス:

- `200`: 正常。
- `403`: Origin不許可。

### `POST /v1/skyway2023/token`

用途: SkyWay Auth Tokenを発行する。

リクエスト:

```json
{
  "formatVersion": 1,
  "channelName": "room-channel-name",
  "peerId": "peer-id"
}
```

レスポンス:

```json
{
  "token": "jwt..."
}
```

ステータス:

- `200`: 発行成功。
- `400`: 入力不正、環境変数不足。
- `403`: Origin不許可。

入力検証:

- `formatVersion` は `1` のみ許可。
- `channelName` と `peerId` は空文字を拒否。
- `channelName` が `udonarium-lobby-` で始まる場合は拒否。
- `channelName` と `peerId` に `*` が含まれる場合は拒否。
- SkyWayのname制約に合わせ、英数字、`-`、`.`、`_`、`%` を基本にする。
- リクエストbodyは小さく、JSON以外は拒否。

CORS:

- `ACCESS_CONTROL_ALLOW_ORIGIN` は完全なOrigin比較を基本にする。
- 本家バックエンドはprefix比較なので、Netlify版では `new URL(origin).origin` で正規化して厳格に比較する。
- `OPTIONS` にも対応する。

## トークン設計

短期実装は本家互換を優先し、Netlify Functions内でNode.jsの `crypto` を使ってHS256のSkyWay Auth Tokenを生成します。トークンpayloadは本家バックエンドと同じく `version: 2` 形式にします。

権限の考え方:

- 実Room用Channel: `channelName` に対して `read` / `create`、自Memberに `write`、Publication / Subscriptionに `write`。
- 他MemberとのP2Pシグナリング用: member `name: "*"` に `signal`。
- ロビー用Channel: `udonarium-lobby-*-of-${lobbySize}` に対して `read` / `create`、自Memberに `write`。
- TURNは有効化する。接続性確保のためで、無料枠消費はSkyWay Consoleで監視する。

本家互換のロビー名:

```ts
const lobbyName = `udonarium-lobby-*-of-${lobbySize}`;
```

フロント側は本家の `getLobbyNames()` と同じく、トークン内のワイルドカードから `udonarium-lobby-1-of-N` から `udonarium-lobby-N-of-N` へ展開します。

## フロント実装方針

### 1. 本家v1.17.4の通信層を取り込む

優先して取り込むファイル:

- `src/app/class/core/system/network/network.ts`
- `src/app/class/core/system/network/connection.ts`
- `src/app/class/core/system/network/skyway2023/skyway-backend.ts`
- `src/app/class/core/system/network/skyway2023/skyway-connection.ts`
- `src/app/class/core/system/network/skyway2023/skyway-facade.ts`
- `src/app/class/core/system/network/skyway2023/skyway-data-stream.ts`
- `src/app/class/core/system/network/skyway2023/skyway-data-stream-list.ts`
- `src/app/component/peer-menu/peer-menu.component.ts` の `canUsePrivateSession`
- `src/assets/config.yaml`
- `src/index.html` の旧SkyWay CDN削除

ただし、このフォーク固有のマーダーミステリー機能、PDF関連依存、OGP設定は消さないように差分適用します。

### 2. `AppConfig` を本家形式へ拡張する

追加する構造:

```ts
backend: {
  mode: string;
  url: string;
}
```

注意: 本家 `AppConfig` には `ur` というtypoらしき型定義があるため、このフォークでは `url` として正します。

`app.component.ts` の `LOAD_CONFIG` では、旧 `Network.setApiKey()` ではなく以下へ寄せます。

```ts
Network.configure(event.data);
Network.open();
```

旧SkyWay fallbackを残す期間だけ `webrtc.key` を読む互換処理を残します。

### 3. プライベート接続は初期対応外にする

本家同様、`backend.mode === "skyway2023"` ではプライベート接続を無効化します。

理由:

- 新SkyWayはRoom/Channel/Member/Publication/Subscriptionのモデルで、旧Peer直結とは違う。
- まずルーム接続を安定させる方が、ロビー、ファイル共有、再接続の検証をしやすい。

後続で必要なら、1対1接続を専用Roomとして再設計します。

### 4. 旧SkyWay CDNを外す

`src/index.html` から以下を削除します。

```html
<script type="text/javascript" src="https://cdn.webrtc.ecl.ntt.com/skyway-latest.min.js"></script>
```

旧実装をfallbackとして一時的に残す場合は、本家同様 `skyway-js` npm依存へ寄せ、グローバルCDN依存を減らします。

## 実装ステップ

### Phase 0: 本家差分の取り込み準備

- 本家 v1.17.4 とこのフォークの差分を確認する。
- 通信層だけを先に取り込む対象として切り出す。
- マーダーミステリー固有のUI、PDF、OGP、README差分は維持する。
- `docs/new-skyway-migration-plan.md` を基準文書にする。

完了条件:

- 取り込むファイル一覧が決まっている。
- 旧SkyWay fallbackを残すか、即削除するかを決める。

### Phase 1: Netlify Functionsバックエンド

- `netlify.toml` を追加する。
- `netlify/functions/udonarium-backend.ts` を追加し、`config.path: "/v1/*"` を設定する。
- `GET /v1/status` を実装する。
- `POST /v1/skyway2023/token` を実装する。
- `.env.example` を追加する。
- `netlify dev` で `GET /v1/status` とtoken発行を確認する。

完了条件:

- `curl http://localhost:8888/v1/status` が `OK` を返す。
- 許可OriginからのPOSTだけが `{ token }` を返す。
- `SKYWAY_SECRET` がビルド成果物に入らない。

### Phase 2: フロント設定と接続層

- `AppConfig` に `backend` を追加する。
- `Network.configure()`、dynamic import、`Connection.configure()` を本家から取り込む。
- `backend.mode: skyway2023` で `skyway2023/skyway-connection` を使う。
- `skyway2023/skyway-backend.ts` はNetlify Functionsの `/v1/*` を呼ぶ。
- `app.component.ts` の `LOAD_CONFIG` を `Network.configure()` へ変更する。
- `src/assets/config.yaml` をNetlify前提のサンプルにする。

完了条件:

- `backend.mode: skyway2023` でアプリが起動する。
- `backend.url` 未設定時に分かりやすいエラーを出す。
- 旧 `webrtc.key` がなくても新SkyWay接続を開始できる。

### Phase 3: ルーム接続とロビー

- 本家 `skyway2023/skyway-facade.ts` のロビー方式を取り込む。
- `udonarium-lobby-*-of-N` からロビー名を展開する。
- `listAllPeers()` をロビーChannelのMember一覧から作る。
- `RoomInfo.listFrom(peerIds)` で既存ロビーUIへ接続する。
- パスワード付きRoomの `channelName` は既存通りハッシュ化する。

完了条件:

- ルーム作成後、別ブラウザのロビー一覧に表示される。
- パスワードなしRoomへ参加できる。
- パスワードありRoomへ正しいパスワードで参加でき、誤ったパスワードでは参加できない。

### Phase 4: 同期通信

- DataStreamのpublish/subscribeを本家実装ベースで取り込む。
- `MessagePack`、圧縮、chunk分割、TTL relay、user list通知を維持する。
- 2ブラウザ間でチャット、コマ移動、カード、共有メモ、画像、BGM、PDF関連の同期を確認する。
- リロード後の再接続を確認する。

完了条件:

- 既存のユドナリウム同期イベントが旧SkyWayと同じ形で届く。
- ファイル共有系の大きなpayloadがchunk復元できる。
- `PeerCursor` と接続者一覧が更新される。

### Phase 5: UI/README更新

- READMEの旧SkyWay APIキー案内をNetlify Functions + SkyWay Auth Token案内に置き換える。
- `ng serve --ssl` だけでなく、`netlify dev` を使う開発手順を書く。
- Netlify環境変数の設定手順を書く。
- `backend.mode: skyway2023` ではプライベート接続を非表示またはdisabledにする。
- エラーメッセージを「APIバックエンド」から「Netlify Functions」前提でも分かる文言にする。

完了条件:

- 新規開発者がREADMEだけでNetlify Functions込みのローカル検証を開始できる。
- 本番Netlifyで環境変数設定後に接続できる。

### Phase 6: 安全化と将来更新

本家互換で動いた後に進めます。

- SDK内部プロパティ参照の削減。
- `@skyway-sdk/core` 1系から2系への更新検証。
- SkyWay Auth Token v3への移行。
- `@skyway-sdk/room` 2系を使う構成への移行可否を検証。
- `LocalDataStream.onWritable` を使った送信開始制御を検討。
- トークンTTL短縮と自動更新の検証。

完了条件:

- 本家互換実装から、より現行SDKに近い実装へ段階移行できる見通しがある。
- Free Planの接続数、TURN転送量をSkyWay Consoleで監視できる。

## テスト計画

自動テスト:

- Netlify FunctionのOrigin許可/拒否。
- token APIの入力検証。
- token APIが環境変数不足時に400を返す。
- `PeerContext` の生成、parse、パスワード検証。
- chunk分割/復元。
- `RoomInfo.listFrom(peerIds)`。

手動E2E:

- `netlify dev` で `/v1/status` が成功する。
- Chrome 2ウィンドウで同一Roomへ参加する。
- ChromeとFirefoxで同一Roomへ参加する。
- ロビー一覧にRoomが出る。
- パスワードあり/なしRoomで接続する。
- チャット、コマ移動、カード操作、共有メモ、画像、BGM、PDFを同期する。
- 片方のブラウザをリロードして再接続する。
- 片方を閉じた時に切断表示される。
- Netlify本番デプロイ後、同じ手順を確認する。

無料枠確認:

- SkyWay Consoleで接続数の増加を確認する。
- TURN転送量が増えるケースを確認する。
- 再接続ループで接続数を過剰消費しないことを確認する。

## リスクと対策

| リスク | 影響 | 対策 |
| --- | --- | --- |
| Free Planが開発・検証用途限定 | 公開運用の可否に影響 | 非商用検証か本番運用かを明確化し、本番ならEnterpriseまたは別基盤を検討 |
| Netlify Functionsのcold start | 初回token取得が遅れる | 起動時にstatus確認し、失敗時は再試行と分かりやすい表示 |
| `ACCESS_CONTROL_ALLOW_ORIGIN` 設定ミス | token APIが403になる | READMEにNetlify本番URLとlocalhost/netlify devの設定例を書く |
| Secret漏えい | SkyWayの不正利用 | SecretはNetlify環境変数のみ、`.env` はコミット禁止 |
| 本家 `skyway2023` がSDK内部APIに依存 | SDK更新で壊れる | 短期は本家互換、安定後に公開API中心へ刷新 |
| `listAllPeers()` が新SkyWayにない | ロビー一覧が作れない | 本家同様 `udonarium-lobby-*-of-N` 方式を使う |
| プライベート接続非対応 | 一部既存導線が使えない | 初期はdisabled、本当に必要なら1対1 Roomとして後続設計 |

## 採用しない方針

- フロントエンドにSkyWay Secret Keyを埋め込む。
- `SkyWayContext.CreateForDevelopment(appId, secret)` を公開ビルドで使う。
- Netlify Functionsとは別に常設Node.jsサーバを必須にする。
- 旧SkyWay CDNを新SkyWay対応後も本番で読み続ける。
- まずSDK 2系 / Room SDKへ全面刷新してから接続確認する。

最後の点は重要です。今回は本家追従とNetlify Functions内蔵化を優先し、SDK刷新は次の段階にします。

## 参考資料

- TK11235/udonarium: https://github.com/TK11235/udonarium
- TK11235/udonarium-backend: https://github.com/TK11235/udonarium-backend
- SkyWay料金: https://skyway.ntt.com/en/pricing/
- SkyWay Auth Token: https://skyway.ntt.com/ja/docs/user-guide/authentication/skyway-auth-token/
- SkyWay通信要件: https://skyway.ntt.com/ja/docs/user-guide/commons/communication-requirements/
- SkyWay割り当てと制限: https://skyway.ntt.com/ja/docs/user-guide/commons/quotas-and-limits/
- Netlify Functions: https://docs.netlify.com/functions/overview/
