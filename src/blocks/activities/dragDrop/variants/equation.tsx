import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniGenericOrder } from "../previews";

export function createDragEquationBlock() {
  return createDragDropBlock(
    {
      label: "Equation builder",
      question: "Build the correct expression.",
      rows: [["speed"], ["="], ["distance"], ["/"], ["time"]],
      correctExplanation: "Correct. The expression is built in the right order.",
      incorrectExplanation: "The expression is not ordered correctly yet.",
      hint: "Place the equals sign after the quantity being solved.",
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
