const nodeCrypto = require('crypto');

Object.defineProperty(globalThis, 'crypto', {
  configurable: true,
  value: nodeCrypto.webcrypto ?? {
    getRandomValues(buffer) {
      return nodeCrypto.randomFillSync(buffer);
    },
  },
});
