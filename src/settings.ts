import {
	App,
	ButtonComponent,
	Platform,
	PluginSettingTab,
	Setting,
	SettingDefinition,
	SettingDefinitionItem,
} from "obsidian";
import {
	CHECKBOX_STYLES,
	CheckboxStyle,
	getCheckboxStyle,
} from "./checkbox-styles";
import { describeHotkey, recordHotkey } from "./hotkey";
import type CheckboxStylesPlugin from "./main";
import { PACKS, StyleSection, sectionStyles } from "./sections";

const MENU_BUTTON = {
	name: "Menu button",
	desc: "On a computer: the mouse button that opens the style menu on a checkbox. The other button checks and unchecks the task.",
	options: { left: "Left click", right: "Right click" },
};

const MOBILE_GESTURE = {
	name: "Menu on mobile",
	desc: "On a phone or tablet: the gesture that opens the style menu on a checkbox. The other one checks and unchecks the task.",
	options: { tap: "Tap", hold: "Tap and hold" },
};

const UNCHECK_ALL_BUTTON = {
	name: "Uncheck-all button",
	desc: "Show a button at the top of each note that unchecks every task in it. Use it again right away to restore them; once the note changes, there is nothing to restore.",
};

const UNCHECK_ALL_HOTKEY = {
	name: "Uncheck-all hotkey",
	desc: "A keyboard shortcut that does the same as the uncheck-all button, in the note you are on. Click the button, then press the combination. Escape cancels.",
};

const DEFAULT_STYLE = {
	name: "Default style",
	desc: "The style applied when you check a task with the other button. Also used for unchecked tasks and tasks marked with [x].",
};

const SECTIONS = {
	heading: "Menu sections",
	desc: "Extra sections show up as tabs in the style menu, next to the basic styles, which are always there. Turning a section off only hides it from the menu: tasks that already use its styles keep their look.",
};

const CUSTOM = {
	heading: "Your own images",
	folderName: "Images folder",
	folderDesc:
		"A folder in your vault with your own images (PNG, JPG, SVG, WebP…), such as team crests. Images directly in it form one section; each subfolder becomes its own section, like “Checkbox styles/Football”.",
	placeholder: "Checkbox styles",
	emptyName: "No images found",
	emptyDesc: "Add images to the folder, or check that the folder exists.",
	fullName: "Too many images",
	fullDesc: "Up to 2,304 images can have a style. The rest are left out of the menu.",
};

const SECTION_KEY = "section:";

export class CheckboxStyleSettingTab extends PluginSettingTab {
	private plugin: CheckboxStylesPlugin;
	/** Encerra a gravação de atalho em andamento, se houver. */
	private stopRecording: (() => void) | null = null;

