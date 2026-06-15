import { MousePointerClick } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { buttonTypographyFields, iconSize, makeBlock } from "../shared";

export const continueBlock: BlockDefinition = {
  type: "continue",
  label: "Continue",
  category: "interaction",
  icon: <MousePointerClick size={iconSize} />,
  defaultBlock: () => makeBlock("continue", { label: "Continue" }),
  preview: (block, theme) => (
    <div className="text-center">
      <button className="rounded-full px-4 py-2 text-xs font-bold text-white" style={{ background: theme.primary, boxShadow: `0 3px 0 ${theme.shadow}` }}>
        {block.content.label}
      </button>
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "text", key: "label", label: "Label" }],
    styleGroups: [
      {
        title: "Button",
        description: "Controls the Continue button itself.",
        defaultOpen: true,
        fields: buttonTypographyFields,
      },
    ],
  },
};
