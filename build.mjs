// Build statico: bundle singolo (JS+CSS) in dist/, apribile con doppio click.
import * as esbuild from "esbuild";
import { mkdirSync, copyFileSync, writeFileSync } from "node:fs";

mkdirSync("dist", { recursive: true });

await esbuild.build({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  minify: true,
  format: "iife",
  loader: { ".jsx": "jsx", ".css": "css", ".jpg": "dataurl", ".png": "dataurl", ".webp": "dataurl" },
  outfile: "dist/app.bundle.js",
});

writeFileSync("dist/index.html", `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TEXA — Textile Network & Marketplace</title>
<link rel="stylesheet" href="app.bundle.css">
</head>
<body>
<div id="root"></div>
<script src="app.bundle.js"></script>
</body>
</html>
`);

console.log("Build completato in dist/ — apri dist/index.html");
