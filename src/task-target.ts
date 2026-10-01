import {
	App,
	MarkdownPostProcessorContext,
	MarkdownView,
	TFile,
} from "obsidian";

/** Uma tarefa localizada no Markdown a partir da checkbox clicada. */
export interface TaskTarget {
	/** Caractere atual entre os colchetes (" " = desmarcada). */
	char: string;
	setChar(char: string): void;
}

interface RenderedSection {
	ctx: MarkdownPostProcessorContext;
	el: HTMLElement;
}

/** Parte do EditorView (CodeMirror 6) usada para achar a linha da checkbox. */
interface EditorViewLike {
	posAtDOM(node: Node): number;
	state: { doc: { lineAt(pos: number): { number: number } } };
}

// prefixo (citação/lista) + "[" | caractere | "]"
const TASK_LINE = /^(\s*(?:>\s*)*(?:[-*+]|\d+[.)])\s+\[)(.)(\])/;

export const UNCHECKED_CHAR = " ";

export const isUnchecked = (char: string): boolean => char === UNCHECKED_CHAR;

/** Checkboxes do modo leitura, registradas pelo post processor. */
const renderedCheckboxes = new WeakMap<HTMLElement, RenderedSection>();

export function trackRenderedCheckboxes(
	el: HTMLElement,
	ctx: MarkdownPostProcessorContext
): void {
	el.querySelectorAll<HTMLElement>("input.task-list-item-checkbox").forEach(
		(input) => renderedCheckboxes.set(input, { ctx, el })
	);
}

/**
 * Descobre a linha do Markdown por trás de uma checkbox. Devolve `null` quando
 * não há como localizá-la com segurança (embeds, canvas, callouts no Live
 * Preview, outros plugins...); nesse caso o clique segue nativo.
 */
export function resolveTaskTarget(app: App, input: HTMLElement): TaskTarget | null {
	const view = findMarkdownView(app, input);
	if (!view || input.closest(".markdown-embed, .internal-embed")) return null;
	return view.getMode() === "source"
		? resolveEditorTask(view, input)
		: resolveRenderedTask(app, view, input);
}

/** O caractere que o Obsidian renderizou (`data-task`) tem de bater com o da linha achada. */
const matchesRendered = (char: string, rendered: string | undefined): boolean =>
	rendered === undefined || (rendered || UNCHECKED_CHAR) === char;

function resolveEditorTask(view: MarkdownView, input: HTMLElement): TaskTarget | null {
	if (!input.closest(".cm-line") || input.closest(".markdown-rendered")) {
		return null;
	}
	const editor = view.editor;
	const cm = (editor as unknown as { cm?: EditorViewLike }).cm;
	if (!cm) return null;

	let line: number;
	try {
		line = cm.state.doc.lineAt(cm.posAtDOM(input)).number - 1;
	} catch {
		return null;
	}
	const match = TASK_LINE.exec(editor.getLine(line));
	const rendered = input.closest<HTMLElement>(".HyperMD-task-line")?.dataset.task;
	if (!match || !matchesRendered(match[2], rendered)) return null;

	const text = editor.getLine(line);
	return {
		char: match[2],
		setChar: (char) => {
			// Só altera se a linha ainda for a mesma tarefa.
			if (editor.getLine(line) !== text || match[2] === char) return;
			const ch = match[1].length;
			editor.replaceRange(char, { line, ch }, { line, ch: ch + 1 });
		},
	};
}

function resolveRenderedTask(
	app: App,
	view: MarkdownView,
	input: HTMLElement
): TaskTarget | null {
	const rendered = renderedCheckboxes.get(input);
	const item = input.closest("li");
	const relativeLine = Number(item?.dataset.line);
	if (!rendered || !item || !Number.isInteger(relativeLine)) return null;

	const file = app.vault.getAbstractFileByPath(rendered.ctx.sourcePath);
	const info = rendered.ctx.getSectionInfo(rendered.el);
	if (!info || !(file instanceof TFile) || file !== view.file) return null;

	const line = info.lineStart + relativeLine;
	const text = info.text.split("\n")[line];
	const match = text === undefined ? null : TASK_LINE.exec(text);
	if (!match || !matchesRendered(match[2], item.dataset.task)) return null;

	return {
		char: match[2],
		setChar: (char) => {
			void app.vault.process(file, (data) => {
				const lines = data.split("\n");
				// Só altera se a linha ainda for a mesma tarefa.
				if (lines[line] !== text) return data;
				lines[line] = text.replace(TASK_LINE, (_, open, __, close) => open + char + close);
				return lines.join("\n");
			});
		},
	};
}

function findMarkdownView(app: App, el: HTMLElement): MarkdownView | null {
	let found: MarkdownView | null = null;
	app.workspace.iterateAllLeaves((leaf) => {
		if (leaf.view instanceof MarkdownView && leaf.view.containerEl.contains(el)) {
			found = leaf.view;
		}
	});
	return found;
}
