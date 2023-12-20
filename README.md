# ユドナリウムマーダー

このプロジェクトはユドナリウムをマーダーミステリー用にカスタマイズするために作成しました。

[ユドナリウム（Udonarium）][1]は Web ブラウザで動作するボードゲームオンラインセッション支援ツールです。本家ユドナリウムの開発範囲は本家に著作権が有ります。追加下部分は本ソースコードの作成者に著作権があります。

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/TK11235/udonarium/blob/master/LICENSE)

## 実際の開発手順コマンド

- git clone https://github.com/TK11235/udonarium.git
- npm install
- Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
- ng serve

## バージョンアップ方法

[参考](https://chaika.hatenablog.com/entry/2022/12/19/083000)
[参考](https://zenn.dev/yoshii0110/articles/820187fd237b44)

- npm i -g npm-check-updates
- ncu
- ncu -u

### 本家様の変更反映コマンド

- git fetch upstream
- git merge upstream/master

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

ユーザ自身で Web サーバを用意し、そのサーバにユドナリウムを設置して利用することができます。

1. [リリース版（**udonarium.zip**）](../../releases/latest)をダウンロードして解凍し、Web サーバに配置してください。  
   **開発者向けのソースコードをダウンロードしないように注意して下さい。**
1. [旧 SkyWay](https://support.skyway.io/hc/)の API キーを`assets/config.yaml`に記述します。
   - [旧 SkyWay](https://support.skyway.io/hc/)の Community Edition(無料版)の新規登録は終了しています。
   - [新 SkyWay](https://skyway.ntt.com/)への対応はユドナリウム 1.16.0 時点では実装途中です。
1. サーバに配置したユドナリウムの`index.html`にアクセスして動作することを確認してみてください。  
   上手く動作しない時は付属の`上手くサーバで動かない時Q&A.txt`を参照してください。

ユドナリウムはサーバーサイドの処理を持たないため CGI やデータベースは必要はありません。

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
ng serve
```

`ng serve`を実行すると`http://localhost:4200/`で開発用サーバが起動します。  
いずれかのソースコードを変更すると、アプリケーションは自動的にリロードされます。

`ng build`でプロジェクトのビルドを実行します。ビルド成果物は`dist/`ディレクトリに格納されます。

#### 旧 SkyWay

**[旧 SkyWay](https://support.skyway.io/hc/)の Community Edition(無料版)の新規登録は終了しています。**

このアプリケーションは通信処理に WebRTC を使用しています。  
WebRTC 向けのシグナリングサーバとして[旧 SkyWay](https://support.skyway.io/hc/ja)を利用しているため、動作確認のために旧 SkyWay の API キーが必要です。

取得した API キーの情報は`src/assets/config.yaml`に記述します。

#### 新 SkyWay

**[新 SkyWay](https://skyway.ntt.com/)を使用した通信処理はユドナリウム 1.16.0 時点では実装途中です。**

開発者向けのプレビュー版機能として実装しています。本番環境では使用しないでください。  
開発者自身でコード修正やセキュリティ対応を実施してプライベートな動作確認を行う場合のみ、[commit: 1bf7d86](https://github.com/TK11235/udonarium/commit/1bf7d866d97b791d226dc9b8c23de0357bf478b4) を参考にコードを書き替えてビルドを行ってください。

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
