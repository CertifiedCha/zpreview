import { BookOpenText, Database, Gamepad2, Heading1, Images, ListChecks, MousePointerClick, PanelTop, Sigma, Wrench } from "lucide-react";
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
import { vennDiagramBlock } from "./data/vennDiagram.block";
import { continueBlock } from "./flow/continue.block";
import { goToPageBlock } from "./flow/goToPage.block";
import { hyperlinkBlock } from "./flow/hyperlink.block";
import { nextPageBlock } from "./flow/nextPage.block";
import { flashcardBlock } from "./gamified/flashcard.block";
import { previousPageBlock } from "./flow/previousPage.block";
import { lineBlock } from "./layout/line.block";
import { miniPageBlock } from "./layout/miniPage.block";
import { popupBlock } from "./layout/popup.block";
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
import { whiteboardBlock } from "./tools/whiteboard.block";

const blockSearchTags: Record<BlockType, string[]> = {
  title: ["heading", "headline", "text", "lesson title", "cover"],
  paragraph: ["text", "body", "description", "copy", "content"],
  sectionHeader: ["heading", "section", "subtitle", "divider", "text"],
  keyPoints: ["bullets", "summary", "highlights", "takeaways", "notes"],
  checklist: ["todo", "tasks", "steps", "list", "progress"],
  stepByStep: ["instructions", "process", "procedure", "sequence", "guide"],
  tabbedContent: ["tabs", "sections", "organize", "switcher", "content"],
  timeline: ["sequence", "history", "events", "dates", "chronology"],
  thumbsCheck: ["check", "understanding", "feedback", "yes no", "reaction"],
  equation: ["math", "formula", "latex", "kaTeX", "symbol"],
  table: ["grid", "data", "rows", "columns", "spreadsheet"],
  vennDiagram: ["venn", "compare", "contrast", "diagram", "circles"],
  quiz: ["question", "assessment", "test", "activity", "answer"],
  dragDrop: ["drag", "drop", "matching", "sort", "activity", "interactive"],
  flashcard: ["cards", "study", "memory", "review", "flip"],
  callout: ["note", "tip", "warning", "highlight", "info"],
  image: ["picture", "photo", "media", "upload", "annotation"],
  video: ["media", "youtube", "clip", "movie", "watch"],
  simulation: ["interactive", "embed", "demo", "experiment", "physics"],
  hyperlink: ["link", "url", "website", "navigation", "external"],
  separator: ["divider", "spacing", "section break", "layout", "rule"],
  line: ["rule", "divider", "underline", "stroke", "layout"],
  twoColumn: ["columns", "layout", "split", "side by side", "compare"],
  popup: ["modal", "overlay", "floating", "reveal", "board"],
  miniPage: ["nested", "page", "layout", "internal", "flow"],
  continue: ["next", "flow", "button", "progress", "advance"],
  previousPage: ["back", "flow", "button", "navigation", "page"],
  nextPage: ["next", "flow", "button", "navigation", "page"],
  goToPage: ["jump", "flow", "button", "navigation", "page"],
  calculator: ["math", "tool", "compute", "numbers", "arithmetic"],
  whiteboard: ["draw", "scratch", "canvas", "board", "tool"],
};

const familyVariantSearchTags: Record<string, string[]> = {
  "quiz:multipleChoice": ["multiple choice", "mcq", "options", "single answer"],
  "quiz:fillBlank": ["fill blank", "blank", "cloze", "type answer"],
  "quiz:shortAnswer": ["short answer", "written", "response", "free text"],
  "quiz:multiSelect": ["multi select", "multiple answers", "checkbox", "choose many"],
  "quiz:trueFalse": ["true false", "yes no", "binary", "statement"],
  "quiz:matching": ["match", "pairs", "connect", "answer key"],
  "quiz:dropdown": ["dropdown", "select", "choose", "blank"],
  "quiz:enumeration": ["enumeration", "list answers", "accepted answers", "items"],
  "dragDrop:sort": ["sort", "order", "sequence", "rank"],
  "dragDrop:buckets": ["buckets", "categories", "classify", "groups"],
  "dragDrop:pairs": ["pairs", "matching", "connect", "match"],
  "dragDrop:diagram": ["diagram", "label", "image", "drop zone"],
  "dragDrop:timeline": ["timeline", "dates", "events", "chronology"],
  "dragDrop:equation": ["equation", "formula", "math", "terms"],
  "dragDrop:blanks": ["fill blanks", "cloze", "drag words", "sentence"],
  "dragDrop:venn": ["venn", "circles", "compare", "regions"],
  "dragDrop:hierarchy": ["hierarchy", "tree", "levels", "rank"],
  "dragDrop:longText": ["long text", "reading", "passage", "highlight"],
  "flashcard:flip": ["flip", "card", "front back", "memory"],
  "flashcard:deck": ["deck", "study", "cards", "review"],
};

function withSearchMetadata(definition: BlockDefinition): BlockDefinition {
  const family = definition.family
    ? {
        ...definition.family,
        variants: definition.family.variants.map((variant) => ({
          ...variant,
          searchTags: familyVariantSearchTags[`${definition.type}:${variant.id}`] ?? variant.searchTags,
        })),
      }
    : undefined;

  return {
    ...definition,
    searchTags: blockSearchTags[definition.type],
    family,
  };
}

export const blockDefinitions: Record<BlockType, BlockDefinition> = {
  title: withSearchMetadata(titleBlock),
  paragraph: withSearchMetadata(paragraphBlock),
  sectionHeader: withSearchMetadata(sectionHeaderBlock),
  keyPoints: withSearchMetadata(keyPointsBlock),
  checklist: withSearchMetadata(checklistBlock),
  stepByStep: withSearchMetadata(stepByStepBlock),
  tabbedContent: withSearchMetadata(tabbedContentBlock),
  timeline: withSearchMetadata(timelineBlock),
  thumbsCheck: withSearchMetadata(thumbsCheckBlock),
  equation: withSearchMetadata(equationBlock),
  table: withSearchMetadata(tableBlock),
  vennDiagram: withSearchMetadata(vennDiagramBlock),
  quiz: withSearchMetadata(quizBlock),
  dragDrop: withSearchMetadata(dragDropBlock),
  flashcard: withSearchMetadata(flashcardBlock),
  callout: withSearchMetadata(calloutBlock),
  image: withSearchMetadata(imageBlock),
  video: withSearchMetadata(videoBlock),
  simulation: withSearchMetadata(simulationBlock),
  hyperlink: withSearchMetadata(hyperlinkBlock),
  separator: withSearchMetadata(separatorBlock),
  line: withSearchMetadata(lineBlock),
  twoColumn: withSearchMetadata(twoColumnBlock),
  popup: withSearchMetadata(popupBlock),
  miniPage: withSearchMetadata(miniPageBlock),
  continue: withSearchMetadata(continueBlock),
  previousPage: withSearchMetadata(previousPageBlock),
  nextPage: withSearchMetadata(nextPageBlock),
  goToPage: withSearchMetadata(goToPageBlock),
  calculator: withSearchMetadata(calculatorBlock),
  whiteboard: withSearchMetadata(whiteboardBlock),
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
  { id: "gamified", label: "Gamified", icon: <Gamepad2 size={24} /> },
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
