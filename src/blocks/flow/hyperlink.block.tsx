import { Link2 } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { baseTypographyGroup, fontColorField, fontSizeField, iconSize, makeBlock, textAlignStylingField } from "../shared";

export const hyperlinkBlock: BlockDefinition = {
  type: "hyperlink",
  label: "Hyperlink",
  category: "multimedia",
  icon: <Link2 size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "hyperlink",
      {
        linkLabel: "Open resource",
        href: "https://example.com",
      },
      { style: { textAlign: "left", fontColor: "#2563eb", fontSize: 16 } },
    ),
  preview: (block, theme) => (
    <div className="py-2">
      <span className="inline-flex items-center gap-2 text-xs font-bold" style={{ color: theme.primary }}>
        <Link2 size={13} />
        {block.content.linkLabel}
      </span>
    </div>
  ),
  config: {
    content: [
      { section: "content", kind: "text", key: "linkLabel", label: "Link label" },
      { section: "content", kind: "text", key: "href", label: "URL" },
    ],
    stylePresets: [
      {
        id: "minimal-link",
        label: "Blue text",
        style: { shell: "plain", textAlign: "left", fontColor: "#2563eb", fontSize: 16, fillColor: undefined, borderColor: undefined, shadowColor: undefined, buttonFillColor: undefined, buttonFontColor: undefined },
      },
      {
        id: "quiet-link",
        label: "Quiet text",
        style: { shell: "plain", textAlign: "left", fontColor: "#52525b", fontSize: 16, fillColor: undefined, borderColor: undefined, shadowColor: undefined, buttonFillColor: undefined, buttonFontColor: undefined },
      },
    ],
    styleGroups: [
      {
        title: "Link",
        description: "Placement of the standalone link.",
        defaultOpen: true,
        fields: [textAlignStylingField, fontSizeField("fontSize", "Link font size", 16, 10, 48), fontColorField("fontColor", "Link color", "#2563eb")],
      },
      baseTypographyGroup,
    ],
  },
};
