// Substitutos mínimos da API do Obsidian, só para desenhar o menu fora do app.
const ICONS: Record<string, string> = {
	plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
	check: '<path d="M20 6 9 17l-5-5"/>',
	settings:
		'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
};
export function setIcon(el: HTMLElement, name: string): void {
	el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-${name}">${ICONS[name] ?? ""}</svg>`;
}
export const Platform = { isMobile: false, isPhone: false, isDesktop: true };
export class ToggleComponent {
	toggleEl: HTMLElement;
	constructor(parent: HTMLElement) {
		this.toggleEl = parent.createDiv({ cls: "checkbox-container" });
		this.toggleEl.createEl("input", { attr: { type: "checkbox", tabindex: "0" } });
	}
	setValue(on: boolean): this {
		this.toggleEl.toggleClass("is-enabled", on);
		return this;
	}
}
class Dummy {}
export { Dummy as App, Dummy as ButtonComponent, Dummy as PluginSettingTab, Dummy as Setting, Dummy as Notice, Dummy as Modal, Dummy as Plugin, Dummy as TFile, Dummy as TFolder, Dummy as MarkdownView, Dummy as Scope, Dummy as Keymap };
export type SettingDefinition = unknown;
export type SettingDefinitionItem = unknown;
export const debounce = <T>(f: T) => f;
export const normalizePath = (p: string) => p;
export type KeymapContext = unknown;
export type Modifier = string;
export type KeymapEventHandler = unknown;
