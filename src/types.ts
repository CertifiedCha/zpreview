import type { ReactNode } from "react";

export type ThemeId = "up-red" | "brilliant-blue" | "eco-green" | "space-dark";

export type BlockType =
  | "title"
  | "paragraph"
  | "sectionHeader"
  | "keyPoints"
  | "checklist"
  | "stepByStep"
  | "tabbedContent"
  | "timeline"
  | "thumbsCheck"
  | "equation"
  | "table"
  | "quiz"
  | "dragDrop"
  | "callout"
  | "image"
  | "video"
  | "simulation"
  | "hyperlink"
  | "separator"
  | "line"
  | "twoColumn"
  | "continue"
  | "nextPage"
  | "calculator";

export type BlockCategory = "text" | "content" | "data" | "math" | "multimedia" | "layout" | "assessment" | "interaction" | "tools";

export type ShellVariant = "plain" | "card" | "tinted" | "outline" | "embossed";

export type QuizChoice = {
  id: string;
  text: string;
};

export type ImageAnnotation =
  | {
    id: string;
    type: "pen";
    points: { x: number; y: number }[];
    color: string;
    strokeWidth: number;
  }
  | {
    id: string;
    type: "arrow";
    start: { x: number; y: number };
    end: { x: number; y: number };
    color: string;
    strokeWidth: number;
  }
  | {
    id: string;
    type: "text";
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize: number;
  };

export type BlockContent = {
  title?: string;
  subtitle?: string;
  text?: string;
  label?: string;
  icon?: string;
  caption?: string;
  mathSource?: string;
  href?: string;
  linkLabel?: string;
  rows?: string[][];
  question?: string;
  choices?: QuizChoice[];
  correctChoiceId?: string;
  correctChoiceIds?: string;
  answerText?: string;
  hint?: string;
  correctExplanation?: string;
  incorrectExplanation?: string;
  alt?: string;
  src?: string;
  videoSourceType?: "upload" | "youtube" | "link";
  videoUrl?: string;
  simulationId?: string;
  simulationTitle?: string;
  fileName?: string;
  annotations?: ImageAnnotation[];
};

export type BlockStyle = {
  shell?: ShellVariant;
  accent?: string;
  height?: "sm" | "md" | "lg";
  minHeight?: number;
  columns?: "equal" | "leftWide" | "rightWide";
  textAlign?: "left" | "center" | "right";
  fontSize?: number;
  fontColor?: string;
  titleFontSize?: number;
  titleFontColor?: string;
  subtitleFontSize?: number;
  subtitleFontColor?: string;
  bodyFontSize?: number;
  bodyFontColor?: string;
  questionFontSize?: number;
  questionFontColor?: string;
  choiceFontSize?: number;
  choiceFontColor?: string;
  buttonFontSize?: number;
  buttonFontColor?: string;
  buttonFillColor?: string;
  fillColor?: string;
  borderColor?: string;
  shadowColor?: string;
  borderWidth?: number;
  radius?: number;
  lineStyle?: "solid" | "dashed" | "dotted" | "double" | "wavy";
  lineThickness?: number;
  lineWidth?: number;
  tableBorderMode?: "grid" | "rows" | "none";
  tableHeaderFillColor?: string;
  tableHeaderFontColor?: string;
  tableRowFillColor?: string;
  tableGridColor?: string;
  tableCellPadding?: number;
};

export type BlockSettings = {
  retry?: boolean;
  revealAnswer?: boolean;
  mobileStack?: boolean;
  mathDisplay?: "inline" | "display";
  showCaption?: boolean;
  imageFit?: "fitWidth" | "contain" | "cover" | "fill";
  annotationTool?: "pen" | "arrow" | "text";
  annotationMode?: boolean;
  quizVariant?: "multipleChoice" | "fillBlank" | "shortAnswer" | "multiSelect" | "trueFalse" | "matching";
  quizLayout?: "clean" | "embossed";
  quizMarker?: "radio" | "letters" | "checkbox" | "trueFalse";
  quizChoiceColumns?: "one" | "two";
  quizButtonWidth?: "inline" | "full";
  hideNextUntilAnswered?: boolean;
  fillBlankMode?: "type" | "drag";
  dragVariant?: "sort" | "buckets" | "pairs" | "diagram" | "timeline" | "equation" | "blanks" | "venn" | "hierarchy" | "longText";
  componentVariant?: "plain" | "card";
  interactive?: boolean;
  showPromptLabel?: boolean;
  showExplanationLink?: boolean;
  editMatchingAnswerKey?: boolean;
};

