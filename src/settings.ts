import { App, PluginSettingTab, Setting, SettingDefinitionItem } from "obsidian";
import {
	CHECKBOX_STYLES,
	CheckboxStyle,
	getCheckboxStyle,
} from "./checkbox-styles";
import type CheckboxStylesPlugin from "./main";

const MENU_BUTTON = {
	name: "Menu button",
	desc: "The mouse button that opens the style menu on a checkbox. The other button checks and unchecks the task.",
	options: { left: "Left click", right: "Right click" },
};

const DEFAULT_STYLE = {
	name: "Default style",
	desc: "The style applied when you check a task with the other button. Also used for unchecked tasks and tasks marked with [x].",
};

export class CheckboxStyleSettingTab extends PluginSettingTab {
	private plugin: CheckboxStylesPlugin;

	constructor(app: App, plugin: CheckboxStylesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: MENU_BUTTON.name,
				desc: MENU_BUTTON.desc,
				control: {
					type: "dropdown",
					key: "menuButton",
					options: MENU_BUTTON.options,
				},
			},
			{
				...DEFAULT_STYLE,
				aliases: CHECKBOX_STYLES.map((style) => style.name),
				render: (setting) => this.renderStyleSetting(setting),
			},
		];
	}

	getControlValue(key: string): unknown {
		if (key === "menuButton") return this.plugin.settings.menuButton;
		return undefined;
	}

	setControlValue(key: string, value: unknown): Promise<void> {
		if (key === "menuButton") {
			return this.plugin.updateSettings({
				menuButton: value === "right" ? "right" : "left",
			});
		}
		return Promise.resolve();
	}

	/** Fallback para versões do Obsidian anteriores à 1.13.0. */
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName(MENU_BUTTON.name)
			.setDesc(MENU_BUTTON.desc)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(MENU_BUTTON.options)
					.setValue(this.plugin.settings.menuButton)
					.onChange((value) => this.setControlValue("menuButton", value))
			);
		this.renderStyleSetting(new Setting(containerEl));
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
