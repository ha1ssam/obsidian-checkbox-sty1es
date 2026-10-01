import esbuild from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import { builtinModules } from "node:module";

const production = process.argv[2] === "production";

// styles.css = regras genéricas + variáveis geradas a partir do registro de estilos.
async function buildStyles() {
	const result = await esbuild.build({
		entryPoints: ["src/checkbox-styles.ts"],
		bundle: true,
		format: "esm",
		write: false,
		logLevel: "silent",
	});
	const source = Buffer.from(result.outputFiles[0].text).toString("base64");
	const { buildStyleSheet } = await import(`data:text/javascript;base64,${source}`);
	const base = await readFile("src/styles.base.css", "utf8");
	await writeFile(
		"styles.css",
		`${base}\n/* ---------- Gerado a partir de src/checkbox-styles.ts ---------- */\n\n${buildStyleSheet()}\n`
	);
}

await buildStyles();

const context = await esbuild.context({
	entryPoints: ["src/main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/*",
		"@lezer/*",
		...builtinModules,
	],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: production ? false : "inline",
	treeShaking: true,
	minify: production,
	outfile: "main.js",
});

if (production) {
	await context.rebuild();
	await context.dispose();
} else {
	await context.watch();
}
