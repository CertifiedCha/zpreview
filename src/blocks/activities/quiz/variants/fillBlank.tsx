import type { BlockFamilyVariant } from "../../../../types";
import { createQuizBaseBlock } from "../shared";
import { renderMiniQuiz } from "../previews";

export function createFillBlankQuizBlock() {
  const block = createQuizBaseBlock();
  return {
    ...block,
    settings: { ...block.settings, quizVariant: "fillBlank" as const, quizMarker: "letters" as const, quizButtonWidth: "full" as const, fillBlankMode: "drag" as const },
    content: {
      ...block.content,
      question: "Students drag words or tap choices to fill the blanks.",
      text: "Add a sentence with a blank like ___ and another blank like ___.",
      answerText: "first answer, second answer",
      choices: [
        { id: "a", text: "first answer" },
        { id: "b", text: "second answer" },
        { id: "c", text: "extra option" },
        { id: "d", text: "another option" },
      ],
    },
  };
}

export const fillBlankQuizVariant: BlockFamilyVariant = {
  id: "fillBlank",
  label: "Fill in the blank",
  createBlock: createFillBlankQuizBlock,
  preview: renderMiniQuiz,
};
