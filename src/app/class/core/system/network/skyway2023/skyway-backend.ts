export class SkyWayBackend {
  constructor(readonly url: string) { }

  async alive(): Promise<boolean> {
    return fetchStatus(this.url);
  }

  async createSkyWayAuthToken(channelName: string, peerId: string): Promise<string> {
    return fetchSkyWayAuthToken(this.url, channelName, peerId);
  }
}

async function fetchStatus(url: string): Promise<boolean> {
  try {
    let response = await fetch(resolveApiUrl('/v1/status', url));
    return response.status === 200;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function fetchSkyWayAuthToken(url: string, channelName: string, peerId: string): Promise<string> {
  try {
    let body = JSON.stringify({
      formatVersion: 1,
      channelName: channelName,
      peerId: peerId,
    });

    let response = await fetch(resolveApiUrl('/v1/skyway2023/token', url), {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) return '';

    let jsonObj = await response.json();
    return jsonObj.token ?? '';
  } catch (err) {
    console.error(err);
    return '';
  }
}

function resolveApiUrl(path: string, url: string): URL {
  return new URL(path, url || window.location.origin);
}
