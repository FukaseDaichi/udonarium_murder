# 08. マーダーミステリー拡張（フォーク固有）

本家ユドナリウムに対して、このフォークが追加した機能群です。**アップストリームとのマージ時に必ず保持** してください（[conventions.md](../conventions.md) 参照）。

## GM / ビューアモード

GM（ゲームマスター）向けに、参加者と異なるメニュー/表示を出す仕組みです。

- 状態は `service/app-config-custom.service.ts`（`AppConfigCustomService`）が保持。
  - `isViewer$`（`Observable<boolean>`）と `dataViewer`（現在値）。
- `AppComponent` が `isViewer$` を購読して `isGM` を切り替え、`menuHeight`（GM はフルメニュー）を出し分けます。
- 既定オブジェクトや UI はこのフラグで GM 専用操作（パネル配布など）を露出します。

> 本家にはない概念なので、`AppConfigCustomService` と `AppComponent` の `isGM` 周りはマージ時の競合に注意。

## ゲームパネル（GamePanel）

GM がプレイヤーへハンドアウト等を提示するための **パネル** です。`class/game-panel.ts`（`@SyncObject('game-panel')`、`ObjectNode` 派生）。

主なフィールド（すべて `@SyncVar` = 同期 & セーブ対象）:

| フィールド | 意味 |
| --- | --- |
| `title` | パネル名。ショートカット表示名は先頭 5 文字（`shortCutName`） |
| `width` / `height` / `top` / `left` | サイズと位置 |
| `imageIdentifier` / `backgroundImageIdentifier` | 表示画像・背景画像の参照 |
| `isAllView` | 全員に表示 |
| `isSelfView` | 自分に表示中か（ローカル制御用に非同期フィールド `isSelfView`/`isOwner` も併用） |
| `isShortcutAble` | ショートカット表示を許可するか |
| `nicknameFillter` | カンマ区切りのニックネーム条件。一致した参加者にだけショートカット表示（`isShortcutView`） |
| `isCenter` / `isOriginalSize` | 中央寄せ・原寸表示 |

`isShortcutView(nickname)` が「全体公開でない・権限あり・フィルタ一致」を判定し、**参加者ごとに見えるパネルを出し分け** ます（マダミスのハンドアウト配布に対応）。

### パネル選択（GamePanelSelecter）

`class/game-panel-selecter.ts`（シングルトン `@SyncObject('GamePanelSelecter')`）。

- `selectPanelIdentifier`（`@SyncVar`）で「いま選択中のパネル」を全ピアで共有。
- `SELECT_GAME_PANEL` イベントで選択を切り替え、`selected` フラグを付け替えます。
- 選択中パネルが消えた場合は先頭パネルにフォールバック。

### 関連コンポーネント

| コンポーネント | 役割 |
| --- | --- |
| `game-panel-setting` | パネルの作成・編集（画像/PDF 設定、表示条件） |
| `game-panel-store` | パネル一覧・呼び出し |
| `game-panel-viewer` | パネル本体の表示（PDF 描画） |
| `ui-game-panel` | パネルのウィンドウ枠 |

## PDF 閲覧

シナリオ/ハンドアウトの PDF 表示に [`ng2-pdf-viewer`](https://www.npmjs.com/package/ng2-pdf-viewer) を使います（`app.module.ts` で `PdfViewerModule` を import）。

- `GamePanelViewerComponent` が `@Input() pdfFile: ImageFile` の `url` を `pdfSrc` として渡し、`<pdf-viewer>` で描画。
- `angular.json` の `allowedCommonJsDependencies` に `pdfjs-dist/...` を登録済み（CommonJS 警告抑制）。
- 画像と同じく PDF も `ImageFile`/`ImageStorage` の仕組みに乗せて共有します。

## タイマー

GM 進行用のタイマー。

- `class/timer-bot.ts`（`TimerBot`、`AlermSound`）… メッセージ駆動のタイマー・アラーム音。
- `component/timer/timer-menu.component.ts` … 常駐タイマーメニュー（起動時に右上へ配置）。
- `component/timer-modal/` … タイマー設定モーダル。
- 起動時にアラーム音源を `AudioStorage` に登録（`AlermSound.alermFileList`）。

## ブランディング / OGP

- `src/index.html` … タイトル「ユドナリウムマーダー」、OGP/Twitter カード、Google Search Console 認証、説明文（GM モード・タイマー・PDF 閲覧を訴求）。本家由来の旧 SkyWay CDN 読み込みは**既に削除済み**。
- 公開先は Netlify（`https://udonarium-murder.netlify.app`）。

## マージ時に保持すべきフォーク差分（チェックリスト）

- `class/game-panel*.ts`、`component/game-panel-*` / `ui-game-panel` 一式
- `class/timer-bot.ts`、`component/timer*`
- `service/app-config-custom.service.ts` と `AppComponent` の `isGM` ロジック
- `ng2-pdf-viewer` 依存と `PdfViewerModule` 登録、`allowedCommonJsDependencies` の pdfjs
- `index.html` の OGP/タイトル、`README.md` のフォーク説明
