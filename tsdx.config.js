const replace = require('@rollup/plugin-replace');

// Not transpiled with TypeScript or Babel, so use plain Es6/Node.js!
module.exports = {
  // This function will run for each entry/format/env combination
  rollup(config, opts) {
    config.cache = false;

    config.plugins = config.plugins.map(p =>
      p.name === 'replace'
        ? replace({
          'process.env.NODE_ENV': JSON.stringify(opts.env),
          preventAssignment: true,
        }) : p,
    );
    return config; // always return a config.
  },
};
