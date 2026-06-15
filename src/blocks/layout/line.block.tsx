import { Minus } from "lucide-react";
import type { Block, BlockConfigField, BlockDefinition } from "../../types";
import { iconSize, makeBlock } from "../shared";

const lineStyleField: BlockConfigField = {
  section: "layout",
  kind: "select",
  target: "style",
  key: "lineStyle",
  label: "Line type",
  options: [
    { label: "Solid", value: "solid" },
    { label: "Dashed", value: "dashed" },
    { label: "Dotted", value: "dotted" },
    { label: "Double", value: "double" },
    { label: "Wavy", value: "wavy" },
  ],
};

const lineAlignField: BlockConfigField = {
  section: "layout",
  kind: "select",
  target: "style",
  key: "textAlign",
  label: "Alignment",
  options: [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ],
};

export const lineBlock: BlockDefinition = {
  type: "line",
  label: "Line",
  category: "layout",
  icon: <Minus size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "line",
      {},
      {
        style: {
          shell: "plain",
          borderColor: "#d4d4d8",
          lineStyle: "solid",
          lineThickness: 2,
          lineWidth: 100,
          textAlign: "center",
        },
      },
    ),
  preview: (block) => <div className="py-4">{renderLinePreview(block)}</div>,
  config: {
    layout: [
      lineStyleField,
      lineAlignField,
      {
        section: "layout",
        kind: "number",
        target: "style",
        key: "lineThickness",
        label: "Thickness",
        min: 1,
        max: 12,
        step: 1,
        defaultValue: 2,
      },
      {
        section: "layout",
        kind: "number",
        target: "style",
        key: "lineWidth",
        label: "Width",
        min: 10,
        max: 100,
        step: 5,
        defaultValue: 100,
      },
    ],
    styling: [
      {
        section: "styling",
        kind: "color",
        target: "style",
        key: "borderColor",
        label: "Line color",
        defaultColor: "#d4d4d8",
      },
    ],
    styleGroups: [
      {
        title: "Line",
        description: "Shape and placement of the rule.",
        defaultOpen: true,
        fields: [lineStyleField, lineAlignField],
      },
      {
        title: "Size",
        description: "How much space the line occupies.",
        defaultOpen: true,
        fields: [
          {
            section: "styling",
            kind: "number",
            target: "style",
            key: "lineThickness",
            label: "Thickness",
            min: 1,
            max: 12,
            step: 1,
            defaultValue: 2,
          },
          {
            section: "styling",
            kind: "number",
            target: "style",
            key: "lineWidth",
            label: "Width",
            min: 10,
            max: 100,
            step: 5,
            defaultValue: 100,
          },
        ],
      },
      {
        title: "Color",
        description: "Visual color of the line.",
        fields: [
          {
            section: "styling",
            kind: "color",
            target: "style",
            key: "borderColor",
            label: "Line color",
            defaultColor: "#d4d4d8",
          },
        ],
      },
    ],
  },
};

function renderLinePreview(block: Block) {
  const color = block.style.borderColor ?? "#d4d4d8";
  const thickness = block.style.lineThickness ?? 2;
  const width = `${block.style.lineWidth ?? 100}%`;

  if (block.style.lineStyle === "wavy") {
    return (
      <svg className="block" width={width} height={Math.max(12, thickness * 5)} viewBox="0 0 120 14" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 7 C10 1 20 13 30 7 S50 1 60 7 80 13 90 7 110 1 120 7" fill="none" stroke={color} strokeLinecap="round" strokeWidth={thickness} />
      </svg>
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        width,
        borderTop: `${thickness}px ${cssLineStyle(block.style.lineStyle)} ${color}`,
      }}
    />
  );
}

function cssLineStyle(style?: Block["style"]["lineStyle"]) {
  if (style === "dashed" || style === "dotted" || style === "double") return style;
  return "solid";
}
