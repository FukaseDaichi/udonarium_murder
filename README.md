# ユドナリウムマーダー

このプロジェクトはユドナリウムをマーダーミステリー用にカスタマイズするために作成しました。

[ユドナリウム（Udonarium）][1]は Web ブラウザで動作するボードゲームオンラインセッション支援ツールです。本家ユドナリウムの開発範囲は本家に著作権が有ります。追加下部分は本ソースコードの作成者に著作権があります。

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/TK11235/udonarium/blob/master/LICENSE)

## 実際の開発手順コマンド

- git clone https://github.com/TK11235/udonarium.git
- npm install
- Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
- `.env.example` を参考に `.env` を作成
- npx netlify dev

## バージョンアップ方法

[参考](https://chaika.hatenablog.com/entry/2022/12/19/083000)
[参考](https://zenn.dev/yoshii0110/articles/820187fd237b44)

- npm i -g npm-check-updates
- ncu
- ncu -u

### 本家様の変更反映コマンド

- git fetch upstream
- git merge upstream/master

## 新 SkyWay + Netlify Functions

このフォークは新 SkyWay と Netlify Functions を前提にしています。SkyWay の Secret Key はフロントエンドに置かず、Netlify Function が `/v1/skyway2023/token` で SkyWay Auth Token を発行します。

ローカルで通信まで確認する場合は、`.env.example` をコピーして以下を設定してください。

```bash
SKYWAY_APP_ID=your-skyway-application-id
SKYWAY_SECRET=your-skyway-secret-key
SKYWAY_UDONARIUM_LOBBY_SIZE=4
ACCESS_CONTROL_ALLOW_ORIGIN=http://localhost:8888
```

起動は `npx netlify dev` を使います。`src/assets/config.yaml` の `backend.url` は空文字なら同一オリジンを使うため、Netlify Dev / Netlify本番のどちらでも `/v1/*` を参照します。

Netlify本番では環境変数に以下を設定します。

- `SKYWAY_APP_ID`
- `SKYWAY_SECRET`
- `ACCESS_CONTROL_ALLOW_ORIGIN=https://your-site.netlify.app`
- `SKYWAY_UDONARIUM_LOBBY_SIZE=4` 任意

SkyWay Free Plan は開発・検証用途なら無料枠で利用できます。ただし商用利用不可の条件があるため、恒常的な公開サービスとして運用する場合はSkyWayの契約条件を確認してください。

以下、本家の抜粋です。

# ユドナリウム

[ユドナリウム（Udonarium）][1]は Web ブラウザで動作するボードゲームオンラインセッション支援ツールです。

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/TK11235/udonarium/blob/master/LICENSE)

[![Udonarium](docs/images/ss.jpg "スクリーンショット")][1]

## クイックスタート

今すぐ試したり利用したりできる公開サーバを用意しています。  
推奨ブラウザはデスクトップ版 Google Chrome、またはデスクトップ版 Mozilla Firefox です。

[**ユドナリウムをはじめる**][1]

## 目次

- [機能](#機能)
- [サーバ設置](#サーバ設置)
- [開発者クイックスタート](#開発者クイックスタート)
- [開発に寄与する](#開発に寄与する)
- [今後の開発](#今後の開発)
- [License](#license)

## 機能

- **ブラウザ間通信**
  - WebRTC を利用したブラウザ間通信を実現しています。  
    サーバサイドを介さずに全ての機能を Web ブラウザ上で完結させることを目指しています。
- **軽量 & リアルタイム**
  - 軽量で快適に動作し、ユーザの操作は他のユーザにリアルタイムに反映されます。
- **遊ぶ機能**
  - ルーム機能
  - 複数テーブル管理、テーブルマスク
  - 立体地形
  - コマ、カード、共有メモ
  - チャット送受信、チャットパレット
  - ダイスボット（[BCDice](https://github.com/bcdice/bcdice-js)）
  - 画像ファイル共有
  - BGM 再生
  - セーブデータ生成（ZIP 形式）

## サーバ設置

ユーザ自身で Netlify サイトを用意し、そのサイトにユドナリウムを設置して利用することができます。

1. Netlifyでこのリポジトリを連携します。
1. Build command は `npm run build`、Publish directory は `dist/udonarium` です。`netlify.toml` にも同じ設定があります。
1. NetlifyのEnvironment variablesに `SKYWAY_APP_ID`、`SKYWAY_SECRET`、`ACCESS_CONTROL_ALLOW_ORIGIN` を設定します。
1. `src/assets/config.yaml` は通常そのまま使えます。`backend.mode: skyway2023`、`backend.url: ""` の場合、同一オリジンのNetlify Functions `/v1/*` を使用します。
1. NetlifyのURLにアクセスして、ルーム作成とロビー表示を確認してください。

このフォークではSkyWay Auth Token発行のためにNetlify Functionsを使用します。データベースは必要ありません。

## 開発者クイックスタート

ソースコードはそのままでは実行できません。  
開発環境を用意してビルドする必要があります。

### 開発環境

[Node.js](https://nodejs.org/)と[npm](https://www.npmjs.com/)が必要です。

言語は TypeScript を用い、[Angular](https://angular.io/)で実装されています。  
開発を効率化する CLI ツールとして[Angular CLI](https://github.com/angular/angular-cli)を利用しています。

インストール手順は[Angular 公式ページのセットアップ](https://angular.jp/guide/setup-local)が参考になります。

#### Angular CLI

リポジトリからソースコードをダウンロードした後、初回起動時のコマンドは以下のようになります。

```bash
cd "ソースコードを展開したディレクトリの場所"
npm install
npx netlify dev
```

`npx netlify dev`を実行すると通常`http://localhost:8888/`で開発用サーバが起動し、Netlify Functionsも同時に動作します。
いずれかのソースコードを変更すると、アプリケーションは自動的にリロードされます。

`ng build`でプロジェクトのビルドを実行します。ビルド成果物は`dist/`ディレクトリに格納されます。

#### 旧 SkyWay

**[旧 SkyWay](https://support.skyway.io/hc/)の Community Edition(無料版)の新規登録は終了しています。**

旧SkyWayのCDN読み込みは削除済みです。通常は `backend.mode: skyway2023` の新SkyWay構成を使用してください。

#### 新 SkyWay

新SkyWayは `backend.mode: skyway2023` で有効になります。SkyWay Auth TokenはNetlify Functionsで発行するため、SkyWay Secret Keyを `src/assets/config.yaml` やフロントエンドコードに記述しないでください。

## 開発に寄与する

バグを報告したり、ドキュメントを改善したり、開発の手助けをしたりしたいですか？

報告や要望の窓口として[GitHub の Issue](https://github.com/TK11235/udonarium/issues)、または[Twitter](https://twitter.com/TK11235)を利用できます。  
コードの[Pull Request](https://github.com/TK11235/udonarium/pulls)も歓迎です。

### 報告

バグ報告では、バグを再現できる必要十分な条件について、分かっている範囲で詳しく書いてください。  
基本的には「報告を受けて改修 → 次回更新時に反映」の流れで対応する予定です。

### 要望

機能要望では「何故それが必要なのか」について説明があると良いです。  
ただ、難易度や優先度の都合によりそっとしたままになる可能性があります。

### Pull Request

作成したコードやドキュメントをこのリポジトリに反映させたい時は Pull Request（PR）を送ってください。

PR のコードが完全ではない場合でも作業中 PR として送ることができます。  
その場合、作業中である旨を PR タイトルか説明文に付け加えてください。

## 今後の開発

最低限必要となる機能は実装されていますが、作業すべき課題が残されています。

取得した API キーの情報は`src/assets/config.yaml`に記述します。

## License

[MIT License](https://github.com/TK11235/udonarium/blob/master/LICENSE)

[1]: https://udonarium.app/
