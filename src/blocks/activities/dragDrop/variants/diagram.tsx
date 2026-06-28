import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragDiagram } from "../previews";

export function createDragDiagramBlock() {
  return createDragDropBlock(
    {
      label: "Diagram labeling",
      question: "Drag each label to the correct part of the diagram.",
      text: "Drag each label to its correct target on the image.",
      src: "",
      diagramImageWidthPercent: 100,
      diagramImageHeight: 320,
      rows: [
        ["Peak", "50", "18"],
        ["Base", "50", "78"],
        ["Left slope", "24", "52"],
        ["Right slope", "76", "52"],
      ],
      correctExplanation: "This message shows when every label is on the correct target.",
      incorrectExplanation: "This message shows when some labels are not on their targets yet.",
      hint: "This is a hint that your students see if they place a label incorrectly. You can remove this.",
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
