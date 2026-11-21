/**
 * pi-setup — personal extension
 *
 * Currently a placeholder: `/pick` is kept as a working reference for
 * `ctx.ui.custom()` + `SelectList`. Real functionality goes here as the
 * setup grows (see AGENTS.md for the development loop).
 *
 * Patterns not yet used: tools, event handlers, keybindings, widgets,
 * tool renderers, custom providers.
 */

import { DynamicBorder, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Container, type SelectItem, SelectList, Text } from "@earendil-works/pi-tui";

export default function (pi: ExtensionAPI) {
  // Slash command with TUI: the user can type /pick to open a selection dialog.
  pi.registerCommand("pick", {
    description: "Pick an item from a selection dialog",
    handler: async (_args, ctx) => {
      const items: SelectItem[] = [
        { value: "alpha", label: "Option A", description: "First option" },
        { value: "beta", label: "Option B", description: "Second option" },
        { value: "gamma", label: "Option C", description: "Third option" },
      ];

      const result = await ctx.ui.custom<string | null>((tui, theme, _kb, done) => {
        const container = new Container();

        container.addChild(new DynamicBorder((s: string) => theme.fg("accent", s)));
        container.addChild(new Text(theme.fg("accent", theme.bold("Pick an Option")), 1, 0));

        const selectList = new SelectList(items, Math.min(items.length, 10), {
          selectedPrefix: (t) => theme.fg("accent", t),
          selectedText: (t) => theme.fg("accent", t),
          description: (t) => theme.fg("muted", t),
          scrollInfo: (t) => theme.fg("dim", t),
          noMatch: (t) => theme.fg("warning", t),
        });
        selectList.onSelect = (item) => done(item.value);
        selectList.onCancel = () => done(null);
        container.addChild(selectList);

        container.addChild(
          new Text(theme.fg("dim", "↑↓ navigate • enter select • esc cancel"), 1, 0),
        );
        container.addChild(new DynamicBorder((s: string) => theme.fg("accent", s)));

        return {
          render: (w) => container.render(w),
          invalidate: () => container.invalidate(),
          handleInput: (data) => {
            selectList.handleInput(data);
            tui.requestRender();
          },
        };
      });

      if (result) {
        ctx.ui.notify(`Selected: ${result}`, "info");
      }
    },
  });
}
