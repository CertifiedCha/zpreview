import { dragBlanksVariant } from "./blanks";
import { dragBucketsVariant } from "./buckets";
import { dragDiagramVariant } from "./diagram";
import { dragEquationVariant } from "./equation";
import { dragHierarchyVariant } from "./hierarchy";
import { dragLongTextVariant } from "./longText";
import { dragPairsVariant } from "./pairs";
import { dragSortVariant } from "./sort";
import { dragTimelineVariant } from "./timeline";
import { dragVennVariant } from "./venn";

export { createDragSortBlock } from "./sort";

export const dragDropFamilyVariants = [
  dragSortVariant,
  dragBucketsVariant,
  dragPairsVariant,
  dragDiagramVariant,
  dragTimelineVariant,
  dragEquationVariant,
  dragBlanksVariant,
  dragVennVariant,
  dragHierarchyVariant,
  dragLongTextVariant,
];
