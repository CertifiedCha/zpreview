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
    settings: { dragVariant: variant, dragVisualVariant: "default", quizButtonWidth: "full", retry: true, ...(variant === "timeline" ? { showTimelineYears: false, answerTimelineDates: false } : {}), ...(variant === "venn" ? { vennCircleCount: "two" as const } : {}) },
  };
}

export function isDragVariant(block: Block, variants: DragVariant[]) {
  return variants.includes(block.settings.dragVariant ?? "sort");
}

export function applyDragVariantDefaults(block: Block, variant: DragVariant): Block {
  const next: Block = { ...block, settings: { ...block.settings, dragVariant: variant, quizButtonWidth: block.settings.quizButtonWidth ?? "full" } };

  const starter = {
    buckets: {
      question: "Students sort each item into the correct category.",
      text: "Drag items to a category, or tap an item and then tap a category",
      answerText: "Category A, Category B",
      rows: [["Item for category A", "Category A"], ["Item for category B", "Category B"], ["Another category A item", "Category A"], ["Another category B item", "Category B"]],
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
      rows: [["First event", "Date 1"], ["Second event", "Date 2"], ["Third event", "Date 3"], ["Final event", "Date 4"]],
    },
    equation: {
      question: "Students arrange these pieces into the correct expression.",
      text: "",
      answerText: "",
      rows: [["first piece"], ["+"], ["second piece"], ["="], ["answer"]],
    },
    blanks: {
      question: "Students drag words into the correct blanks.",
      text: "Add a sentence with a blank like ___ and another blank like ___.",
      answerText: "first answer, second answer",
      rows: [],
      choices: [
        { id: "a", text: "first answer" },
        { id: "b", text: "second answer" },
        { id: "c", text: "extra option" },
        { id: "d", text: "another option" },
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
      question: "Arrange the sequence so it reads clearly.",
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
  if (isDragVariant(block, ["venn"])) return { label: "Draggable cards", itemLabel: "Card", fields: ["Card text", "Correct region", "Image source", "Image alt text", "Image width (%)"], placeholders: ["New card", "Only A", "", "", "100"] };
  if (isDragVariant(block, ["buckets"])) return { label: "Draggable cards", itemLabel: "Card", fields: ["Card text", "Correct region"], placeholders: ["New card", "Bucket A"] };
  if (isDragVariant(block, ["pairs"])) return { label: "Pairs", itemLabel: "Pair", fields: ["Left card", "Right match"], placeholders: ["New term", "New match"] };
  if (isDragVariant(block, ["hierarchy"])) return { label: "Hierarchy nodes", itemLabel: "Node", fields: ["Node", "Correct parent"], placeholders: ["New node", "Parent node"] };
  if (isDragVariant(block, ["diagram"])) return { label: "Diagram labels", itemLabel: "Label", fields: ["Label", "X percent", "Y percent"], placeholders: ["New label", "50", "50"] };
  if (isDragVariant(block, ["timeline"])) return { label: "Correct order", itemLabel: "Event", fields: ["Event text", "Date"], placeholders: ["New event", "Date"] };
  return { label: "Correct order", itemLabel: "Item", fields: ["Item text"], placeholders: ["New item"] };
}
