// Build statico: bundle singolo (JS+CSS) in dist/, apribile con doppio click.
import * as esbuild from "esbuild";
import { mkdirSync, copyFileSync, writeFileSync } from "node:fs";

mkdirSync("dist", { recursive: true });

await esbuild.build({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  minify: true,
  format: "iife",
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".jsx": "jsx", ".css": "css", ".jpg": "dataurl", ".png": "dataurl", ".webp": "dataurl" },
  outfile: "dist/app.bundle.js",
});

// Cache-busting: il numero di versione cambia a ogni build, così il
// browser scarica sempre il bundle nuovo dopo un deploy.
const v = Date.now().toString(36);

writeFileSync("dist/index.html", `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TEXA — Textile Network & Marketplace</title>
<link rel="stylesheet" href="app.bundle.css?v=${v}">
</head>
<body>
<div id="root"></div>
<script src="app.bundle.js?v=${v}"></script>
</body>
</html>
`);

console.log("Build completato in dist/ — apri dist/index.html");
