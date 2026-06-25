# ルーム招待URL機能

> 種別: **現行機能仕様**。新 SkyWay のルーム接続で使う `?room=<token>` 招待URLの仕様です。
> 関連: [03-messaging-and-network.md](architecture/03-messaging-and-network.md) / [08-murder-mystery-extensions.md](architecture/08-murder-mystery-extensions.md)

## 概要

ルーム招待URLは、GM が作成したルームへ参加者を直接案内するためのURLです。参加に必要な `roomId` / `roomName` / `password` を `lzbase62` で短い token にまとめ、URL の `room` クエリに入れます。

```text
https://example.app/?room=<token>
```

参加者がこのURLを開くと、アプリ起動後の `OPEN_NETWORK` イベントで token を読み取り、同じ `roomId` / `roomName` / `password` を使って `Network.open(userId, roomId, roomName, password)` を実行します。同じ3要素で入室すると新 SkyWay の Channel 名が一致するため、参加者は同じルームに入ります。

## 招待URLの生成

招待URLは `src/app/class/core/system/network/room-invite.ts` で生成します。

```ts
export interface RoomInvitePayload {
  r: string; // roomId
  n: string; // roomName
  p: string; // password（平文・空文字可）
}

export function encodeRoomInvite(payload: RoomInvitePayload): string {
  return lzbase62.compress(JSON.stringify({ r: payload.r, n: payload.n, p: payload.p }));
}

export function buildRoomInviteUrl(payload: RoomInvitePayload, base: string = window.location.href): string {
  const url = new URL(base);
  url.search = '';
  url.searchParams.set('room', encodeRoomInvite(payload));
  return url.href;
}
```

`buildRoomInviteUrl()` は既存の検索パラメータを消し、`room` だけを付けます。これにより古い接続パラメータや余計なクエリが招待URLに混ざりません。

`PeerMenuComponent.inviteUrl` は、現在の `Network.peer` がルーム入室中のときだけ、次の payload から招待URLを生成します。

```ts
{ r: peer.roomId, n: peer.roomName, p: peer.password }
```

## Tokenの検証

`decodeRoomInvite()` は token の展開、JSON パース、意味的バリデーションを行います。

```ts
export function decodeRoomInvite(token: string): RoomInvitePayload | null {
  try {
    const obj = JSON.parse(lzbase62.decompress(token));
    if (!isRoomInvitePayload(obj)) return null;
    return { r: obj.r, n: obj.n, p: obj.p };
  } catch {
    return null;
  }
}
```

有効な payload の条件:

| 項目 | 条件 |
| --- | --- |
| `r` | 英数字3文字 |
| `n` | 1文字以上128文字以内 |
| `p` | 12文字以内 |

`roomName` と `password` の長さは `RoomSettingComponent` の入力制約に合わせています。`roomId` は `PeerContext.generateId('***')` で生成される3文字の英数字を前提にしています。

## 入室フロー

`AppComponent` は `OPEN_NETWORK` 後に現在URLの `room` パラメータを処理します。

1. `PeerCursor.myCursor` に現在の `peerId` / `userId` を反映する。
2. URL から `room` token を取り出す。
3. `history.replaceState()` で `room` パラメータを消す。
4. `decodeRoomInvite()` が `null` の場合はエラーモーダルを表示して入室しない。
5. 現在の `roomId` / `roomName` / `password` が招待内容と一致する場合は何もしない。
6. すでに別ルームにいる場合は確認ダイアログを出し、キャンセルなら入室しない。
7. `ObjectStore.instance.clearDeleteHistory()` の後、招待内容で `Network.open()` する。

```ts
private isCurrentRoomInvite(invite: RoomInvitePayload): boolean {
  const peer = Network.peer;
  return peer.isRoom && peer.roomId === invite.r && peer.roomName === invite.n && peer.password === invite.p;
}

private joinRoomFromInvite(invite: RoomInvitePayload) {
  const userId = Network.peer.userId;
  ObjectStore.instance.clearDeleteHistory();
  Network.open(userId, invite.r, invite.n, invite.p);
  PeerCursor.myCursor.peerId = Network.peerId;
}
```

