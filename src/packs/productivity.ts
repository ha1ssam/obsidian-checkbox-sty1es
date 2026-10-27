import {
	BOLD_TEXT,
	MUTED_TEXT,
	badge,
	cutDot,
	define,
	knockout,
	stroke,
	svgMask,
} from "../checkbox-styles";
import { StyleSection, ThemeColor, iconPack, packChar, themeColor } from "./pack";

const fill = (d: string): string => `<path d="${d}"/>`;
const line = (d: string, width = 1.6): string =>
	`<path d="${d}" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

export const PRIORITY = iconPack(
	{
		id: "priority",
		name: "Priority",
		description: "Five priority levels, from urgent to lowest.",
		block: 0,
	},
	[
		{
			id: "urgent",
			name: "Urgent",
			at: 0,
			mark: stroke("M3.6 8.2L8 3.8l4.4 4.4M3.6 12.6L8 8.2l4.4 4.4", 2),
			color: "red",
			effect: "Bold text",
			text: BOLD_TEXT,
		},
		{ id: "high", name: "High", at: 1, mark: stroke("M3.4 10.4L8 5.8l4.6 4.6", 2.2), color: "orange" },
		{ id: "medium", name: "Medium", at: 2, mark: stroke("M3.6 6.2h8.8M3.6 9.8h8.8", 2), color: "yellow" },
		{ id: "low", name: "Low", at: 3, mark: stroke("M3.4 5.6L8 10.2l4.6-4.6", 2.2), color: "blue" },
		{
			id: "lowest",
			name: "Lowest",
			at: 4,
			mark: stroke("M3.6 3.4L8 7.8l4.4-4.4M3.6 8.2L8 12.6l4.4-4.4", 2),
			color: "muted",
			effect: "Muted text",
			text: MUTED_TEXT,
		},
	]
);

export const STATUS = iconPack(
	{
		id: "status",
		name: "Status",
		description: "Project stages: backlog, waiting, review, approved and more.",
		block: 1,
	},
	[
		{
			id: "backlog",
			name: "Backlog",
			at: 0,
			mark: svgMask(
				'<circle cx="8" cy="8" r="5.9" fill="none" stroke="#000" stroke-width="1.7" stroke-dasharray="2.3 1.95"/>'
			),
			color: "muted",
			effect: "Muted text",
			text: MUTED_TEXT,
		},
		{
			id: "waiting",
			name: "Waiting",
			at: 1,
			mark: svgMask(
				line("M3.6 1.8h8.8M3.6 14.2h8.8", 1.6) +
					fill("M4.8 2.6h6.4c0 2.7-2.2 3.7-2.2 5.4 0 1.7 2.2 2.7 2.2 5.4H4.8c0-2.7 2.2-3.7 2.2-5.4 0-1.7-2.2-2.7-2.2-5.4z")
			),
			color: "yellow",
			effect: "Muted text",
			text: MUTED_TEXT,
		},
		{
			id: "blocked",
			name: "Blocked",
			at: 2,
			mark: badge('<path d="M4.6 8h6.8" stroke-width="2"/>'),
			color: "red",
			effect: "Muted text",
			text: MUTED_TEXT,
		},
		{
			id: "paused",
			name: "Paused",
			at: 3,
			mark: badge('<path d="M6.3 5.3v5.4M9.7 5.3v5.4" stroke-width="1.7"/>'),
			color: "orange",
			effect: "Muted text",
			text: MUTED_TEXT,
		},
		{
			id: "review",
			name: "In review",
			at: 4,
			mark: svgMask(
				line("M1.2 8S3.6 3.4 8 3.4 14.8 8 14.8 8 12.4 12.6 8 12.6 1.2 8 1.2 8z", 1.5) +
					'<circle cx="8" cy="8" r="2.3"/>'
			),
			color: "purple",
		},
		{
			id: "delegated",
			name: "Delegated",
			at: 5,
			mark: svgMask(
				'<circle cx="6" cy="5.2" r="2.7"/>' +
					fill("M1 14.4c0-3 2.2-5 5-5s5 2 5 5z") +
					line("M10.6 4.6h4M12.8 2.6l2 2-2 2", 1.4)
			),
			color: "cyan",
		},
		{
			id: "approved",
			name: "Approved",
			at: 6,
			mark: badge('<path d="M4.8 8.3l2.2 2.2 4.2-4.5" stroke-width="1.7"/>'),
			color: "green",
		},
		{
			id: "rejected",
			name: "Rejected",
			at: 7,
			mark: badge('<path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" stroke-width="1.7"/>'),
			color: "red",
			effect: "Strikethrough text",
			text: { textColor: "var(--text-muted)", textDecoration: "line-through" },
		},
	]
);

export const WORK = iconPack(
	{
		id: "work",
		name: "Work",
		description: "Meetings, e-mails, calls, bugs, deadlines and more.",
		block: 2,
	},
	[
		{
			id: "meeting",
			name: "Meeting",
			at: 0,
			mark: svgMask(
				'<circle cx="5.6" cy="5" r="2.4"/><circle cx="11.3" cy="5.6" r="1.9"/>' +
					fill("M1.2 14c0-2.9 2-4.6 4.4-4.6S10 11.1 10 14z") +
					fill("M10.9 14c0-1.7-.4-3-1.2-3.9.5-.3 1.1-.5 1.7-.5 2 0 3.4 1.5 3.4 4.4z")
			),
			color: "blue",
		},
		{
			id: "email",
			name: "E-mail",
			at: 1,
			mark: knockout(
				'<rect x="1.3" y="3" width="13.4" height="10" rx="1.8"/>',
				'<path d="M2.6 4.6L8 8.8l5.4-4.2"/>'
			),
			color: "cyan",
		},
		{
			id: "call",
			name: "Call",
			at: 2,
			mark: svgMask(
				fill("M5.1 1.5l1.6 3.4-1.7 1.4a8.4 8.4 0 0 0 4.7 4.7l1.4-1.7 3.4 1.6-.5 2.9c-.1.6-.6 1-1.2 1C6.3 14.8 1.2 9.7 1.2 3.2c0-.6.4-1.1 1-1.2z")
			),
			color: "green",
		},
		{
			id: "bug",
			name: "Bug",
			at: 3,
			mark: svgMask(
				'<ellipse cx="8" cy="9.6" rx="3.5" ry="4.4"/>' +
					fill("M5.5 4.9a2.5 2.5 0 0 1 5 0z") +
					line(
						"M1.9 6.4l2.5 1.5M14.1 6.4l-2.5 1.5M1.6 10.2h2.6M14.4 10.2h-2.6M2.2 14.2l2.5-1.7M13.8 14.2l-2.5-1.7M6.3 2.6l-.9-1.1M9.7 2.6l.9-1.1",
						1.2
					)
			),
			color: "red",
		},
		{
			id: "code",
			name: "Code",
			at: 4,
			mark: stroke("M5.2 4.4L1.6 8l3.6 3.6M10.8 4.4L14.4 8l-3.6 3.6M9.3 2.6l-2.6 10.8", 1.6),
			color: "purple",
		},
		{
			id: "document",
			name: "Document",
			at: 5,
			mark: knockout(
				fill("M3 1.4h6.6l3.4 3.4v9.8H3z"),
				'<path d="M5.5 8h5M5.5 10.9h5"/>'
			),
			color: "blue",
		},
		{
			id: "deadline",
			name: "Deadline",
			at: 6,
			mark: knockout(
				'<circle cx="8" cy="9" r="5.6"/>' + line("M1.6 3.8L4 1.6M14.4 3.8L12 1.6", 1.6),
				'<path d="M8 6v3.2l2 1.4"/>'
			),
			color: "red",
			effect: "Bold text",
			text: BOLD_TEXT,
		},
		{
			id: "launch",
			name: "Launch",
			at: 7,
			mark: knockout(
				fill("M14.5 1.5c-3.7-.2-6.6 1.4-8.6 4.8l-2.6.5-1.7 2.3 3.2.4 2.2 2.2.4 3.2 2.3-1.7.5-2.6c3.4-2 5-4.9 4.8-8.6z") +
					fill("M3.6 10.6c-1.4.6-2 2-2 3.8 1.8 0 3.2-.6 3.8-2z"),
				cutDot(10.3, 5.7, 1.35)
			),
			color: "orange",
		},
	]
);

const COLOR_ITEMS: [string, string, number, ThemeColor | "gray"][] = [
	["red", "Red", 0, "red"],
	["orange", "Orange", 1, "orange"],
	["yellow", "Yellow", 2, "yellow"],
	["green", "Green", 3, "green"],
	["cyan", "Cyan", 4, "cyan"],
	["blue", "Blue", 5, "blue"],
	["purple", "Purple", 6, "purple"],
	["pink", "Pink", 7, "pink"],
	["gray", "Gray", 8, "gray"],
];

/** A checkbox padrão preenchida com uma cor do tema; o texto fica na mesma cor. */
export const COLORS: StyleSection = {
	id: "colors",
	name: "Colors",
	description: "The classic checkbox in nine theme colors, with matching text.",
	layout: "list",
	groups: [
		COLOR_ITEMS.map(([id, name, at, color]) => {
			const value = color === "gray" ? "var(--text-faint)" : themeColor(color);
			const text = color === "gray" ? "var(--text-muted)" : value;
			return define(
				{
					id: `colors.${id}`,
					name,
					char: packChar(3, at),
					description: `${name} checkbox.`,
					effect: `${name} text`,
				},
				{
					checkedBg: value,
					checkedBgHover: value,
					checkedBorderColor: value,
					checkedBorderColorHover: value,
					markColor: "var(--background-primary)",
					markColorHover: "var(--background-primary)",
					textColor: text,
				}
			);
		}),
	],
};
