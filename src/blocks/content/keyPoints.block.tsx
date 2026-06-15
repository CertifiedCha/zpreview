import { CheckCircle2 } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { defaultStylePresets, iconSize, makeBlock, paragraphTypographyFields, textAlignStylingField, titleTypographyFields } from "../shared";

export const keyPointsBlock: BlockDefinition = {
  type: "keyPoints",
  label: "Key Points",
  category: "content",
  icon: <CheckCircle2 size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "keyPoints",
      {
        title: "Key Points",
        rows: [["Add an important takeaway."], ["Add another key idea."]],
      },
      { settings: { interactive: true } },
    ),
  preview: (block, theme) => (
    <div className="space-y-3 py-1">
      <p className="border-l-4 pl-3 text-sm font-black text-zinc-950" style={{ borderColor: theme.primary }}>{block.content.title}</p>
      {(block.content.rows ?? []).slice(0, 2).map((row, index) => (
        <div key={index} className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
          <CheckCircle2 size={14} style={{ color: theme.primary }} />
          {row[0]}
        </div>
      ))}
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "text", key: "title", label: "Title" }],
    contentControls: () => ["rows"],
    rowSchema: () => ({ label: "Takeaway items", itemLabel: "Point", fields: ["Point text"], placeholders: ["New takeaway"] }),
    stylePresets: defaultStylePresets,
    styleGroups: [{ title: "Text", defaultOpen: true, fields: [textAlignStylingField, ...titleTypographyFields, ...paragraphTypographyFields.slice(2)] }],
  },
};
