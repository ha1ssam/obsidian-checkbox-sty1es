import { MarkdownView, Menu, Plugin } from "obsidian";
import {
	CHECKBOX_STYLES,
	DEFAULT_STYLE_ID,
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

interface CheckboxStylesSettings {
	/** Estilo de tarefas desmarcadas, `[x]` e caracteres desconhecidos. */
	defaultStyle: string;
	/** Abrir o menu de estilos ao clicar numa tarefa desmarcada. */
	menuOnCheck: boolean;
	/** O que o clique faz numa tarefa já marcada. */
	clickOnChecked: "uncheck" | "menu";
}

const DEFAULT_SETTINGS: CheckboxStylesSettings = {
	defaultStyle: DEFAULT_STYLE_ID,
	menuOnCheck: true,
	clickOnChecked: "uncheck",
};

export default class CheckboxStylesPlugin extends Plugin {
	settings: CheckboxStylesSettings = DEFAULT_SETTINGS;

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
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.settings.defaultStyle = getCheckboxStyle(this.settings.defaultStyle).id;
		if (this.settings.clickOnChecked !== "menu") {
			this.settings.clickOnChecked = "uncheck";
		}
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

		const wantsMenu =
			evt.type === "contextmenu" ||
			(isUnchecked(task.char)
				? this.settings.menuOnCheck
				: this.settings.clickOnChecked === "menu");
		// Sem menu, marcar/desmarcar continua sendo o comportamento nativo.
		if (!wantsMenu) return;

		evt.preventDefault();
		evt.stopImmediatePropagation();
		this.showStyleMenu(evt, task);
	}

	private showStyleMenu(evt: MouseEvent, task: TaskTarget): void {
		const menu = new Menu();
		const addOption = (option: {
			styleId: string;
			name: string;
			hint: string;
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
							row.createSpan({ cls: "cbs-menu-effect", text: option.hint });
						})
					)
					.setChecked(option.selected)
					.onClick(() => task.setChar(option.char))
			);

		for (const style of CHECKBOX_STYLES) {
			addOption({
				styleId: style.id,
				name: style.name,
				hint: style.effect,
				char: style.char,
				selected: task.char === style.char,
			});
		}
		if (!isUnchecked(task.char)) {
			menu.addSeparator();
			addOption({
				styleId: this.settings.defaultStyle,
				name: "Desmarcada",
				hint: "Voltar a tarefa para não concluída",
				char: UNCHECKED_CHAR,
				selected: false,
			});
		}
		// Clique gerado pelo teclado (espaço) não tem posição do mouse.
		if (evt.detail === 0 && evt.target instanceof Element) {
			const rect = evt.target.getBoundingClientRect();
			menu.showAtPosition({ x: rect.left, y: rect.bottom }, evt.target.ownerDocument);
		} else {
			menu.showAtMouseEvent(evt);
		}
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

function setDefaultStyleClass(body: HTMLElement, id: string | null): void {
	for (const style of CHECKBOX_STYLES) {
		body.classList.toggle(defaultStyleClass(style.id), style.id === id);
	}
}
