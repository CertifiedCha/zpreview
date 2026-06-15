import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniGenericOrder } from "../previews";

export function createDragTimelineBlock() {
  return createDragDropBlock(
    {
      label: "Timeline activity",
      question: "Arrange the events in chronological order.",
      rows: [["Question is asked"], ["Evidence is gathered"], ["Claim is tested"], ["Conclusion is shared"]],
      correctExplanation: "Perfect timeline. The events now follow the correct chronology.",
      incorrectExplanation: "A few events are out of order. Look for what must happen before the next step.",
      hint: "Start with the earliest event.",
    },
    "timeline",
  );
}

export const dragTimelineVariant: BlockFamilyVariant = {
  id: "timeline",
  label: "Timeline order",
  createBlock: createDragTimelineBlock,
  preview: renderMiniGenericOrder,
};