`room` パラメータは入室前に削除します。これにより、`Network.open()` 後に再度 `OPEN_NETWORK` が発生しても招待処理が繰り返されません。また、合言葉を含むURLがアドレスバーに残りません。

## UI

接続情報パネル（`PeerMenuComponent`）は、ルーム入室状態に応じて表示を切り替えます。

| 状態 | 条件 | 表示 |
| --- | --- | --- |
| 未入室 | `!Network.peer.isRoom` | GM向けの「ルームを作成」と、参加者向けの「ロビーを開く」 |
| 入室済 | `Network.peer.isRoom` | 参加用URL、コピー、共有、注意文、参加人数、ルーム情報 |

入室済みの招待パネルには次の操作があります。

- 読み取り専用の参加用URL入力欄。フォーカスまたはクリックで全選択します。
- `navigator.clipboard.writeText()` による「リンクをコピー」。
- `navigator.share` がある環境だけ表示される「共有」。
- URL に合言葉が含まれることの注意文。
- `Network.peers.length` に基づく参加人数表示。
- ルーム名、ルームID、パスワード表示切り替え。

旧 SkyWay のプライベート接続UIは `backend.mode === 'skyway'` のときだけ表示します。既定の `skyway2023` ではルーム接続を使います。

## ネットワーク上の前提

新 SkyWay のルーム接続では、パスワード付きルームの Channel 名を `roomId + roomName + password` の SHA-256（Base64URL）から作ります。招待URLから同じ3要素を復元して `Network.open()` すれば同じ Channel に入れます。

入室後のピア接続は `skyway2023` の購読コールバックとユーザーリスト交換で自動的に作られます。参加者側で `Network.connect()` を呼ぶ必要はありません。

## エッジケース

| ケース | 挙動 |
| --- | --- |
| `room` パラメータがない | 通常起動として扱う |
| token が不正 | 入室せず「参加用URLが正しくありません」モーダルを表示する |
| token の値が制約違反 | 入室せず不正URLとして扱う |
| すでに同じ部屋にいる | `roomId` / `roomName` / `password` がすべて一致する場合は何もしない |
| すでに別ルームにいる | 参加人数に関わらず移動確認を出す |
| 合言葉が違うURL | 別 Channel に入るため、同じ参加者一覧には合流しない |
| 参加者が0人のルーム | 新 SkyWay は入室自体を拒否しないため、自分だけのルームとして開く |

## セキュリティ

`room` token は短縮と難読化のための表現であり、暗号化ではありません。URL を知る人は、含まれる `roomId` / `roomName` / `password` を使って入室できます。

運用上は、参加用URLを部屋の鍵として扱います。UI でも公開場所へ貼らないよう案内し、入室時にはアドレスバーから `room` パラメータを削除します。

## 関連ファイル

| ファイル | 役割 |
| --- | --- |
| `src/app/class/core/system/network/room-invite.ts` | token のエンコード、デコード、URL生成 |
| `src/app/class/core/system/network/room-invite.spec.ts` | token の往復、不正入力、URL生成のテスト |
| `src/app/app.component.ts` | `?room=` の自動入室、URL浄化、同一部屋判定、別部屋移動確認 |
| `src/app/component/peer-menu/peer-menu.component.ts` | 招待URL生成、コピー、共有、ルーム作成導線 |
| `src/app/component/peer-menu/peer-menu.component.html` | 未入室/入室済みの接続情報UI |

## テスト観点

- `encodeRoomInvite()` / `decodeRoomInvite()` が日本語ルーム名、空パスワード、記号入りパスワードを往復できること。
- 不正 token、型違い payload、制約違反 payload が `null` になること。
- `buildRoomInviteUrl()` が既存クエリを消し、`room` だけを付与すること。
- 2ブラウザで、GM作成、URLコピー、別ブラウザでURLを開く、自動入室、アドレスバーから `room` が消えることを確認すること。
- 別ルーム在室時に移動確認が出ること。
