import typescript from '@rollup/plugin-typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default {
  input: 'src/index.ts',
  output: [{
    file: pkg.main,
    format: 'cjs',
    sourcemap: true
  }, {
    file: pkg.module,
    format: 'es',
    sourcemap: true
  }],
  plugins: [
    typescript({tsconfig: './tsconfig.json', noEmitOnError: true}),
  ]
};
