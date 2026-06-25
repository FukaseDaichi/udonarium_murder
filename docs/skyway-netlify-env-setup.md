# 新SkyWay + Netlify環境変数設定手順

このドキュメントは、Udonarium Murderを新SkyWay + Netlify Functions構成で動かすために必要な `.env` / Netlify環境変数と、ブラウザ上での設定手順をまとめたものです。

## 設定する環境変数

ローカル開発用の `.env` と、Netlify本番のEnvironment variablesには同じキーを設定します。

```env
SKYWAY_APP_ID=
SKYWAY_SECRET=
SKYWAY_UDONARIUM_LOBBY_SIZE=4
SKYWAY_TOKEN_TTL_SECONDS=7200
ACCESS_CONTROL_ALLOW_ORIGIN=http://localhost:8888
```

| 変数名 | 必須 | 設定先 | 説明 |
| --- | --- | --- | --- |
| `SKYWAY_APP_ID` | 必須 | Netlify Functions / ローカル `.env` | SkyWay Consoleで作成したアプリケーションID。 |
| `SKYWAY_SECRET` | 必須 | Netlify Functions / ローカル `.env` | SkyWay Consoleで取得するシークレットキー。フロントエンド、`src/assets/config.yaml`、`netlify.toml` には書かない。 |
| `SKYWAY_UDONARIUM_LOBBY_SIZE` | 任意 | Netlify Functions / ローカル `.env` | ロビー用Channelの分割数。未設定や不正値の場合はFunction側で `4` として扱う。通常は `4` のままでよい。 |
| `SKYWAY_TOKEN_TTL_SECONDS` | 任意 | Netlify Functions / ローカル `.env` | SkyWay Auth Tokenの有効期限。未設定や不正値の場合は `7200` 秒として扱う。指定できる範囲は `60`〜`86400` 秒。 |
| `ACCESS_CONTROL_ALLOW_ORIGIN` | 必須 | Netlify Functions / ローカル `.env` | Token APIを許可するブラウザOrigin。例: `http://localhost:8888`、`https://your-site.netlify.app`。複数指定する場合はカンマ区切り。 |

## ローカル開発用 `.env`

リポジトリ直下に `.env` を作ります。`.env.example` をコピーして値を埋めるのが安全です。

```bash
cp .env.example .env
```

ローカルで `npx netlify dev` を使う場合の例です。

```env
SKYWAY_APP_ID=00000000-0000-0000-0000-000000000000
SKYWAY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SKYWAY_UDONARIUM_LOBBY_SIZE=4
SKYWAY_TOKEN_TTL_SECONDS=7200
ACCESS_CONTROL_ALLOW_ORIGIN=http://localhost:8888
```

`.env` は秘密情報を含むためコミットしません。Netlify FunctionsはNetlify Dev上ではこの `.env` を読み、本番ではNetlify UIに登録したEnvironment variablesを読みます。

## Netlify本番用の値

Netlify本番では、`ACCESS_CONTROL_ALLOW_ORIGIN` を公開URLのOriginにします。末尾のパスは入れません。

```env
SKYWAY_APP_ID=00000000-0000-0000-0000-000000000000
SKYWAY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SKYWAY_UDONARIUM_LOBBY_SIZE=4
SKYWAY_TOKEN_TTL_SECONDS=7200
ACCESS_CONTROL_ALLOW_ORIGIN=https://your-site.netlify.app
```

独自ドメインを使う場合は、そのOriginを指定します。

```env
ACCESS_CONTROL_ALLOW_ORIGIN=https://udonarium.example.com
```

複数のOriginを許可したい場合はカンマ区切りです。

```env
ACCESS_CONTROL_ALLOW_ORIGIN=https://your-site.netlify.app,https://udonarium.example.com
```

`*` も技術的には使えますが、どのWebサイトからでもToken APIを呼べる状態になるため、公開運用では使わないでください。

## SkyWayをブラウザで設定する

