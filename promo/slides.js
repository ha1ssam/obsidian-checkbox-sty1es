// Monta cada imagem de divulgação. Ver promo/README.md.
const P = window.Promo;
const params = new URLSearchParams(location.search);
const FORMAT = params.get("f") || "portrait";
const SLIDE = params.get("s") || "menu";
const L = FORMAT === "landscape";

const h = (tag, attrs = {}, ...kids) => {
	const el = document.createElement(tag);
	for (const [k, v] of Object.entries(attrs)) {
		if (k === "class") el.className = v;
		else if (k === "style") el.style.cssText = v;
		else if (k === "html") el.innerHTML = v;
		else el.setAttribute(k, v);
	}
	for (const kid of kids.flat()) if (kid != null) el.append(kid);
	return el;
};
const box = (id, checked = true) => h("span", { "data-cbs-style": id, style: "display:inline-flex" },
	Object.assign(h("input", { type: "checkbox", class: "cbs-checkbox", tabindex: "-1" }), { checked }));
const shown = (c) => (c === '"' ? "[”]" : `[${c}]`);
const ICON = {
	search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
	image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>',
	undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
	keyboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 8h.01M12 12h.01M14 8h.01M16 12h.01M18 8h.01M6 8h.01M7 16h10M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg>',
	listx: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 12H3M16 6H3M16 18H3M18 9l6 6M24 9l-6 6"/></svg>',
	folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
	chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
	phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>',
	book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
	plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg>',
};
const chip = (icon, text) => h("span", { class: "chip", html: ICON[icon] }, text);
const brand = () => h("div", { class: "brand" }, h("span", { class: "logo" }, "1"),
	h("span", { html: 'Checkbox Sty<span class="one">1</span>es' }));

/** Lista de tarefas com o CSS real do plugin. */
const tasks = (title, rows, { chars = true } = {}) => {
	const list = h("div", { class: "markdown-rendered" });
	for (const [char, text, checked = true] of rows) {
		const li = h("li", { class: "task-list-item" + (checked ? " is-checked" : ""), "data-task": checked ? char : "" },
			Object.assign(h("input", { type: "checkbox", class: "task-list-item-checkbox" }), { checked }),
			h("span", { class: "t" }, text));
		list.append(h("div", { style: "display:flex;align-items:center;gap:12px" },
			h("ul", { style: "flex:1;min-width:0" }, li), chars ? h("span", { class: "char" }, checked ? shown(char) : "[ ]") : null));
	}
	return h("div", { class: "panel note" }, title ? h("h3", {}, title) : null, list);
};

function frame(eyebrow, title, sub, stage) {
	const slide = h("div", { class: `slide ${FORMAT}` });
	const text = [h("p", { class: "eyebrow" }, eyebrow), h("h1", { html: title }), sub ? h("p", { class: "sub", html: sub }) : null];
	const t = text.filter(Boolean);
	if (L) slide.append(h("div", { class: "left" }, ...t, brand()), h("div", { class: "stage" }, stage));
	else slide.append(...t, h("div", { class: "stage" }, stage), brand());
	document.body.append(slide);
	return slide;
}

