import { Sigma } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { baseTypographyGroup, containerStyleGroup, defaultStylePresets, fontColorField, fontSizeField, iconSize, makeBlock } from "../shared";

export const equationBlock: BlockDefinition = {
  type: "equation",
  label: "Equation",
  category: "math",
  icon: <Sigma size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "equation",
      {
        mathSource: "\\lim_{x\\to2} x^2 = 4",
        caption: "Optional explanation or label",
      },
      { settings: { mathDisplay: "display", showCaption: false }, style: { textAlign: "center", fontSize: 24 } },
    ),
  preview: () => (
    <div className="py-2 text-center">
      <div className="text-2xl font-bold text-zinc-950">f(x)=x^2</div>
      <p className="mt-1 text-[11px] font-bold text-zinc-400">Equation</p>
    </div>
  ),
  config: {
    content: [
      { section: "content", kind: "textarea", key: "mathSource", label: "Math source" },
      { section: "content", kind: "text", key: "caption", label: "Caption" },
    ],
    layout: [
      {
        section: "layout",
        kind: "select",
        target: "settings",
        key: "mathDisplay",
        label: "Display mode",
        options: [
          { label: "Display", value: "display" },
          { label: "Inline", value: "inline" },
        ],
      },
      { section: "layout", kind: "toggle", target: "settings", key: "showCaption", label: "Show caption" },
    ],
    stylePresets: defaultStylePresets,
    styleGroups: [
      baseTypographyGroup,
      {
        title: "Equation",
        description: "Controls the rendered formula.",
        defaultOpen: true,
        fields: [fontSizeField("fontSize", "Formula size", 24, 14, 80), fontColorField("fontColor", "Formula color", "#09090b")],
      },
      containerStyleGroup,
    ],
  },
};
