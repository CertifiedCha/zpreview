import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniGenericOrder } from "../previews";

export function createDragEquationBlock() {
  return createDragDropBlock(
    {
      label: "Equation builder",
      question: "Students arrange these pieces into the correct expression.",
      rows: [["first piece"], ["+"], ["second piece"], ["="], ["answer"]],
      correctExplanation: "This message shows when the expression is in the right order.",
      incorrectExplanation: "This message shows when the expression is not ordered correctly yet.",
      hint: "This is a hint that your students see if they build the expression incorrectly. You can remove this.",
    },
    "equation",
  );
}

export const dragEquationVariant: BlockFamilyVariant = {
  id: "equation",
  label: "Equation builder",
  createBlock: createDragEquationBlock,
  preview: renderMiniGenericOrder,
};
