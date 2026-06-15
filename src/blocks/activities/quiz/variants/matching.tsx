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
      label: "Match check",
      question: "Match each concept with its best description.",
      rows: [
        ["Scalar quantity", "Has magnitude only"],
        ["Vector quantity", "Has magnitude and direction"],
        ["Speed", "Distance traveled per unit time"],
        ["Velocity", "Speed in a stated direction"],
      ],
      choices: [
        { id: "a", text: "Has magnitude only" },
        { id: "b", text: "Has magnitude and direction" },
        { id: "c", text: "Distance traveled per unit time" },
        { id: "d", text: "Speed in a stated direction" },
      ],
      hint: "Look for whether the quantity needs a direction.",
      correctExplanation: "Nice matching. Each concept is paired with the description that defines it.",
      incorrectExplanation: "Some pairs are crossed. Try comparing the key words in each description.",
    },
  };
}

export const matchingQuizVariant: BlockFamilyVariant = {
  id: "matching",
  label: "Matching",
  createBlock: createMatchingQuizBlock,
  preview: renderMiniMatching,
};
