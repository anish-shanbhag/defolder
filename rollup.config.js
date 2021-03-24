import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

module.exports = {
  input: [
    "index",
    "preload",
    "server",
    "folder-size",
  ].map(name => `src/main/${name}.js`),
  output: {
    dir: "build/main",
    format: "cjs",
    compact: true,
    exports: "auto"
  },
  external: ["electron"],
  plugins: [
    (() => ({
      name: "ignore",
      load: id => id === __dirname + "\\src\\main\\dev.js" ? { code: "" } : null
    }))(),
    commonjs(),
    nodeResolve(),
    terser()
  ]
};
