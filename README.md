# Checkbox Sty1es

Pick a visual style for each task checkbox in Obsidian. Clicking an unchecked task opens a menu with ten styles; each style changes how the checkbox looks and applies a matching effect to the task text.

| Style | Text effect | Written to the note |
|---|---|---|
| Classic | strikethrough | `- [c]` |
| Rounded | muted | `- [r]` |
| Circle | accent color | `- [o]` |
| Minimal | faint | `- [m]` |
| Filled | bold | `- [f]` |
| Cross | red strikethrough (cancelled) | `- [-]` |
| Square | underline | `- [s]` |
| Dot | italic (in progress) | `- [.]` |
| Dash | dashed underline (postponed) | `- [~]` |
| Glow | glowing text | `- [g]` |

## How it works

- The chosen style is stored as the character between the brackets, so tasks stay plain Markdown tasks. Nothing else in the note is changed.
- Unchecked tasks and tasks marked with `[x]` use the default style chosen in the plugin settings.
- Right-click any checkbox to change its style or uncheck it.
- Colors come from the current theme's variables, so the styles follow light and dark themes.

## Settings

- **Menu on check** — open the style menu when clicking an unchecked task. When off, a click checks the task as usual and the menu stays on right-click.
- **When clicking a checked task** — either uncheck directly or open the menu again.
- **Default style** — the look of unchecked and `[x]` tasks.

## Limitations

- Plugins that only treat `[x]` as done (for example Tasks or Dataview queries) may not count styled tasks as completed.
- Themes that ship their own alternate checkbox icons may override some styles.
- Checkboxes inside embeds, canvas cards and callouts keep the native click behavior.

## Development

```bash
npm install
npm run build
```

`styles.css` is generated from `src/styles.base.css` and the style registry in `src/checkbox-styles.ts`. To add a style, add one entry to `CHECKBOX_STYLES` with a unique `char`.
