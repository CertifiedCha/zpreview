import type { BlockFamilyVariant } from "../../../../types";
import { createQuizBaseBlock } from "../shared";
import { renderMiniQuiz } from "../previews";

export function createMultiSelectQuizBlock() {
  const block = createQuizBaseBlock();
  return {
    ...block,
    settings: { ...block.settings, quizVariant: "multiSelect" as const, quizMarker: "checkbox" as const, quizChoiceColumns: "one" as const, quizButtonWidth: "full" as const },
    content: {
      ...block.content,
      question: "Select all vector quantities below:",
      text: "Select all that apply",
      correctChoiceIds: "a,b,d",
    },
  };
}

export const multiSelectQuizVariant: BlockFamilyVariant = {
  id: "multiSelect",
  label: "Multi-select",
  createBlock: createMultiSelectQuizBlock,
  preview: renderMiniQuiz,
};
