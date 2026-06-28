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
      question: "Students select every correct option.",
      text: "Select all that apply",
      correctChoiceIds: "a,c",
    },
  };
}

export const multiSelectQuizVariant: BlockFamilyVariant = {
  id: "multiSelect",
  label: "Multi-select",
  createBlock: createMultiSelectQuizBlock,
  preview: renderMiniQuiz,
};
