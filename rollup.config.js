import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import buble from "rollup-plugin-buble";
// import uglify from "rollup-plugin-uglify";

export default {
  entry: "src/js/main.js",
  dest: "dist/bundle.js",
  plugins: [
    nodeResolve({ jsnext: true }),
    commonjs(),
    buble()
    //,
    //uglify()
  ],
  format: "iife",
  sourceMap: true
}

