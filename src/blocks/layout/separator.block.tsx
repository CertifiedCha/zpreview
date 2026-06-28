import { Minus } from "lucide-react";
import { MathText } from "../../components/MathText";
import type { BlockDefinition } from "../../types";
import { iconSize, makeBlock } from "../shared";

export const separatorBlock: BlockDefinition = {
  type: "separator",
  label: "Separator",
  category: "layout",
  icon: <Minus size={iconSize} />,
  defaultBlock: () => makeBlock("separator", { label: "New section" }),
  preview: (block, theme) => (
    <div className="flex items-center gap-2 py-2">
      <span className="h-0.5 flex-1 rounded-full" style={{ background: theme.borderLight }} />
      <MathText text={block.content.label} className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: theme.primary }} />
      <span className="h-0.5 flex-1 rounded-full" style={{ background: theme.borderLight }} />
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "text", key: "label", label: "Label" }],
  },
};
