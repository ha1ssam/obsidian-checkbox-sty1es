import {
	CheckboxStyle,
	CheckboxStyleVars,
	define,
	icon,
} from "../checkbox-styles";

/**
 * Uma seção do menu: os estilos básicos ou um pacote extra.
 *
 * Os pacotes gravam na tarefa caracteres da Área de Uso Privado do Unicode
 * (U+E000–U+F8FF), reservada justamente para usos próprios de um programa:
 * não colide com letras, símbolos de outros temas ou plugins.
 * Cada pacote embutido tem um bloco fixo de 256 caracteres (ver `block`) e
 * cada item, uma posição fixa dentro dele (`at`). Uma vez publicado, o par
 * bloco/posição de um item nunca muda nem é reaproveitado, senão as tarefas
 * já gravadas mudariam de estilo.
 */
export interface StyleSection {
	id: string;
	name: string;
	description: string;
	/** "list": linhas com nome. "grid": ícones em grade (seções grandes). */
	layout: "list" | "grid";
	/** Grupos na ordem do menu (separados por uma linha). */
	groups: CheckboxStyle[][];
}

/** Primeiro caractere dos pacotes embutidos (blocos de 0x100 a partir daqui). */
const PACK_BASE = 0xe000;
/** Blocos ocupados pelos pacotes embutidos: U+E000–U+EFFF. */
export const PACK_BLOCKS = 16;
/** Pacotes do usuário (pasta de imagens): U+F000–U+F8FF. */
export const CUSTOM_FIRST = 0xf000;
export const CUSTOM_LAST = 0xf8ff;

export const packChar = (block: number, at: number): string => {
	if (block < 0 || block >= PACK_BLOCKS || at < 0 || at > 0xff) {
		throw new Error(`Invalid pack position ${block}/${at}`);
	}
	return String.fromCharCode(PACK_BASE + block * 0x100 + at);
};

/** Cores do tema (`--color-*`) aceitas pelo atalho de nome. */
export type ThemeColor =
	| "red"
	| "orange"
	| "yellow"
	| "green"
	| "cyan"
	| "blue"
	| "purple"
	| "pink";

export const themeColor = (color: ThemeColor | "muted"): string =>
	color === "muted" ? "var(--text-muted)" : `var(--color-${color})`;

export interface IconItem {
	id: string;
	name: string;
	/** Posição fixa do caractere dentro do bloco do pacote. */
	at: number;
	mark: string;
	color: ThemeColor | "muted";
	/** Descrição curta do efeito no texto. */
	effect?: string;
	text?: Partial<CheckboxStyleVars>;
}

export interface PackInfo {
	id: string;
	name: string;
	description: string;
	block: number;
	layout?: "list" | "grid";
}

/** Pacote de ícones monocromáticos coloridos pelo tema (como os ícones básicos). */
export function iconPack(info: PackInfo, items: IconItem[]): StyleSection {
	return {
		id: info.id,
		name: info.name,
		description: info.description,
		layout: info.layout ?? "list",
		groups: [
			items.map((item) =>
				define(
					{
						id: `${info.id}.${item.id}`,
						name: item.name,
						char: packChar(info.block, item.at),
						description: `${item.name} icon.`,
						effect: item.effect ?? "Normal text",
					},
					icon(item.mark, themeColor(item.color)),
					item.text ?? {}
				)
			),
		],
	};
}

/** Marcador colorido (imagem): a caixa some e a imagem ocupa o lugar dela. */
export const imageMark = (url: string): Partial<CheckboxStyleVars> => ({
	checkedBg: "transparent",
	checkedBgHover: "transparent",
	checkedBorderColor: "transparent",
	checkedBorderColorHover: "transparent",
	mark: "none",
	markImage: url,
	markColor: "transparent",
	markColorHover: "transparent",
});

/** SVG colorido (sem máscara) como `url(...)`. */
export const svgImage = (body: string, viewBox = "0 0 16 16"): string =>
	`url("data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`
	)}")`;
