const PROVINCES_URL = 'https://provinces.open-api.vn/api/v2/p/';
const WARDS_URL = 'https://provinces.open-api.vn/api/v2/w/';

function asList(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === 'object') {
    const row = payload as Record<string, unknown>;
    if (Array.isArray(row.data)) {
      return row.data;
    }
    if (Array.isArray(row.results)) {
      return row.results;
    }
  }
  return [];
}

async function fetchJson(url: string) {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    throw new Error(`Không kết nối được ${url}`);
  }

  if (!response.ok) {
    throw new Error(`API ${url} trả về ${response.status}.`);
  }

  return asList(await response.json());
}

export async function fetchOpenApiDivisions() {
  const [provinces, wards] = await Promise.all([
    fetchJson(PROVINCES_URL),
    fetchJson(WARDS_URL),
  ]);

  if (!provinces.length) {
    throw new Error('API tỉnh/thành không trả về dữ liệu.');
  }
  if (!wards.length) {
    throw new Error('API xã/phường không trả về dữ liệu.');
  }

  return { provinces, wards };
}

export function shouldFetchRemote(raw: unknown) {
  if (raw == null) {
    return true;
  }
  if (Array.isArray(raw)) {
    return raw.length === 0;
  }
  if (typeof raw !== 'object') {
    return true;
  }
  const body = raw as { source?: string; provinces?: unknown; wards?: unknown };
  if (body.source === 'open-api' || body.source === 'seed') {
    return true;
  }
  return !Array.isArray(body.provinces) && !Array.isArray(body.wards);
}
