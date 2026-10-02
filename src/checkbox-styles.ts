/**
 * Registro de estilos de checkbox.
 *
 * Um estilo é um caractere de tarefa (`- [g] ...`) mais um conjunto de
 * variáveis CSS (`--cbs-*`) consumidas pelas regras genéricas de `styles.css`:
 * a aparência da checkbox e o efeito aplicado ao texto da tarefa marcada.
 * Para adicionar um novo estilo basta acrescentar uma entrada em
 * `CHECKBOX_STYLES`; menu, configurações e CSS são gerados a partir dela.
 * O caractere (`char`) de cada estilo precisa ser único.
 */

export interface CheckboxStyleVars {
	radius: string;
	borderWidth: string;
	borderColor: string;
	borderColorHover: string;
	bg: string;
	bgHover: string;
	checkedBg: string;
	checkedBgHover: string;
	checkedBorderColor: string;
	checkedBorderColorHover: string;
	/** Imagem usada como máscara do marcador (ver `MARKS`). */
	mark: string;
	markColor: string;
	markColorHover: string;
	checkedShadow: string;
	duration: string;
	/** Efeito no texto da tarefa marcada. */
	textColor: string;
	textDecoration: string;
	textShadow: string;
	textWeight: string;
	textStyle: string;
}

export interface CheckboxStyleInfo {
	id: string;
	name: string;
	/** Caractere gravado entre os colchetes da tarefa marcada com este estilo. */
	char: string;
	description: string;
	/** Descrição curta do efeito no texto. */
	effect: string;
}

export interface CheckboxStyle extends CheckboxStyleInfo {
	vars: CheckboxStyleVars;
}

const svgMask = (body: string): string =>
	`url("data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`
	)}")`;

