import { GitCommitVertical } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { containerStyleGroup, defaultStylePresets, iconSize, makeBlock, paragraphTypographyFields, titleTypographyFields } from "../shared";

export const timelineBlock: BlockDefinition = {
  type: "timeline",
  label: "Timeline",
  category: "content",
  icon: <GitCommitVertical size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "timeline",
      {
        title: "Timeline Title",
        rows: [["Step 1", "First Event", "Describe what happens first."], ["Step 2", "Second Event", "Describe what happens next."]],
      },
      { settings: { componentVariant: "plain", interactive: true } },
    ),
  preview: (block, theme) => (
    <div className="space-y-3 py-1">
      <p className="text-center text-sm font-black text-zinc-950">{block.content.title}</p>
      {(block.content.rows ?? []).slice(0, 2).map((row, index) => (
        <div key={index} className="grid grid-cols-[18px_1fr] gap-3 text-xs">
          <span className="mt-1 h-3 w-3 rounded-full border-2 bg-white" style={{ borderColor: theme.primary }} />
          <div><p className="text-[10px] font-black" style={{ color: theme.primary }}>{row[0]}</p><p className="font-black">{row[1]}</p><p className="text-zinc-600">{row[2]}</p></div>
        </div>
      ))}
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "text", key: "title", label: "Title" }],
    contentControls: () => ["rows"],
    rowSchema: () => ({ label: "Timeline entries", itemLabel: "Entry", fields: ["Date / label", "Entry title", "Description"], placeholders: ["Date", "Event title", "Event description"] }),
    layout: [{
      section: "layout",
      kind: "select",
      target: "settings",
      key: "componentVariant",
      label: "Timeline style",
      options: [{ label: "Plain", value: "plain" }, { label: "Cards", value: "card" }],
    }],
    stylePresets: defaultStylePresets,
    styleGroups: [containerStyleGroup, { title: "Text", defaultOpen: true, fields: [...titleTypographyFields, ...paragraphTypographyFields.slice(2)] }],
  },
};
