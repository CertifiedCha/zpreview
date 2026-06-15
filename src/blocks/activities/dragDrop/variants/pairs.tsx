import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragPairs } from "../previews";

export function createDragPairsBlock() {
  return createDragDropBlock(
    {
      label: "Pairing activity",
      question: "Match each term with its correct description.",
      rows: [
        ["Scalar", "Magnitude only"],
        ["Vector", "Magnitude and direction"],
        ["Speed", "Distance over time"],
        ["Velocity", "Speed in a direction"],
      ],
      correctExplanation: "Correct. Each term is matched with the description that defines it.",
      incorrectExplanation: "Some pairs are crossed. Compare the key words in each description.",
      hint: "Direction is the clue that separates vector from scalar.",
    },
    "pairs",
  );
}

export const dragPairsVariant: BlockFamilyVariant = {
  id: "pairs",
  label: "Match pairs",
  createBlock: createDragPairsBlock,
  preview: renderMiniDragPairs,
};
