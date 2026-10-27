/**
 * Todas as seções embutidas: os estilos básicos (sempre no menu) e os pacotes
 * extras, que o usuário liga e desliga nas configurações.
 *
 * Um pacote desligado só sai do menu: as regras de CSS de todos os pacotes
 * continuam no styles.css, então as tarefas já marcadas com eles não mudam.
 */
import {
	BOX_STYLES,
	CheckboxStyle,
	ICON_STYLES,
	defaultStyleRules,
	styleRule,
} from "./checkbox-styles";
import { FLAG_SECTION } from "./packs/flags";
import { HEALTH, HOME, MONEY, MOOD, STUDY, TRAVEL } from "./packs/life";
import { StyleSection } from "./packs/pack";
import { COLORS, PRIORITY, STATUS, WORK } from "./packs/productivity";
import { SEASONS } from "./packs/seasons";

export type { StyleSection } from "./packs/pack";

export const BASIC_SECTION: StyleSection = {
	id: "basic",
	name: "Basic",
	description: "The 29 built-in checkbox styles and icons.",
	layout: "list",
	groups: [BOX_STYLES, ICON_STYLES],
};

/** Pacotes extras, na ordem das abas do menu. */
export const PACKS: StyleSection[] = [
	PRIORITY,
	STATUS,
	WORK,
	COLORS,
	MOOD,
	HEALTH,
	STUDY,
	MONEY,
	HOME,
	TRAVEL,
	SEASONS,
	FLAG_SECTION,
];

export const sectionStyles = (section: StyleSection): CheckboxStyle[] => section.groups.flat();

/** Gera styles.css (executado no build, ver esbuild.config.mjs). */
export function buildStyleSheet(): string {
	const styles = [BASIC_SECTION, ...PACKS].flatMap(sectionStyles);
	assertUnique(styles.map((style) => style.id), "id");
	assertUnique(styles.map((style) => style.char), "char");
	assertUnique(PACKS.map((pack) => pack.id), "pack id");
	return [...defaultStyleRules(), ...styles.map(styleRule)].join("\n");
}

function assertUnique(values: string[], what: string): void {
	const seen = new Set<string>();
	for (const value of values) {
		if (seen.has(value)) throw new Error(`Duplicate style ${what}: ${JSON.stringify(value)}`);
		seen.add(value);
	}
}
