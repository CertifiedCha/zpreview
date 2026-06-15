import { ArrowRight } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { buttonTypographyFields, iconSize, makeBlock } from "../shared";

export const nextPageBlock: BlockDefinition = {
  type: "nextPage",
  label: "Next Page",
  category: "interaction",
  icon: <ArrowRight size={iconSize} />,
  defaultBlock: () => makeBlock("nextPage", { label: "Next Page" }),
  preview: (block, theme) => (
    <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-white" style={{ background: theme.primary, boxShadow: `0 3px 0 ${theme.shadow}` }}>
      <span>{block.content.label}</span>
      <ArrowRight size={16} />
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "text", key: "label", label: "Label" }],
    styleGroups: [
      {
        title: "Button",
        description: "Controls the Next Page button itself.",
        defaultOpen: true,
        fields: buttonTypographyFields,
      },
    ],
  },
};
