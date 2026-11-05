// Expõe o menu real do plugin e os dados das seções para as imagens de divulgação.
import { define, cssString, styleRule, CheckboxStyle } from "../src/checkbox-styles";
import { imageMark } from "../src/packs/pack";
import { BASIC_SECTION, ICON_SECTION, PACKS, StyleSection } from "../src/sections";
import { openStylePicker } from "../src/style-picker";

// ---------- Ajudantes de DOM do Obsidian ----------
type Info = { cls?: string | string[]; text?: string; type?: string; placeholder?: string; value?: string; attr?: Record<string, string | number | boolean> } | string;
const P = HTMLElement.prototype as any;
function apply(el: HTMLElement, o?: Info) {
	if (!o) return;
	if (typeof o === "string") { el.className = o; return; }
	if (o.cls) el.classList.add(...([] as string[]).concat(o.cls).flatMap((c) => c.split(" ")).filter(Boolean));
	if (o.text != null) el.textContent = o.text;
	if (o.type) el.setAttribute("type", o.type);
	if (o.placeholder) el.setAttribute("placeholder", o.placeholder);
	if (o.value != null) (el as HTMLInputElement).value = o.value;
	if (o.attr) for (const [k, v] of Object.entries(o.attr)) el.setAttribute(k, String(v));
}
P.createEl = function (tag: string, o?: Info, cb?: (el: HTMLElement) => void) {
	const el = this.ownerDocument.createElement(tag); apply(el, o); this.appendChild(el); cb?.(el); return el;
};
P.createDiv = function (o?: Info, cb?: any) { return this.createEl("div", o, cb); };
P.createSpan = function (o?: Info, cb?: any) { return this.createEl("span", o, cb); };
P.empty = function () { while (this.firstChild) this.removeChild(this.firstChild); };
P.addClass = function (...c: string[]) { this.classList.add(...c); };
P.removeClass = function (...c: string[]) { this.classList.remove(...c); };
P.toggleClass = function (c: string, v: boolean) { this.classList.toggle(c, v); };
P.hasClass = function (c: string) { return this.classList.contains(c); };
P.toggle = function (show: boolean) { this.style.display = show ? "" : "none"; };
P.isShown = function () { return this.style.display !== "none"; };

// ---------- Imagens do usuário (escudos fictícios) ----------
const crest = (a: string, b: string, kind: number) => {
	const shield = "M32 4 L56 12 V30 C56 46 46 56 32 60 C18 56 8 46 8 30 V12 Z";
	const inner = [
		`<path d="M32 4 V60" stroke="${b}" stroke-width="10"/>`,
		`<path d="M8 26 H56" stroke="${b}" stroke-width="10"/>`,
		`<path d="M32 18 l4 9 10 1-7.5 6.5 2.5 10-9-5.5-9 5.5 2.5-10L18 28l10-1z" fill="${b}"/>`,
		`<circle cx="32" cy="32" r="11" fill="none" stroke="${b}" stroke-width="5"/>`,
		`<path d="M14 14 L50 50 M50 14 L14 50" stroke="${b}" stroke-width="7"/>`,
		`<path d="M20 4 V60 M44 4 V60" stroke="${b}" stroke-width="8"/>`,
	][kind];
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><clipPath id="c"><path d="${shield}"/></clipPath></defs><path d="${shield}" fill="${a}"/><g clip-path="url(#c)">${inner}</g><path d="${shield}" fill="none" stroke="#111" stroke-opacity=".35" stroke-width="2.5"/></svg>`;
	return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};
const CRESTS: [string, string, string, number][] = [
	["Lions", "#e5484d", "#ffffff", 0], ["Harbor", "#2f6fec", "#ffffff", 1],
	["Eagles", "#1f9d55", "#f5d90a", 2], ["Comets", "#111111", "#ffffff", 3],
	["Rovers", "#f5d90a", "#1f3b8a", 4], ["United", "#8b6cef", "#ffffff", 5],
	["Rangers", "#ffffff", "#e5484d", 1], ["Wolves", "#f08c00", "#111111", 3],
	["Sharks", "#1aa8b5", "#ffffff", 0], ["Athletic", "#c2255c", "#f5d90a", 2],
	["City", "#74c0fc", "#ffffff", 4], ["Royals", "#3b2d8f", "#f5d90a", 5],
];
const CUSTOM: StyleSection = {
	id: "custom:Checkbox images/Football",
	name: "Football",
	description: "12 images",
	layout: "grid",
	groups: [CRESTS.map(([name, a, b, k], i) => define(
		{ id: `custom:Football/${name}`, name, char: String.fromCharCode(0xf000 + i), description: name, effect: "Normal text" },
		imageMark(crest(a, b, k)),
	))],
};
const style = document.createElement("style");
style.textContent = CUSTOM.groups[0].map(styleRule).join("\n");
document.head.appendChild(style);

// ---------- API para as páginas ----------
const ALL: StyleSection[] = [BASIC_SECTION, ...PACKS, CUSTOM];
export interface PickerSpec {
	tabs: string[];
	current: string;
	query?: string;
	manage?: boolean;
	enabled?: string[];
	checked?: boolean;
	scroll?: number;
}
function picker(target: HTMLElement, spec: PickerSpec) {
	const byId = (id: string) => ALL.find((s) => s.id === id)!;
	const enabled = new Set(spec.enabled ?? spec.tabs);
	openStylePicker({
		doc: document,
		position: { x: 0, y: 0 },
		getSections: () => spec.tabs.map(byId),
		getExtraSections: () => PACKS,
		isSectionEnabled: (id) => enabled.has(id),
		setSectionEnabled: async () => {},
		openSettings: () => {},
		currentChar: spec.current,
		preferredSection: null,
		unchecked: spec.checked === false ? null : { styleId: "classic", char: " " },
		keyboard: false,
		onPick: () => {},
		onSectionChange: () => {},
	});
	document.querySelector(".cbs-picker-backdrop")?.remove();
	const el = document.querySelector<HTMLElement>(".cbs-picker")!;
	(document.activeElement as HTMLElement | null)?.blur();
	el.style.position = "relative";
	el.style.left = el.style.top = "";
	target.appendChild(el);
	if (spec.manage) el.querySelector<HTMLElement>(".cbs-picker-add")!.click();
	if (spec.query) {
		const input = el.querySelector<HTMLInputElement>(".cbs-picker-search")!;
		input.value = spec.query;
		input.dispatchEvent(new Event("input"));
	}
	if (spec.scroll) el.querySelector<HTMLElement>(".cbs-picker-body")!.scrollTop = spec.scroll;
	return el;
}
const info = (s: CheckboxStyle) => ({ id: s.id, name: s.name, char: s.char, effect: s.effect });
(window as any).Promo = {
	picker,
	basic: BASIC_SECTION.groups.flat().map(info),
	icons: ICON_SECTION.groups.flat().map(info),
	packs: PACKS.filter((p) => p !== ICON_SECTION).map((p) => ({ id: p.id, name: p.name, description: p.description, count: p.groups.flat().length, styles: p.groups.flat().map(info) })),
	custom: { id: CUSTOM.id, name: CUSTOM.name, styles: CUSTOM.groups[0].map(info) },
	cssString,
};
