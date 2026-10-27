import { define } from "../checkbox-styles";
import { StyleSection, imageMark, packChar, svgImage } from "./pack";

/*
 * Bandeiras simplificadas, desenhadas numa área de 30×20 (proporção 3:2),
 * centralizada num quadrado de 30×30 para ocupar o lugar da checkbox.
 */

const W = 30;
const H = 20;

const rect = (x: number, y: number, w: number, h: number, color: string): string =>
	`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;

const bg = (color: string): string => rect(0, 0, W, H, color);

/** Três faixas horizontais iguais. */
const rows = (a: string, b: string, c: string): string =>
	rect(0, 0, W, H / 3, a) + rect(0, H / 3, W, H / 3, b) + rect(0, (2 * H) / 3, W, H / 3, c);

/** Três faixas verticais iguais. */
const cols = (a: string, b: string, c: string): string =>
	rect(0, 0, W / 3, H, a) + rect(W / 3, 0, W / 3, H, b) + rect((2 * W) / 3, 0, W / 3, H, c);

const round = (n: number): string => String(Math.round(n * 100) / 100);

const starPoints = (cx: number, cy: number, outer: number, inner = outer * 0.382): string =>
	Array.from({ length: 10 }, (_, i) => {
		const radius = i % 2 === 0 ? outer : inner;
		const angle = -Math.PI / 2 + (i * Math.PI) / 5;
		return `${round(cx + radius * Math.cos(angle))},${round(cy + radius * Math.sin(angle))}`;
	}).join(" ");

const star = (cx: number, cy: number, r: number, color: string): string =>
	`<polygon points="${starPoints(cx, cy, r)}" fill="${color}"/>`;

/** Pentagrama vazado (Marrocos). */
const pentagram = (cx: number, cy: number, r: number, color: string, width: number): string => {
	const points = [0, 2, 4, 1, 3].map((i) => {
		const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
		return `${round(cx + r * Math.cos(angle))},${round(cy + r * Math.sin(angle))}`;
	});
	return `<polygon points="${points.join(" ")}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round"/>`;
};

/** Cruz nórdica (Dinamarca, Suécia, Noruega). */
const nordic = (x: number, width: number, color: string): string =>
	rect(x, 0, width, H, color) + rect(0, (H - width) / 2, W, width, color);

const FLAGS: { id: string; name: string; at: number; body: string }[] = [
	// América do Sul
	{
		id: "br",
		name: "Brazil",
		at: 0,
		body:
			bg("#009c3b") +
			'<polygon points="3,10 15,2.2 27,10 15,17.8" fill="#ffdf00"/>' +
			'<circle cx="15" cy="10" r="4.7" fill="#002776"/>' +
			'<path d="M10.5 9.1c3-1.1 6.2-.6 8.9 1.4" fill="none" stroke="#fff" stroke-width="0.9"/>',
	},
	{
		id: "ar",
		name: "Argentina",
		at: 1,
		body: rows("#74acdf", "#fff", "#74acdf") + '<circle cx="15" cy="10" r="2.1" fill="#f6b40e"/>',
	},
	{
		id: "uy",
		name: "Uruguay",
		at: 2,
		body:
			bg("#fff") +
			[1, 3, 5, 7].map((i) => rect(0, (i * H) / 9, W, H / 9, "#0038a8")).join("") +
			rect(0, 0, 11.1, 11.1, "#fff") +
			'<circle cx="5.6" cy="5.6" r="2.9" fill="#fcd116"/>',
	},
	{
		id: "py",
		name: "Paraguay",
		at: 3,
		body:
			rows("#d52b1e", "#fff", "#0038a8") +
			'<circle cx="15" cy="10" r="1.9" fill="none" stroke="#2f7d32" stroke-width="0.8"/>',
	},
	{
		id: "cl",
		name: "Chile",
		at: 4,
		body:
			bg("#fff") +
			rect(0, 10, W, 10, "#d52b1e") +
			rect(0, 0, 10, 10, "#0039a6") +
			star(5, 5.2, 3, "#fff"),
	},
	{
		id: "co",
		name: "Colombia",
		at: 5,
		body: rect(0, 0, W, 10, "#fcd116") + rect(0, 10, W, 5, "#003893") + rect(0, 15, W, 5, "#ce1126"),
	},
	{
		id: "ec",
		name: "Ecuador",
		at: 6,
		body:
			rect(0, 0, W, 10, "#ffdd00") +
			rect(0, 10, W, 5, "#034ea2") +
			rect(0, 15, W, 5, "#ed1c24") +
			'<ellipse cx="15" cy="10" rx="2.3" ry="2.8" fill="#7a5a2e" stroke="#ffdd00" stroke-width="0.6"/>',
	},
	{ id: "pe", name: "Peru", at: 7, body: cols("#d91023", "#fff", "#d91023") },
	// América do Norte
	{
		id: "mx",
		name: "Mexico",
		at: 8,
		body: cols("#006847", "#fff", "#ce1126") + '<circle cx="15" cy="10" r="2.2" fill="#8c5a2b"/>',
	},
	{
		id: "us",
		name: "United States",
		at: 9,
		body:
			bg("#fff") +
			Array.from({ length: 7 }, (_, i) => rect(0, (i * 2 * H) / 13, W, H / 13, "#b22234")).join("") +
			rect(0, 0, 12, (7 * H) / 13, "#3c3b6e") +
			[2, 6, 10]
				.flatMap((x) => [2.6, 5.4, 8.2].map((y) => `<circle cx="${x}" cy="${y}" r="0.75" fill="#fff"/>`))
				.join(""),
	},
	{
		id: "ca",
		name: "Canada",
		at: 10,
		body:
			bg("#fff") +
			rect(0, 0, 7.5, H, "#d52b1e") +
			rect(22.5, 0, 7.5, H, "#d52b1e") +
			'<polygon fill="#d52b1e" points="15,3.2 16.2,5.6 17.6,5 17.1,8.2 19,6.6 19.6,7.9 21.4,7.5 20.8,9.6 21.8,10.1 18.2,13 18.6,14.2 15.5,13.8 15.5,16.8 14.5,16.8 14.5,13.8 11.4,14.2 11.8,13 8.2,10.1 9.2,9.6 8.6,7.5 10.4,7.9 11,6.6 12.9,8.2 12.4,5 13.8,5.6"/>',
	},
	// Europa
	{
		id: "pt",
		name: "Portugal",
		at: 11,
		body:
			rect(0, 0, 12, H, "#046a38") +
			rect(12, 0, 18, H, "#da291c") +
			'<circle cx="12" cy="10" r="3.8" fill="#ffe000"/>' +
			'<rect x="10.2" y="7.6" width="3.6" height="4.8" rx="1.4" fill="#da291c"/>' +
			'<rect x="11.1" y="8.5" width="1.8" height="3" rx="0.8" fill="#fff"/>',
	},
	{
		id: "es",
		name: "Spain",
		at: 12,
		body:
			rect(0, 0, W, 5, "#aa151b") +
			rect(0, 5, W, 10, "#f1bf00") +
			rect(0, 15, W, 5, "#aa151b") +
			'<rect x="6.4" y="7.2" width="3.8" height="5.6" rx="1.4" fill="#aa151b"/>',
	},
	{ id: "fr", name: "France", at: 13, body: cols("#0055a4", "#fff", "#ef4135") },
	{ id: "de", name: "Germany", at: 14, body: rows("#000", "#dd0000", "#ffce00") },
	{ id: "it", name: "Italy", at: 15, body: cols("#009246", "#fff", "#ce2b37") },
	{
		id: "gb-eng",
		name: "England",
		at: 16,
		body: bg("#fff") + rect(12.8, 0, 4.4, H, "#ce1124") + rect(0, 7.8, W, 4.4, "#ce1124"),
	},
	{ id: "nl", name: "Netherlands", at: 17, body: rows("#ae1c28", "#fff", "#21468b") },
	{ id: "be", name: "Belgium", at: 18, body: cols("#000", "#fdda24", "#ef3340") },
	{
		id: "hr",
		name: "Croatia",
		at: 19,
		body:
			rows("#ff0000", "#fff", "#171796") +
			rect(11.4, 5.4, 7.2, 8.4, "#fff") +
			Array.from({ length: 4 * 5 }, (_, n) => {
				const col = n % 4;
				const row = Math.floor(n / 4);
				return (col + row) % 2 === 0 ? rect(11.4 + col * 1.8, 5.4 + row * 1.68, 1.8, 1.68, "#ff0000") : "";
			}).join(""),
	},
	{
		id: "ch",
		name: "Switzerland",
		at: 20,
		body: bg("#da291c") + rect(13.2, 4, 3.6, 12, "#fff") + rect(9, 8.2, 12, 3.6, "#fff"),
	},
	{ id: "dk", name: "Denmark", at: 21, body: bg("#c8102e") + nordic(9, 3, "#fff") },
	{ id: "se", name: "Sweden", at: 22, body: bg("#006aa7") + nordic(9, 3.2, "#fecc00") },
	{
		id: "no",
		name: "Norway",
		at: 23,
		body: bg("#ba0c2f") + nordic(8, 5, "#fff") + nordic(9.25, 2.5, "#00205b"),
	},
	{ id: "pl", name: "Poland", at: 24, body: rect(0, 0, W, 10, "#fff") + rect(0, 10, W, 10, "#dc143c") },
	// África
	{
		id: "ma",
		name: "Morocco",
		at: 25,
		body: bg("#c1272d") + pentagram(15, 10.4, 4.8, "#006233", 1.1),
	},
	{
		id: "sn",
		name: "Senegal",
		at: 26,
		body: cols("#00853f", "#fdef42", "#e31b23") + star(15, 10.4, 3, "#00853f"),
	},
	{ id: "ng", name: "Nigeria", at: 27, body: cols("#008751", "#fff", "#008751") },
	{
		id: "ao",
		name: "Angola",
		at: 28,
		body:
			rect(0, 0, W, 10, "#cc092f") +
			rect(0, 10, W, 10, "#000") +
			'<path d="M11.6 12.9A4.3 4.3 0 1 1 18.7 7.6" fill="none" stroke="#ffcb00" stroke-width="1.3"/>' +
			'<path d="M12.6 7.8l4.8 5.4" stroke="#ffcb00" stroke-width="1.3" stroke-linecap="round"/>' +
			star(16.8, 9.2, 1.3, "#ffcb00"),
	},
	// Ásia e Oceania
	{ id: "jp", name: "Japan", at: 29, body: bg("#fff") + '<circle cx="15" cy="10" r="6" fill="#bc002d"/>' },
	{
		id: "kr",
		name: "South Korea",
		at: 30,
		body:
			bg("#fff") +
			'<circle cx="15" cy="10" r="5" fill="#0047a0"/>' +
			'<path d="M10 10A5 5 0 0 1 20 10A2.5 2.5 0 0 1 15 10A2.5 2.5 0 0 0 10 10Z" fill="#cd2e3a"/>' +
			[
				[5.6, 4.4, -33],
				[24.4, 15.6, -33],
				[24.4, 4.4, 33],
				[5.6, 15.6, 33],
			]
				.map(
					([x, y, angle]) =>
						`<g transform="translate(${x} ${y}) rotate(${angle})" fill="#000">` +
						rect(-2.2, -1.8, 4.4, 0.8, "#000") +
						rect(-2.2, -0.4, 4.4, 0.8, "#000") +
						rect(-2.2, 1, 4.4, 0.8, "#000") +
						"</g>"
				)
				.join(""),
	},
	{
		id: "au",
		name: "Australia",
		at: 31,
		body:
			bg("#012169") +
			'<svg width="15" height="10" viewBox="0 0 15 10">' +
			'<path d="M0 0L15 10M15 0L0 10" stroke="#fff" stroke-width="2"/>' +
			'<path d="M0 0L15 10M15 0L0 10" stroke="#c8102e" stroke-width="0.7"/>' +
			rect(6, 0, 3, 10, "#fff") +
			rect(0, 3.5, 15, 3, "#fff") +
			rect(6.75, 0, 1.5, 10, "#c8102e") +
			rect(0, 4.25, 15, 1.5, "#c8102e") +
			"</svg>" +
			star(7.5, 15, 2.2, "#fff") +
			star(22.5, 16.6, 1.2, "#fff") +
			star(19.6, 9.2, 1.2, "#fff") +
			star(22.5, 3.6, 1.2, "#fff") +
			star(26, 8.4, 1.2, "#fff") +
			star(24.3, 11.6, 0.7, "#fff"),
	},
];

const flagImage = (body: string): string =>
	svgImage(
		'<clipPath id="c"><rect width="30" height="20" rx="2.6"/></clipPath>' +
			`<g transform="translate(0 5)"><g clip-path="url(#c)">${body}</g>` +
			'<rect x=".25" y=".25" width="29.5" height="19.5" rx="2.4" fill="none" stroke="#000" stroke-opacity=".18" stroke-width=".5"/></g>',
		"0 0 30 30"
	);

export const FLAG_SECTION: StyleSection = {
	id: "flags",
	name: "Flags",
	description: "National team flags from the Americas, Europe, Africa, Asia and Oceania.",
	layout: "grid",
	groups: [
		FLAGS.map((flag) =>
			define(
				{
					id: `flags.${flag.id}`,
					name: flag.name,
					char: packChar(11, flag.at),
					description: `Flag of ${flag.name}.`,
					effect: "Normal text",
				},
				imageMark(flagImage(flag.body))
			)
		),
	],
};
