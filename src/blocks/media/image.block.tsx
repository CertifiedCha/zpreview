import { Image } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { containerStyleGroup, defaultStylePresets, fontColorField, fontSizeField, iconSize, makeBlock } from "../shared";

export const imageBlock: BlockDefinition = {
  type: "image",
  label: "Image",
  category: "multimedia",
  icon: <Image size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "image",
      {
        alt: "Image placeholder",
        annotations: [],
      },
      { settings: { imageFit: "fitWidth", annotationTool: "pen", annotationMode: false }, style: { accent: "#2563eb", lineThickness: 3 } },
    ),
  preview: (_block, theme) => (
    <div className="rounded-2xl p-4 text-center" style={{ background: theme.bgLight }}>
      <Image className="mx-auto mb-2" size={26} style={{ color: theme.primary }} />
      <p className="text-xs font-bold text-zinc-700">Choose or drop image here</p>
    </div>
  ),
  config: {
    layout: [
      {
        section: "layout",
        kind: "select",
        target: "settings",
        key: "imageFit",
        label: "Image fit",
        options: [
          { label: "Fit width", value: "fitWidth" },
          { label: "Contain", value: "contain" },
          { label: "Cover", value: "cover" },
          { label: "Fill", value: "fill" },
        ],
      },
      { section: "layout", kind: "toggle", target: "settings", key: "annotationMode", label: "Draw on image" },
      {
        section: "layout",
        kind: "select",
        target: "settings",
        key: "annotationTool",
        label: "Drawing tool",
        options: [
          { label: "Pen", value: "pen" },
          { label: "Arrow", value: "arrow" },
          { label: "Text", value: "text" },
        ],
      },
    ],
    stylePresets: defaultStylePresets,
    styleGroups: [
      {
        title: "Annotation",
        description: "Creator drawing overlay tools.",
        defaultOpen: true,
        fields: [fontColorField("accent", "Annotation color", "#2563eb"), fontSizeField("lineThickness", "Stroke size", 3, 1, 12)],
      },
      containerStyleGroup,
    ],
  },
};
