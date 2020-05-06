import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/main.ts',
  output: {
    file: pkg.main,
    format: 'cjs'
  },
  plugins: [
    typescript(),
    resolve()
  ],
  external: [ 'three/src/math/Matrix4' ]
};