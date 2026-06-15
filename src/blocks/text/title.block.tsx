import { Heading1 } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { baseTypographyGroup, containerStyleGroup, defaultStylePresets, iconSize, makeBlock, titleTypographyFields } from "../shared";

export const titleBlock: BlockDefinition = {
  type: "title",
  label: "Title",
  category: "text",
  icon: <Heading1 size={iconSize} />,
  defaultBlock: () =>
    makeBlock("title", {
      title: "Title Text",
      subtitle: "Body text goes here (Optional)...",
    }),
  preview: (block) => (
    <div className="py-2 text-center">
      <h2 className="text-2xl font-bold leading-tight text-zinc-950">{block.content.title}</h2>
      <p className="mt-2 text-sm font-medium text-zinc-500">{block.content.subtitle}</p>
    </div>
  ),
  config: {
    content: [
      { section: "content", kind: "text", key: "title", label: "Title" },
      { section: "content", kind: "text", key: "subtitle", label: "Subtitle" },
    ],
    stylePresets: defaultStylePresets,
    styleGroups: [
      containerStyleGroup,
      baseTypographyGroup,
      {
        title: "Title Text",
        description: "Overrides for the main title only.",
        defaultOpen: true,
        fields: titleTypographyFields.slice(0, 2),
      },
      {
        title: "Subtitle Text",
        description: "Overrides for the optional subtitle only.",
        fields: titleTypographyFields.slice(2),
      },
    ],
  },
};
