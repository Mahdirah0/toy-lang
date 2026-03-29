import * as esbuild from "npm:esbuild";

await esbuild.build({
  entryPoints: ["src/playground.ts"],
  bundle: true,
  outfile: "web/playground.js",
  format: "iife",
  target: "es2020",
  minify: false,
  sourcemap: true,
});

console.log("✓ Built web/playground.js");
esbuild.stop();
