import { AlignLeft } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { baseTypographyGroup, containerStyleGroup, defaultStylePresets, fontColorField, fontSizeField, iconSize, makeBlock } from "../shared";

export const paragraphBlock: BlockDefinition = {
  type: "paragraph",
  label: "Paragraph",
  category: "text",
  icon: <AlignLeft size={iconSize} />,
  defaultBlock: () =>
    makeBlock("paragraph", {
      text: "Write your paragraph here, explanation, description...",
    }),
  preview: (block) => <p className="text-[13px] font-medium leading-relaxed text-[#0b0b0b]">{block.content.text}</p>,
  config: {
    content: [{ section: "content", kind: "textarea", key: "text", label: "Paragraph text" }],
    stylePresets: defaultStylePresets,
    styleGroups: [
      baseTypographyGroup,
      {
        title: "Body Text",
        description: "Overrides for this paragraph text.",
        defaultOpen: true,
        fields: [fontSizeField("bodyFontSize", "Paragraph font size", 16, 10, 48), fontColorField("bodyFontColor", "Paragraph font color", "#0b0b0b")],
      },
      containerStyleGroup,
    ],
  },
};
