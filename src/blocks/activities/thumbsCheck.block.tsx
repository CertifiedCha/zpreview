import { ThumbsUp } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { containerStyleGroup, defaultStylePresets, iconSize, makeBlock, paragraphTypographyFields } from "../shared";

export const thumbsCheckBlock: BlockDefinition = {
  type: "thumbsCheck",
  label: "Thumbs Check",
  category: "assessment",
  icon: <ThumbsUp size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "thumbsCheck",
      { question: "Do you understand this concept?" },
      { style: { shell: "card", radius: 28 } },
    ),
  preview: (block, theme) => (
    <div className="rounded-2xl border bg-white p-5 text-center">
      <p className="text-sm font-black text-zinc-800">{block.content.question}</p>
      <div className="mt-4 flex justify-center gap-5 text-2xl"><span>👎</span><span style={{ color: theme.primary }}>👍</span></div>
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "textarea", key: "question", label: "Question" }],
    stylePresets: defaultStylePresets,
    styleGroups: [containerStyleGroup, { title: "Text", defaultOpen: true, fields: paragraphTypographyFields.slice(2) }],
  },
};
