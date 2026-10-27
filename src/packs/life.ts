import { badge, cutDot, knockout, svgMask } from "../checkbox-styles";
import { iconPack } from "./pack";

const fill = (d: string): string => `<path d="${d}"/>`;
const line = (d: string, width = 1.6): string =>
	`<path d="${d}" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

const EYES = cutDot(5.6, 6.4, 1.05) + cutDot(10.4, 6.4, 1.05);

export const MOOD = iconPack(
	{
		id: "mood",
		name: "Mood",
		description: "Faces and a heart to log how you feel.",
		block: 4,
	},
	[
		{ id: "happy", name: "Happy", at: 0, mark: badge(EYES + '<path d="M4.9 9.4c1.7 2.1 4.5 2.1 6.2 0"/>'), color: "yellow" },
		{ id: "neutral", name: "Neutral", at: 1, mark: badge(EYES + '<path d="M5.3 10.4h5.4"/>'), color: "orange" },
		{ id: "sad", name: "Sad", at: 2, mark: badge(EYES + '<path d="M4.9 11.4c1.7-2.1 4.5-2.1 6.2 0"/>'), color: "blue" },
		{
			id: "angry",
			name: "Angry",
			at: 3,
			mark: badge(
				cutDot(5.8, 7.2, 1) +
					cutDot(10.2, 7.2, 1) +
					'<path d="M4.3 4.9l2.6 1.3M11.7 4.9L9.1 6.2M5.4 11.4c1.6-1.4 3.6-1.4 5.2 0"/>'
			),
			color: "red",
		},
		{
			id: "tired",
			name: "Tired",
			at: 4,
			mark: badge('<path d="M4.4 6.8c.7.7 1.8.7 2.5 0M9.1 6.8c.7.7 1.8.7 2.5 0M6.2 10.6h3.6"/>'),
			color: "purple",
		},
		{
			id: "love",
			name: "Love",
			at: 5,
			mark: svgMask(fill("M8 14.3S1.2 10.2 1.2 5.5a3.4 3.4 0 0 1 6.8-1.3 3.4 3.4 0 0 1 6.8 1.3c0 4.7-6.8 8.8-6.8 8.8z")),
			color: "pink",
		},
	]
);

export const HEALTH = iconPack(
	{
		id: "health",
		name: "Health",
		description: "Habits: workout, cardio, water, medicine, sleep and food.",
		block: 5,
	},
	[
		{
			id: "workout",
			name: "Workout",
			at: 0,
			mark: svgMask(
				'<rect x="0.9" y="5.6" width="2.4" height="4.8" rx=".8"/>' +
					'<rect x="12.7" y="5.6" width="2.4" height="4.8" rx=".8"/>' +
					'<rect x="3.3" y="3.4" width="2.6" height="9.2" rx=".9"/>' +
					'<rect x="10.1" y="3.4" width="2.6" height="9.2" rx=".9"/>' +
					'<rect x="5.6" y="7.1" width="4.8" height="1.8"/>'
			),
			color: "orange",
		},
		{
			id: "cardio",
			name: "Cardio",
			at: 1,
			mark: svgMask(line("M1.2 8.6h2.9l1.9-5 3.6 9.6 1.9-4.6h3.3", 1.8)),
			color: "red",
		},
		{
			id: "water",
			name: "Water",
			at: 2,
			mark: knockout(
				fill("M8 1.2S3 6.9 3 10.1a5 5 0 0 0 10 0C13 6.9 8 1.2 8 1.2z"),
				'<path d="M5.6 10.4a2.4 2.4 0 0 0 2 2.2" stroke-width="1.2"/>'
			),
			color: "blue",
		},
		{
			id: "medicine",
			name: "Medicine",
			at: 3,
			mark: knockout(
				'<rect x="0.9" y="5" width="14.2" height="6" rx="3" transform="rotate(-45 8 8)"/>',
				'<path d="M5.9 5.9l4.2 4.2"/>'
			),
			color: "pink",
		},
		{
			id: "sleep",
			name: "Sleep",
			at: 4,
			mark: svgMask(fill("M13.9 10.2A6.2 6.2 0 0 1 5.8 2.1a6.2 6.2 0 1 0 8.1 8.1z")),
			color: "purple",
		},
		{
			id: "food",
			name: "Healthy food",
			at: 5,
			mark: svgMask(
				fill("M8 5c-1-.9-2.5-1.2-3.8-.8C2 5 1.5 7.5 2.1 10c.6 2.8 2.4 5 4.2 5 .6 0 1.1-.3 1.7-.3s1.1.3 1.7.3c1.8 0 3.6-2.2 4.2-5 .6-2.5.1-5-2.1-5.8C10.5 3.8 9 4.1 8 5z") +
					line("M8 4.6c0-1.5.7-2.6 2-3.1", 1.3)
			),
			color: "green",
		},
	]
);

export const STUDY = iconPack(
	{
		id: "study",
		name: "Study",
		description: "Reading, classes, exams, homework, research and review.",
		block: 6,
	},
	[
		{
			id: "reading",
			name: "Reading",
			at: 0,
			mark: svgMask(
				fill("M1.2 3c2.5-.6 4.8-.2 6.2 1v10c-1.4-1.1-3.7-1.5-6.2-.9zM14.8 3c-2.5-.6-4.8-.2-6.2 1v10c1.4-1.1 3.7-1.5 6.2-.9z")
			),
			color: "orange",
		},
		{
			id: "class",
			name: "Class",
			at: 1,
			mark: svgMask(
				fill("M8 2.2L.6 6 8 9.8 15.4 6z") +
					fill("M3.6 8v3.2c0 1.3 2 2.6 4.4 2.6s4.4-1.3 4.4-2.6V8L8 10.3z") +
					line("M14.2 6.4v4.8", 1.1)
			),
			color: "purple",
		},
		{
			id: "exam",
			name: "Exam",
			at: 2,
			mark: knockout(
				'<rect x="2.6" y="2.4" width="10.8" height="12.4" rx="1.6"/>',
				'<path d="M5.3 9.1l1.9 1.9 3.5-3.8"/><path d="M5.8 2.6h4.4" stroke-width="2.6"/>'
			),
			color: "red",
		},
		{
			id: "homework",
			name: "Homework",
			at: 3,
			mark: knockout(fill("M11.4 1.5l3.1 3.1-8.9 8.9-4.1 1 1-4.1z"), '<path d="M9.4 3.5l3.1 3.1"/>'),
			color: "yellow",
		},
		{
			id: "research",
			name: "Research",
			at: 4,
			mark: svgMask(
				'<circle cx="6.7" cy="6.7" r="4.5" fill="none" stroke="#000" stroke-width="1.9"/>' +
					line("M10.1 10.1l4.2 4.2", 2.3)
			),
			color: "cyan",
		},
		{
			id: "review",
			name: "Review",
			at: 5,
			mark: svgMask(
				'<rect x="1.2" y="5.2" width="10.4" height="8.6" rx="1.4"/>' +
					line("M4.4 2.6h8.8a1.6 1.6 0 0 1 1.6 1.6v7.2", 1.5)
			),
			color: "green",
		},
	]
);

export const MONEY = iconPack(
	{
		id: "money",
		name: "Money",
		description: "Bills, cards, income, expenses and investments.",
		block: 7,
	},
	[
		{
			id: "bill",
			name: "Bill",
			at: 0,
			mark: knockout(
				fill("M2.8 1.4h10.4v13.2l-1.7-1.2-1.8 1.2L8 13.4l-1.7 1.2-1.8-1.2-1.7 1.2z"),
				'<path d="M5.4 4.9h5.2M5.4 7.7h5.2M5.4 10.5h3"/>'
			),
			color: "yellow",
		},
		{
			id: "card",
			name: "Card",
			at: 1,
			mark: knockout(
				'<rect x="0.9" y="3" width="14.2" height="10" rx="1.8"/>',
				'<path d="M.9 6.4h14.2" stroke-width="1.9"/><path d="M3.6 10.1h3"/>'
			),
			color: "orange",
		},
		{
			id: "income",
			name: "Income",
			at: 2,
			mark: svgMask(line("M8 1.4v7.8M4.7 6l3.3 3.3L11.3 6", 1.9) + line("M1.6 10.4v2.4c0 1 .8 1.8 1.8 1.8h9.2c1 0 1.8-.8 1.8-1.8v-2.4", 1.9)),
			color: "green",
		},
		{
			id: "expense",
			name: "Expense",
			at: 3,
			mark: svgMask(line("M8 9.4V1.6M4.7 4.8L8 1.5l3.3 3.3", 1.9) + line("M1.6 10.4v2.4c0 1 .8 1.8 1.8 1.8h9.2c1 0 1.8-.8 1.8-1.8v-2.4", 1.9)),
			color: "red",
		},
		{
			id: "invest",
			name: "Invest",
			at: 4,
			mark: svgMask(
				'<rect x="1.4" y="9.4" width="3.2" height="5.2" rx=".7"/>' +
					'<rect x="6.4" y="6" width="3.2" height="8.6" rx=".7"/>' +
					'<rect x="11.4" y="1.8" width="3.2" height="12.8" rx=".7"/>'
			),
			color: "cyan",
		},
	]
);

export const HOME = iconPack(
	{
		id: "home",
		name: "Home",
		description: "Groceries, cleaning, repairs, deliveries, gifts, plants and pets.",
		block: 8,
	},
	[
		{
			id: "groceries",
			name: "Groceries",
			at: 0,
			mark: svgMask(
				line("M.9 1.8h2.4l2 8.6h7.8l1.7-6.2H4", 1.6) +
					fill("M4.6 4.9h10.2l-1.4 4.9H5.7z") +
					'<circle cx="6.2" cy="13.3" r="1.4"/><circle cx="12.1" cy="13.3" r="1.4"/>'
			),
			color: "green",
		},
		{
			id: "cleaning",
			name: "Cleaning",
			at: 1,
			mark: svgMask(
				line("M14.4 1.6L8.9 7.1", 1.7) +
					fill("M7.4 5.4l3.2 3.2-1 1.3c-1.8 2.1-4.6 3.8-8.1 4.8 1-3.5 2.7-6.3 4.8-8.1z")
			),
			color: "cyan",
		},
		{
			id: "repair",
			name: "Repair",
			at: 2,
			mark: svgMask(
				fill("M14.2 4.2a3.8 3.8 0 0 1-5 4.9l-5.4 5.4a1.5 1.5 0 0 1-2.2-2.2L7 6.9a3.8 3.8 0 0 1 4.9-5L9.6 4.2l.4 1.7 1.7.4z")
			),
			color: "muted",
		},
		{
			id: "delivery",
			name: "Delivery",
			at: 3,
			mark: knockout(fill("M8 1.2l6.6 3.3v7.2L8 15 1.4 11.7V4.5z"), '<path d="M1.4 4.5L8 7.8l6.6-3.3M8 7.8V15"/>'),
			color: "orange",
		},
		{
			id: "gift",
			name: "Gift",
			at: 4,
			mark: knockout(
				'<rect x="1.2" y="5" width="13.6" height="3.4" rx=".8"/><rect x="2.2" y="8.4" width="11.6" height="6.4" rx=".8"/>' +
					line("M8 5C6.7 2.3 3.8 1.5 3.8 3.4 3.8 4.6 5.9 5 8 5zM8 5c1.3-2.7 4.2-3.5 4.2-1.6C12.2 4.6 10.1 5 8 5z", 1.3),
				'<path d="M8 5.6v9.4" stroke-width="1.6"/>'
			),
			color: "pink",
		},
		{
			id: "plants",
			name: "Plants",
			at: 5,
			mark: svgMask(
				line("M8 14.6V7.8", 1.6) +
					fill("M8 8.8C8 5 5.7 3 1.8 3c0 3.8 2.3 5.8 6.2 5.8zM8 7.6c0-3.2 2-5 6.2-5 0 3.2-2 5-6.2 5z")
			),
			color: "green",
		},
		{
			id: "pet",
			name: "Pet",
			at: 6,
			mark: svgMask(
				'<ellipse cx="3.6" cy="7" rx="1.6" ry="2"/><ellipse cx="6.3" cy="3.5" rx="1.6" ry="2"/>' +
					'<ellipse cx="9.7" cy="3.5" rx="1.6" ry="2"/><ellipse cx="12.4" cy="7" rx="1.6" ry="2"/>' +
					fill("M8 7.4c-2.3 0-4.6 3.4-4.6 5.3 0 1.3.9 1.9 2.1 1.9.9 0 1.6-.5 2.5-.5s1.6.5 2.5.5c1.2 0 2.1-.6 2.1-1.9 0-1.9-2.3-5.3-4.6-5.3z")
			),
			color: "orange",
		},
	]
);

export const TRAVEL = iconPack(
	{
		id: "travel",
		name: "Travel",
		description: "Flights, hotels, luggage, tickets, maps and trips.",
		block: 9,
	},
	[
		{
			id: "flight",
			name: "Flight",
			at: 0,
			mark: svgMask(
				fill("M14.5 1.5c-.8-.8-2-.6-2.8.2L9.3 4.1 2.6 2.3 1.3 3.6l5.5 3.3-2.7 2.7-2-.4-.9.9 2.7 1.6 1.6 2.7.9-.9-.4-2 2.7-2.7 3.3 5.5 1.3-1.3-1.8-6.7 2.4-2.4c.8-.8 1-2 .2-2.8z")
			),
			color: "blue",
		},
		{
			id: "hotel",
			name: "Hotel",
			at: 1,
			mark: svgMask(
				line("M1.4 3v10.8M1.4 10.6h13.2v3.2", 1.7) +
					'<circle cx="4.6" cy="7.4" r="1.7"/>' +
					fill("M7 5.6h5.6c1.1 0 2 .9 2 2v1.6H7z")
			),
			color: "purple",
		},
		{
			id: "luggage",
			name: "Luggage",
			at: 2,
			mark: knockout(
				'<rect x="2.2" y="4.4" width="11.6" height="10" rx="1.6"/>' + line("M5.9 4.4V2.8c0-.6.4-1 1-1h2.2c.6 0 1 .4 1 1v1.6", 1.4),
				'<path d="M5.6 6.8v5.2M10.4 6.8v5.2"/>'
			),
			color: "orange",
		},
		{
			id: "ticket",
			name: "Ticket",
			at: 3,
			mark: knockout(
				fill("M.9 4c0-.6.4-1 1-1h12.2c.6 0 1 .4 1 1v2.2a1.8 1.8 0 0 0 0 3.6V12c0 .6-.4 1-1 1H1.9c-.6 0-1-.4-1-1V9.8a1.8 1.8 0 0 0 0-3.6z"),
				'<path d="M10.4 4.6v1M10.4 7.5v1M10.4 10.4v1"/>'
			),
			color: "yellow",
		},
		{
			id: "map",
			name: "Map",
			at: 4,
			mark: knockout(fill("M.9 3.4l4.6-1.8 5 1.8 4.6-1.8v11l-4.6 1.8-5-1.8-4.6 1.8z"), '<path d="M5.5 1.8v10.8M10.5 3.6v10.8"/>'),
			color: "green",
		},
		{
			id: "car",
			name: "Car",
			at: 5,
			mark: knockout(
				fill("M3.3 3.6c.2-.9 1-1.5 1.9-1.5h5.6c.9 0 1.7.6 1.9 1.5l.9 3.4c.9.3 1.6 1.2 1.6 2.2V12h-1.7v1.5a.9.9 0 0 1-.9.9h-.8a.9.9 0 0 1-.9-.9V12H5.1v1.5a.9.9 0 0 1-.9.9h-.8a.9.9 0 0 1-.9-.9V12H.8V9.2c0-1 .7-1.9 1.6-2.2z"),
				'<path d="M3.6 7h8.8"/>' + cutDot(4, 9.6, 1.05) + cutDot(12, 9.6, 1.05)
			),
			color: "red",
		},
		{
			id: "vacation",
			name: "Vacation",
			at: 6,
			mark: svgMask(fill("M8 1.4a6.8 6.8 0 0 0-6.8 6.8h13.6A6.8 6.8 0 0 0 8 1.4z") + line("M8 8v4.7a1.7 1.7 0 0 1-3.4 0", 1.6)),
			color: "cyan",
		},
	]
);
