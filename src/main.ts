import { KeymapEventHandler, MarkdownView, Menu, Plugin } from "obsidian";
import {
	CHECKBOX_STYLES,
	DEFAULT_STYLE_ID,
	STYLE_GROUPS,
	defaultStyleClass,
	getCheckboxStyle,
} from "./checkbox-styles";
import { StoredHotkey, parseHotkey } from "./hotkey";
import { CheckboxStyleSettingTab, createCheckbox } from "./settings";
import {
	TaskTarget,
	UNCHECKED_CHAR,
	isUnchecked,
	resolveTaskTarget,
	trackRenderedCheckboxes,
} from "./task-target";
import { UncheckAll } from "./uncheck-all";

export type MouseButton = "left" | "right";

interface CheckboxStylesSettings {
	/**
	 * Estilo de tarefas desmarcadas, `[x]` e caracteres desconhecidos; é o
	 * estilo que o botão de marcar/desmarcar aplica.
	 */
	defaultStyle: string;
	/** Botão do mouse que abre o menu; o outro marca e desmarca a tarefa. */
	menuButton: MouseButton;
	/** Mostrar no topo de cada nota o botão que desmarca todas as tarefas. */
	uncheckAllButton: boolean;
	/** Atalho de teclado que desmarca todas as tarefas da nota ativa. */
	uncheckAllHotkey: StoredHotkey | null;
}

/** Formato das configurações até a versão 1.0.1. */
interface LegacySettings {
	menuOnCheck?: boolean;
}

const DEFAULT_SETTINGS: CheckboxStylesSettings = {
	defaultStyle: DEFAULT_STYLE_ID,
	menuButton: "left",
	uncheckAllButton: false,
	uncheckAllHotkey: null,
};

