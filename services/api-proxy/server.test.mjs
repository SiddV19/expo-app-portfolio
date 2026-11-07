import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApiServer } from './server.mjs';

async function withServer(options, run) {
  const server = createApiServer(options);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try { await run('http://127.0.0.1:' + server.address().port); }
  finally { await new Promise(resolve => server.close(resolve)); }
}
test('missing keys do not call a provider', async () => {
  await withServer({ env: {}, fetcher: () => { throw new Error('Unexpected request'); } }, async base => {
    const response = await fetch(base + '/api/finnhub/quote?symbol=AAPL');
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /Configure/);
  });
});
test('provider destination is allowlisted and server key replaces client credentials', async () => {
  let requested;
  const secret = 'test-server-credential';
  await withServer({ env: { FINNHUB_API_KEY: secret }, fetcher: async url => {
    requested = url;
    return Response.json({ c: 100 });
  } }, async base => {
    const rejected = await fetch(base + '/api/finnhub/https://unrelated.example');
    assert.equal(rejected.status, 404);
    const response = await fetch(base + '/api/finnhub/quote?symbol=AAPL&token=client-value');
    assert.deepEqual(await response.json(), { c: 100 });
    assert.equal(requested.origin, 'https://finnhub.io');
    assert.equal(requested.searchParams.get('token'), secret);
    assert.equal(requested.searchParams.getAll('token').length, 1);
  });
});
test('weather coordinates are validated before contacting a provider', async () => {
  await withServer({ env: { OPENWEATHER_API_KEY: 'test-key' }, fetcher: () => { throw new Error('Unexpected request'); } }, async base => {
    const response = await fetch(base + '/api/weather/forecast?lat=999&lon=0');
    assert.equal(response.status, 400);
  });
});
test('upstream errors cannot disclose the configured key', async () => {
  const secret = 'test-private-provider-key';
  await withServer({ env: { FINNHUB_API_KEY: secret }, fetcher: async () => { throw new Error(secret); } }, async base => {
    const response = await fetch(base + '/api/finnhub/quote?symbol=AAPL');
    assert.equal(response.status, 502);
    assert.ok(!(await response.text()).includes(secret));
  });
});
