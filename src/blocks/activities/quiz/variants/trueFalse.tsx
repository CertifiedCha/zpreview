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
      question: "A scalar quantity has direction.",
      correctChoiceId: "false",
    },
  };
}

export const trueFalseQuizVariant: BlockFamilyVariant = {
  id: "trueFalse",
  label: "True / False",
  createBlock: createTrueFalseQuizBlock,
  preview: renderMiniQuiz,
};