export default class CheckboxStylesPlugin extends Plugin {
	settings: CheckboxStylesSettings = { ...DEFAULT_SETTINGS };
	private uncheckAll = new UncheckAll(this.app);
	private uncheckButtons = new Map<MarkdownView, HTMLElement>();
	private uncheckHotkey: KeymapEventHandler | null = null;
	/** Verdadeiro enquanto repassamos um clique sintético ao Obsidian. */
	private passingClick = false;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new CheckboxStyleSettingTab(this.app, this));
		this.registerMarkdownPostProcessor(trackRenderedCheckboxes);

		this.applyDefaultStyle(this.settings.defaultStyle);
		this.syncUncheckHotkey();
		this.registerWindow(window);
		this.app.workspace.onLayoutReady(() => {
			// Janelas destacadas (pop-out) têm o seu próprio document.
			this.applyDefaultStyle(this.settings.defaultStyle);
			this.syncUncheckButtons();
			// Notas já abertas em modo leitura precisam passar pelo post processor.
			this.app.workspace.iterateAllLeaves((leaf) => {
				if (leaf.view instanceof MarkdownView && leaf.view.getMode() === "preview") {
					leaf.view.previewMode.rerender(true);
				}
			});
		});
		this.registerEvent(
			this.app.workspace.on("layout-change", () => this.syncUncheckButtons())
		);
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => this.syncUncheckButtons())
		);
		this.registerEvent(
			this.app.workspace.on("window-open", (win) => {
				setDefaultStyleClass(win.doc.body, this.settings.defaultStyle);
				this.registerWindow(win.win);
			})
		);
	}

	onunload(): void {
		this.applyDefaultStyle(null);
		for (const button of this.uncheckButtons.values()) {
			button.remove();
		}
		this.uncheckButtons.clear();
		if (this.uncheckHotkey) this.app.scope.unregister(this.uncheckHotkey);
	}

	async updateSettings(changes: Partial<CheckboxStylesSettings>): Promise<void> {
		Object.assign(this.settings, changes);
		this.applyDefaultStyle(this.settings.defaultStyle);
		this.syncUncheckButtons();
		this.syncUncheckHotkey();
		await this.saveData(this.settings);
	}

	private async loadSettings(): Promise<void> {
		const saved = (await this.loadData()) as
			| (Partial<CheckboxStylesSettings> & LegacySettings)
			| null;
		let menuButton: MouseButton = DEFAULT_SETTINGS.menuButton;
		if (saved?.menuButton === "left" || saved?.menuButton === "right") {
			menuButton = saved.menuButton;
		} else if (saved?.menuOnCheck === false) {
			// Antes: clique marcava direto e o menu ficava no botão direito.
			menuButton = "right";
		}
		this.settings = {
			defaultStyle: getCheckboxStyle(saved?.defaultStyle ?? DEFAULT_STYLE_ID).id,
			menuButton,
			uncheckAllButton: saved?.uncheckAllButton === true,
			uncheckAllHotkey: parseHotkey(saved?.uncheckAllHotkey),
		};
	}

	/** Registra no Obsidian o atalho escolhido nas configurações do plugin. */
	private syncUncheckHotkey(): void {
		if (this.uncheckHotkey) {
			this.app.scope.unregister(this.uncheckHotkey);
			this.uncheckHotkey = null;
		}
		const hotkey = this.settings.uncheckAllHotkey;
		if (!hotkey) return;
		this.uncheckHotkey = this.app.scope.register(hotkey.modifiers, hotkey.key, () => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			// Sem nota ativa, a tecla segue o caminho normal.
			if (!view) return;
			void this.uncheckAll.run(view);
			return false;
		});
	}

	/** Põe ou tira o botão "desmarcar tudo" do topo de cada nota aberta. */
	private syncUncheckButtons(): void {
		const open = new Set<MarkdownView>();
		this.app.workspace.iterateAllLeaves((leaf) => {
			if (leaf.view instanceof MarkdownView) open.add(leaf.view);
		});
		const show = this.settings.uncheckAllButton;
		for (const [view, button] of this.uncheckButtons) {
			if (!show || !open.has(view)) {
				button.remove();
				this.uncheckButtons.delete(view);
			}
		}
		if (!show) return;
		for (const view of open) {
			if (this.uncheckButtons.has(view)) continue;
			this.uncheckButtons.set(
				view,
				view.addAction("list-x", "Uncheck all tasks", () => {
					void this.uncheckAll.run(view);
				})
			);
		}
	}

	private registerWindow(win: Window): void {
		// Captura na janela: roda antes do tratamento nativo do Obsidian.
		const handler = (evt: MouseEvent) => this.onCheckboxEvent(evt);
		this.registerDomEvent(win, "click", handler, { capture: true });
		this.registerDomEvent(win, "contextmenu", handler, { capture: true });
	}

	private onCheckboxEvent(evt: MouseEvent): void {
		if (this.passingClick) return;
		const input = evt.target as HTMLElement | null;
		if (!input?.matches?.("input.task-list-item-checkbox")) return;

		const task = resolveTaskTarget(this.app, input);
		if (!task) return;

		const button: MouseButton = evt.type === "contextmenu" ? "right" : "left";
		if (button === this.settings.menuButton) {
			evt.preventDefault();
			evt.stopImmediatePropagation();
			this.showStyleMenu(evt, input, task);
			return;
		}
		// O outro botão marca/desmarca. No esquerdo isso já é o comportamento
		// nativo; no direito, repassamos um clique comum no lugar do menu de
		// contexto, para que o Obsidian e outros plugins (Tasks, por exemplo)
		// tratem a tarefa exatamente como num clique normal.
		if (button === "right") {
			evt.preventDefault();
			evt.stopImmediatePropagation();
			this.passingClick = true;
			try {
				input.click();
			} finally {
				this.passingClick = false;
			}
		}
	}

	private showStyleMenu(evt: MouseEvent, input: HTMLElement, task: TaskTarget): void {
		// O menu nativo do sistema não renderiza as checkboxes dos itens.
		const menu = new Menu().setUseNativeMenu(false);
		const rows: HTMLElement[] = [];
		const addOption = (option: {
			styleId: string;
			name: string;
			char: string;
			selected: boolean;
		}) =>
			menu.addItem((item) =>
				item
					.setTitle(
						createFragment((frag) => {
							const row = frag.createSpan({
								cls: "cbs-menu-item",
								attr: { "data-cbs-style": option.styleId },
							});
							createCheckbox(row, !isUnchecked(option.char), true);
							row.createSpan({ cls: "cbs-preview-text", text: option.name });
							rows.push(row);
						})
					)
					.setChecked(option.selected)
					.onClick(() => task.setChar(option.char))
			);

		STYLE_GROUPS.forEach((group, index) => {
			if (index > 0) menu.addSeparator();
			for (const style of group) {
				addOption({
					styleId: style.id,
					name: style.name,
					char: style.char,
					selected: task.char === style.char,
				});
			}
		});
		if (!isUnchecked(task.char)) {
			menu.addSeparator();
			addOption({
				styleId: this.settings.defaultStyle,
				name: "Unchecked",
				char: UNCHECKED_CHAR,
				selected: false,
			});
		}
		scrollOnlyWithKeyboard(menu, rows, evt.view ?? window);
		// A classe precisa existir antes de abrir: o Obsidian posiciona o menu
		// pela altura dele, e é ela que limita a altura (ver styles.base.css).
		(menu as unknown as { dom?: HTMLElement }).dom?.addClass("cbs-menu");
		// Clique gerado pelo teclado (espaço) não tem posição do mouse.
		if (evt.type === "click" && evt.detail === 0) {
			const rect = input.getBoundingClientRect();
			menu.showAtPosition({ x: rect.left, y: rect.bottom }, input.ownerDocument);
		} else {
			menu.showAtMouseEvent(evt);
		}
		// Ao abrir, o Obsidian liga na área de rolagem um "mousemove" que move
		// a lista conforme a posição do mouse; barra esse evento antes dele.
		rows[0]
			?.closest(".menu-scroll")
			?.addEventListener("mousemove", (e) => e.stopImmediatePropagation(), true);
	}

	private applyDefaultStyle(id: string | null): void {
		const bodies = new Set<HTMLElement>([document.body]);
		this.app.workspace.iterateAllLeaves((leaf) => {
			bodies.add(leaf.view.containerEl.ownerDocument.body);
		});
		for (const body of bodies) {
			setDefaultStyleClass(body, id);
		}
	}
}

