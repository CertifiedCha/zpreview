import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragDiagram } from "../previews";

export function createDragDiagramBlock() {
  return createDragDropBlock(
    {
      label: "Diagram labeling",
      question: "Drag each label to the correct part of the diagram.",
      text: "Use x and y percentages in the row editor to position each target.",
      src: "",
      rows: [
        ["Peak", "50", "18"],
        ["Base", "50", "78"],
        ["Left slope", "24", "52"],
        ["Right slope", "76", "52"],
      ],
      correctExplanation: "Nice labeling. Each label is attached to the right target.",
      incorrectExplanation: "Some labels are not on their correct targets yet.",
      hint: "Place each label on the target that names the visible part.",
    },
    "diagram",
  );
}

export const dragDiagramVariant: BlockFamilyVariant = {
  id: "diagram",
  label: "Label diagram",
  createBlock: createDragDiagramBlock,
  preview: renderMiniDragDiagram,
};
