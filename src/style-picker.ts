/**
 * Menu de estilos com abas por seção.
 *
 * Com só a seção básica ligada, é uma lista simples como o menu antigo. Com
 * pacotes extras, ganha uma barra de abas (uma por seção) e uma busca que
 * procura em todas as seções. Seções grandes (bandeiras, imagens do usuário)
 * aparecem em grade. No celular, abre como painel na parte de baixo da tela.
 */
import { Platform, setIcon } from "obsidian";
import { CheckboxStyle } from "./checkbox-styles";
import { StyleSection } from "./packs/pack";
import { createCheckbox } from "./settings";

export interface PickerOptions {
	doc: Document;
	position: { x: number; y: number };
	/** Seções na ordem das abas; a primeira é a básica. */
	sections: StyleSection[];
	/** Caractere atual da tarefa. */
	currentChar: string;
	/** Aba aberta se o caractere atual não estiver em nenhuma seção. */
	preferredSection: string | null;
	/** Opção "Unchecked" no fim (só quando a tarefa está marcada). */
	unchecked: { styleId: string; char: string } | null;
	/** Abrir com o foco no menu (veio do teclado). */
	keyboard: boolean;
	onPick: (char: string) => void;
	onSectionChange: (sectionId: string) => void;
}

const ITEM = ".cbs-picker-item";

