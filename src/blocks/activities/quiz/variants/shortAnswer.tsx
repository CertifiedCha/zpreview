import type { BlockFamilyVariant } from "../../../../types";
import { createQuizBaseBlock } from "../shared";
import { renderMiniQuiz } from "../previews";

export function createShortAnswerQuizBlock() {
  const block = createQuizBaseBlock();
  return {
    ...block,
    settings: { ...block.settings, quizVariant: "shortAnswer" as const, quizMarker: "letters" as const },
    content: {
      ...block.content,
      question: "If a vehicle accelerates at 2m/s^2, what speed does it reach in 5s?",
      answerText: "10",
    },
  };
}

export const shortAnswerQuizVariant: BlockFamilyVariant = {
  id: "shortAnswer",
  label: "Short answer",
  createBlock: createShortAnswerQuizBlock,
  preview: renderMiniQuiz,
};
