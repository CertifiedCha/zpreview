import type { BlockFamilyVariant } from "../../../../types";
import { createQuizBaseBlock } from "../shared";
import { renderMiniMatching } from "../previews";

export function createMatchingQuizBlock() {
  const block = createQuizBaseBlock();
  return {
    ...block,
    settings: { ...block.settings, quizVariant: "matching" as const, quizChoiceColumns: "one" as const, quizButtonWidth: "full" as const },
    content: {
      ...block.content,
      label: "Matching activity",
      question: "Students match each item with the correct pair.",
      rows: [
        ["Item 1", "Matching answer 1"],
        ["Item 2", "Matching answer 2"],
        ["Item 3", "Matching answer 3"],
        ["Item 4", "Matching answer 4"],
      ],
      choices: [
        { id: "a", text: "Matching answer 1" },
        { id: "b", text: "Matching answer 2" },
        { id: "c", text: "Matching answer 3" },
        { id: "d", text: "Matching answer 4" },
      ],
      hint: "This is a hint that your students see if they match something incorrectly. You can remove this.",
      correctExplanation: "This message shows when every pair is correct.",
      incorrectExplanation: "This message shows when some pairs need another try.",
    },
  };
}

export const matchingQuizVariant: BlockFamilyVariant = {
  id: "matching",
  label: "Matching",
  createBlock: createMatchingQuizBlock,
  preview: renderMiniMatching,
};
