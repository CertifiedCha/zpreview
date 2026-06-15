import { BookOpenText, Database, Heading1, Images, ListChecks, MousePointerClick, PanelTop, Sigma, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import type { BlockCategory, BlockDefinition, BlockType } from "../types";
import { checklistBlock } from "./activities/checklist.block";
import { dragDropBlock } from "./activities/dragDrop";
import { quizBlock } from "./activities/quiz";
import { thumbsCheckBlock } from "./activities/thumbsCheck.block";
import { calloutBlock } from "./content/callout.block";
import { keyPointsBlock } from "./content/keyPoints.block";
import { stepByStepBlock } from "./content/stepByStep.block";
import { tabbedContentBlock } from "./content/tabbedContent.block";
import { timelineBlock } from "./content/timeline.block";
import { tableBlock } from "./data/table.block";
import { continueBlock } from "./flow/continue.block";
import { hyperlinkBlock } from "./flow/hyperlink.block";
import { nextPageBlock } from "./flow/nextPage.block";
import { lineBlock } from "./layout/line.block";
import { separatorBlock } from "./layout/separator.block";
import { twoColumnBlock } from "./layout/twoColumn.block";
import { equationBlock } from "./math/equation.block";
import { imageBlock } from "./media/image.block";
import { simulationBlock } from "./media/simulation.block";
import { videoBlock } from "./media/video.block";
import { paragraphBlock } from "./text/paragraph.block";
import { sectionHeaderBlock } from "./text/sectionHeader.block";
import { titleBlock } from "./text/title.block";
import { calculatorBlock } from "./tools/calculator.block";

export const blockDefinitions: Record<BlockType, BlockDefinition> = {
  title: titleBlock,
  paragraph: paragraphBlock,
  sectionHeader: sectionHeaderBlock,
  keyPoints: keyPointsBlock,
  checklist: checklistBlock,
  stepByStep: stepByStepBlock,
  tabbedContent: tabbedContentBlock,
  timeline: timelineBlock,
  thumbsCheck: thumbsCheckBlock,
  equation: equationBlock,
  table: tableBlock,
  quiz: quizBlock,
  dragDrop: dragDropBlock,
  callout: calloutBlock,
  image: imageBlock,
  video: videoBlock,
  simulation: simulationBlock,
  hyperlink: hyperlinkBlock,
  separator: separatorBlock,
  line: lineBlock,
  twoColumn: twoColumnBlock,
  continue: continueBlock,
  nextPage: nextPageBlock,
  calculator: calculatorBlock,
};

export function createDefaultBlock(type: BlockType) {
  return blockDefinitions[type].defaultBlock();
}

export const categories: { id: BlockCategory; label: string; icon: ReactNode }[] = [
  { id: "text", label: "Text", icon: <Heading1 size={24} /> },
  { id: "content", label: "Content", icon: <BookOpenText size={24} /> },
  { id: "data", label: "Data", icon: <Database size={24} /> },
  { id: "math", label: "Math", icon: <Sigma size={24} /> },
  { id: "multimedia", label: "Media", icon: <Images size={24} /> },
  { id: "assessment", label: "Activities", icon: <ListChecks size={24} /> },
  { id: "layout", label: "Layout", icon: <PanelTop size={24} /> },
  { id: "interaction", label: "Flow", icon: <MousePointerClick size={24} /> },
  { id: "tools", label: "Tools", icon: <Wrench size={24} /> },
];

export const blocksByCategory = categories.reduce(
  (acc, category) => {
    acc[category.id] = Object.values(blockDefinitions).filter((block) => block.category === category.id);
    return acc;
  },
  {} as Record<BlockCategory, BlockDefinition[]>,
);
