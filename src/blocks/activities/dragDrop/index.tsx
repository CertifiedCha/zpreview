import { GripVertical } from "lucide-react";
import type { Block, BlockDefinition, ThemeTokens } from "../../../types";
import { baseTypographyGroup, buttonTypographyFields, containerStyleGroup, iconSize, quizTypographyFields } from "../../shared";
import { dragRowSchema, isDragVariant } from "./shared";
import { renderMiniDragBuckets, renderMiniDragDiagram, renderMiniDragPairs, renderMiniDragVenn, renderMiniGenericOrder } from "./previews";
import { createDragSortBlock, dragDropFamilyVariants } from "./variants";

export const dragDropBlock: BlockDefinition = {
  type: "dragDrop",
  label: "Drag & Drop",
  category: "assessment",
  icon: <GripVertical size={iconSize} />,
  defaultBlock: createDragSortBlock,
  preview: (block, theme) => renderDragPreview(block, theme),
  family: {
    label: "Drag & Drop",
    variants: dragDropFamilyVariants,
  },
  config: {
    content: [
      {
        section: "content",
        kind: "select",
        target: "settings",
        key: "dragVisualVariant",
        label: "Variant",
        disabled: (block) => !isDragVariant(block, ["timeline", "venn"]),
        optionsFor: (block) => isDragVariant(block, ["timeline", "venn"])
          ? [{ label: "Text", value: "default" }, { label: "Picture only", value: "image" }, { label: "Picture + text", value: "imageText" }]
          : [{ label: "Default", value: "default" }],
        options: [{ label: "Default", value: "default" }],
      },
      { section: "content", kind: "select", target: "settings", key: "vennCircleCount", label: "Circles", visibleWhen: (block) => isDragVariant(block, ["venn"]), options: [{ label: "Two circles", value: "two" }, { label: "Three circles", value: "three" }] },
      { section: "content", kind: "text", key: "vennLabels", label: "Circle labels (comma-separated)", visibleWhen: (block) => isDragVariant(block, ["venn"]) },
      { section: "content", kind: "toggle", target: "settings", key: "showTimelineYears", label: "Show dates", defaultChecked: false, visibleWhen: (block) => isDragVariant(block, ["timeline"]) },
      { section: "content", kind: "toggle", target: "settings", key: "answerTimelineDates", label: "Students answer dates", defaultChecked: false, visibleWhen: (block) => isDragVariant(block, ["timeline"]) },
      { section: "content", kind: "textarea", key: "question", label: "Prompt" },
      { section: "content", kind: "textarea", key: "text", label: "Supporting text", visibleWhen: (block) => isDragVariant(block, ["buckets", "diagram", "blanks", "venn"]) },
      { section: "content", kind: "text", key: "answerText", label: "Bucket names / answers (comma-separated)", visibleWhen: (block) => isDragVariant(block, ["buckets", "blanks", "venn"]) },
    ],
    layout: [
      {
        section: "layout",
        kind: "select",
        target: "settings",
        key: "quizButtonWidth",
        label: "Check button width",
        options: [
          { label: "Inline", value: "inline" },
          { label: "Full width", value: "full" },
        ],
      },
    ],
    feedback: [
      { section: "feedback", kind: "textarea", key: "hint", label: "Hint after mistake" },
      { section: "feedback", kind: "textarea", key: "correctExplanation", label: "Correct explanation" },
      { section: "feedback", kind: "textarea", key: "incorrectExplanation", label: "Incorrect explanation" },
      { section: "feedback", kind: "toggle", target: "settings", key: "retry", label: "Allow retry" },
    ],
    styleGroups: [
      containerStyleGroup,
      baseTypographyGroup,
      {
        title: "Prompt Text",
        description: "Overrides for the activity prompt.",
        defaultOpen: true,
        fields: quizTypographyFields.slice(0, 2),
      },
      {
        title: "Card Text",
        description: "Overrides for draggable cards.",
        fields: quizTypographyFields.slice(2),
      },
      {
        title: "Button",
        description: "Controls the check button.",
        fields: buttonTypographyFields,
      },
    ],
    rowSchema: dragRowSchema,
    contentControls: (block) => {
      if (isDragVariant(block, ["blanks"])) return ["dragBlankChoices"];
      if (isDragVariant(block, ["diagram"])) return [];
      return ["rows"];
    },
  },
};

function renderDragPreview(block: Block, theme: ThemeTokens) {
  if (block.settings.dragVariant === "buckets") return renderMiniDragBuckets(block, theme);
  if (block.settings.dragVariant === "pairs" || block.settings.dragVariant === "hierarchy") return renderMiniDragPairs(block, theme);
  if (block.settings.dragVariant === "diagram") return renderMiniDragDiagram(block, theme);
  if (block.settings.dragVariant === "venn") return renderMiniDragVenn(block, theme);
  return renderMiniGenericOrder(block, theme);
}
