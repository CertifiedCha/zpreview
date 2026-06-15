import type { Block, BlockContent } from "../../../types";
import { makeBlock } from "../../shared";

export type DragVariant = NonNullable<Block["settings"]["dragVariant"]>;

export function createDragDropBlock(content: BlockContent, variant: DragVariant) {
  return makeBlock("dragDrop", content, defaultDragExtra(variant));
}

export function defaultDragExtra(variant: DragVariant): Partial<Block> {
  return {
    style: {
      shell: "plain",
      buttonFillColor: "#2563eb",
      buttonFontColor: "#ffffff",
      questionFontColor: "#27272a",
      choiceFontColor: "#27272a",
      radius: 14,
    },
    settings: { dragVariant: variant, quizButtonWidth: "full", retry: true, showPromptLabel: false },
  };
}

export function isDragVariant(block: Block, variants: DragVariant[]) {
  return variants.includes(block.settings.dragVariant ?? "sort");
}

export function applyDragVariantDefaults(block: Block, variant: DragVariant): Block {
  const next: Block = { ...block, settings: { ...block.settings, dragVariant: variant, quizButtonWidth: block.settings.quizButtonWidth ?? "full" } };

  const starter = {
    buckets: {
      question: "Sort each item into the correct bucket.",
      text: "Drag or tap each card into the best category.",
      answerText: "Bucket A, Bucket B",
      rows: [["Item 1", "Bucket A"], ["Item 2", "Bucket B"], ["Item 3", "Bucket A"], ["Item 4", "Bucket B"]],
    },
    pairs: {
      question: "Match each term with its correct description.",
      text: "",
      answerText: "",
      rows: [["Term 1", "Match 1"], ["Term 2", "Match 2"], ["Term 3", "Match 3"]],
    },
    diagram: {
      question: "Drag each label to the correct part of the diagram.",
      text: "Use x and y percentages to position each target.",
      answerText: "",
      rows: [["Label 1", "35", "35"], ["Label 2", "65", "35"], ["Label 3", "50", "70"]],
    },
    timeline: {
      question: "Arrange the events in chronological order.",
      text: "",
      answerText: "",
      rows: [["First event"], ["Second event"], ["Third event"], ["Final event"]],
    },
    equation: {
      question: "Build the correct expression.",
      text: "",
      answerText: "",
      rows: [["speed"], ["="], ["distance"], ["/"], ["time"]],
    },
    blanks: {
      question: "Drag words into the correct blanks.",
      text: "A scalar has ___ only, while a vector has ___ and ___.",
      answerText: "magnitude, magnitude, direction",
      rows: [],
      choices: [
        { id: "a", text: "magnitude" },
        { id: "b", text: "direction" },
        { id: "c", text: "color" },
        { id: "d", text: "shape" },
      ],
    },
    venn: {
      question: "Place each item into the best Venn region.",
      text: "",
      answerText: "Only A, Both, Only B",
      rows: [["Item A", "Only A"], ["Shared item", "Both"], ["Item B", "Only B"]],
    },
    hierarchy: {
      question: "Attach each node to its correct parent.",
      text: "",
      answerText: "",
      rows: [["Root", ""], ["Branch A", "Root"], ["Branch B", "Root"], ["Leaf", "Branch A"]],
    },
    longText: {
      question: "Arrange the text so it reads clearly.",
      text: "",
      answerText: "",
      rows: [["First sentence."], ["Second sentence."], ["Third sentence."], ["Final sentence."]],
    },
    sort: {
      question: "Put the steps in the correct order.",
      text: "",
      answerText: "",
      rows: [["First step"], ["Second step"], ["Third step"], ["Final step"]],
    },
  } satisfies Record<DragVariant, Partial<Block["content"]>>;

  return {
    ...next,
    content: {
      ...next.content,
      ...starter[variant],
    },
  };
}

export function dragRowSchema(block: Block) {
  if (isDragVariant(block, ["blanks"])) return undefined;
  if (isDragVariant(block, ["buckets", "venn"])) return { label: "Draggable cards", itemLabel: "Card", fields: ["Card text", "Correct region"], placeholders: ["New card", "Bucket A"] };
  if (isDragVariant(block, ["pairs"])) return { label: "Pairs", itemLabel: "Pair", fields: ["Left card", "Right match"], placeholders: ["New term", "New match"] };
  if (isDragVariant(block, ["hierarchy"])) return { label: "Hierarchy nodes", itemLabel: "Node", fields: ["Node", "Correct parent"], placeholders: ["New node", "Parent node"] };
  if (isDragVariant(block, ["diagram"])) return { label: "Diagram labels", itemLabel: "Label", fields: ["Label", "X percent", "Y percent"], placeholders: ["New label", "50", "50"] };
  return { label: "Correct order", itemLabel: "Item", fields: ["Item text"], placeholders: ["New item"] };
}
