const nodeCrypto = require('crypto');

Object.defineProperty(globalThis, 'crypto', {
  configurable: true,
  value: nodeCrypto.webcrypto ?? {
    getRandomValues(buffer: NodeJS.ArrayBufferView) {
      return nodeCrypto.randomFillSync(buffer);
    },
  },
});
