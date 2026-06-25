# 規約・開発ガイド

## コマンド

```bash
npm install                  # 依存インストール
ng serve                     # 開発サーバ http://localhost:4200（ライブリロード）
ng build                     # 本番ビルド → dist/udonarium/
npm run watch                # 開発ビルド（変更監視）
ng test                      # Karma + Jasmine（Chrome、ウォッチ）
npm run test:backend         # Netlify Function の Node テスト
netlify dev                  # フロント + Functions を一体起動（バックエンド検証時）
```

- **単一テスト**: `.spec.ts` 内で `fdescribe`/`fit` に絞る、またはパス指定 `ng test --include='**/object-store.spec.ts'`。
- **ヘッドレス 1 回実行**: `ng test --watch=false --browsers=ChromeHeadless`。
- **バックエンド 1 回実行**: `npm run test:backend`。
- 実際に通信を動かすには SkyWay の構成が必要です（下記「設定」）。

## 設定（config.yaml）

`src/assets/config.yaml` を `AppConfigService` が読み込みます。

```yaml
backend:
  mode: skyway2023        # 既定。新 SkyWay + Netlify Functions
  url: ""                 # 空なら同一オリジンの /v1 を使用。ローカルは http://localhost:8888/
webrtc:
  key: ""                 # 非推奨。mode: skyway（旧 SkyWay）に戻す場合のみ設定
```

詳細は [architecture/04-backend.md](architecture/04-backend.md)。

## パスエイリアス（tsconfig.json）

| エイリアス | 実体 |
| --- | --- |
| `@udonarium/*` | `src/app/class/*` |
| `component/*` | `src/app/component/*` |
| `service/*` | `src/app/service/*` |
| `directive/*` | `src/app/directive/*` |
| `pipe/*` | `src/app/pipe/*` |

新規 import はこのエイリアスを使ってください（深い相対パスを避ける）。

## コードスタイル

`.editorconfig` / `.prettierrc` に従います。

- インデント 2 スペース、最終行に改行、行末空白を除去。
- TypeScript は **シングルクォート**。
- Prettier `printWidth: 200`（横長を許容）。
- `class/` 配下は Angular 非依存（フレームワークに依存しない純 TS）を保つ。

## 命名・設計の注意

- 新しい共有状態は `@SyncObject('一意なalias')` + `@SyncVar()` で作る（[architecture/02-synchronized-object-model.md](architecture/02-synchronized-object-model.md)）。
- **`aliasName`（XML タグ名）と `@SyncVar` のフィールド名はセーブデータ互換に直結** する。既存のものをリネーム/変更しない（必要時は移行を用意）。
- コンポーネントは `EventSystem.register(this).on(...)` で購読し、`ngOnDestroy` で `EventSystem.unregister(this)` を必ず呼ぶ。

## コミット規約

Conventional Commits 形式のプレフィックスを使います。本文は日本語が多いです。

```
feat: ゲームパネルに表示条件を追加
fix: 再接続時のロビー重複を修正
docs: 設計ドキュメントを更新
build: 依存パッケージ更新
perf: 不要なソートを削減
```

## アップストリーム同期

本家の変更を定期的に取り込みます。`origin` のみ設定済みなので、初回に `upstream` を追加します。

```bash
git remote add upstream https://github.com/TK11235/udonarium.git
git fetch upstream
git merge upstream/master
```

マージ時は **フォーク固有の追加を必ず保持** してください。対象一覧は [architecture/08-murder-mystery-extensions.md](architecture/08-murder-mystery-extensions.md) の「マージ時に保持すべきフォーク差分」を参照。

## ディレクトリ規約（要点）

| ディレクトリ | 置くもの |
| --- | --- |
| `src/app/class/core/` | 同期・イベント・ネットワーク・ファイル共有などの基盤 |
| `src/app/class/*.ts` | 具体ドメイン（コマ・カード・チャット・パネル等） |
| `src/app/service/` | 横断サービス |
| `src/app/component/` | 画面コンポーネント |
| `src/app/directive/` | 操作系ディレクティブ |
| `netlify/functions/` | トークン発行 API |
| `docs/` | 本設計ドキュメント |
