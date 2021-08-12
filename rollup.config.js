import merge from 'deepmerge'
import { createBasicConfig } from '@open-wc/building-rollup'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import pkg from './package.json'
const baseConfig = createBasicConfig()


export default merge(baseConfig, {
  input: './lib/src/index.js',
  output: [{
    file: pkg.main,
    format: 'cjs',
  }, {
    file: pkg.module,
    format: 'es',
  }, {
    file: pkg.browser,
    format: 'iife',
    name: 'MixinClientSDK',
    globals: {},
  }],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      presets: ['@babel/preset-env'],
      babelHelpers: 'bundled',
    }),
  ],

})