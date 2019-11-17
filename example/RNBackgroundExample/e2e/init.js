const detox = require('detox');
const config = require('../package.json').detox;
const adapter = require('detox/runners/jest/adapter');
const startTestServer = require('./server').startTestServer;

jest.setTimeout(120000);
jasmine.getEnv().addReporter(adapter);

let server;

beforeAll(async () => {
  await detox.init(config);

  server = startTestServer();
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
  await detox.cleanup();
  server.close();
});
