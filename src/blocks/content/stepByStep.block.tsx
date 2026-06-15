import { ListOrdered } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { containerStyleGroup, defaultStylePresets, iconSize, makeBlock, paragraphTypographyFields, titleTypographyFields } from "../shared";

export const stepByStepBlock: BlockDefinition = {
  type: "stepByStep",
  label: "Step By Step",
  category: "content",
  icon: <ListOrdered size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "stepByStep",
      {
        title: "Process Title",
        rows: [
          ["First Step", "Describe what students should do first."],
          ["Second Step", "Add the next action or idea in the sequence."],
          ["Third Step", "Explain the final step or checkpoint."],
        ],
      },
      { settings: { componentVariant: "plain", interactive: true } },
    ),
  preview: (block, theme) => (
    <div className="space-y-3 py-1">
      <p className="border-l-4 pl-2 text-sm font-black text-zinc-950" style={{ borderColor: theme.primary }}>{block.content.title}</p>
      {(block.content.rows ?? []).slice(0, 2).map((row, index) => (
        <div key={index} className="flex gap-3 text-xs">
          <span className="grid h-6 w-6 place-items-center rounded-full border bg-white font-black" style={{ color: theme.primary }}>{index + 1}</span>
          <div><p className="font-black" style={{ color: theme.primary }}>{row[0]}</p><p className="text-zinc-600">{row[1]}</p></div>
        </div>
      ))}
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "text", key: "title", label: "Title" }],
    contentControls: () => ["rows"],
    rowSchema: () => ({ label: "Steps", itemLabel: "Step", fields: ["Step title", "Step body"], placeholders: ["New step", "Describe the step"] }),
    layout: [{
      section: "layout",
      kind: "select",
      target: "settings",
      key: "componentVariant",
      label: "Step style",
      options: [{ label: "Plain", value: "plain" }, { label: "Cards", value: "card" }],
    }, { section: "layout", kind: "toggle", target: "settings", key: "interactive", label: "Interactive reveal" }],
    stylePresets: defaultStylePresets,
    styleGroups: [containerStyleGroup, { title: "Text", defaultOpen: true, fields: [...titleTypographyFields, ...paragraphTypographyFields.slice(2)] }],
  },
};
