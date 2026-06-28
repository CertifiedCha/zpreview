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
  | "vennDiagram"
  | "quiz"
  | "dragDrop"
  | "flashcard"
  | "callout"
  | "image"
  | "video"
  | "simulation"
  | "hyperlink"
  | "separator"
  | "line"
  | "twoColumn"
  | "popup"
  | "miniPage"
  | "continue"
  | "previousPage"
  | "nextPage"
  | "goToPage"
  | "calculator"
  | "whiteboard";

export type BlockCategory = "text" | "content" | "data" | "math" | "multimedia" | "layout" | "assessment" | "gamified" | "interaction" | "tools";

export type ShellVariant = "plain" | "card" | "tinted" | "outline" | "embossed";

export type QuizChoice = {
  id: string;
  text: string;
  imageSrc?: string;
  imageAlt?: string;
  imageWidthPercent?: number;
};

export type DropdownQuizOption = {
  id: string;
  text: string;
};

export type DropdownQuizBlank = {
  id: string;
  options: DropdownQuizOption[];
  correctOptionId: string;
};

export type DropdownQuizItem = {
  id: string;
  text: string;
  blanks: DropdownQuizBlank[];
};

export type EnumerationQuizItem = {
  id: string;
  accepted: string[];
};

export type FlashcardItem = {
  id: string;
  frontText: string;
  backText: string;
  frontImageSrc?: string;
  frontImageAlt?: string;
  backImageSrc?: string;
  backImageAlt?: string;
};

export type VennDiagramItem = {
  id: string;
  text: string;
  x: number;
  y: number;
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
  targetPageId?: string;
  rows?: string[][];
  question?: string;
  choices?: QuizChoice[];
  dropdownQuizItems?: DropdownQuizItem[];
  enumerationItems?: EnumerationQuizItem[];
  flashcards?: FlashcardItem[];
  correctChoiceId?: string;
  correctChoiceIds?: string;
  answerText?: string;
  vennLabels?: string;
  vennItems?: VennDiagramItem[];
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
  diagramImageWidthPercent?: number;
  diagramImageHeight?: number;
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
  blockGap?: number;
  hitboxInset?: number;
  popupWidth?: number;
  popupHeight?: number;
  flashcardFrontFillColor?: string;
  flashcardBackFillColor?: string;
  flashcardFrontTextColor?: string;
  flashcardBackTextColor?: string;
  flashcardControlColor?: string;
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
  quizVariant?: "multipleChoice" | "fillBlank" | "shortAnswer" | "multiSelect" | "trueFalse" | "matching" | "dropdown" | "enumeration";
  quizChoiceVariant?: "text" | "image" | "imageText";
  quizLayout?: "clean" | "embossed";
  quizMarker?: "radio" | "letters" | "checkbox" | "trueFalse";
  showChoiceMarkers?: boolean;
  showTimelineYears?: boolean;
  answerTimelineDates?: boolean;
  vennCircleCount?: "two" | "three";
  quizChoiceColumns?: "one" | "two";
  quizButtonWidth?: "inline" | "full";
  hideNextUntilAnswered?: boolean;
  fillBlankMode?: "type" | "drag";
  dropdownUseGlobalOptions?: boolean;
  enumerationCaseSensitive?: boolean;
  enumerationSpaceSensitive?: boolean;
  dragVariant?: "sort" | "buckets" | "pairs" | "diagram" | "timeline" | "equation" | "blanks" | "venn" | "hierarchy" | "longText";
  dragVisualVariant?: "default" | "image" | "imageText";
  flashcardVariant?: "flip" | "deck";
  flashcardAllowShuffle?: boolean;
  flashcardFlipDirection?: "horizontal" | "vertical";
  flashcardAnimationSpeed?: "fast" | "normal" | "slow";
  flashcardAspectRatio?: "wide" | "classic" | "square";
  flashcardImageLayout?: "top" | "side";
  flashcardImageFit?: "contain" | "cover";
  flashcardShowSideLabel?: boolean;
  flashcardShowFlipHint?: boolean;
  componentVariant?: "plain" | "card";
  interactive?: boolean;
  showExplanationLink?: boolean;
  editMatchingAnswerKey?: boolean;
  customBlockGap?: boolean;
  customHitboxInset?: boolean;
  continueDelayEnabled?: boolean;
  continueDelaySeconds?: number;
  youtubeStartSeconds?: number;
  youtubeEndSeconds?: number;
  youtubeAutoplay?: boolean;
  youtubeMuted?: boolean;
  youtubeShowControls?: boolean;
  youtubeAllowFullscreen?: boolean;
  youtubeLoop?: boolean;
  youtubeCaptions?: boolean;
  youtubePlaysInline?: boolean;
  popupDisplay?: "floating" | "modal" | "inline";
  whiteboardVariant?: "fixed" | "popup";
  whiteboardPopupMode?: "modal" | "fullscreen";
  whiteboardPreset?: "whiteboard" | "blackboard" | "greenboard" | "paperPencil" | "paperPen";
  whiteboardHeight?: "small" | "medium" | "large";
  whiteboardAllowEraser?: boolean;
  whiteboardAllowColors?: boolean;
  whiteboardAllowSizes?: boolean;
  whiteboardAllowUndoRedo?: boolean;
  whiteboardAllowClear?: boolean;
  whiteboardUnlimitedArea?: boolean;
  miniPageFixedHeight?: boolean;
};

