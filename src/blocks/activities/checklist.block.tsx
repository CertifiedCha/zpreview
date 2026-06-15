import { Circle } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { defaultStylePresets, iconSize, makeBlock, paragraphTypographyFields, textAlignStylingField, titleTypographyFields } from "../shared";

export const checklistBlock: BlockDefinition = {
  type: "checklist",
  label: "Checklist",
  category: "assessment",
  icon: <Circle size={iconSize} />,
  defaultBlock: () =>
    makeBlock("checklist", {
      title: "Checklist",
      rows: [["Add a checklist item"], ["Add another item"], ["Add a final checkpoint"]],
    }),
  preview: (block, theme) => (
    <div className="space-y-2 py-1">
      <p className="text-sm font-black text-zinc-950">{block.content.title}</p>
      {(block.content.rows ?? []).slice(0, 3).map((row, index) => (
        <div key={index} className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
          <span className="h-4 w-4 rounded-full border-2" style={{ borderColor: theme.primary }} />
          {row[0]}
        </div>
      ))}
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "text", key: "title", label: "Title" }],
    contentControls: () => ["rows"],
    rowSchema: () => ({ label: "Checklist items", itemLabel: "Item", fields: ["Item text"], placeholders: ["New checklist item"] }),
    stylePresets: defaultStylePresets,
    styleGroups: [{ title: "Text", defaultOpen: true, fields: [textAlignStylingField, ...titleTypographyFields, ...paragraphTypographyFields.slice(2)] }],
  },
};
