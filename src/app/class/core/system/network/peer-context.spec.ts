import { PeerContext } from './peer-context';

describe('PeerContext', () => {
  it('creates and parses a private peer id', () => {
    const peer = PeerContext.create('alice');
    const parsed = PeerContext.parse(peer.peerId);

    expect(peer.peerId).not.toBe('alice');
    expect(peer.isRoom).toBeFalse();
    expect(parsed.peerId).toBe(peer.peerId);
    expect(parsed.digestUserId).toBe(peer.peerId);
    expect(parsed.isRoom).toBeFalse();
  });

  it('creates a password protected room peer that can verify matching peers', () => {
    const owner = PeerContext.create('alice', 'abc', 'Murder Room', 'secret');
    const guest = PeerContext.create('bob', 'abc', 'Murder Room', 'secret');

    expect(owner.isRoom).toBeTrue();
    expect(owner.hasPassword).toBeTrue();
    expect(owner.verifyPassword('secret')).toBeTrue();
    expect(owner.verifyPassword('wrong')).toBeFalse();
    expect(owner.verifyPeer(guest.peerId)).toBeTrue();
  });

  it('rejects room peers created with different passwords', () => {
    const owner = PeerContext.create('alice', 'abc', 'Murder Room', 'secret');
    const guest = PeerContext.create('bob', 'abc', 'Murder Room', 'wrong');

    expect(owner.verifyPeer(guest.peerId)).toBeFalse();
  });
});
