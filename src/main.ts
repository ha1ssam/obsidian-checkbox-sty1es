import {
	KeymapEventHandler,
	MarkdownView,
	Platform,
	Plugin,
	TAbstractFile,
	debounce,
	normalizePath,
} from "obsidian";
import {
	CHECKBOX_STYLES,
	DEFAULT_STYLE_ID,
	defaultStyleClass,
	getCheckboxStyle,
} from "./checkbox-styles";
import {
	CUSTOM_PREFIX,
	DynamicStyles,
	moveCustomChars,
	scanCustomFolder,
} from "./custom-packs";
import { StoredHotkey, parseHotkey } from "./hotkey";
import { BASIC_SECTION, PACKS, StyleSection } from "./sections";
import { CheckboxStyleSettingTab } from "./settings";
import { openStylePicker } from "./style-picker";
import {
	TaskTarget,
	UNCHECKED_CHAR,
	isUnchecked,
	resolveTaskTarget,
	trackRenderedCheckboxes,
} from "./task-target";
import { UncheckAll } from "./uncheck-all";

export type MouseButton = "left" | "right";
export type TouchGesture = "tap" | "hold";

/** Tempo segurando o dedo na checkbox para contar como "segurar". */
const HOLD_MS = 450;
/** Movimento máximo do dedo (px) para ainda contar como toque parado. */
const HOLD_SLOP = 10;

interface CheckboxStylesSettings {
	/**
	 * Estilo de tarefas desmarcadas, `[x]` e caracteres desconhecidos; é o
	 * estilo que o botão de marcar/desmarcar aplica.
	 */
	defaultStyle: string;
	/** Botão do mouse que abre o menu; o outro marca e desmarca a tarefa. */
	menuButton: MouseButton;
	/** No celular/tablet: gesto que abre o menu; o outro marca e desmarca. */
	mobileMenuGesture: TouchGesture;
	/** Mostrar no topo de cada nota o botão que desmarca todas as tarefas. */
	uncheckAllButton: boolean;
	/** Atalho de teclado que desmarca todas as tarefas da nota ativa. */
	uncheckAllHotkey: StoredHotkey | null;
	/** Seções extras ligadas/desligadas (id → ligada). Ver `isSectionEnabled`. */
	sections: Record<string, boolean>;
	/** Pasta do cofre com as imagens do usuário ("" = nenhuma). */
	customFolder: string;
	/** Caractere reservado para cada imagem do usuário (caminho → caractere). */
	customChars: Record<string, string>;
}

/** Formato das configurações até a versão 1.0.1. */
interface LegacySettings {
	menuOnCheck?: boolean;
}

const DEFAULT_SETTINGS: CheckboxStylesSettings = {
	defaultStyle: DEFAULT_STYLE_ID,
	menuButton: "left",
	mobileMenuGesture: "tap",
	uncheckAllButton: false,
	uncheckAllHotkey: null,
	sections: {},
	customFolder: "",
	customChars: {},
};

const isStringRecord = (value: unknown): value is Record<string, string> =>
	typeof value === "object" &&
	value !== null &&
	Object.values(value).every((v) => typeof v === "string");

const isBooleanRecord = (value: unknown): value is Record<string, boolean> =>
	typeof value === "object" &&
	value !== null &&
	Object.values(value).every((v) => typeof v === "boolean");

export default class CheckboxStylesPlugin extends Plugin {
	settings: CheckboxStylesSettings = { ...DEFAULT_SETTINGS };
	private uncheckAll = new UncheckAll(this.app);
	private uncheckButtons = new Map<MarkdownView, HTMLElement>();
	private uncheckHotkey: KeymapEventHandler | null = null;
	/** Verdadeiro enquanto repassamos um clique sintético ao Obsidian. */
	private passingClick = false;
	/** Depois de um "segurar", o clique que o navegador gera ao soltar é ignorado. */
	private ignoreClickOn: { input: HTMLElement; until: number } | null = null;
	private settingTab: CheckboxStyleSettingTab | null = null;
	/** Seções das imagens do usuário (ver custom-packs.ts). */
	customSections: StyleSection[] = [];
	/** Faixa de caracteres das imagens do usuário esgotada. */
	customFull = false;
	private customStyles = new DynamicStyles();
	/** Última aba aberta no menu de estilos. */
	private lastSection: string | null = null;
	private closePicker: (() => void) | null = null;
	private rescanSoon = debounce(() => void this.rescanCustom(), 400, true);

