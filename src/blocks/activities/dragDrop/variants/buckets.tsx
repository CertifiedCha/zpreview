import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragBuckets } from "../previews";

export function createDragBucketsBlock() {
  return createDragDropBlock(
    {
      label: "Sorting activity",
      question: "Sort each item into the correct bucket.",
      text: "Drag or tap each card into the best category.",
      answerText: "Scalar, Vector",
      rows: [
        ["Speed", "Scalar"],
        ["Mass", "Scalar"],
        ["Velocity", "Vector"],
        ["Force", "Vector"],
      ],
      correctExplanation: "Correct. Scalars only need magnitude, while vectors need magnitude and direction.",
      incorrectExplanation: "Some cards are in the wrong bucket. Check whether each quantity needs a direction.",
      hint: "Vectors include direction; scalars do not.",
    },
    "buckets",
  );
}

export const dragBucketsVariant: BlockFamilyVariant = {
  id: "buckets",
  label: "Drag to buckets",
  createBlock: createDragBucketsBlock,
  preview: renderMiniDragBuckets,
};
