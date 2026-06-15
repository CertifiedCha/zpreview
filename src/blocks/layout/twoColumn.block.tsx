import { Columns2, Rows3 } from "lucide-react";
import type { Block, BlockDefinition } from "../../types";
import { columnLayoutField, iconSize, makeBlock } from "../shared";

function createDefaultNestedParagraph(text: string): Block {
  return makeBlock("paragraph", {
    text,
  });
}

export const twoColumnBlock: BlockDefinition = {
  type: "twoColumn",
  label: "Two Columns",
  category: "layout",
  icon: <Columns2 size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "twoColumn",
      {},
      {
        settings: { mobileStack: true },
          children: { left: [createDefaultNestedParagraph("Drop blocks here or edit this starter text.")], right: [createDefaultNestedParagraph("Drop blocks here or edit this starter text.")] },
      },
    ),
  preview: (_block, theme) => (
    <div className="grid min-h-32 grid-cols-2 gap-3 py-2">
      <div className="rounded-xl p-3" style={{ background: theme.bgLight }}>
        <Rows3 size={16} style={{ color: theme.primary }} />
        <div className="mt-3 space-y-1.5">
          <span className="block h-2 w-4/5 rounded-full bg-zinc-300/80" />
          <span className="block h-2 w-3/5 rounded-full bg-zinc-300/60" />
          <span className="block h-2 w-2/3 rounded-full bg-zinc-300/50" />
        </div>
      </div>
      <div className="rounded-xl p-3" style={{ background: theme.bgLight }}>
        <Rows3 size={16} style={{ color: theme.primary }} />
        <div className="mt-3 space-y-1.5">
          <span className="block h-2 w-3/4 rounded-full bg-zinc-300/80" />
          <span className="block h-2 w-2/3 rounded-full bg-zinc-300/60" />
          <span className="block h-2 w-1/2 rounded-full bg-zinc-300/50" />
        </div>
      </div>
    </div>
  ),
  config: {
    layout: [
      columnLayoutField,
      { section: "layout", kind: "toggle", target: "settings", key: "mobileStack", label: "Stack columns on mobile" },
    ],
  },
};
