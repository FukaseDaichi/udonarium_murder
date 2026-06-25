import * as lzbase62 from 'lzbase62';

import { buildRoomInviteUrl, decodeRoomInvite, encodeRoomInvite, RoomInvitePayload } from './room-invite';

describe('room-invite', () => {
  it('round-trips a basic payload through encode/decode', () => {
    const payload: RoomInvitePayload = { r: 'abc', n: 'Room', p: 'secret' };
    expect(decodeRoomInvite(encodeRoomInvite(payload))).toEqual(payload);
  });

  it('round-trips a Japanese room name, empty password, and symbols', () => {
    const payload: RoomInvitePayload = { r: 'a1b', n: '殺人事件の館🔪', p: 'p@ss word/&=' };
    expect(decodeRoomInvite(encodeRoomInvite(payload))).toEqual(payload);
  });

  it('produces a URL-safe token that needs no percent-encoding', () => {
    const token = encodeRoomInvite({ r: 'abc', n: 'ふつうの部屋', p: 'p@ss word/&=' });
    expect(token).toBe(encodeURIComponent(token));
  });

  it('returns null for a malformed token', () => {
    expect(decodeRoomInvite('!!! not a valid token !!!')).toBeNull();
  });

  it('returns null when the decoded object is missing fields', () => {
    const token = lzbase62.compress(JSON.stringify({ r: 'abc' }));
    expect(decodeRoomInvite(token)).toBeNull();
  });

  it('builds an invite URL that carries only the room token', () => {
    const url = buildRoomInviteUrl({ r: 'abc', n: 'Room', p: 'secret' }, 'https://example.app/play?id=old&foo=bar');
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://example.app/play');
    expect([...parsed.searchParams.keys()]).toEqual(['room']);
  });

  it('builds an invite URL whose token decodes back to the room', () => {
    const payload: RoomInvitePayload = { r: 'abc', n: '館', p: 'secret' };
    const token = new URL(buildRoomInviteUrl(payload, 'https://example.app/')).searchParams.get('room');
    expect(decodeRoomInvite(token)).toEqual(payload);
  });
});
