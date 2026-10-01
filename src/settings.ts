import { App, PluginSettingTab, Setting } from "obsidian";
import {
	CHECKBOX_STYLES,
	CheckboxStyle,
	getCheckboxStyle,
} from "./checkbox-styles";
import type CheckboxStylesPlugin from "./main";

export class CheckboxStyleSettingTab extends PluginSettingTab {
	private plugin: CheckboxStylesPlugin;

	constructor(app: App, plugin: CheckboxStylesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Menu on check")
			.setDesc(
				"Clicking an unchecked task opens a menu to pick its style. When off, a click checks the task as usual and the menu stays on right-click."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.menuOnCheck)
					.onChange((value) =>
						this.plugin.updateSettings({ menuOnCheck: value })
					)
			);
		new Setting(containerEl)
			.setName("When clicking a checked task")
			.setDesc(
				"Uncheck it right away, or open the menu again to change its style (the menu includes an \"Unchecked\" option)."
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("uncheck", "Uncheck")
					.addOption("menu", "Open the menu")
					.setValue(this.plugin.settings.clickOnChecked)
					.onChange((value) =>
						this.plugin.updateSettings({
							clickOnChecked: value === "menu" ? "menu" : "uncheck",
						})
					)
			);
		new Setting(containerEl)
			.setName("Default style")
			.setDesc(
				"Used for unchecked tasks and tasks marked with [x]. Each style also applies its own effect to the task text."
			);

		const grid = containerEl.createDiv({
			cls: "cbs-grid",
			attr: { role: "radiogroup", "aria-label": "Default checkbox style" },
		});
		const preview = this.renderPreview(containerEl);

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

			const select = async () => {
				await this.plugin.updateSettings({ defaultStyle: style.id });
				refresh();
			};
			card.addEventListener("click", select);
			card.addEventListener("keydown", (evt) => {
				if (evt.key === "Enter" || evt.key === " ") {
					evt.preventDefault();
					void select();
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
