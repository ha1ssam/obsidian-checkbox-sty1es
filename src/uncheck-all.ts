import { App, MarkdownView, Notice } from "obsidian";
import { TASK_LINE, UNCHECKED_CHAR, isUnchecked } from "./task-target";

/** Troca do caractere de uma tarefa: linha, coluna e o caractere a gravar. */
interface TaskEdit {
	line: number;
	ch: number;
	char: string;
}

interface Snapshot {
	/** Conteúdo da nota logo depois de desmarcar tudo. */
	after: string;
	/** Edições que devolvem cada tarefa ao caractere que tinha antes. */
	restore: TaskEdit[];
}

const FENCE = /^\s*(?:>\s*)*(`{3,}|~{3,})/;

const normalize = (data: string): string => data.replace(/\r\n/g, "\n");

const countTasks = (count: number): string =>
	`${count} ${count === 1 ? "task" : "tasks"}`;

/** Tarefas marcadas da nota, ignorando blocos de código. */
function findCheckedTasks(lines: string[]): TaskEdit[] {
	const found: TaskEdit[] = [];
	let fence: string | null = null;
	lines.forEach((text, line) => {
		const marker = FENCE.exec(text)?.[1];
		if (marker) {
			if (!fence) fence = marker[0];
			else if (marker[0] === fence) fence = null;
			return;
		}
		if (fence) return;
		const match = TASK_LINE.exec(text);
		if (match && !isUnchecked(match[2])) {
			found.push({ line, ch: match[1].length, char: match[2] });
		}
	});
	return found;
}

function applyEdits(lines: string[], edits: TaskEdit[]): string {
	const result = [...lines];
	for (const { line, ch, char } of edits) {
		const text = result[line];
		result[line] = text.slice(0, ch) + char + text.slice(ch + 1);
	}
	return result.join("\n");
}

/**
 * Desmarca todas as tarefas da nota. Acionado de novo sem nenhuma alteração
 * na nota desde então, devolve as tarefas ao estado anterior; se a nota mudou,
 * o estado guardado é descartado e a ação volta a ser "desmarcar tudo".
 */
export class UncheckAll {
	private snapshots = new Map<string, Snapshot>();

	constructor(private app: App) {}

	async run(view: MarkdownView): Promise<void> {
		const file = view.file;
		if (!file) return;

		let message = "";
		if (view.getMode() === "source") {
			const editor = view.editor;
			const plan = this.plan(file.path, editor.getValue());
			message = plan.message;
			if (plan.edits.length > 0) {
				editor.transaction({
					changes: plan.edits.map(({ line, ch, char }) => ({
						from: { line, ch },
						to: { line, ch: ch + 1 },
						text: char,
					})),
				});
			}
		} else {
			await this.app.vault.process(file, (data) => {
				const plan = this.plan(file.path, data);
				message = plan.message;
				return plan.edits.length > 0
					? applyEdits(data.split("\n"), plan.edits)
					: data;
			});
		}
		new Notice(message);
	}

	private plan(path: string, data: string): { edits: TaskEdit[]; message: string } {
		const lines = data.split("\n");
		const snapshot = this.snapshots.get(path);
		this.snapshots.delete(path);

		if (snapshot && snapshot.after === normalize(data)) {
			return {
				edits: snapshot.restore,
				message: `Restored ${countTasks(snapshot.restore.length)}.`,
			};
		}

		const checked = findCheckedTasks(lines);
		if (checked.length === 0) {
			return { edits: [], message: "No checked tasks in this note." };
		}
		const edits = checked.map((task) => ({ ...task, char: UNCHECKED_CHAR }));
		this.snapshots.set(path, {
			after: normalize(applyEdits(lines, edits)),
			restore: checked,
		});
		return {
			edits,
			message: `Unchecked ${countTasks(checked.length)}. Use it again now to undo.`,
		};
	}
}
