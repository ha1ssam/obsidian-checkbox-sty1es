/**
 * Pacotes do usuário: imagens de uma pasta do cofre viram estilos.
 *
 * Imagens soltas na pasta formam uma seção com o nome dela; cada subpasta
 * (com tudo o que houver dentro) vira outra seção. Serve para o que não pode
 * vir embutido no plugin, como escudos oficiais de times.
 *
 * Cada imagem recebe um caractere fixo da faixa U+F000–U+F8FF, guardado nas
 * configurações pelo caminho do arquivo. O caractere nunca é reaproveitado:
 * se a imagem sumir, tarefas antigas só voltam ao estilo padrão, sem trocar
 * de imagem por engano. Renomear ou mover dentro do cofre mantém o caractere.
 */
import { App, TFile, TFolder } from "obsidian";
import { cssString, define, styleRule } from "./checkbox-styles";
import { CUSTOM_FIRST, CUSTOM_LAST, StyleSection, imageMark } from "./packs/pack";

export const CUSTOM_PREFIX = "custom:";

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp"]);

export const isImage = (file: TFile): boolean => IMAGE_EXTENSIONS.has(file.extension.toLowerCase());

export interface CustomScan {
	sections: StyleSection[];
	css: string;
	/** Algum caractere novo foi reservado (as configurações precisam ser salvas). */
	allocated: boolean;
	/** Ficou alguma imagem sem caractere (faixa esgotada). */
	full: boolean;
}

const byName = (a: { name: string }, b: { name: string }): number =>
	a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });

function collectImages(folder: TFolder, out: TFile[] = []): TFile[] {
	for (const child of folder.children) {
		if (child instanceof TFile && isImage(child)) out.push(child);
		else if (child instanceof TFolder) collectImages(child, out);
	}
	return out;
}

/** "real-madrid_2024" → "real madrid 2024" */
const displayName = (file: TFile): string => file.basename.replace(/[_-]+/g, " ").trim() || file.basename;

/**
 * Lê a pasta e monta as seções. `chars` (caminho → caractere) é atualizado no
 * lugar com os caracteres novos.
 */
export function scanCustomFolder(
	app: App,
	folderPath: string,
	chars: Record<string, string>
): CustomScan {
	const result: CustomScan = { sections: [], css: "", allocated: false, full: false };
	const folder = folderPath ? app.vault.getAbstractFileByPath(folderPath) : null;
	if (!(folder instanceof TFolder)) return result;

	const used = new Set(Object.values(chars));
	let next = CUSTOM_FIRST;
	const charFor = (path: string): string | null => {
		const existing = chars[path];
		if (existing) return existing;
		while (next <= CUSTOM_LAST && used.has(String.fromCharCode(next))) next++;
		if (next > CUSTOM_LAST) return null;
		const char = String.fromCharCode(next);
		used.add(char);
		chars[path] = char;
		result.allocated = true;
		return char;
	};

	const groups: { id: string; name: string; files: TFile[] }[] = [];
	const loose = folder.children.filter((c): c is TFile => c instanceof TFile && isImage(c));
	if (loose.length) groups.push({ id: folder.path, name: folder.name, files: loose });
	for (const sub of folder.children.filter((c): c is TFolder => c instanceof TFolder).sort(byName)) {
		const files = collectImages(sub);
		if (files.length) groups.push({ id: sub.path, name: sub.name, files });
	}

	const rules: string[] = [];
	for (const group of groups) {
		const styles = [];
		for (const file of group.files.sort(byName)) {
			const char = charFor(file.path);
			if (!char) {
				result.full = true;
				continue;
			}
			const name = displayName(file);
			const style = define(
				{
					id: `${CUSTOM_PREFIX}${file.path}`,
					name,
					char,
					description: `${name} (your image).`,
					effect: "Normal text",
				},
				imageMark(`url(${cssString(app.vault.getResourcePath(file))})`)
			);
			styles.push(style);
			rules.push(styleRule(style));
		}
		if (!styles.length) continue;
		result.sections.push({
			id: `${CUSTOM_PREFIX}${group.id}`,
			name: group.name,
			description: `${styles.length} image${styles.length === 1 ? "" : "s"} from ${group.id}.`,
			layout: "grid",
			groups: [styles],
		});
	}
	result.css = rules.join("\n");
	return result;
}

/**
 * Ao renomear/mover um arquivo ou pasta, leva junto os caracteres reservados.
 * Devolve verdadeiro se algo mudou.
 */
export function moveCustomChars(
	chars: Record<string, string>,
	oldPath: string,
	newPath: string
): boolean {
	let changed = false;
	for (const path of Object.keys(chars)) {
		let target: string | null = null;
		if (path === oldPath) target = newPath;
		else if (path.startsWith(`${oldPath}/`)) target = newPath + path.slice(oldPath.length);
		if (target === null || target in chars) continue;
		chars[target] = chars[path];
		delete chars[path];
		changed = true;
	}
	return changed;
}

/** Folha de estilo gerada em tempo de execução, presente em todas as janelas. */
export class DynamicStyles {
	private css = "";
	private elements = new Map<Document, HTMLStyleElement>();

	attach(doc: Document): void {
		if (this.elements.has(doc)) return;
		const el = doc.head.createEl("style", { attr: { id: "checkbox-styles-custom" } });
		el.textContent = this.css;
		this.elements.set(doc, el);
	}

	set(css: string): void {
		this.css = css;
		for (const [doc, el] of this.elements) {
			if (!doc.defaultView) {
				this.elements.delete(doc);
				continue;
			}
			el.textContent = css;
		}
	}

	detachAll(): void {
		for (const el of this.elements.values()) el.remove();
		this.elements.clear();
	}
}
