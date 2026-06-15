import { Rocket } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { defaultStylePresets, iconSize, makeBlock, paragraphTypographyFields, textAlignStylingField, titleTypographyFields } from "../shared";

export const sectionHeaderBlock: BlockDefinition = {
  type: "sectionHeader",
  label: "Section Header",
  category: "text",
  icon: <Rocket size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "sectionHeader",
      {
        label: "Section Label",
        icon: "",
        title: "Section Header",
        subtitle: "Add a short subtitle or guiding description.",
      },
      { settings: { interactive: true } },
    ),
  preview: (block, theme) => (
    <div className="space-y-2 py-1">
      {block.content.label && <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: theme.primary }}>{block.content.label}</p>}
      <div className="flex items-center gap-2">
        {block.content.icon && <span className="text-base leading-none">{block.content.icon}</span>}
        <p className="text-lg font-black text-zinc-950">{block.content.title}</p>
      </div>
      <p className={block.content.icon ? "pl-6 text-xs font-bold text-zinc-700" : "text-xs font-bold text-zinc-700"}>{block.content.subtitle}</p>
    </div>
  ),
  config: {
    content: [
      { section: "content", kind: "text", key: "label", label: "Eyebrow" },
      { section: "content", kind: "text", key: "icon", label: "Icon / emoji" },
      { section: "content", kind: "text", key: "title", label: "Title" },
      { section: "content", kind: "text", key: "subtitle", label: "Subtitle" },
    ],
    stylePresets: defaultStylePresets,
    styleGroups: [
      { title: "Text", defaultOpen: true, fields: [textAlignStylingField, ...titleTypographyFields, ...paragraphTypographyFields.slice(2)] },
    ],
  },
};