export type BlockChildren = {
  left?: Block[];
  right?: Block[];
};

export type Block = {
  id: string;
  type: BlockType;
  content: BlockContent;
  style: BlockStyle;
  settings: BlockSettings;
  locked?: boolean;
  children?: BlockChildren;
};

export type Page = {
  id: string;
  title: string;
  blocks: Block[];
};

export type Board = {
  id: string;
  title: string;
  description: string;
  themeId: ThemeId;
  advancedStyling?: boolean;
  pages: Page[];
  currentPageId: string;
  updatedAt: number;
};

export type ThemeTokens = {
  id: ThemeId;
  name: string;
  primary: string;
  shadow: string;
  accent: string;
  bgLight: string;
  borderLight: string;
  bgHover: string;
};

export type BlockDefinition = {
  type: BlockType;
  label: string;
  category: BlockCategory;
  icon: ReactNode;
  defaultBlock: () => Block;
  preview: (block: Block, theme: ThemeTokens) => ReactNode;
  thumbnail?: SourceThumbnail;
  family?: BlockFamilyDefinition;
  config?: BlockConfigSchema;
};

export type SourceThumbnail = {
  src: string;
  alt?: string;
};

export type BlockFamilyVariant = {
  id: string;
  label: string;
  createBlock: () => Block;
  preview: (block: Block, theme: ThemeTokens) => ReactNode;
  thumbnail?: SourceThumbnail;
};

export type BlockFamilyDefinition = {
  label: string;
  thumbnail?: SourceThumbnail;
  variants: BlockFamilyVariant[];
};

export type BlockConfigGroup = {
  title: string;
  description?: string;
  fields: BlockConfigField[];
  defaultOpen?: boolean;
};

export type BlockRowsConfig = {
  label: string;
  itemLabel: string;
  fields: string[];
  placeholders: string[];
};

export type BlockConfigContentControl = "table" | "rows" | "quizChoices" | "fillBlank" | "matchingAnswerKey" | "dragBlankChoices";

export type StylePreset = {
  id: string;
  label: string;
  style: Partial<BlockStyle>;
};

export type BlockConfigField =
  | {
    section: "content" | "layout" | "styling" | "feedback";
    kind: "text" | "textarea";
    key: keyof BlockContent;
    label: string;
    visibleWhen?: (block: Block) => boolean;
  }
  | {
    section: "content" | "layout" | "styling" | "feedback";
    kind: "number" | "color";
    key: keyof BlockStyle;
    label: string;
    target: "style";
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
    defaultColor?: string;
    visibleWhen?: (block: Block) => boolean;
  }
  | {
    section: "content" | "layout" | "styling" | "feedback";
    kind: "select";
    key: keyof BlockContent | keyof BlockStyle | keyof BlockSettings;
    label: string;
    target?: "content" | "style" | "settings";
    options: { label: string; value: string }[];
    optionsFor?: (block: Block) => { label: string; value: string }[];
    visibleWhen?: (block: Block) => boolean;
    applyChange?: (block: Block, value: string) => Block;
  }
  | {
    section: "layout" | "styling" | "feedback";
    kind: "toggle";
    key: keyof BlockSettings | "locked";
    label: string;
    target?: "settings" | "block";
    visibleWhen?: (block: Block) => boolean;
  };

export type BlockConfigSchema = {
  content?: BlockConfigField[];
  layout?: BlockConfigField[];
  styling?: BlockConfigField[];
  feedback?: BlockConfigField[];
  styleGroups?: BlockConfigGroup[];
  stylePresets?: StylePreset[];
  rowSchema?: (block: Block) => BlockRowsConfig | undefined;
  contentControls?: (block: Block) => BlockConfigContentControl[];
};

export type BlockLocation = {
  containerId: string;
  index: number;
  list: Block[];
};
