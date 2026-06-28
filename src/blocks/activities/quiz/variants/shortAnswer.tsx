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
      question: "Students type a short answer to this question.",
      answerText: "Expected answer",
    },
  };
}

export const shortAnswerQuizVariant: BlockFamilyVariant = {
  id: "shortAnswer",
  label: "Short answer",
  createBlock: createShortAnswerQuizBlock,
  preview: renderMiniQuiz,
};
