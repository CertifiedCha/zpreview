import type { BlockFamilyVariant } from "../../../../types";
import { createQuizBaseBlock } from "../shared";
import { renderMiniQuiz } from "../previews";

export function createMultipleChoiceQuizBlock() {
  const block = createQuizBaseBlock();
  return {
    ...block,
    settings: { ...block.settings, quizVariant: "multipleChoice" as const, quizMarker: "letters" as const, quizChoiceColumns: "two" as const },
  };
}

export const multipleChoiceQuizVariant: BlockFamilyVariant = {
  id: "multipleChoice",
  label: "Multiple choice",
  createBlock: createMultipleChoiceQuizBlock,
  preview: renderMiniQuiz,
};
