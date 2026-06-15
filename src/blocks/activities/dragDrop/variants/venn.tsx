import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragVenn } from "../previews";

export function createDragVennBlock() {
  return createDragDropBlock(
    {
      label: "Venn activity",
      question: "Place each item into the best Venn region.",
      answerText: "Only A, Both, Only B",
      rows: [
        ["Has fur", "Only A"],
        ["Lays eggs", "Only B"],
        ["Needs energy", "Both"],
        ["Has feathers", "Only B"],
      ],
      correctExplanation: "Correct. Each item is in the right region.",
      incorrectExplanation: "Some items belong in a different part of the Venn diagram.",
      hint: "Use Both for items shared by the two groups.",
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
