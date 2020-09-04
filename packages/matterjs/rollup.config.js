import pkg from './package.json';
import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/main.ts',
  output: {
    file: pkg.main,
    format: 'cjs'
  },
  plugins: [
    typescript()
  ]
};