export type BlockChildren = {
  left?: Block[];
  right?: Block[];
  content?: Block[];
};

export type BlockChildSlot = keyof BlockChildren;

export type MiniPage = {
  id: string;
  blocks: Block[];
};

export type Block = {
  id: string;
  type: BlockType;
  content: BlockContent;
  style: BlockStyle;
  settings: BlockSettings;
  pinned?: boolean;
  locked?: boolean;
  children?: BlockChildren;
  miniPages?: MiniPage[];
  activeMiniPageId?: string;
};

export type ColumnCount = 1 | 2 | 3;

export type BoardColumn = {
  id: string;
  blocks: Block[];
};

export type FrozenBoardColumn = BoardColumn & {
  side: "left" | "right";
  order: number;
};

export type StudentProgressPersistence = "resume" | "session";

export type Page = {
  id: string;
  title: string;
  columns: BoardColumn[];
  pinnedColumnIds?: string[];
};

export type BoardHeader = {
  enabled: boolean;
  children: {
    content: Block[];
  };
  style: BlockStyle;
};

export type Board = {
  schemaVersion: 1;
  id: string;
  title: string;
  description: string;
  themeId: ThemeId;
  advancedStyling?: boolean;
  blockGap?: number;
  hitboxInset?: number;
  defaultColumnCount: ColumnCount;
  frozenColumns: FrozenBoardColumn[];
  pinnedFrozenColumnIds?: string[];
  header?: BoardHeader;
  studentProgressPersistence: StudentProgressPersistence;
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
  searchTags?: string[];
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
  searchTags?: string[];
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

export type BlockConfigContentControl = "table" | "rows" | "quizChoices" | "fillBlank" | "matchingAnswerKey" | "dropdownQuiz" | "enumerationQuiz" | "dragBlankChoices" | "flashcardItems" | "imageUpload";

export type StylePreset = {
  id: string;
  label: string;
  style: Partial<BlockStyle>;
};

export type BlockConfigField =
  | {
    section: "content" | "layout" | "styling" | "feedback";
    kind: "playbackRange";
    key: keyof BlockSettings;
    label: string;
    startKey: keyof BlockSettings;
    endKey: keyof BlockSettings;
    visibleWhen?: (block: Block) => boolean;
  }
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
    key: keyof BlockStyle | keyof BlockSettings;
    label: string;
    target: "style" | "settings";
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
    defaultValue?: string;
    optionsFor?: (block: Block, board?: Board) => { label: string; value: string }[];
    visibleWhen?: (block: Block) => boolean;
    applyChange?: (block: Block, value: string) => Block;
    disabled?: boolean | ((block: Block) => boolean);
  }
  | {
    section: "content" | "layout" | "styling" | "feedback";
    kind: "toggle";
    key: keyof BlockSettings | "locked";
    label: string;
    target?: "settings" | "block";
    visibleWhen?: (block: Block) => boolean;
    defaultChecked?: boolean;
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
