import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniGenericOrder } from "../previews";

export function createDragTimelineBlock() {
  return createDragDropBlock(
    {
      label: "Timeline activity",
      question: "Arrange the events in chronological order.",
      rows: [["First event", "Date 1"], ["Second event", "Date 2"], ["Third event", "Date 3"]],
      correctExplanation: "This message shows when the timeline is in the correct order.",
      incorrectExplanation: "This message shows when a few events are out of order.",
      hint: "This is a hint that your students see if they arrange events incorrectly. You can remove this.",
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
