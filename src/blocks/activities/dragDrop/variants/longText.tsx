import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniGenericOrder } from "../previews";

export function createDragLongTextBlock() {
  return createDragDropBlock(
    {
      label: "Sequencing",
      question: "Arrange the sequence so it reads clearly.",
      rows: [
        ["First, identify what the problem is asking."],
        ["Next, list the information that is given."],
        ["Then, choose a relationship that connects the information."],
        ["Finally, solve and check whether the answer makes sense."],
      ],
      correctExplanation: "This message shows when the sequence reads in the correct order.",
      incorrectExplanation: "This message shows when some parts are out of order.",
      hint: "This is a hint that your students see if they arrange the sequence incorrectly. You can remove this.",
    },
    "longText",
  );
}

export const dragLongTextVariant: BlockFamilyVariant = {
  id: "longText",
  label: "Sequencing",
  createBlock: createDragLongTextBlock,
  preview: renderMiniGenericOrder,
};
