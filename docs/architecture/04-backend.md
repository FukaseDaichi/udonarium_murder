# 04. バックエンド（Netlify Functions）

このアプリ唯一のサーバー処理は **SkyWay 認証トークンの発行** です。新 SkyWay（skyway2023）はブラウザから直接トークンを発行できない（= シークレットをフロントに置けない）ため、最小限の API をサーバー側に置きます。

- 実体: `netlify/functions/udonarium-backend.ts`（Netlify Functions v2）
- フロント側クライアント: `src/app/class/core/system/network/skyway2023/skyway-backend.ts`

## Netlify 構成

`netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist/udonarium"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- ビルド成果物 `dist/udonarium` を公開し、SPA なので未知パスは `index.html` へリライトします。
- Function は v2 の `config.path` で `"/v1/*"` を担当します。Netlify では **Function のルートが SPA リライトより優先** されるため、`/v1/*` はリライトされず Function に届きます。

```ts
// udonarium-backend.ts
export const config = { path: '/v1/*' };
```

## API 仕様

### `GET /v1/status`

疎通確認。

- 許可 Origin（または Origin ヘッダ無し）→ `200 OK`（`text/plain`）
- 不許可 Origin → `403`

### `POST /v1/skyway2023/token`

SkyWay 認証トークンを発行します。

リクエスト:

```json
{ "formatVersion": 1, "channelName": "<channel>", "peerId": "<peer>" }
```

レスポンス:

```json
{ "token": "<jwt>" }
```

ステータス:

| コード | 条件 |
| --- | --- |
| `200` | 発行成功 |
| `400` | 入力不正、または `SKYWAY_APP_ID` / `SKYWAY_SECRET` 未設定 |
| `403` | Origin 不許可 |

入力検証（`isValidName` ほか）:

- `formatVersion` は `1` のみ許可。
- `channelName` / `peerId` は `^[A-Za-z0-9_.%-]{1,128}$` のみ許可（空文字・記号は拒否）。
- `channelName` が `udonarium-lobby-` で始まる、または `channelName`/`peerId` に `*` を含む場合は拒否（ロビー権限の不正取得・ワイルドカード注入の防止）。

## CORS

`createCorsHeaders()` が `ACCESS_CONTROL_ALLOW_ORIGIN`（カンマ区切り）を見て判定します。

- `*` を含む設定なら全 Origin 許可（`Access-Control-Allow-Origin: *`）。
- それ以外は `new URL(origin).origin` で **正規化して厳格一致**（プレフィックス一致ではない）。
- `OPTIONS`（プリフライト）にも対応（許可時 `204`、不許可時 `403`）。

## トークン設計

`createSkyWayAuthToken()` が **HS256 の JWT を手作業で署名** して返します（`@skyway-sdk/token` は使わず `node:crypto` のみ）。`version: 2` 形式です。

付与する権限（`scope.app`）:

- `turn: true`（接続性確保のため TURN を有効化）
- **実ルーム Channel**（`channelName`）
  - Channel: `read` / `create`（プライベート時は `updateMetadata` も）
  - 自 Member（`peerId`）: `write`、Publication/Subscription に `write`
  - Member `name: "*"`: `signal`（他ピアとの P2P シグナリング用）
- **ロビー Channel**（`udonarium-lobby-*-of-${lobbySize}`）
  - Channel: `read` / `create`、自 Member: `write`

トークン有効期限は `SKYWAY_TOKEN_TTL_SECONDS` で指定します。未指定または不正値の場合は **2 時間**、許可範囲は **60 秒〜24 時間** です。フロントは `onTokenUpdateReminder` で失効前に再取得します（[03 章](03-messaging-and-network.md)）。

> ロビー名はトークン内ではワイルドカード（`udonarium-lobby-*-of-N`）で、フロントが `udonarium-lobby-1-of-N` … `N-of-N` に展開して使います。`N` は `SKYWAY_UDONARIUM_LOBBY_SIZE`（既定 4）。

## 環境変数

| 変数 | 用途 |
| --- | --- |
| `SKYWAY_APP_ID` | SkyWay Application ID |
| `SKYWAY_SECRET` | SkyWay Secret Key（**サーバーのみ**。フロントやリポジトリに置かない） |
| `ACCESS_CONTROL_ALLOW_ORIGIN` | 許可する Origin（例 `https://udonarium-murder.netlify.app`）。カンマ区切り可 |
| `SKYWAY_UDONARIUM_LOBBY_SIZE` | ロビー数（未指定で 4。1〜100 にクランプ） |
| `SKYWAY_TOKEN_TTL_SECONDS` | SkyWay Auth Token の有効期限（未指定で 7200 秒。60〜86400 秒） |

> セキュリティ: シークレットは Netlify の環境変数にのみ置きます。ローカル用の `.env` は **Git 管理対象に入れません**。

## フロント連携

`SkyWayBackend`（`skyway2023/skyway-backend.ts`）が API を呼びます。

```ts
new SkyWayBackend(url).alive();                                  // GET /v1/status
new SkyWayBackend(url).createSkyWayAuthToken(channelName, peerId); // POST /v1/skyway2023/token
```

- `url` は `config.yaml` の `backend.url`。**空文字なら `window.location.origin`（= 同一オリジンの `/v1`）** を使います（`resolveApiUrl`）。
- 本番（Netlify）では同一オリジンで完結するため `backend.url` は空でよく、ローカルでは `netlify dev` の URL（例 `http://localhost:8888/`）を指定します。

## ローカル開発

```bash
netlify dev          # フロント + Functions を一体で起動
curl http://localhost:8888/v1/status   # → OK（環境変数とOrigin設定が正しければ）
```

`config.yaml` 例（ローカル）:

```yaml
backend:
  mode: skyway2023
  url: http://localhost:8888/
```

詳しい運用手順はリポジトリ直下の [README.md](../../README.md) を参照してください。
