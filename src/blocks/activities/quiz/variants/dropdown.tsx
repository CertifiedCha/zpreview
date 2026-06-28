import type { BlockFamilyVariant } from "../../../../types";
import { createDefaultDropdownQuizItems } from "../dropdownQuiz";
import { renderMiniQuiz } from "../previews";
import { createQuizBaseBlock } from "../shared";

export function createDropdownQuizBlock() {
  const block = createQuizBaseBlock();
  return {
    ...block,
    settings: {
      ...block.settings,
      quizVariant: "dropdown" as const,
      quizButtonWidth: "full" as const,
      dropdownUseGlobalOptions: false,
    },
    content: {
      ...block.content,
      question: "",
      dropdownQuizItems: createDefaultDropdownQuizItems(),
      hint: "This is a hint that your students see if they choose the wrong dropdown option. You can remove this.",
      correctExplanation: "This message shows when every dropdown is correct.",
      incorrectExplanation: "This message shows when one or more dropdowns need another try.",
    },
  };
}

export const dropdownQuizVariant: BlockFamilyVariant = {
  id: "dropdown",
  label: "Dropdown Quiz",
  createBlock: createDropdownQuizBlock,
  preview: renderMiniQuiz,
};
