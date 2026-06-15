import { BookOpen } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { baseTypographyGroup, containerStyleGroup, defaultStylePresets, iconSize, makeBlock, paragraphTypographyFields } from "../shared";

export const calloutBlock: BlockDefinition = {
  type: "callout",
  label: "Callout",
  category: "content",
  icon: <BookOpen size={iconSize} />,
  defaultBlock: () =>
    makeBlock("callout", {
      title: "Key idea",
      text: "Use this space for a tip, reminder, or important note.",
    }),
  preview: (block, theme) => (
    <div className="p-1">
      <p className="text-xs font-bold" style={{ color: theme.primary }}>
        {block.content.title}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-zinc-700">{block.content.text}</p>
    </div>
  ),
  config: {
    content: [
      { section: "content", kind: "text", key: "title", label: "Title" },
      { section: "content", kind: "textarea", key: "text", label: "Body text" },
    ],
    stylePresets: defaultStylePresets,
    styleGroups: [
      containerStyleGroup,
      baseTypographyGroup,
      {
        title: "Callout Title",
        description: "Overrides for the callout heading.",
        fields: paragraphTypographyFields.slice(0, 2),
      },
      {
        title: "Callout Body",
        description: "Overrides for the callout body.",
        defaultOpen: true,
        fields: paragraphTypographyFields.slice(2),
      },
    ],
  },
};