1. [SkyWay Console](https://console.skyway.ntt.com/) にアクセスしてログインします。未登録の場合はサインアップします。
2. プロジェクトがない場合は、画面上部のプロジェクト切り替えメニューから「プロジェクトを作成」を選び、任意のプロジェクト名で作成します。新規プロジェクトはFreeプランで開始されます。
3. 左メニューの「アプリケーション一覧」を開きます。
4. 画面右上の「アプリケーションを作成」を押します。
5. アプリケーション名を入力します。例: `udonarium-murder-netlify`
6. 作成後、アプリケーション一覧または作成完了画面に表示される「アプリケーションID」と「シークレットキー」をコピーします。
7. コピーした値を、それぞれ `SKYWAY_APP_ID` と `SKYWAY_SECRET` に設定します。

シークレットキーはSkyWay Auth Tokenの署名に使います。ブラウザに配信されるファイルやGit管理下の設定ファイルへは絶対に書かず、Netlify Environment variablesだけに入れてください。

## Netlifyをブラウザで設定する

### サイト作成

1. [Netlify](https://app.netlify.com/) にログインします。
2. `Add new project` または `Import from Git` から、このGitリポジトリを連携します。
3. Build settingsは以下にします。`netlify.toml` に同じ内容があるため、UI側で自動認識される場合はそのままで構いません。

| 項目 | 値 |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist/udonarium` |
| Functions directory | `netlify/functions` |

### Environment variablesを登録する

1. Netlifyで対象サイトを開きます。
2. `Project configuration` > `Environment variables` を開きます。
3. `Add a variable` または `Import from .env` を選びます。
4. 以下の4つを登録します。

```env
SKYWAY_APP_ID=SkyWayのアプリケーションID
SKYWAY_SECRET=SkyWayのシークレットキー
SKYWAY_UDONARIUM_LOBBY_SIZE=4
SKYWAY_TOKEN_TTL_SECONDS=7200
ACCESS_CONTROL_ALLOW_ORIGIN=https://your-site.netlify.app
```

5. Scopeを選べる画面が出る場合は、少なくとも `Functions` を含めます。Build時にも参照したい場合だけ `Builds` も含めます。
6. Deploy contextを選べる画面が出る場合は、まず `All deploy contexts` または `Production` に設定します。
7. `SKYWAY_SECRET` は、UIに `Contains secret values` のような秘密値オプションがある場合は有効にします。
8. 保存後、`Deploys` から新しいDeployを実行します。Netlify Functionsの環境変数はDeploy時点の値が使われるため、値を変更した後は再Deployが必要です。

Netlify Functionsから参照する秘密値は、`netlify.toml` ではなくNetlify UIのEnvironment variablesに入れます。Netlify公式ドキュメント上も、Functionsで使う環境変数はUI/CLI/APIで設定し、`netlify.toml` に宣言した値はFunctions runtimeでは使えない扱いです。

## フロント側の設定

通常は `src/assets/config.yaml` を変更しません。

```yaml
backend:
  mode: skyway2023
  url: ""
webrtc:
  key: ""
```

`backend.url: ""` の場合、ブラウザで開いているサイトと同じOriginの `/v1/status` と `/v1/skyway2023/token` を呼びます。Netlify HostingとNetlify Functionsを同じサイトで動かす構成なら、このままでよいです。

別のドメインにToken APIを置く場合だけ、`backend.url` にAPIのOriginを入れます。

```yaml
backend:
  mode: skyway2023
  url: "https://your-api-site.netlify.app"
```

その場合、`ACCESS_CONTROL_ALLOW_ORIGIN` はフロント側サイトのOriginにしてください。

## ブラウザでの疎通確認

Deploy後、ブラウザで以下にアクセスします。

```text
https://your-site.netlify.app/v1/status
```

`OK` と表示されればNetlify Functionは応答しています。

次に、同じサイトを開いた状態でブラウザのDeveloper Tools ConsoleからToken APIを確認します。

```js
await fetch('/v1/skyway2023/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formatVersion: 1,
    channelName: 'test-room',
    peerId: 'test-peer'
  })
}).then(async (response) => ({
  status: response.status,
  body: await response.json()
}))
```

`status: 200` と `body.token` が返れば、Netlify FunctionsからSkyWay Auth Tokenを発行できています。

よくある失敗:

- `403 Origin is not allowed.`: `ACCESS_CONTROL_ALLOW_ORIGIN` がブラウザのOriginと一致していません。`https://your-site.netlify.app/path` ではなく `https://your-site.netlify.app` のようにOriginだけを設定します。
- `400 SKYWAY_APP_ID and SKYWAY_SECRET are required.`: Netlify Environment variablesが未設定、または再Deploy前です。
- `404 Not Found`: `netlify.toml` のFunctions設定やDeploy結果を確認します。
- アプリ画面でロビーが出ない: `/v1/status` とToken APIの確認後、SkyWay Consoleの利用状況とブラウザConsoleのエラーを確認します。

## 参考公式ドキュメント

- [SkyWay Console 概要](https://skyway.ntt.com/en/docs/user-guide/console-site/overview/)
- [SkyWay JavaScript SDK クイックスタート](https://skyway.ntt.com/ja/docs/user-guide/javascript-sdk/quickstart/)
- [SkyWay Auth Token](https://skyway.ntt.com/ja/docs/user-guide/authentication/skyway-auth-token/)
- [旧バージョン SkyWay Auth Token](https://skyway.ntt.com/ja/docs/user-guide/authentication/skyway-auth-token-legacy/)
- [Netlify Environment variables](https://docs.netlify.com/build/environment-variables/get-started/)
- [Netlify Functions environment variables](https://docs.netlify.com/build/functions/environment-variables/)
