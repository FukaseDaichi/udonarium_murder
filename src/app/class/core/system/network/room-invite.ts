import * as lzbase62 from 'lzbase62';

/**
 * ルーム参加用URL（`?room=<token>`）に埋め込む最小情報。
 * キーは短縮: r=roomId, n=roomName, p=password（平文・空文字可）。
 */
export interface RoomInvitePayload {
  r: string;
  n: string;
  p: string;
}

const roomIdPattern = /^[A-Za-z0-9]{3}$/;
const maxRoomNameLength = 128;
const maxPasswordLength = 12;

/** ルーム情報をURLセーフな単一トークンへエンコードする（lzbase62 = base62 出力）。 */
export function encodeRoomInvite(payload: RoomInvitePayload): string {
  return lzbase62.compress(JSON.stringify({ r: payload.r, n: payload.n, p: payload.p }));
}

/** トークンをデコードする。不正・破損時は null を返す（呼び出し側で無害化）。 */
export function decodeRoomInvite(token: string): RoomInvitePayload | null {
  try {
    const obj = JSON.parse(lzbase62.decompress(token));
    if (!isRoomInvitePayload(obj)) return null;
    return { r: obj.r, n: obj.n, p: obj.p };
  } catch {
    return null;
  }
}

/** 既存クエリを除去し、room トークンのみを付与した参加用URLを生成する。 */
export function buildRoomInviteUrl(payload: RoomInvitePayload, base: string = window.location.href): string {
  const url = new URL(base);
  url.search = '';
  url.searchParams.set('room', encodeRoomInvite(payload));
  return url.href;
}

function isRoomInvitePayload(obj: any): obj is RoomInvitePayload {
  if (typeof obj?.r !== 'string' || typeof obj?.n !== 'string' || typeof obj?.p !== 'string') return false;
  if (!roomIdPattern.test(obj.r)) return false;
  if (obj.n.length < 1 || maxRoomNameLength < obj.n.length) return false;
  if (maxPasswordLength < obj.p.length) return false;
  return true;
}