const normalize = (text: string): string =>
	text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function openStylePicker(options: PickerOptions): () => void {
	const { doc, sections } = options;
	const win = doc.defaultView ?? window;
	const previousFocus = doc.activeElement as HTMLElement | null;
	const tabbed = sections.length > 1;
	const sheet = Platform.isPhone;

	const backdrop = doc.body.createDiv({ cls: "cbs-picker-backdrop" });
	const picker = doc.body.createDiv({
		cls: ["cbs-picker", tabbed ? "has-tabs" : "is-simple", sheet ? "is-sheet" : "is-popover"],
		attr: { role: "dialog", "aria-label": "Checkbox style" },
	});

	let search: HTMLInputElement | null = null;
	const tabs = new Map<string, HTMLElement>();
	if (tabbed) {
		search = picker.createEl("input", {
			cls: "cbs-picker-search",
			attr: {
				type: "search",
				placeholder: "Search styles…",
				spellcheck: "false",
				"aria-label": "Search styles",
			},
		});
		const nav = picker.createDiv({ cls: "cbs-picker-tabs", attr: { role: "tablist" } });
		for (const section of sections) {
			const tab = nav.createDiv({
				cls: "cbs-picker-tab",
				text: section.name,
				attr: { role: "tab", "aria-selected": "false" },
			});
			tab.addEventListener("click", () => {
				if (search) search.value = "";
				showSection(section.id);
			});
			tabs.set(section.id, tab);
		}
		// Rodinha vertical rola as abas na horizontal.
		nav.addEventListener(
			"wheel",
			(evt) => {
				if (Math.abs(evt.deltaY) > Math.abs(evt.deltaX)) {
					nav.scrollLeft += evt.deltaY;
					evt.preventDefault();
				}
			},
			{ passive: false }
		);
	}

	const body = picker.createDiv({ cls: "cbs-picker-body", attr: { role: "listbox" } });
	const footer = picker.createDiv({ cls: "cbs-picker-footer" });

	let closed = false;
	const close = () => {
		if (closed) return;
		closed = true;
		const hadFocus = picker.contains(doc.activeElement);
		backdrop.remove();
		picker.remove();
		win.removeEventListener("resize", close);
		win.removeEventListener("blur", close);
		if (hadFocus) previousFocus?.focus?.({ preventScroll: true });
	};
	const pick = (char: string) => {
		close();
		options.onPick(char);
	};

	const addItem = (
		parent: HTMLElement,
		style: { id: string; name: string; char: string },
		layout: "list" | "grid",
		extra?: string
	): HTMLElement => {
		const selected = style.char === options.currentChar;
		const item = parent.createDiv({
			cls: ["cbs-picker-item", layout === "grid" ? "is-tile" : "is-row"],
			attr: {
				role: "option",
				tabindex: "-1",
				"data-cbs-style": style.id,
				"aria-selected": String(selected),
				"aria-label": style.name,
			},
		});
		item.toggleClass("is-selected", selected);
		createCheckbox(item, style.char !== " ", true);
		item.createSpan({ cls: "cbs-preview-text cbs-picker-name", text: style.name });
		if (extra) item.createSpan({ cls: "cbs-picker-extra", text: extra });
		if (selected && layout === "list") setIcon(item.createSpan({ cls: "cbs-picker-check" }), "check");
		item.addEventListener("click", () => pick(style.char));
		return item;
	};

	const renderGroups = (section: StyleSection) => {
		section.groups.forEach((group, index) => {
			if (index > 0) body.createDiv({ cls: "cbs-picker-separator" });
			const container = body.createDiv({
				cls: section.layout === "grid" ? "cbs-picker-grid" : "cbs-picker-list",
			});
			for (const style of group) addItem(container, style, section.layout);
		});
	};

	let currentSection = sections[0].id;
	const showSection = (id: string) => {
		const section = sections.find((s) => s.id === id) ?? sections[0];
		currentSection = section.id;
		for (const [tabId, tab] of tabs) {
			const active = tabId === section.id;
			tab.toggleClass("is-active", active);
			tab.setAttribute("aria-selected", String(active));
			if (active) {
				const nav = tab.parentElement as HTMLElement;
				if (tab.offsetLeft < nav.scrollLeft) nav.scrollLeft = tab.offsetLeft;
				else if (tab.offsetLeft + tab.offsetWidth > nav.scrollLeft + nav.clientWidth) {
					nav.scrollLeft = tab.offsetLeft + tab.offsetWidth - nav.clientWidth;
				}
			}
		}
		body.empty();
		body.scrollTop = 0;
		renderGroups(section);
		options.onSectionChange(section.id);
	};

	const showResults = (query: string) => {
		body.empty();
		body.scrollTop = 0;
		for (const tab of tabs.values()) tab.removeClass("is-active");
		const terms = normalize(query).split(/\s+/).filter(Boolean);
		const matches: { style: CheckboxStyle; section: StyleSection }[] = [];
		for (const section of sections) {
			const sectionName = normalize(section.name);
			for (const style of section.groups.flat()) {
				const haystack = `${normalize(style.name)} ${sectionName}`;
				if (terms.every((term) => haystack.includes(term))) matches.push({ style, section });
			}
		}
		if (!matches.length) {
			body.createDiv({ cls: "cbs-picker-empty", text: "No styles found." });
			return;
		}
		const list = body.createDiv({ cls: "cbs-picker-list" });
		for (const { style, section } of matches.slice(0, 100)) {
			addItem(list, style, "list", section.name);
		}
	};

	search?.addEventListener("input", () => {
		const query = search?.value.trim() ?? "";
		if (query) showResults(query);
		else showSection(currentSection);
	});

	if (options.unchecked) {
		footer.createDiv({ cls: "cbs-picker-separator" });
		addItem(
			footer,
			{ id: options.unchecked.styleId, name: "Unchecked", char: options.unchecked.char },
			"list"
		);
	}

	const initial =
		sections.find((s) => s.groups.some((g) => g.some((st) => st.char === options.currentChar))) ??
		sections.find((s) => s.id === options.preferredSection) ??
		sections[0];
	showSection(initial.id);
	const selected = body.querySelector<HTMLElement>(".is-selected");
	if (selected) body.scrollTop = selected.offsetTop - body.offsetTop - body.clientHeight / 2;

	// ---------- Teclado ----------

	const items = (): HTMLElement[] => Array.from(picker.querySelectorAll<HTMLElement>(ITEM));
	const focusItem = (item: HTMLElement | undefined) => {
		if (!item) return;
		item.focus({ preventScroll: true });
		// Só a área do menu rola (scrollIntoView poderia mover a nota por trás).
		const scroller = item.closest<HTMLElement>(".cbs-picker-body");
		if (!scroller) return;
		const top = item.offsetTop - scroller.offsetTop;
		if (top < scroller.scrollTop) scroller.scrollTop = top;
		else if (top + item.offsetHeight > scroller.scrollTop + scroller.clientHeight) {
			scroller.scrollTop = top + item.offsetHeight - scroller.clientHeight;
		}
	};
	const switchTab = (step: number) => {
		const index = sections.findIndex((s) => s.id === currentSection);
		const next = sections[(index + step + sections.length) % sections.length];
		if (search) search.value = "";
		showSection(next.id);
		focusItem(items()[0]);
	};
	/** Itens por linha na grade do item (1 na lista). */
	const columnsOf = (item: HTMLElement): number => {
		const grid = item.parentElement;
		if (!grid?.hasClass("cbs-picker-grid")) return 1;
		return win.getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
	};

	picker.addEventListener("keydown", (evt) => {
		const all = items();
		const active = doc.activeElement as HTMLElement | null;
		const index = active ? all.indexOf(active) : -1;
		const inSearch = active === search;

		switch (evt.key) {
			case "Escape":
				close();
				break;
			case "Enter":
			case " ":
				if (inSearch && evt.key === " ") return;
				if (index >= 0) active?.click();
				else if (inSearch) all[0]?.click();
				else return;
				break;
			case "ArrowDown":
			case "ArrowUp": {
				const down = evt.key === "ArrowDown";
				if (index < 0) {
					if (down) focusItem(all[0]);
					else return;
					break;
				}
				const step = columnsOf(all[index]);
				const target = index + (down ? step : -step);
				if (target < 0) {
					if (search) search.focus();
					else focusItem(all[0]);
				} else {
					focusItem(all[Math.min(target, all.length - 1)]);
				}
				break;
			}
			case "ArrowLeft":
			case "ArrowRight": {
				const right = evt.key === "ArrowRight";
				if (inSearch) return;
				if (index >= 0 && columnsOf(all[index]) > 1) {
					focusItem(all[index + (right ? 1 : -1)] ?? all[index]);
				} else if (tabbed) {
					switchTab(right ? 1 : -1);
				} else {
					return;
				}
				break;
			}
			default:
				return;
		}
		evt.preventDefault();
		evt.stopPropagation();
	});

	// ---------- Fechar ----------

	const dismiss = (evt: Event) => {
		evt.preventDefault();
		evt.stopPropagation();
		close();
	};
	backdrop.addEventListener("pointerdown", dismiss);
	backdrop.addEventListener("contextmenu", dismiss);
	backdrop.addEventListener("wheel", close, { passive: true });
	win.addEventListener("resize", close);
	win.addEventListener("blur", close);

	// ---------- Posição ----------

	if (!sheet) {
		const margin = 8;
		const { x, y } = options.position;
		const rect = picker.getBoundingClientRect();
		const maxLeft = win.innerWidth - rect.width - margin;
		const left = Math.max(margin, Math.min(x, maxLeft));
		let top = y;
		if (y + rect.height > win.innerHeight - margin) {
			top = y - rect.height >= margin ? y - rect.height : win.innerHeight - rect.height - margin;
		}
		picker.style.left = `${left}px`;
		picker.style.top = `${Math.max(margin, top)}px`;
	}

	if (options.keyboard || !search) {
		const all = items();
		focusItem(all.find((item) => item.hasClass("is-selected")) ?? all[0]);
	} else if (!Platform.isMobile) {
		search.focus({ preventScroll: true });
	} else {
		picker.tabIndex = -1;
		picker.focus({ preventScroll: true });
	}

	return close;
}
