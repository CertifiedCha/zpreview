import type { BlockFamilyVariant } from "../../../../types";
import { createDragDropBlock } from "../shared";
import { renderMiniDragPairs } from "../previews";

export function createDragHierarchyBlock() {
  return createDragDropBlock(
    {
      label: "Hierarchy activity",
      question: "Attach each node to its correct parent.",
      rows: [
        ["Science", ""],
        ["Physics", "Science"],
        ["Motion", "Physics"],
        ["Force", "Physics"],
        ["Biology", "Science"],
      ],
      correctExplanation: "Correct hierarchy. Each node is under its parent.",
      incorrectExplanation: "Some nodes are attached to the wrong parent.",
      hint: "Start with the root, then attach broad categories before specific ideas.",
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
