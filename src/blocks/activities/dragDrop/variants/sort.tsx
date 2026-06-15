import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragSort } from "../previews";

export function createDragSortBlock() {
  return createDragDropBlock(
    {
      label: "Ordering activity",
      question: "Put the steps in the correct order.",
      rows: [["Observe the situation"], ["Identify the useful quantities"], ["Choose the correct relationship"], ["Solve and check the answer"]],
      correctExplanation: "Nice ordering. The process moves from observing to identifying, choosing, then solving.",
      incorrectExplanation: "A few steps are out of sequence. Try following the problem-solving flow from start to finish.",
      hint: "Start with what you can see before choosing a formula.",
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
