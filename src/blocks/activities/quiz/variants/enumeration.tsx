import type { BlockFamilyVariant } from "../../../../types";
import { createDefaultEnumerationQuizItems } from "../enumerationQuiz";
import { renderMiniQuiz } from "../previews";
import { createQuizBaseBlock } from "../shared";

export function createEnumerationQuizBlock() {
  const block = createQuizBaseBlock();
  return {
    ...block,
    settings: { ...block.settings, quizVariant: "enumeration" as const, quizButtonWidth: "full" as const, enumerationCaseSensitive: false, enumerationSpaceSensitive: false },
    content: {
      ...block.content,
      question: "Students list the required answers here.",
      enumerationItems: createDefaultEnumerationQuizItems(),
    },
  };
}

export const enumerationQuizVariant: BlockFamilyVariant = {
  id: "enumeration",
  label: "Enumeration",
  createBlock: createEnumerationQuizBlock,
  preview: renderMiniQuiz,
};
