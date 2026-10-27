import { knockout, stroke, svgMask } from "../checkbox-styles";
import { iconPack } from "./pack";

const fill = (d: string): string => `<path d="${d}"/>`;
const line = (d: string, width = 1.6): string =>
	`<path d="${d}" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

const SUN_RAYS =
	"M8 .9v1.8M8 13.3v1.8M.9 8h1.8M13.3 8h1.8M3 3l1.3 1.3M11.7 11.7L13 13M3 13l1.3-1.3M11.7 4.3L13 3";

export const SEASONS = iconPack(
	{
		id: "seasons",
		name: "Seasons",
		description: "Holidays through the year and the four seasons.",
		block: 10,
	},
	[
		{
			id: "new-year",
			name: "New Year",
			at: 0,
			mark: svgMask(
				line("M8 1v3M8 12v3M1 8h3M12 8h3M3.1 3.1l2.1 2.1M10.8 10.8l2.1 2.1M3.1 12.9l2.1-2.1M10.8 5.2l2.1-2.1", 1.5) +
					'<circle cx="8" cy="8" r="1.5"/>'
			),
			color: "yellow",
		},
		{
			id: "valentines",
			name: "Valentine's Day",
			at: 1,
			mark: knockout(
				fill("M6.6 14.6S.8 11.2.8 7.1a3 3 0 0 1 5.8-1.2 3 3 0 0 1 5.8 1.2c0 4.1-5.8 7.5-5.8 7.5z") +
					fill("M12.3 6.6S9.6 5 9.6 3.1a1.4 1.4 0 0 1 2.7-.6 1.4 1.4 0 0 1 2.7.6c0 1.9-2.7 3.5-2.7 3.5z"),
				'<path d="M12.3 7.6S8.6 5.6 8.6 3.1" stroke-width="1.6"/>'
			),
			color: "red",
		},
		{
			id: "carnival",
			name: "Carnival",
			at: 2,
			mark: knockout(
				fill("M.9 4.4c2.4-1 4.8-1 7.1.4 2.3-1.4 4.7-1.4 7.1-.4 0 4.6-1.7 7.2-4.1 7.2-1.4 0-2.3-1-3-2.2-.7 1.2-1.6 2.2-3 2.2C2.6 11.6.9 9 .9 4.4z"),
				'<path d="M3.1 6.7c.7-.7 2-.7 2.7.2M10.2 6.9c.7-.9 2-.9 2.7-.2" stroke-width="1.5"/>'
			),
			color: "purple",
		},
		{
			id: "easter",
			name: "Easter",
			at: 3,
			mark: knockout(
				fill("M8 1c-3 0-5.4 4.5-5.4 8a5.4 5.4 0 0 0 10.8 0C13.4 5.5 11 1 8 1z"),
				'<path d="M2.9 8.6l1.7-1.3 1.7 1.3L8 7.3l1.7 1.3 1.7-1.3 1.7 1.3"/>'
			),
			color: "pink",
		},
		{
			id: "festa-junina",
			name: "Festa Junina",
			at: 4,
			mark: svgMask(
				line("M.8 2.8c4.5 2.4 9.9 2.4 14.4 0", 1.1) +
					fill("M2.2 3.7l1.5 5.6 2-4.6zM6.8 4.6L8 10.2l1.2-5.6zM10.3 4.7l2 4.6 1.5-5.6z")
			),
			color: "orange",
		},
		{
			id: "halloween",
			name: "Halloween",
			at: 5,
			mark: knockout(
				fill("M8 4.4c-1-.7-2.9-.9-4.4.1C1.7 5.8 1.1 8.3 1.5 10.6c.5 2.7 2.7 4.1 4.6 3.6.7-.1 1.2-.4 1.9-.4s1.2.3 1.9.4c1.9.5 4.1-.9 4.6-3.6.4-2.3-.2-4.8-2.1-6.1-1.5-1-3.4-.8-4.4-.1z") +
					line("M8 4.6c0-1.3.5-2.4 1.6-3", 1.4),
				'<path d="M4.4 8.9l1.3-2 1.3 2zM9 8.9l1.3-2 1.3 2z" fill="#000" stroke-width="0.6"/>' +
					'<path d="M4.6 10.9l1.1.9 1.1-.9 1.2.9 1.2-.9 1.1.9 1.1-.9" stroke-width="1.1"/>'
			),
			color: "orange",
		},
		{
			id: "christmas",
			name: "Christmas",
			at: 6,
			mark: svgMask(
				fill("M8 .8l3.8 4.8H10l3.4 4.2h-1.7l3 3.8H1.3l3-3.8H2.6L6 5.6H4.2z") +
					'<rect x="6.9" y="13.4" width="2.2" height="2.2" rx=".4"/>'
			),
			color: "green",
		},
		{
			id: "spring",
			name: "Spring",
			at: 7,
			mark: knockout(
				'<circle cx="8" cy="4.2" r="2.7"/><circle cx="11.9" cy="7" r="2.7"/><circle cx="10.4" cy="11.6" r="2.7"/>' +
					'<circle cx="5.6" cy="11.6" r="2.7"/><circle cx="4.1" cy="7" r="2.7"/>',
				'<circle cx="8" cy="8.2" r="1.9" fill="#000" stroke="none"/>'
			),
			color: "pink",
		},
		{
			id: "summer",
			name: "Summer",
			at: 8,
			mark: svgMask('<circle cx="8" cy="8" r="3.4"/>' + line(SUN_RAYS, 1.6)),
			color: "yellow",
		},
		{
			id: "autumn",
			name: "Autumn",
			at: 9,
			mark: knockout(
				fill("M14.4 1.6C6.6 1.4 1.8 5.3 1.8 10.4c0 1.3.3 2.4.9 3.4 4.4.4 11.7-1.6 11.7-12.2z"),
				'<path d="M2.6 13.8c2.6-3.2 5.4-5.8 8.6-7.9"/>'
			),
			color: "orange",
		},
		{
			id: "winter",
			name: "Winter",
			at: 10,
			mark: stroke(
				"M8 1v14M1.9 4.5l12.2 7M1.9 11.5l12.2-7M6.2 1.9L8 3.6l1.8-1.7M6.2 14.1L8 12.4l1.8 1.7" +
					"M1.7 6.8l2.4-.6-.7-2.4M14.3 9.2l-2.4.6.7 2.4M1.7 9.2l2.4.6-.7 2.4M14.3 6.8l-2.4-.6.7-2.4",
				1.3
			),
			color: "cyan",
		},
	]
);
