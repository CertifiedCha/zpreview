import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragSort } from "../previews";

export function createDragBlanksBlock() {
  return createDragDropBlock(
    {
      label: "Blank activity",
      question: "Students drag words into the correct blanks.",
      text: "Add a sentence with a blank like ___ and another blank like ___.",
      answerText: "first answer, second answer",
      choices: [
        { id: "a", text: "first answer" },
        { id: "b", text: "second answer" },
        { id: "c", text: "extra option" },
        { id: "d", text: "another option" },
      ],
      correctExplanation: "This message shows when every blank is correct.",
      incorrectExplanation: "This message shows when some blanks need another try.",
      hint: "This is a hint that your students see if they place a word incorrectly. You can remove this.",
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
