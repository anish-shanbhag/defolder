import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

module.exports = {
  input: ["index", "preload", "folder-size"].map(name => `src/main/${name}.js`),
  output: {
    dir: "build/main",
    format: "cjs",
    compact: true,
    exports: "auto"
  },
  external: ["electron"],
  plugins: [
    commonjs(),
    nodeResolve(),
    terser()
  ]
};
