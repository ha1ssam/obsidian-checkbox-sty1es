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

export const CHECKBOX_STYLES: CheckboxStyle[] = [
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