const SLIDES = {
	menu() {
		const pick = h("div", { style: `zoom:${L ? 1 : 1.08};flex:none` });
		const info = h("div", { style: "display:flex;flex-direction:column;" + (L ? "width:140px;flex:none" : "") },
			h("div", { class: "logo1" }, "1"),
			h("div", { style: L ? "margin-top:auto" : "margin-top:16px" },
				h("div", { class: "kicker" }, "Obsidian plugin"),
				h("div", { class: "title", html: "Checkbox<br>Sty1es" }),
				h("div", { class: "text" }, "Search, tabs and 29 styles, plus 12 extra sections.")),
			L ? h("div", { class: "foot", style: "margin-top:auto" }, "Live Preview,", h("br"), "Reading mode", h("br"), "and mobile") : null);
		const hero = h("div", { class: "hero", style: L ? "height:500px;align-items:stretch;width:100%;padding:24px;gap:18px" : "flex-direction:column;align-items:stretch;gap:18px" }, info,
			h("div", { style: "display:flex;justify-content:center;align-items:center;flex:1" }, pick));
		if (!L) { info.style.flexDirection = "row"; info.style.gap = "16px"; info.style.width = "auto"; info.style.alignItems = "flex-start"; info.children[1].style.marginTop = "0"; }
		frame("Menu", "Click a task, pick&nbsp;a&nbsp;style.", null, hero);
		const el = P.picker(pick, { tabs: ["basic", "icons", "priority", "status", "work", "seasons"], current: "r" });
		el.style.height = L ? "430px" : "406px";
	},
	sections() {
		const cols = L ? 3 : 2, n = L ? 7 : 8;
		const grid = h("div", { class: "grid", style: `grid-template-columns:repeat(${cols},1fr);gap:${L ? 8 : 10}px;width:100%` });
		for (const p of P.packs) {
			grid.append(h("div", { class: "sec" },
				h("div", { class: "head" }, h("span", { class: "name" }, p.name), h("span", { class: "count" }, String(p.count))),
				h("div", { class: "sample" }, p.styles.slice(0, n).map((s) => box(s.id)))));
		}
		frame("Sections", "12 extra sections. Turn on what you&nbsp;need.",
			`Priority, status, seasons, flags and more. Each one becomes a tab in the menu: turn it on with <b>Add styles</b> or in the settings.`, grid);
	},
	effects() {
		const rows = P.basic.map((s) => [s.char, {
			classic: "Review the README", rounded: "Reply to the comments", circle: "Publish to the community store",
			minimal: "Archive old notes", filled: "Ship version 1.2", cross: "Support legacy themes",
			square: "Write the changelog", dot: "Translate the docs", dash: "Record the demo video", glow: "First plugin published",
		}[s.id]]);
		const note = tasks("Launch checklist", rows);
		note.style.width = "100%";
		frame("Text effects", "Every checkbox also changes the&nbsp;text.", null, note);
	},
	images() {
		const crests = P.custom.styles;
		const img = (s) => {
			const span = h("span", { "data-cbs-style": s.id, style: "display:inline-flex" });
			span.append(Object.assign(h("input", { type: "checkbox", class: "cbs-checkbox", tabindex: "-1", style: "width:16px;height:16px" }), { checked: true }));
			return span;
		};
		const file = (s) => h("div", { class: "row", style: "padding-left:44px" }, img(s), h("span", {}, s.name.toLowerCase() + ".png"));
		const tree = h("div", { class: "panel tree", style: L ? "width:182px;flex:none;padding:14px 12px" : "flex:1" },
			h("div", { class: "row", html: ICON.chev + ICON.folder + "<span>Checkbox images</span>" }),
			h("div", { class: "row", style: "padding-left:22px", html: ICON.chev + ICON.folder + "<span>Football</span>" }),
			...crests.slice(0, L ? 6 : 5).map(file),
			h("div", { class: "row dim", style: "padding-left:44px" }, `+ ${crests.length - (L ? 6 : 5)} more`),
			h("div", { class: "row", style: "padding-left:22px", html: ICON.chev.replace("m6 9 6 6 6-6", "m9 18 6-6-6-6") + ICON.folder + "<span>Team</span>" }));
		const pick = h("div", { style: `zoom:${L ? 0.98 : 1.22};flex:none` });
		const stage = h("div", { style: `display:flex;gap:16px;align-items:${L ? "center" : "stretch"};${L ? "" : "flex-direction:column"}` },
			tree, h("div", { style: "display:flex;justify-content:center" }, pick));
		if (!L) { tree.style.flex = "none"; }
		frame("Your images", "Use your own images.",
			"Pick a folder in your vault. Each subfolder becomes a tab, and each image a style: team crests, logos, avatars.", stage);
		const el = P.picker(pick, { tabs: ["basic", "icons", P.custom.id, "seasons", "flags"], current: crests[2].char });
		el.style.height = L ? "330px" : "318px";
		if (!L) {
			tree.replaceWith(h("div", { class: "panel tree", style: "display:flex;align-items:center;gap:10px;padding:12px 16px" },
				h("span", { style: "display:inline-flex", html: ICON.folder }),
				h("span", {}, "Checkbox images / ", h("b", { style: "color:#ececec;font-weight:600" }, "Football")),
				h("span", { class: "dim", style: "margin-left:auto" }, "12 images")));
		}
	},
	uncheck() {
		const before = [["r", "Pack the gym bag"], ["!", "Pay the rent"], ["*", "Call mom"], ["g", "Morning run"]];
		const mk = (checked, label) => {
			const note = tasks(null, before.map(([c, t]) => [c, t, checked]), { chars: false });
			const head = h("div", { style: "display:flex;align-items:center;justify-content:space-between;margin-bottom:8px" },
				h("span", { class: "mono", style: "font-size:11px;color:#8a8a8a" }, label),
				h("span", { style: `display:inline-flex;width:28px;height:28px;border-radius:6px;align-items:center;justify-content:center;color:${checked ? "#fff" : "#8a8a8a"};background:${checked ? "var(--accent)" : "transparent"}`, html: ICON.listx.replace("<svg", '<svg width="16" height="16"') }));
			note.prepend(head);
			note.style.flex = "1";
			if (!L) note.querySelectorAll("li").forEach((li) => (li.style.height = "40px"));
			return note;
		};
		const arrow = h("div", { style: `display:grid;place-items:center;color:#777;font-size:20px;${L ? "" : "height:18px"}` }, L ? "→" : "↓");
		const states = h("div", { style: `display:flex;gap:${L ? 12 : 10}px;${L ? "align-items:center" : "flex-direction:column"}` }, mk(true, "Weekly reset"), arrow, mk(false, "One click later"));
		const chips = h("div", { class: "chips", style: `margin-top:${L ? 16 : 18}px` }, chip("listx", "Button at the top of the note"), chip("keyboard", "Your own hotkey"), chip("undo", "Use it again to undo"));
		frame("Uncheck all", "Reset a checklist in one&nbsp;click.", null, h("div", { style: "width:100%" }, states, chips));
	},
};
SLIDES[SLIDE]();
document.body.dataset.ready = "1";
