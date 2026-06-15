import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniGenericOrder } from "../previews";

export function createDragLongTextBlock() {
  return createDragDropBlock(
    {
      label: "Long text builder",
      question: "Arrange the text so it reads clearly.",
      rows: [
        ["First, identify what the problem is asking."],
        ["Next, list the information that is given."],
        ["Then, choose a relationship that connects the information."],
        ["Finally, solve and check whether the answer makes sense."],
      ],
      correctExplanation: "Correct. The text now flows in a clear order.",
      incorrectExplanation: "Some parts interrupt the flow.",
      hint: "Look for transition words like first, next, then, and finally.",
    },
    "longText",
  );
}

export const dragLongTextVariant: BlockFamilyVariant = {
  id: "longText",
  label: "Long text builder",
  createBlock: createDragLongTextBlock,
  preview: renderMiniGenericOrder,
};
