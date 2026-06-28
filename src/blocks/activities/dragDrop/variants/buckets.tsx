import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragBuckets } from "../previews";

export function createDragBucketsBlock() {
  return createDragDropBlock(
    {
      question: "Students sort each item into the correct category.",
      text: "Drag items to a category, or tap an item and then tap a category",
      answerText: "Category A, Category B",
      rows: [
        ["Item for category A", "Category A"],
        ["Item for category B", "Category B"],
        ["Another category A item", "Category A"],
        ["Another category B item", "Category B"],
      ],
      correctExplanation: "This message shows when every item is in the right category.",
      incorrectExplanation: "This message shows when some items are in the wrong category.",
      hint: "This is a hint that your students see if they sort an item incorrectly. You can remove this.",
    },
    "buckets",
  );
}

export const dragBucketsVariant: BlockFamilyVariant = {
  id: "buckets",
  label: "Classify",
  createBlock: createDragBucketsBlock,
  preview: renderMiniDragBuckets,
};
