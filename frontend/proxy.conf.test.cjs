const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

test('proxy targets the host locally and the backend service in Docker', () => {
  for (const [target, expected] of [
    ['', 'http://127.0.0.1:8080'],
    ['http://backend:8080', 'http://backend:8080'],
  ]) {
    const result = spawnSync(process.execPath, [
      '-e', "process.stdout.write(require('./proxy.conf.cjs')['/api/**'].target)",
    ], {
      cwd: __dirname,
      env: { ...process.env, API_PROXY_TARGET: target },
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, expected);
  }
});
