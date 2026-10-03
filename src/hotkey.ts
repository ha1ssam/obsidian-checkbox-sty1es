import { App, KeymapContext, Modifier, Notice, Platform, Scope } from "obsidian";

/** Atalho de teclado guardado nas configurações do plugin. */
export interface StoredHotkey {
	modifiers: Modifier[];
	key: string;
}

const MODIFIERS: Modifier[] = ["Ctrl", "Meta", "Alt", "Shift"];

/** Com Ctrl/Cmd, estas teclas são do editor: copiar, colar, desfazer... */
const EDITING_KEYS = ["A", "C", "V", "X", "Y", "Z"];

function isEditingShortcut(hotkey: StoredHotkey): boolean {
	const command = Platform.isMacOS ? "Meta" : "Ctrl";
	const others = hotkey.modifiers.filter((m) => m !== command && m !== "Shift");
	return (
		hotkey.modifiers.includes(command) &&
		others.length === 0 &&
		EDITING_KEYS.includes(hotkey.key.toUpperCase())
	);
}

/** Valida o que veio do `data.json`; devolve `null` se não for um atalho. */
export function parseHotkey(value: unknown): StoredHotkey | null {
	if (typeof value !== "object" || value === null) return null;
	const { modifiers, key } = value as { modifiers?: unknown; key?: unknown };
	if (typeof key !== "string" || key === "" || !Array.isArray(modifiers)) {
		return null;
	}
	return {
		modifiers: MODIFIERS.filter((modifier) => modifiers.includes(modifier)),
		key,
	};
}

export function describeHotkey(hotkey: StoredHotkey | null): string {
	if (!hotkey) return "Not set";
	const key =
		hotkey.key === " "
			? "Space"
			: hotkey.key.length === 1
				? hotkey.key.toUpperCase()
				: hotkey.key;
	const modifiers = hotkey.modifiers.map((modifier) =>
		modifier === "Meta" ? (Platform.isMacOS ? "Cmd" : "Win") : modifier
	);
	return [...modifiers, key].join(" + ");
}

/** Letras e dígitos vêm da tecla física, para não depender do layout com Alt. */
function keyName(evt: KeyboardEvent, ctx: KeymapContext): string | null {
	const physical = /^(?:Key([A-Z])|Digit(\d))$/.exec(evt.code);
	if (physical) return physical[1] ?? physical[2];
	return ctx.key;
}

/**
 * Captura a próxima combinação de teclas. Enquanto grava, um escopo próprio
 * fica no topo da pilha do Obsidian, então nenhum outro atalho dispara.
 * `Escape` cancela. Devolve a função que encerra a gravação.
 */
export function recordHotkey(
	app: App,
	onDone: (hotkey: StoredHotkey | null) => void
): () => void {
	const scope = new Scope();
	let recording = true;
	const stop = () => {
		if (!recording) return;
		recording = false;
		app.keymap.popScope(scope);
	};

	scope.register(null, null, (evt, ctx) => {
		if (ctx.key === "Escape" && !ctx.modifiers) {
			stop();
			onDone(null);
			return false;
		}
		const key = keyName(evt, ctx);
		const modifiers = MODIFIERS.filter((modifier) =>
			(ctx.modifiers ?? "").split(",").includes(modifier)
		);
		const isFunctionKey = /^F\d{1,2}$/.test(key ?? "");
		const hasCommandModifier = modifiers.some((m) => m !== "Shift");
		if (!key || (!hasCommandModifier && !isFunctionKey)) {
			// Uma tecla sozinha dispararia enquanto a pessoa digita.
			new Notice("Use Ctrl, Alt or Cmd together with a key.");
			return false;
		}
		if (isEditingShortcut({ modifiers, key })) {
			new Notice("That combination is used for editing. Pick another one.");
			return false;
		}
		stop();
		onDone({ modifiers, key });
		return false;
	});
	app.keymap.pushScope(scope);
	return stop;
}