	async onload(): Promise<void> {
		await this.loadSettings();
		this.settingTab = new CheckboxStyleSettingTab(this.app, this);
		this.addSettingTab(this.settingTab);
		this.registerMarkdownPostProcessor(trackRenderedCheckboxes);
		this.customStyles.attach(document);

		this.applyDefaultStyle(this.settings.defaultStyle);
		this.syncUncheckHotkey();
		this.registerWindow(window);
		this.app.workspace.onLayoutReady(() => {
			void this.rescanCustom();
			this.registerVaultEvents();
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
				this.customStyles.attach(win.doc);
				this.registerWindow(win.win);
			})
		);
	}

	onunload(): void {
		this.closePicker?.();
		this.customStyles.detachAll();
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
			mobileMenuGesture: saved?.mobileMenuGesture === "hold" ? "hold" : "tap",
			uncheckAllButton: saved?.uncheckAllButton === true,
			uncheckAllHotkey: parseHotkey(saved?.uncheckAllHotkey),
			sections: isBooleanRecord(saved?.sections) ? { ...saved.sections } : {},
			customFolder: typeof saved?.customFolder === "string" ? saved.customFolder : "",
			customChars: isStringRecord(saved?.customChars) ? { ...saved.customChars } : {},
		};
	}

	/**
	 * Pacotes embutidos começam desligados (o menu fica igual ao de antes até
	 * a pessoa escolher); seções de imagens próprias começam ligadas.
	 */
	isSectionEnabled(id: string): boolean {
		return this.settings.sections[id] ?? id.startsWith(CUSTOM_PREFIX);
	}

	async setSectionEnabled(id: string, enabled: boolean): Promise<void> {
		await this.updateSettings({ sections: { ...this.settings.sections, [id]: enabled } });
	}

	async setCustomFolder(path: string): Promise<void> {
		const folder = path.trim() ? normalizePath(path.trim()) : "";
		if (folder === "/" || folder === this.settings.customFolder) return;
		await this.updateSettings({ customFolder: folder });
		await this.rescanCustom();
	}

	/** Seções do menu, na ordem das abas. */
	private menuSections(): StyleSection[] {
		return [
			BASIC_SECTION,
			...[...PACKS, ...this.customSections].filter((section) =>
				this.isSectionEnabled(section.id)
			),
		];
	}

	/** Relê a pasta de imagens do usuário e atualiza CSS, menu e configurações. */
	private async rescanCustom(): Promise<void> {
		const scan = scanCustomFolder(this.app, this.settings.customFolder, this.settings.customChars);
		this.customSections = scan.sections;
		this.customFull = scan.full;
		this.customStyles.set(scan.css);
		if (scan.allocated) await this.saveData(this.settings);
		this.settingTab?.refresh();
	}

	private registerVaultEvents(): void {
		const inFolder = (path: string): boolean => {
			const folder = this.settings.customFolder;
			return !!folder && (path === folder || path.startsWith(`${folder}/`));
		};
		const onChange = (file: TAbstractFile) => {
			if (inFolder(file.path)) this.rescanSoon();
		};
		this.registerEvent(this.app.vault.on("create", onChange));
		this.registerEvent(this.app.vault.on("modify", onChange));
		this.registerEvent(this.app.vault.on("delete", onChange));
		this.registerEvent(
			this.app.vault.on("rename", (file, oldPath) => {
				let changed = moveCustomChars(this.settings.customChars, oldPath, file.path);
				// A própria pasta de imagens foi renomeada ou movida.
				const folder = this.settings.customFolder;
				if (folder && (oldPath === folder || folder.startsWith(`${oldPath}/`))) {
					this.settings.customFolder = file.path + folder.slice(oldPath.length);
					changed = true;
				}
				if (changed) void this.saveData(this.settings);
				if (changed || inFolder(file.path) || inFolder(oldPath)) this.rescanSoon();
			})
		);
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
		if (Platform.isMobile) {
			this.registerDomEvent(win, "touchstart", (evt) => this.onTouchStart(evt), {
				capture: true,
				passive: true,
			});
		}
	}

	private onCheckboxEvent(evt: MouseEvent): void {
		if (this.passingClick) return;
		const input = evt.target as HTMLElement | null;
		if (!input?.matches?.("input.task-list-item-checkbox")) return;

		const ignore = this.ignoreClickOn;
		if (evt.type === "click" && ignore?.input === input && Date.now() < ignore.until) {
			this.ignoreClickOn = null;
			evt.preventDefault();
			evt.stopImmediatePropagation();
			return;
		}

		const task = resolveTaskTarget(this.app, input);
		if (!task) return;

		if (Platform.isMobile) {
			// No toque, o "segurar" é tratado em onTouchStart; o menu de
			// contexto que o Android gera ao segurar é descartado.
			if (evt.type === "contextmenu") {
				evt.preventDefault();
				evt.stopImmediatePropagation();
				return;
			}
			if (this.settings.mobileMenuGesture === "tap") {
				evt.preventDefault();
				evt.stopImmediatePropagation();
				this.showStyleMenu(input, task, this.menuPosition(evt, input), isKeyboardClick(evt));
			}
			// Com "segurar para o menu", o toque segue nativo: marca/desmarca.
			return;
		}

		const button: MouseButton = evt.type === "contextmenu" ? "right" : "left";
		if (button === this.settings.menuButton) {
			evt.preventDefault();
			evt.stopImmediatePropagation();
			this.showStyleMenu(input, task, this.menuPosition(evt, input), isKeyboardClick(evt));
			return;
		}
		// O outro botão marca/desmarca. No esquerdo isso já é o comportamento
		// nativo; no direito, repassamos um clique comum no lugar do menu de
		// contexto, para que o Obsidian e outros plugins (Tasks, por exemplo)
		// tratem a tarefa exatamente como num clique normal.
		if (button === "right") {
			evt.preventDefault();
			evt.stopImmediatePropagation();
			this.clickNatively(input);
		}
	}

	/**
	 * "Segurar" a checkbox no celular. O Obsidian não gera menu de contexto ao
	 * segurar (e o iOS não gera nada), então o gesto é detectado aqui.
	 */
	private onTouchStart(evt: TouchEvent): void {
		const input = evt.target as HTMLElement | null;
		if (evt.touches.length !== 1 || !input?.matches?.("input.task-list-item-checkbox")) {
			return;
		}
		const win = input.ownerDocument.defaultView ?? window;
		const start = evt.touches[0];
		let held = false;

		const cleanup = () => {
			win.clearTimeout(timer);
			win.removeEventListener("touchmove", onMove, true);
			win.removeEventListener("touchend", onEnd, true);
			win.removeEventListener("touchcancel", onEnd, true);
		};
		const onMove = (e: TouchEvent) => {
			const touch = e.touches[0];
			if (
				!touch ||
				Math.abs(touch.clientX - start.clientX) > HOLD_SLOP ||
				Math.abs(touch.clientY - start.clientY) > HOLD_SLOP
			) {
				cleanup();
			}
		};
		const onEnd = (e: TouchEvent) => {
			cleanup();
			// Impede o clique que o navegador geraria ao soltar o dedo.
			if (held && e.cancelable) e.preventDefault();
		};
		const timer = win.setTimeout(() => {
			const task = resolveTaskTarget(this.app, input);
			if (!task) {
				cleanup();
				return;
			}
			held = true;
			this.ignoreClickOn = { input, until: Date.now() + 1000 };
			navigator.vibrate?.(30);
			if (this.settings.mobileMenuGesture === "hold") {
				this.showStyleMenu(input, task, { x: start.clientX, y: start.clientY });
			} else {
				this.clickNatively(input);
			}
		}, HOLD_MS);

		win.addEventListener("touchmove", onMove, true);
		win.addEventListener("touchend", onEnd, { capture: true, passive: false });
		win.addEventListener("touchcancel", onEnd, true);
	}

	/**
	 * Marca/desmarca como num clique comum, para que o Obsidian e outros
	 * plugins (Tasks, por exemplo) tratem a tarefa do jeito deles.
	 */
	private clickNatively(input: HTMLElement): void {
		this.passingClick = true;
		try {
			input.click();
		} finally {
			this.passingClick = false;
		}
	}

	/** Onde abrir o menu: no ponteiro, ou abaixo da checkbox se veio do teclado. */
	private menuPosition(evt: MouseEvent, input: HTMLElement): { x: number; y: number } {
		if (isKeyboardClick(evt)) {
			const rect = input.getBoundingClientRect();
			return { x: rect.left, y: rect.bottom };
		}
		return { x: evt.clientX, y: evt.clientY };
	}

	private showStyleMenu(
		input: HTMLElement,
		task: TaskTarget,
		position: { x: number; y: number },
		keyboard = false
	): void {
		this.closePicker?.();
		this.closePicker = openStylePicker({
			doc: input.ownerDocument,
			position,
			sections: this.menuSections(),
			currentChar: task.char,
			preferredSection: this.lastSection,
			unchecked: isUnchecked(task.char)
				? null
				: { styleId: this.settings.defaultStyle, char: UNCHECKED_CHAR },
			keyboard,
			onPick: (char) => task.setChar(char),
			onSectionChange: (id) => {
				this.lastSection = id;
			},
		});
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

/** Clique gerado pelo teclado (Espaço/Enter na checkbox). */
const isKeyboardClick = (evt: MouseEvent): boolean => evt.type === "click" && evt.detail === 0;

function setDefaultStyleClass(body: HTMLElement, id: string | null): void {
	for (const style of CHECKBOX_STYLES) {
		body.classList.toggle(defaultStyleClass(style.id), style.id === id);
	}
}