/**
 * O menu do Obsidian rola o item para a vista sempre que ele é selecionado,
 * inclusive ao passar o mouse; numa lista com rolagem isso faz o menu andar
 * sozinho. Mantém esse comportamento só para a navegação pelo teclado.
 */
function scrollOnlyWithKeyboard(menu: Menu, rows: HTMLElement[], win: Window): void {
	let usingKeyboard = false;
	const onKeyDown = () => {
		usingKeyboard = true;
	};
	const onPointerMove = () => {
		usingKeyboard = false;
	};
	win.addEventListener("keydown", onKeyDown, true);
	win.addEventListener("pointermove", onPointerMove, true);
	menu.onHide(() => {
		win.removeEventListener("keydown", onKeyDown, true);
		win.removeEventListener("pointermove", onPointerMove, true);
	});

	for (const row of rows) {
		const item = row.closest<HTMLElement>(".menu-item");
		if (!item) continue;
		const scrollIntoView = item.scrollIntoView.bind(item);
		item.scrollIntoView = (arg?: boolean | ScrollIntoViewOptions) => {
			if (usingKeyboard) scrollIntoView(arg);
		};
	}
}

function setDefaultStyleClass(body: HTMLElement, id: string | null): void {
	for (const style of CHECKBOX_STYLES) {
		body.classList.toggle(defaultStyleClass(style.id), style.id === id);
	}
}
