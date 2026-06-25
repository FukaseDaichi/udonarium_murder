# 07. ドメインオブジェクト

`src/app/class/` 直下の具体クラス群です。すべて [02 章](02-synchronized-object-model.md) の同期モデル（`@SyncObject` + `@SyncVar`）の上に乗ります。

## 卓上オブジェクト（TabletopObject 系）

`tabletop-object.ts` が卓上に置くピースの基底（`ObjectNode` 派生）です。

- `location: { name, x, y }`（`@SyncVar`）… 置き場所。`name === 'table'` で卓上可視。
- `posZ`（高さ）、`imageFile`（参照: `imageIdentifier`）、`rootDataElement`（後述の `DataElement` ツリー）。

具体ピース:

| クラス | 内容 |
| --- | --- |
| `GameCharacter`（`character`） | コマ。`rotate` / `roll`、サイズ、チャットパレット、データ要素（能力値等） |
| `Card`（`card`） | カード。表裏・所有者・公開状態 |
| `CardStack`（`card-stack`） | 山札。カードの集合、シャッフル/ドロー |
| `DiceSymbol`（`dice-symbol`） | 卓上ダイス（面の画像で表現） |
| `Terrain`（`terrain`） | 立体地形（壁・床）。`matrix-3d` による 3D 変換 |
| `GameTableMask`（`game-table-mask`） | テーブルマスク（隠し領域） |
| `TextNote`（`text-note`） | 共有メモ |

テーブル自体:

- `GameTable`（`game-table.ts`）… 盤面（背景画像、グリッド、サイズ）。
- `TableSelecter`（`table-selecter.ts`）… 複数テーブルの管理と現在テーブル選択。

## データモデル（DataElement）

`data-element.ts`（`@SyncObject('data')`、`ObjectNode` 派生）は、キャラクターシート的な **キー/値のツリー** です。

- `name` / `type` / `currentValue`（`@SyncVar`）。
- `type` 例: `numberResource`（HP 等のリソース）、`note`（自由記述）。
- `getElementsByName` / `getElementsByType` / `getFirstElementByName` でツリーを検索。

`TabletopObject` は配下に `DataElement` ツリーを持ち、コマの能力値・メモ・画像参照などを表現します。

## チャット

| クラス | 内容 |
| --- | --- |
| `ChatMessage`（`chat`） | 1 発言。`from`/`to`/`name`/`tag`/`dicebot`/`timestamp`、本文は `value`。`to` 指定で秘話（`sendTo`） |
| `ChatTab`（`chat-tab`） | タブ 1 つ。`ChatMessage` を子に持つ |
| `ChatTabList`（`chat-tab-list`） | タブ一覧（シングルトン）。`InnerXml` 実装でセーブ対象 |
| `ChatPalette`（`chat-palette`） | コマごとの定型文パレット |

起動時に「メインタブ」「サブタブ」を生成します（`app.component.ts`）。送信は `ChatMessageService` 経由で、`SEND_MESSAGE` イベントが流れます。

## ダイス（BCDice）

`dice-bot.ts`（`@SyncObject('dice-bot')`）が [BCDice](https://github.com/bcdice/bcdice-js) を統合します。

- `bcdice/bcdice-loader` でゲームシステム定義を遅延ロード。
- `SEND_MESSAGE` を購読し、本文がダイスコマンドなら判定して結果メッセージを生成。
- シークレットダイス、繰り返し（`xN`）等に対応。
- 判定は `PromiseQueue` で直列化。

`timer-bot.ts` は同様にメッセージ駆動のタイマー機能（[08 章](08-murder-mystery-extensions.md) と連動）。

## 音声

- `Jukebox`（BGM）/ `SeBox`（効果音）/ `SoundEffect`（操作音プリセット）。
- 実体は `AudioStorage` に登録され、`AudioPlayer` が再生。プリセット音は `isHidden = true` で一覧から隠します（[05 章](05-file-sharing-and-save.md)）。

## プレゼンス（PeerCursor）

`peer-cursor.ts`（`@SyncObject('PeerCursor')`）は各参加者のカーソル/在席を表します。

- `userId` / `peerId` / `name` / `imageIdentifier`。
- `PeerCursor.myCursor` が自分。`userIdMap` / `peerIdMap` で索引。
- `DISCONNECT_PEER` を購読し、切断したピアのカーソルを片付けます。

## ルーム集約とその他

- `Room`（`room.ts`）… セーブ時の集約ルート（卓上一式をまとめて XML 化）。
- `RoomSetting`（`room-setting.ts`）… ルーム設定（メニュー構成・権限など）。
- `DataSummarySetting`（`data-summary-setting.ts`）… インベントリ一覧の表示カラム設定。
- `database/`… BCDice 等の参照データ。
- `transform/`（`matrix-3d.ts` / `transform.ts`）… 地形の 3D 変換。
