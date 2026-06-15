import { GripVertical } from "lucide-react";
import type { Block, BlockDefinition, ThemeTokens } from "../../../types";
import { baseTypographyGroup, buttonTypographyFields, containerStyleGroup, iconSize, quizTypographyFields } from "../../shared";
import { applyDragVariantDefaults, dragRowSchema, isDragVariant, type DragVariant } from "./shared";
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
        key: "dragVariant",
        label: "Activity type",
        applyChange: (block, value) => applyDragVariantDefaults(block, value as DragVariant),
        options: [
          { label: "Drag to sort", value: "sort" },
          { label: "Drag to buckets", value: "buckets" },
          { label: "Match pairs", value: "pairs" },
          { label: "Label diagram", value: "diagram" },
          { label: "Timeline order", value: "timeline" },
          { label: "Equation builder", value: "equation" },
          { label: "Drag to blanks", value: "blanks" },
          { label: "Venn sort", value: "venn" },
          { label: "Hierarchy builder", value: "hierarchy" },
          { label: "Long text builder", value: "longText" },
        ],
      },
      { section: "content", kind: "text", key: "label", label: "Prompt label" },
      { section: "content", kind: "textarea", key: "question", label: "Prompt" },
      { section: "content", kind: "textarea", key: "text", label: "Supporting text", visibleWhen: (block) => isDragVariant(block, ["buckets", "diagram", "blanks", "venn"]) },
      { section: "content", kind: "text", key: "answerText", label: "Bucket names / answers (comma-separated)", visibleWhen: (block) => isDragVariant(block, ["buckets", "blanks", "venn"]) },
      { section: "content", kind: "text", key: "src", label: "Diagram image URL", visibleWhen: (block) => isDragVariant(block, ["diagram"]) },
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
      { section: "layout", kind: "toggle", target: "settings", key: "showPromptLabel", label: "Show prompt label" },
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
    contentControls: (block) => (isDragVariant(block, ["blanks"]) ? ["dragBlankChoices"] : ["rows"]),
  },
};

function renderDragPreview(block: Block, theme: ThemeTokens) {
  if (block.settings.dragVariant === "buckets") return renderMiniDragBuckets(block, theme);
  if (block.settings.dragVariant === "pairs" || block.settings.dragVariant === "hierarchy") return renderMiniDragPairs(block, theme);
  if (block.settings.dragVariant === "diagram") return renderMiniDragDiagram(block, theme);
  if (block.settings.dragVariant === "venn") return renderMiniDragVenn(block, theme);
  return renderMiniGenericOrder(block, theme);
}
