import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragPairs } from "../previews";

export function createDragHierarchyBlock() {
  return createDragDropBlock(
    {
      label: "Hierarchy activity",
      question: "Attach each node to its correct parent.",
      rows: [
        ["Root item", ""],
        ["Child item A", "Root item"],
        ["Child item B", "Root item"],
        ["Nested item", "Child item A"],
        ["Another child item", "Root item"],
      ],
      correctExplanation: "This message shows when every node is attached to the correct parent.",
      incorrectExplanation: "This message shows when some nodes are attached to the wrong parent.",
      hint: "This is a hint that your students see if they attach a node incorrectly. You can remove this.",
    },
    "hierarchy",
  );
}

export const dragHierarchyVariant: BlockFamilyVariant = {
  id: "hierarchy",
  label: "Hierarchy builder",
  createBlock: createDragHierarchyBlock,
  preview: renderMiniDragPairs,
};
