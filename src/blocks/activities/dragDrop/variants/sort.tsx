import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragSort } from "../previews";

export function createDragSortBlock() {
  return createDragDropBlock(
    {
      label: "Ordering activity",
      question: "Put the steps in the correct order.",
      rows: [["First item"], ["Second item"], ["Third item"], ["Final item"]],
      correctExplanation: "This message shows when the order is correct.",
      incorrectExplanation: "This message shows when a few items are out of order.",
      hint: "This is a hint that your students see if they arrange items incorrectly. You can remove this.",
    },
    "sort",
  );
}

export const dragSortVariant: BlockFamilyVariant = {
  id: "sort",
  label: "Drag to sort",
  createBlock: createDragSortBlock,
  preview: renderMiniDragSort,
};
