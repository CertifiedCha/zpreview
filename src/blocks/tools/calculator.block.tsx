import { Calculator } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { buttonTypographyFields, iconSize, makeBlock } from "../shared";

export const calculatorBlock: BlockDefinition = {
  type: "calculator",
  label: "Calculator",
  category: "tools",
  icon: <Calculator size={iconSize} />,
  thumbnail: {
    src: "/thumbnails/calculator.svg",
    alt: "Scientific calculator thumbnail",
  },
  defaultBlock: () =>
    makeBlock(
      "calculator",
      { label: "Show Calculator" },
      {
        style: {
          textAlign: "center",
          buttonFillColor: "#475569",
          buttonFontColor: "#ffffff",
          buttonFontSize: 12,
          shadowColor: "#1f2937",
        },
        settings: {
          customBlockGap: true,
          customHitboxInset: false,
        },
      },
    ),
  preview: (block, theme) => (
    <div className="flex justify-center py-2">
      <button className="rounded-full px-4 py-2 text-[11px] font-bold text-white" style={{ background: block.style.buttonFillColor ?? theme.primary, boxShadow: `0 2px 0 ${block.style.shadowColor ?? theme.shadow}` }} type="button">
        {block.content.label}
      </button>
    </div>
  ),
  config: {
    content: [{ section: "content", kind: "text", key: "label", label: "Button label" }],
    layout: [
      {
        section: "layout",
        kind: "select",
        target: "style",
        key: "textAlign",
        label: "Button alignment",
        options: [
          { label: "Left", value: "left" },
          { label: "Centered", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
    ],
    styleGroups: [
      {
        title: "Button",
        description: "Controls the calculator trigger button.",
        defaultOpen: true,
        fields: buttonTypographyFields,
      },
    ],
  },
};
