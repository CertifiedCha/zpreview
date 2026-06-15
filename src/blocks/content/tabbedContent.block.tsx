import { FolderKanban } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { containerStyleGroup, defaultStylePresets, iconSize, makeBlock, paragraphTypographyFields, titleTypographyFields } from "../shared";

export const tabbedContentBlock: BlockDefinition = {
  type: "tabbedContent",
  label: "Tabbed Content",
  category: "content",
  icon: <FolderKanban size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "tabbedContent",
      {
        title: "",
        rows: [["Overview", "Add the main explanation here."], ["Details", "Add supporting details here."]],
      },
      { settings: { componentVariant: "card", interactive: true } },
    ),
  preview: (block, theme) => (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white text-xs">
      <div className="grid grid-cols-2">
        {(block.content.rows ?? []).slice(0, 2).map((row, index) => <div key={index} className="border-b px-2 py-2 text-center font-black" style={{ borderTop: index === 0 ? `3px solid ${theme.primary}` : undefined }}>{row[0]}</div>)}
      </div>
      <p className="p-3 text-zinc-700">{block.content.rows?.[0]?.[1]}</p>
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "text", key: "title", label: "Title" }],
    contentControls: () => ["rows"],
    rowSchema: () => ({ label: "Tabs", itemLabel: "Tab", fields: ["Tab label", "Tab content"], placeholders: ["New tab", "Tab content"] }),
    layout: [
      {
        section: "layout",
        kind: "select",
        target: "settings",
        key: "componentVariant",
        label: "Tab style",
        options: [{ label: "Card", value: "card" }, { label: "Plain", value: "plain" }],
      },
      { section: "layout", kind: "toggle", target: "settings", key: "interactive", label: "Interactive tabs" },
    ],
    stylePresets: defaultStylePresets,
    styleGroups: [containerStyleGroup, { title: "Text", defaultOpen: true, fields: [...titleTypographyFields, ...paragraphTypographyFields.slice(2)] }],
  },
};
