import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragSort } from "../previews";

export function createDragBlanksBlock() {
  return createDragDropBlock(
    {
      label: "Blank activity",
      question: "Drag words into the correct blanks.",
      text: "A scalar has ___ only, while a vector has ___ and ___.",
      answerText: "magnitude, magnitude, direction",
      choices: [
        { id: "a", text: "magnitude" },
        { id: "b", text: "direction" },
        { id: "c", text: "color" },
        { id: "d", text: "shape" },
      ],
      correctExplanation: "Correct. Scalars have magnitude only; vectors also include direction.",
      incorrectExplanation: "Some blanks need different words.",
      hint: "Vectors add direction.",
    },
    "blanks",
  );
}

export const dragBlanksVariant: BlockFamilyVariant = {
  id: "blanks",
  label: "Drag to blanks",
  createBlock: createDragBlanksBlock,
  preview: renderMiniDragSort,
};
