import type { Block, BlockConfigField, BlockConfigGroup, BlockType, StylePreset } from "../../types";
import { uid } from "../../theme";

export const iconSize = 20;

export function makeBlock(type: BlockType, content: Block["content"], extra?: Partial<Block>): Block {
  return {
    id: uid(type),
    type,
    content,
    style: { shell: "plain", ...(extra?.style ?? {}) },
    settings: { ...(extra?.settings ?? {}) },
    pinned: false,
    locked: false,
    children: extra?.children,
    miniPages: extra?.miniPages,
    activeMiniPageId: extra?.activeMiniPageId,
  };
}

export const shellStylingFields: BlockConfigField[] = [
  {
    section: "styling",
    kind: "select",
    target: "style",
    key: "shell",
    label: "Container style",
    options: [
      { label: "Plain content", value: "plain" },
      { label: "White card", value: "card" },
      { label: "Tinted panel", value: "tinted" },
      { label: "Outline", value: "outline" },
      { label: "Embossed", value: "embossed" },
    ],
  },
];

export const defaultStylePresets: StylePreset[] = [
  {
    id: "plain",
    label: "Plain",
    style: {
      shell: "plain",
      fillColor: undefined,
      borderColor: undefined,
      shadowColor: undefined,
      borderWidth: undefined,
      radius: undefined,
    },
  },
  {
    id: "card",
    label: "Card",
    style: {
      shell: "card",
      fillColor: "#ffffff",
      borderColor: "#dedede",
      shadowColor: "#d4d4d8",
      borderWidth: 2,
      radius: 20,
    },
  },
  {
    id: "tinted",
    label: "Soft Tint",
    style: {
      shell: "tinted",
      fillColor: "#eff6ff",
      borderColor: "#bfdbfe",
      shadowColor: "#93c5fd",
      borderWidth: 2,
      radius: 20,
    },
  },
  {
    id: "outline",
    label: "Outline",
    style: {
      shell: "outline",
      fillColor: undefined,
      borderColor: "#2563eb",
      shadowColor: undefined,
      borderWidth: 2,
      radius: 18,
    },
  },
  {
    id: "embossed",
    label: "Embossed",
    style: {
      shell: "embossed",
      fillColor: "#2563eb",
      borderColor: "#2563eb",
      shadowColor: "#1e3a8a",
      fontColor: "#ffffff",
      titleFontColor: "#ffffff",
      subtitleFontColor: "#dbeafe",
      bodyFontColor: "#ffffff",
      questionFontColor: "#ffffff",
      choiceFontColor: "#ffffff",
      borderWidth: 0,
      radius: 999,
    },
  },
];

export const textAlignStylingField: BlockConfigField = {
  section: "styling",
  kind: "select",
  target: "style",
  key: "textAlign",
  label: "Text alignment",
  options: [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ],
};

export const buttonAlignmentLayoutField: BlockConfigField = {
  section: "layout",
  kind: "select",
  target: "style",
  key: "textAlign",
  label: "Button alignment",
  defaultValue: "center",
  options: [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ],
};

export const columnLayoutField: BlockConfigField = {
  section: "layout",
  kind: "select",
  target: "style",
  key: "columns",
  label: "Column width",
  options: [
    { label: "Equal", value: "equal" },
    { label: "Left wide", value: "leftWide" },
    { label: "Right wide", value: "rightWide" },
  ],
};

export const commonVisualStyleFields: BlockConfigField[] = [
  {
    section: "styling",
    kind: "number",
    target: "style",
    key: "fontSize",
    label: "Base font size",
    min: 10,
    max: 72,
    step: 1,
    defaultValue: 16,
  },
  {
    section: "styling",
    kind: "color",
    target: "style",
    key: "fontColor",
    label: "Base font color",
    defaultColor: "#3f3f46",
  },
  {
    section: "styling",
    kind: "color",
    target: "style",
    key: "fillColor",
    label: "Fill color",
    defaultColor: "#ffffff",
  },
  {
    section: "styling",
    kind: "color",
    target: "style",
    key: "borderColor",
    label: "Border color",
    defaultColor: "#e4e4e7",
  },
  {
    section: "styling",
    kind: "color",
    target: "style",
    key: "shadowColor",
    label: "Depth color",
    defaultColor: "#d4d4d8",
  },
  {
    section: "styling",
    kind: "number",
    target: "style",
    key: "borderWidth",
    label: "Border width",
    min: 0,
    max: 12,
    step: 1,
    defaultValue: 0,
  },
  {
    section: "styling",
    kind: "number",
    target: "style",
    key: "radius",
    label: "Corner radius",
    min: 0,
    max: 40,
    step: 1,
    defaultValue: 16,
  },
];

export const textBlockStylingFields: BlockConfigField[] = [...shellStylingFields, textAlignStylingField, ...commonVisualStyleFields];

export function fontSizeField(key: keyof Block["style"], label: string, defaultValue: number, min = 10, max = 72): BlockConfigField {
  return { section: "styling", kind: "number", target: "style", key, label, min, max, step: 1, defaultValue };
}

export function fontColorField(key: keyof Block["style"], label: string, defaultColor: string): BlockConfigField {
  return { section: "styling", kind: "color", target: "style", key, label, defaultColor };
}

export const titleTypographyFields: BlockConfigField[] = [
  fontSizeField("titleFontSize", "Title font size", 40, 16, 96),
  fontColorField("titleFontColor", "Title font color", "#09090b"),
  fontSizeField("subtitleFontSize", "Subtitle font size", 16, 10, 48),
  fontColorField("subtitleFontColor", "Subtitle font color", "#52525b"),
];

export const paragraphTypographyFields: BlockConfigField[] = [
  fontSizeField("titleFontSize", "Heading font size", 22, 12, 72),
  fontColorField("titleFontColor", "Heading font color", "#09090b"),
  fontSizeField("bodyFontSize", "Body font size", 16, 10, 48),
  fontColorField("bodyFontColor", "Body font color", "#3f3f46"),
];

export const quizTypographyFields: BlockConfigField[] = [
  fontSizeField("questionFontSize", "Question font size", 18, 12, 56),
  fontColorField("questionFontColor", "Question font color", "#09090b"),
  fontSizeField("choiceFontSize", "Choice font size", 15, 10, 36),
  fontColorField("choiceFontColor", "Choice font color", "#3f3f46"),
];

export const buttonTypographyFields: BlockConfigField[] = [
  fontSizeField("buttonFontSize", "Button font size", 14, 10, 40),
  fontColorField("buttonFontColor", "Button text color", "#ffffff"),
  fontColorField("buttonFillColor", "Button fill color", "#2563eb"),
];

export const containerStyleGroup: BlockConfigGroup = {
  title: "Container",
  description: "Controls the block surface around the content.",
  defaultOpen: true,
  fields: [...shellStylingFields, ...commonVisualStyleFields.filter((field) => ["fillColor", "borderColor", "shadowColor", "borderWidth", "radius"].includes(String(field.key)))],
};

export const baseTypographyGroup: BlockConfigGroup = {
  title: "Base Typography",
  description: "Fallback text styling used by the block unless a part overrides it.",
  fields: [textAlignStylingField, ...commonVisualStyleFields.filter((field) => ["fontSize", "fontColor"].includes(String(field.key)))],
};