const stroke = (d: string, width = 1.8): string =>
	svgMask(
		`<path d="${d}" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
	);

export const MARKS = {
	check: stroke("M4.2 8.4l2.5 2.5 5.1-5.4"),
	thinCheck: stroke("M3.6 8.4l2.9 2.9 5.9-6.3", 1.4),
	cross: stroke("M5 5l6 6M11 5l-6 6"),
	dash: stroke("M4.8 8h6.4", 2),
	dot: svgMask('<circle cx="8" cy="8" r="3.2"/>'),
	square: svgMask('<rect x="4.5" y="4.5" width="7" height="7" rx="1"/>'),
	none: "none",
};

/** Forma preenchida com um glifo vazado (recorte feito por máscara SVG). */
const knockout = (shape: string, cut: string): string =>
	svgMask(
		`<mask id="m"><rect width="16" height="16" fill="#fff"/>` +
			`<g fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${cut}</g></mask>` +
			`<g mask="url(#m)">${shape}</g>`
	);

const badge = (cut: string): string =>
	knockout('<circle cx="8" cy="8" r="7"/>', cut);

const cutDot = (cx: number, cy: number, r = 0.95): string =>
	`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#000" stroke="none"/>`;

const THUMB =
	'<rect x="1.6" y="7" width="2.6" height="7" rx=".7"/>' +
	'<path d="M5.4 7.1l2.5-5.2c1.1 0 1.9.9 1.9 2v2h3a1.5 1.5 0 0 1 1.5 1.8l-.9 4.9a1.6 1.6 0 0 1-1.6 1.3H5.4z"/>';

export const ICONS = {
	half: svgMask(
		'<circle cx="8" cy="8" r="6.2" fill="none" stroke="#000" stroke-width="1.6"/>' +
			'<path d="M8 1.8a6.2 6.2 0 0 0 0 12.4z"/>'
	),
	forward: svgMask(
		'<path d="M2.2 2.6l11.6 5.4-11.6 5.4 1.9-5.4z" stroke="#000" stroke-width="1" stroke-linejoin="round"/>'
	),
	schedule: knockout(
		'<rect x="2" y="3" width="12" height="11.2" rx="2.2"/>' +
			'<path d="M5.2 1.8v2.4M10.8 1.8v2.4" stroke="#000" stroke-width="1.6" stroke-linecap="round"/>',
		'<path d="M4.4 7h7.2"/>'
	),
	question: badge(
		'<path d="M6.1 6.3a2 2 0 1 1 3 1.7c-.7.4-1.1.8-1.1 1.6"/>' + cutDot(8, 11.9)
	),
	important: knockout(
		'<path d="M8 2.2l6.3 11.2H1.7z" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/>',
		'<path d="M8 6.4v3"/>' + cutDot(8, 11.6)
	),
	star: svgMask(
		'<path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z" stroke="#000" stroke-width="1" stroke-linejoin="round"/>'
	),
	quote: badge(
		'<path d="M4.6 10c0-2.2.8-3.6 2.4-4.2M9 10c0-2.2.8-3.6 2.4-4.2"/>' +
			cutDot(5.5, 10, 1.1) +
			cutDot(9.9, 10, 1.1)
	),
	location: knockout(
		'<path d="M8 1.4a5.1 5.1 0 0 1 5.1 5.1c0 3.4-5.1 8.1-5.1 8.1S2.9 9.9 2.9 6.5A5.1 5.1 0 0 1 8 1.4z"/>',
		cutDot(8, 6.5, 1.9)
	),
	bookmark: svgMask(
		'<path d="M4.2 2.2h7.6v11.6L8 11l-3.8 2.8z" stroke="#000" stroke-width="1.2" stroke-linejoin="round"/>'
	),
	info: badge(cutDot(8, 4.9) + '<path d="M8 7.6v4"/>'),
	savings: badge(
		'<path stroke-width="1.2" d="M9.9 6.1c-.3-.7-1-1.1-1.9-1.1-1.1 0-1.9.6-1.9 1.4 0 2 3.9 1 3.9 3.1 0 .9-.8 1.5-2 1.5-.9 0-1.7-.4-2-1.1M8 3.6v8.8"/>'
	),
	idea: svgMask(
		'<path d="M8 1.6a4.5 4.5 0 0 0-2.7 8.1c.4.3.6.8.6 1.3h4.2c0-.5.2-1 .6-1.3A4.5 4.5 0 0 0 8 1.6z"/>' +
			'<path d="M6.2 12.1h3.6v1.2a1.1 1.1 0 0 1-1.1 1.1H7.3a1.1 1.1 0 0 1-1.1-1.1z"/>'
	),
	thumbUp: svgMask(THUMB),
	thumbDown: svgMask(`<g transform="rotate(180 8 8)">${THUMB}</g>`),
	fire: svgMask(
		'<path d="M8.2 1.4c.5 2.3 3.8 3.8 3.8 7.6a4 4 0 0 1-8 0c0-1.6.7-2.6 1.6-3.4.1 1 .7 1.7 1.4 1.8-.4-2 .1-4.3 1.2-6z"/>'
	),
	key: svgMask(
		'<circle cx="5.3" cy="10.7" r="2.6" fill="none" stroke="#000" stroke-width="1.8"/>' +
			'<path d="M7.3 8.7l5.6-5.6M10.6 5.4l1.9 1.9" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round"/>'
	),
	cake: svgMask(
		'<rect x="2.2" y="8.2" width="11.6" height="6" rx="1.3"/>' +
			'<rect x="3.8" y="5.4" width="8.4" height="3.6" rx="1.1"/>' +
			'<path d="M5.6 2.2v1.8M8 2.2v1.8M10.4 2.2v1.8" stroke="#000" stroke-width="1.2" stroke-linecap="round"/>'
	),
	trendUp: stroke("M2 11.4l3.9-3.9 2.7 2.7L13.8 5M10.2 4.8h3.8v3.8"),
	trendDown: stroke("M2 4.6l3.9 3.9 2.7-2.7L13.8 11M10.2 11.2h3.8V7.4"),
};

/** Preenchido com a cor de destaque e marcador contrastante (padrão do Obsidian). */
const BASE: CheckboxStyleVars = {
	radius: "var(--checkbox-radius)",
	borderWidth: "1px",
	borderColor: "var(--checkbox-border-color)",
	borderColorHover: "var(--checkbox-border-color-hover)",
	bg: "transparent",
	bgHover: "transparent",
	checkedBg: "var(--checkbox-color)",
	checkedBgHover: "var(--checkbox-color-hover)",
	checkedBorderColor: "var(--checkbox-color)",
	checkedBorderColorHover: "var(--checkbox-color-hover)",
	mark: MARKS.check,
	markColor: "var(--checkbox-marker-color)",
	markColorHover: "var(--checkbox-marker-color)",
	checkedShadow: "none",
	duration: "140ms",
	textColor: "var(--text-normal)",
	textDecoration: "none",
	textShadow: "none",
	textWeight: "inherit",
	textStyle: "inherit",
};

/** Apenas contorno: fundo transparente e marcador na cor de destaque. */
const OUTLINE: Partial<CheckboxStyleVars> = {
	checkedBg: "transparent",
	checkedBgHover: "transparent",
	markColor: "var(--checkbox-color)",
	markColorHover: "var(--checkbox-color-hover)",
};

const define = (
	info: CheckboxStyleInfo,
	...overrides: Partial<CheckboxStyleVars>[]
): CheckboxStyle => ({
	...info,
	vars: overrides.reduce<CheckboxStyleVars>(
		(vars, override) => ({ ...vars, ...override }),
		BASE
	),
});

const BOX_STYLES: CheckboxStyle[] = [
	define(
		{
			id: "classic",
			name: "Classic",
			char: "c",
			description: "Traditional square with a checkmark.",
			effect: "Strikethrough text",
		},
		OUTLINE,
		{
			radius: "2px",
			textColor: "var(--checklist-done-color, var(--text-muted))",
			textDecoration: "line-through",
		}
	),
	define(
		{
			id: "rounded",
			name: "Rounded",
			char: "r",
			description: "Rounded corners and a smooth transition.",
			effect: "Muted text",
		},
		{ radius: "35%", duration: "200ms", textColor: "var(--text-muted)" }
	),
	define(
		{
			id: "circle",
			name: "Circle",
			char: "o",
			description: "Filled circle with a checkmark.",
			effect: "Accent-colored text",
		},
		{ radius: "50%", textColor: "var(--text-accent)" }
	),
	define(
		{
			id: "minimal",
			name: "Minimal",
			char: "m",
			description: "Subtle, with almost no border.",
			effect: "Faint text",
		},
		OUTLINE,
		{
			radius: "3px",
			borderColor: "var(--background-modifier-border)",
			borderColorHover: "var(--checkbox-border-color)",
			bgHover: "var(--background-modifier-hover)",
			checkedBorderColor: "transparent",
			checkedBorderColorHover: "transparent",
			checkedBgHover: "var(--background-modifier-hover)",
			mark: MARKS.thinCheck,
			markColor: "var(--text-normal)",
			markColorHover: "var(--text-normal)",
			textColor: "var(--text-faint)",
		}
	),
	define(
		{
			id: "filled",
			name: "Filled",
			char: "f",
			description: "Bold outline, fully filled when checked.",
			effect: "Bold text",
		},
		{ radius: "2px", borderWidth: "2px", textWeight: "var(--font-bold, 700)" }
	),
	define(
		{
			id: "cross",
			name: "Cross",
			char: "-",
			description: "An X instead of a checkmark.",
			effect: "Red strikethrough (cancelled)",
		},
		OUTLINE,
		{
			mark: MARKS.cross,
			markColor: "var(--text-error)",
			markColorHover: "var(--text-error)",
			checkedBorderColor: "var(--text-error)",
			checkedBorderColorHover: "var(--text-error)",
			textColor: "var(--text-error)",
			textDecoration: "line-through",
		}
	),
	define(
		{
			id: "square",
			name: "Square",
			char: "s",
			description: "Solid square when checked.",
			effect: "Underlined text",
		},
		OUTLINE,
		{
			radius: "2px",
			mark: MARKS.square,
			textDecoration: "underline var(--checkbox-color)",
		}
	),
	define(
		{
			id: "dot",
			name: "Dot",
			char: ".",
			description: "Circle with a filled dot.",
			effect: "Italic (in progress)",
		},
		OUTLINE,
		{
			radius: "50%",
			mark: MARKS.dot,
			textColor: "var(--text-muted)",
			textStyle: "italic",
		}
	),
	define(
		{
			id: "dash",
			name: "Dash",
			char: "~",
			description: "Small centered dash.",
			effect: "Dashed underline (postponed)",
		},
		OUTLINE,
		{
			mark: MARKS.dash,
			textColor: "var(--text-muted)",
			textDecoration: "underline dashed",
		}
	),
	define(
		{
			id: "glow",
			name: "Glow",
			char: "g",
			description: "Filled with a subtle glow.",
			effect: "Glowing text",
		},
		{
			radius: "4px",
			duration: "220ms",
			checkedShadow:
				"0 0 0 2px color-mix(in srgb, var(--checkbox-color) 22%, transparent), " +
				"0 0 8px color-mix(in srgb, var(--checkbox-color) 50%, transparent)",
			textShadow:
				"0 0 2px color-mix(in srgb, var(--checkbox-color) 45%, transparent), " +
				"0 0 10px color-mix(in srgb, var(--checkbox-color) 75%, transparent)",
		}
	),
];

/** Estilo de ícone: a caixa some e o ícone colorido ocupa o lugar dela. */
const icon = (mark: string, color: string): Partial<CheckboxStyleVars> => ({
	checkedBg: "transparent",
	checkedBgHover: "transparent",
	checkedBorderColor: "transparent",
	checkedBorderColorHover: "transparent",
	mark,
	markColor: color,
	markColorHover: color,
});

const MUTED_TEXT: Partial<CheckboxStyleVars> = { textColor: "var(--text-muted)" };
const BOLD_TEXT: Partial<CheckboxStyleVars> = { textWeight: "var(--font-bold, 700)" };
const ITALIC_TEXT: Partial<CheckboxStyleVars> = { textStyle: "italic" };

const iconStyle = (
	id: string,
	name: string,
	char: string,
	mark: string,
	color: string,
	effect = "Normal text",
	text: Partial<CheckboxStyleVars> = {}
): CheckboxStyle =>
	define(
		{ id, name, char, description: `${name} icon.`, effect },
		icon(mark, color),
		text
	);

const ICON_STYLES: CheckboxStyle[] = [
	iconStyle("in-progress", "In progress", "/", ICONS.half, "var(--color-blue)"),
	iconStyle("forwarded", "Forwarded", ">", ICONS.forward, "var(--text-muted)", "Muted text", MUTED_TEXT),
	iconStyle("scheduled", "Scheduled", "<", ICONS.schedule, "var(--text-muted)", "Muted text", MUTED_TEXT),
	iconStyle("question", "Question", "?", ICONS.question, "var(--color-yellow)"),
	iconStyle("important", "Important", "!", ICONS.important, "var(--color-orange)", "Bold text", BOLD_TEXT),
	iconStyle("star", "Star", "*", ICONS.star, "var(--color-yellow)"),
	iconStyle("quote", "Quote", '"', ICONS.quote, "var(--color-cyan)", "Italic text", ITALIC_TEXT),
	iconStyle("location", "Location", "l", ICONS.location, "var(--color-pink)"),
	iconStyle("bookmark", "Bookmark", "b", ICONS.bookmark, "var(--color-orange)"),
	iconStyle("info", "Info", "i", ICONS.info, "var(--color-blue)"),
	iconStyle("savings", "Savings", "S", ICONS.savings, "var(--color-green)"),
	iconStyle("idea", "Idea", "I", ICONS.idea, "var(--color-yellow)"),
	iconStyle("pro", "Pro", "p", ICONS.thumbUp, "var(--color-green)"),
	iconStyle("con", "Con", "C", ICONS.thumbDown, "var(--color-orange)"),
	iconStyle("fire", "Fire", "F", ICONS.fire, "var(--color-red)"),
	iconStyle("key", "Key", "k", ICONS.key, "var(--color-yellow)"),
	iconStyle("win", "Win", "w", ICONS.cake, "var(--color-purple)"),
	iconStyle("up", "Up", "u", ICONS.trendUp, "var(--color-green)"),
	iconStyle("down", "Down", "d", ICONS.trendDown, "var(--color-red)"),
];

/** Grupos na ordem em que aparecem no menu (separados por uma linha). */
export const STYLE_GROUPS: CheckboxStyle[][] = [BOX_STYLES, ICON_STYLES];

export const CHECKBOX_STYLES: CheckboxStyle[] = [...BOX_STYLES, ...ICON_STYLES];

export const DEFAULT_STYLE_ID = "classic";

export function getCheckboxStyle(id: string): CheckboxStyle {
	return (
		CHECKBOX_STYLES.find((style) => style.id === id) ??
		CHECKBOX_STYLES.find((style) => style.id === DEFAULT_STYLE_ID) ??
		CHECKBOX_STYLES[0]
	);
}

/** Elementos de tarefa do Obsidian (modo leitura e Live Preview). */
const TASK_SCOPE = ":is(li.task-list-item, .HyperMD-task-line)";

const cssVarName = (key: string): string =>
	`--cbs-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

const declarations = (vars: CheckboxStyleVars): string =>
	Object.entries(vars)
		.map(([key, value]) => `${cssVarName(key)}:${value};`)
		.join("");

/** Classe aplicada ao <body> para indicar o estilo padrão escolhido. */
export const defaultStyleClass = (id: string): string => `cbs-default-${id}`;

/**
 * Gera as definições das variáveis (executado no build, ver esbuild.config.mjs).
 * O estilo padrão vale para qualquer tarefa (desmarcada, `[x]` ou caractere
 * desconhecido); cada estilo vale para o seu caractere e para elementos com
 * `data-cbs-style` (menu e configurações).
 */
export function buildStyleSheet(): string {
	const rules: string[] = [];
	// :where() mantém a especificidade abaixo das regras por caractere.
	for (const style of CHECKBOX_STYLES) {
		rules.push(
			`:where(body.${defaultStyleClass(style.id)}) ${TASK_SCOPE}{${declarations(style.vars)}}`
		);
	}
	for (const style of CHECKBOX_STYLES) {
		rules.push(
			`${TASK_SCOPE}[data-task=${JSON.stringify(style.char)}],` +
				`[data-cbs-style="${style.id}"]{${declarations(style.vars)}}`
		);
	}
	return rules.join("\n");
}
