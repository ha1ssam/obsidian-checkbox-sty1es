// Gera as imagens de divulgação em promo/images (ver promo/README.md).
// Uso: npm run build && node promo/build.mjs [slide...]
import esbuild from "esbuild";
import { existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// require (e não import) também acha um Playwright instalado globalmente.
const { chromium } = createRequire(import.meta.url)("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const SLIDES = ["menu", "sections", "effects", "images", "uncheck"];
const FORMATS = {
	portrait: { width: 540, height: 960 },
	landscape: { width: 900, height: 600 },
};

if (!existsSync(join(here, "..", "styles.css"))) {
	console.error("styles.css não encontrado: rode `npm run build` antes.");
	process.exit(1);
}

// O menu real do plugin, com a API do Obsidian trocada por substitutos.
await esbuild.build({
	entryPoints: [join(here, "harness.ts")],
	bundle: true,
	format: "iife",
	alias: { obsidian: join(here, "obsidian-stub.ts") },
	outfile: join(here, ".cache", "harness.js"),
	logLevel: "warning",
});

const only = process.argv.slice(2);
const slides = only.length ? only : SLIDES;
const out = join(here, "images");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const [format, viewport] of Object.entries(FORMATS)) {
	// 2x: 1080×1920 (vertical) e 1800×1200 (horizontal).
	const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
	page.on("pageerror", (err) => console.error(format, err.message));
	for (const slide of slides) {
		const url = pathToFileURL(join(here, "page.html"));
		url.search = `?s=${slide}&f=${format}`;
		await page.goto(url.href);
		await page.waitForSelector("body[data-ready]");
		await page.evaluate(() => document.fonts.ready);
		await page.waitForTimeout(250);
		const file = `${SLIDES.indexOf(slide) + 1}-${slide}-${format}.png`;
		await page.screenshot({ path: join(out, file) });
		console.log(file);
	}
	await page.close();
}
await browser.close();
