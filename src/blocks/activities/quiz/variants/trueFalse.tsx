import type { BlockFamilyVariant } from "../../../../types";
import { createQuizBaseBlock } from "../shared";
import { renderMiniQuiz } from "../previews";

export function createTrueFalseQuizBlock() {
  const block = createQuizBaseBlock();
  return {
    ...block,
    settings: { ...block.settings, quizVariant: "trueFalse" as const, quizMarker: "trueFalse" as const, quizChoiceColumns: "two" as const },
    content: {
      ...block.content,
      question: "Students choose whether this statement is true or false.",
      correctChoiceId: "true",
    },
  };
}

export const trueFalseQuizVariant: BlockFamilyVariant = {
  id: "trueFalse",
  label: "True / False",
  createBlock: createTrueFalseQuizBlock,
  preview: renderMiniQuiz,
};
