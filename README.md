# ユドナリウムマーダー

このプロジェクトはユドナリウムをマーダーミステリー用にカスタマイズするために作成しました。

[ユドナリウム（Udonarium）][1]は Web ブラウザで動作するボードゲームオンラインセッション支援ツールです。本家ユドナリウムの開発範囲は本家に著作権が有ります。追加下部分は本ソースコードの作成者に著作権があります。

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/TK11235/udonarium/blob/master/LICENSE)

## 実際の開発手順コマンド

- git clone https://github.com/TK11235/udonarium.git
- npm install
- Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

以下、本家の抜粋です。

# ユドナリウム

[ユドナリウム（Udonarium）][1]は Web ブラウザで動作するボードゲームオンラインセッション支援ツールです。

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/TK11235/udonarium/blob/master/LICENSE)

[![Udonarium](docs/images/ss.jpg "スクリーンショット")][1]

## クイックスタート

今すぐ試したり利用したりできる公開サーバを用意しています。  
推奨ブラウザはデスクトップ版 Google Chrome です。

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
  - ダイスボット（[BCDice](https://github.com/bcdice/BCDice)を[Opal](http://opalrb.com/)で JavaScript にトランスパイル）
  - 画像ファイル共有
  - BGM 再生
  - セーブデータ生成（ZIP 形式）

## サーバ設置

ユーザ自身で Web サーバを用意し、そのサーバにユドナリウムを設置して利用することができます。

1. [リリース版（**udonarium.zip**）](../../releases/latest)をダウンロードして解凍し、Web サーバに配置してください。  
   **開発者向けのソースコードをダウンロードしないように注意して下さい。**
1. [SkyWay](https://webrtc.ecl.ntt.com/)の API キーを取得し、API キー情報を`assets/config.yaml`に記述します。
1. サーバに配置したユドナリウムの`index.html`にアクセスして動作することを確認してみてください。  
   上手く動作しない時は付属の`上手くサーバで動かない時Q&A.txt`を参照してください。

ユドナリウムはサーバーサイドの処理を持たないので、CGI やデータベースは必要はありません。

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
cd ソースコードを展開したディレクトリの場所
npm install
ng serve
```

`ng serve`を実行すると`http://localhost:4200/`で開発用サーバが起動します。  
いずれかのソースコードを変更すると、アプリケーションは自動的にリロードされます。

`ng build`でプロジェクトのビルドを実行します。ビルド成果物は`dist/`ディレクトリに格納されます。  
`ng build --prod`を使用すると、最適化された本番環境向けビルドが生成されます。

#### SkyWay

このアプリケーションは通信処理に WebRTC を使用しています。  
WebRTC 向けのシグナリングサーバとして[SkyWay](https://webrtc.ecl.ntt.com/)を利用しているため、動作確認のために SkyWay の API キーが必要です。

取得した API キーの情報は`src/assets/config.yaml`に記述します。

## License

[MIT License](https://github.com/TK11235/udonarium/blob/master/LICENSE)

[1]: https://udonarium.app/
