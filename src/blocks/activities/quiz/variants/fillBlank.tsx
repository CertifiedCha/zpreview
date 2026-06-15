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
      question: "Drag words or tap to place them in the correct blanks.",
      text: "The chemical formula for water is ___ and carbon dioxide is ___.",
      answerText: "H2O, CO2",
      choices: [
        { id: "a", text: "CO2" },
        { id: "b", text: "O2" },
        { id: "c", text: "NaCl" },
        { id: "d", text: "H2O" },
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
