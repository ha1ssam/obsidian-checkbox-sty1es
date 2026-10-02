import { MarkdownView, Menu, Plugin } from "obsidian";
import {
	CHECKBOX_STYLES,
	DEFAULT_STYLE_ID,
	STYLE_GROUPS,
	defaultStyleClass,
	getCheckboxStyle,
} from "./checkbox-styles";
import { CheckboxStyleSettingTab, createCheckbox } from "./settings";
import {
	TaskTarget,
	UNCHECKED_CHAR,
	isUnchecked,
	resolveTaskTarget,
	trackRenderedCheckboxes,
} from "./task-target";

export type MouseButton = "left" | "right";

interface CheckboxStylesSettings {
	/**
	 * Estilo de tarefas desmarcadas, `[x]` e caracteres desconhecidos; é o
	 * estilo que o botão de marcar/desmarcar aplica.
	 */
	defaultStyle: string;
	/** Botão do mouse que abre o menu; o outro marca e desmarca a tarefa. */
	menuButton: MouseButton;
}

/** Formato das configurações até a versão 1.0.1. */
interface LegacySettings {
	menuOnCheck?: boolean;
}

const DEFAULT_SETTINGS: CheckboxStylesSettings = {
	defaultStyle: DEFAULT_STYLE_ID,
	menuButton: "left",
};

/** Caractere padrão de tarefa concluída; aparece com o estilo padrão. */
const CHECKED_CHAR = "x";

export default class CheckboxStylesPlugin extends Plugin {
	settings: CheckboxStylesSettings = { ...DEFAULT_SETTINGS };

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new CheckboxStyleSettingTab(this.app, this));
		this.registerMarkdownPostProcessor(trackRenderedCheckboxes);

		this.applyDefaultStyle(this.settings.defaultStyle);
		this.registerWindow(window);
		this.app.workspace.onLayoutReady(() => {
			// Janelas destacadas (pop-out) têm o seu próprio document.
			this.applyDefaultStyle(this.settings.defaultStyle);
			// Notas já abertas em modo leitura precisam passar pelo post processor.
			this.app.workspace.iterateAllLeaves((leaf) => {
				if (leaf.view instanceof MarkdownView) {
					leaf.view.previewMode.rerender(true);
				}
			});
		});
		this.registerEvent(
			this.app.workspace.on("window-open", (win) => {
				setDefaultStyleClass(win.doc.body, this.settings.defaultStyle);
				this.registerWindow(win.win);
			})
		);
	}

	onunload(): void {
		this.applyDefaultStyle(null);
	}

	async updateSettings(changes: Partial<CheckboxStylesSettings>): Promise<void> {
		Object.assign(this.settings, changes);
		this.applyDefaultStyle(this.settings.defaultStyle);
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
		};
	}

	private registerWindow(win: Window): void {
		// Captura na janela: roda antes do tratamento nativo do Obsidian.
		const handler = (evt: MouseEvent) => this.onCheckboxEvent(evt);
		this.registerDomEvent(win, "click", handler, { capture: true });
		this.registerDomEvent(win, "contextmenu", handler, { capture: true });
	}

	private onCheckboxEvent(evt: MouseEvent): void {
		const input = evt.target as HTMLElement | null;
		if (!input?.matches?.("input.task-list-item-checkbox")) return;

		const task = resolveTaskTarget(this.app, input);
		if (!task) return;

		const button: MouseButton = evt.type === "contextmenu" ? "right" : "left";
		if (button === this.settings.menuButton) {
			evt.preventDefault();
			evt.stopImmediatePropagation();
			this.showStyleMenu(evt, task);
			return;
		}
		// O outro botão marca/desmarca. No esquerdo isso já é o comportamento
		// nativo do Obsidian; no direito, fazemos o mesmo no lugar do menu.
		if (button === "right") {
			evt.preventDefault();
			evt.stopImmediatePropagation();
			task.setChar(isUnchecked(task.char) ? CHECKED_CHAR : UNCHECKED_CHAR);
		}
	}

	private showStyleMenu(evt: MouseEvent, task: TaskTarget): void {
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
		// Clique gerado pelo teclado (espaço) não tem posição do mouse.
		if (evt.detail === 0 && evt.target instanceof Element) {
			const rect = evt.target.getBoundingClientRect();
			menu.showAtPosition({ x: rect.left, y: rect.bottom }, evt.target.ownerDocument);
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
