import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragVenn } from "../previews";

export function createDragVennBlock() {
  return createDragDropBlock(
    {
      label: "Venn activity",
      question: "Place each item into the best Venn region.",
      answerText: "Only A, Both, Only B",
      vennLabels: "Group A, Group B, Group C",
      rows: [
        ["Only group A item", "Only A", "", "", "100"],
        ["Only group B item", "Only B", "", "", "100"],
        ["Shared item", "Both", "", "", "100"],
        ["Another group B item", "Only B", "", "", "100"],
      ],
      correctExplanation: "This message shows when every item is in the right region.",
      incorrectExplanation: "This message shows when some items belong in a different Venn region.",
      hint: "This is a hint that your students see if they place an item incorrectly. You can remove this.",
    },
    "venn",
  );
}

export const dragVennVariant: BlockFamilyVariant = {
  id: "venn",
  label: "Venn sort",
  createBlock: createDragVennBlock,
  preview: renderMiniDragVenn,
};