	constructor(app: App, plugin: CheckboxStylesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: MENU_BUTTON.name,
				desc: MENU_BUTTON.desc,
				visible: !Platform.isMobile,
				control: {
					type: "dropdown",
					key: "menuButton",
					options: MENU_BUTTON.options,
				},
			},
			{
				name: MOBILE_GESTURE.name,
				desc: MOBILE_GESTURE.desc,
				visible: Platform.isMobile,
				control: {
					type: "dropdown",
					key: "mobileMenuGesture",
					options: MOBILE_GESTURE.options,
				},
			},
			{
				...UNCHECK_ALL_BUTTON,
				control: { type: "toggle", key: "uncheckAllButton" },
			},
			{
				...UNCHECK_ALL_HOTKEY,
				render: (setting) => this.renderHotkeySetting(setting),
			},
			{
				...DEFAULT_STYLE,
				aliases: CHECKBOX_STYLES.map((style) => style.name),
				render: (setting) => this.renderStyleSetting(setting),
			},
			{
				type: "group",
				heading: SECTIONS.heading,
				items: [
					{ name: "How sections work", desc: SECTIONS.desc, searchable: false },
					...PACKS.map((pack) => this.sectionDefinition(pack)),
				],
			},
			{
				type: "group",
				heading: CUSTOM.heading,
				items: [
					{
						name: CUSTOM.folderName,
						desc: CUSTOM.folderDesc,
						control: {
							type: "folder",
							key: "customFolder",
							placeholder: CUSTOM.placeholder,
						},
					},
					...this.plugin.customSections.map((section) => this.sectionDefinition(section)),
					{
						name: CUSTOM.emptyName,
						desc: CUSTOM.emptyDesc,
						visible: () =>
							!!this.plugin.settings.customFolder && !this.plugin.customSections.length,
					},
					{
						name: CUSTOM.fullName,
						desc: CUSTOM.fullDesc,
						visible: () => this.plugin.customFull,
					},
				],
			},
		];
	}

	private sectionDefinition(section: StyleSection): SettingDefinition {
		return {
			name: section.name,
			desc: this.sectionDesc(section),
			aliases: sectionStyles(section).map((style) => style.name),
			control: { type: "toggle", key: `${SECTION_KEY}${section.id}` },
		};
	}

	/** Descrição da seção + uma amostra dos ícones dela. */
	private sectionDesc(section: StyleSection): DocumentFragment {
		return createFragment((frag) => {
			frag.appendText(section.description);
			const strip = frag.createDiv({ cls: "cbs-section-sample", attr: { "aria-hidden": "true" } });
			for (const style of sectionStyles(section).slice(0, 14)) {
				const cell = strip.createSpan({ attr: { "data-cbs-style": style.id, title: style.name } });
				createCheckbox(cell, true, true);
			}
		});
	}

	/** Atualiza a tela depois que a lista de seções muda (pasta de imagens). */
	refresh(): void {
		// update() existe a partir do 1.13; antes disso, redesenha com display().
		const tab = this as unknown as { update?: () => void; display: () => void };
		if (typeof tab.update === "function") tab.update();
		else if (this.containerEl.isShown()) tab.display();
	}

	getControlValue(key: string): unknown {
		if (key === "menuButton") return this.plugin.settings.menuButton;
		if (key === "mobileMenuGesture") return this.plugin.settings.mobileMenuGesture;
		if (key === "uncheckAllButton") return this.plugin.settings.uncheckAllButton;
		if (key === "customFolder") return this.plugin.settings.customFolder;
		if (key.startsWith(SECTION_KEY)) {
			return this.plugin.isSectionEnabled(key.slice(SECTION_KEY.length));
		}
		return undefined;
	}

	setControlValue(key: string, value: unknown): Promise<void> {
		if (key === "menuButton") {
			return this.plugin.updateSettings({
				menuButton: value === "right" ? "right" : "left",
			});
		}
		if (key === "mobileMenuGesture") {
			return this.plugin.updateSettings({
				mobileMenuGesture: value === "hold" ? "hold" : "tap",
			});
		}
		if (key === "uncheckAllButton") {
			return this.plugin.updateSettings({ uncheckAllButton: value === true });
		}
		if (key === "customFolder") {
			return this.plugin.setCustomFolder(typeof value === "string" ? value : "");
		}
		if (key.startsWith(SECTION_KEY)) {
			return this.plugin.setSectionEnabled(key.slice(SECTION_KEY.length), value === true);
		}
		return Promise.resolve();
	}

	/** Fallback para versões do Obsidian anteriores à 1.13.0. */
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Cada aparelho mostra só a opção que vale para ele.
		if (Platform.isMobile) {
			new Setting(containerEl)
				.setName(MOBILE_GESTURE.name)
				.setDesc(MOBILE_GESTURE.desc)
				.addDropdown((dropdown) =>
					dropdown
						.addOptions(MOBILE_GESTURE.options)
						.setValue(this.plugin.settings.mobileMenuGesture)
						.onChange((value) => this.setControlValue("mobileMenuGesture", value))
				);
		} else {
			new Setting(containerEl)
				.setName(MENU_BUTTON.name)
				.setDesc(MENU_BUTTON.desc)
				.addDropdown((dropdown) =>
					dropdown
						.addOptions(MENU_BUTTON.options)
						.setValue(this.plugin.settings.menuButton)
						.onChange((value) => this.setControlValue("menuButton", value))
				);
		}
		new Setting(containerEl)
			.setName(UNCHECK_ALL_BUTTON.name)
			.setDesc(UNCHECK_ALL_BUTTON.desc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.uncheckAllButton)
					.onChange((value) => this.setControlValue("uncheckAllButton", value))
			);
		this.renderHotkeySetting(new Setting(containerEl));
		this.renderStyleSetting(new Setting(containerEl));

		new Setting(containerEl).setName(SECTIONS.heading).setDesc(SECTIONS.desc).setHeading();
		for (const pack of PACKS) this.renderSectionToggle(containerEl, pack);

		new Setting(containerEl).setName(CUSTOM.heading).setHeading();
		new Setting(containerEl)
			.setName(CUSTOM.folderName)
			.setDesc(CUSTOM.folderDesc)
			.addText((text) => {
				text.setPlaceholder(CUSTOM.placeholder).setValue(this.plugin.settings.customFolder);
				// Salva ao sair do campo (ou Enter): salvar a cada tecla redesenharia a tela.
				text.inputEl.addEventListener("change", () => {
					void this.plugin.setCustomFolder(text.getValue());
				});
			});
		for (const section of this.plugin.customSections) {
			this.renderSectionToggle(containerEl, section);
		}
		if (this.plugin.settings.customFolder && !this.plugin.customSections.length) {
			new Setting(containerEl).setName(CUSTOM.emptyName).setDesc(CUSTOM.emptyDesc);
		}
		if (this.plugin.customFull) {
			new Setting(containerEl).setName(CUSTOM.fullName).setDesc(CUSTOM.fullDesc);
		}
	}

	private renderSectionToggle(containerEl: HTMLElement, section: StyleSection): void {
		new Setting(containerEl)
			.setName(section.name)
			.setDesc(this.sectionDesc(section))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.isSectionEnabled(section.id))
					.onChange((value) => this.plugin.setSectionEnabled(section.id, value))
			);
	}

	hide(): void {
		this.stopRecording?.();
		this.stopRecording = null;
		super.hide();
	}

	/** Linha "Uncheck-all hotkey": botão que grava a combinação + limpar. */
	private renderHotkeySetting(setting: Setting): void {
		setting.setName(UNCHECK_ALL_HOTKEY.name).setDesc(UNCHECK_ALL_HOTKEY.desc);

		let recordButton: ButtonComponent | null = null;
		const showCurrent = () => {
			recordButton
				?.setButtonText(describeHotkey(this.plugin.settings.uncheckAllHotkey))
				.removeCta();
		};
		setting.addButton((button) => {
			recordButton = button;
			button.onClick(() => {
				this.stopRecording?.();
				button.setButtonText("Press a combination…").setCta();
				this.stopRecording = recordHotkey(this.app, (hotkey) => {
					this.stopRecording = null;
					if (!hotkey) {
						showCurrent();
						return;
					}
					void this.plugin
						.updateSettings({ uncheckAllHotkey: hotkey })
						.then(showCurrent);
				});
			});
		});
		setting.addExtraButton((button) =>
			button
				.setIcon("x")
				.setTooltip("Remove hotkey")
				.onClick(() => {
					this.stopRecording?.();
					this.stopRecording = null;
					void this.plugin
						.updateSettings({ uncheckAllHotkey: null })
						.then(showCurrent);
				})
		);
		showCurrent();
	}

	/** Linha "Default style": galeria de cartões + prévia. */
	private renderStyleSetting(setting: Setting): void {
		setting.setName(DEFAULT_STYLE.name).setDesc(DEFAULT_STYLE.desc);
		setting.settingEl.addClass("cbs-style-setting");

		const grid = setting.settingEl.createDiv({
			cls: "cbs-grid",
			attr: { role: "radiogroup", "aria-label": "Default checkbox style" },
		});
		const preview = this.renderPreview(setting.settingEl);

		const cards = new Map<string, HTMLElement>();
		const refresh = () => {
			const current = getCheckboxStyle(this.plugin.settings.defaultStyle);
			for (const [id, card] of cards) {
				const selected = id === current.id;
				card.toggleClass("is-selected", selected);
				card.setAttribute("aria-checked", String(selected));
			}
			preview.show(current);
		};

		for (const style of CHECKBOX_STYLES) {
			const card = grid.createDiv({
				cls: "cbs-card",
				attr: { role: "radio", tabindex: "0", "data-cbs-style": style.id },
			});

			const sample = card.createDiv({ cls: "cbs-card-sample" });
			createCheckbox(sample, false, true);
			createCheckbox(sample, true, true);
			sample.createSpan({ cls: "cbs-preview-text", text: style.name });
			card.createDiv({ cls: "cbs-card-desc", text: style.description });
			card.createDiv({ cls: "cbs-card-desc", text: `${style.effect}.` });

			const select = () => {
				void this.plugin.updateSettings({ defaultStyle: style.id }).then(refresh);
			};
			card.addEventListener("click", select);
			card.addEventListener("keydown", (evt) => {
				if (evt.key === "Enter" || evt.key === " ") {
					evt.preventDefault();
					select();
				}
			});
			// Prévia antes de selecionar: passar o mouse ou focar o cartão.
			card.addEventListener("mouseenter", () => preview.show(style));
			card.addEventListener("focus", () => preview.show(style));
			card.addEventListener("mouseleave", refresh);
			card.addEventListener("blur", refresh);

			cards.set(style.id, card);
		}

		refresh();
	}

	private renderPreview(containerEl: HTMLElement): {
		show: (style: CheckboxStyle) => void;
	} {
		const preview = containerEl.createDiv({ cls: "cbs-preview" });
		const title = preview.createDiv({ cls: "cbs-preview-title" });

		const columns = preview.createDiv({ cls: "cbs-preview-columns" });
		for (const [label, forceHover] of [
			["Normal", false],
			["Hover", true],
		] as const) {
			const column = columns.createDiv({ cls: "cbs-preview-column" });
			column.createDiv({ cls: "cbs-preview-label", text: label });
			for (const [text, checked] of [
				["Unfinished task", false],
				["Finished task", true],
			] as const) {
				const row = column.createEl("label", { cls: "cbs-preview-row" });
				const input = createCheckbox(row, checked);
				input.toggleClass("cbs-force-hover", forceHover);
				row.createSpan({ cls: "cbs-preview-text", text });
			}
		}

		return {
			show: (style) => {
				title.setText(`Preview: ${style.name}`);
				preview.dataset.cbsStyle = style.id;
			},
		};
	}
}

export function createCheckbox(
	parent: HTMLElement,
	checked: boolean,
	decorative = false
): HTMLInputElement {
	const input = parent.createEl("input", {
		type: "checkbox",
		cls: "cbs-checkbox",
	});
	input.checked = checked;
	if (decorative) {
		input.tabIndex = -1;
		input.setAttribute("aria-hidden", "true");
	}
	return input;
}
