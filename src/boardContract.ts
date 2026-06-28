import type { Block, Board } from "./types";

export const BOARD_DOCUMENT_SCHEMA_VERSION = 1;
export const LEGACY_UNVERSIONED_BOARD_SCHEMA_VERSION = 0;
export const MAX_BOARD_NESTING_DEPTH = 8;
export const MAX_BOARD_STRING_LENGTH = 100_000;
export const MAX_BOARD_DATA_URL_LENGTH = 2_000_000;

export type BoardDocumentVersion = typeof BOARD_DOCUMENT_SCHEMA_VERSION;
export type LegacyBoardDocumentVersion = typeof LEGACY_UNVERSIONED_BOARD_SCHEMA_VERSION;
export type BoardDocumentV1 = Board & { schemaVersion: BoardDocumentVersion };
export type BoardDocument = BoardDocumentV1;

export type BoardEditorViewState = {
  currentPageId: string;
  updatedAt: number;
};

export type BoardServerRecordMetadata = {
  boardId: string;
  ownerId?: string;
  revision?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type LearnerProgressStateBoundary = {
  allowedLater: readonly string[];
  practiceOnly: readonly string[];
  localOnly: readonly string[];
  neverAuthoritative: readonly string[];
};

export type BoardMigrationResult =
  | {
    ok: true;
    sourceVersion: LegacyBoardDocumentVersion | BoardDocumentVersion;
    targetVersion: BoardDocumentVersion;
    document: BoardDocumentV1;
    changed: boolean;
    warnings: string[];
  }
  | {
    ok: false;
    sourceVersion: LegacyBoardDocumentVersion | BoardDocumentVersion | "unknown";
    targetVersion: BoardDocumentVersion;
    errors: string[];
    warnings: string[];
  };

export type BoardValidationSeverity = "error" | "warning";

export type BoardValidationIssue = {
  severity: BoardValidationSeverity;
  code: string;
  path: string;
  message: string;
};

export type BoardValidationBoundary = "editor" | "import" | "cloud" | "public";

export type BoardValidationOptions = {
  boundary?: BoardValidationBoundary;
};

export type BoardValidationResult = {
  ok: boolean;
  boundary: BoardValidationBoundary;
  errors: BoardValidationIssue[];
  warnings: BoardValidationIssue[];
  issues: BoardValidationIssue[];
};

export type DragDropVariantPolicy = {
  officiallySupported: readonly NonNullable<Block["settings"]["dragVariant"]>[];
  legacyReadableOnly: readonly NonNullable<Block["settings"]["dragVariant"]>[];
  rejectedAtCloudOrPublicBoundary: readonly NonNullable<Block["settings"]["dragVariant"]>[];
};

export type BoardHeaderPolicy = {
  decision: "retained-official-v1-document-feature";
  notes: readonly string[];
};

export type BoardMediaPolicy = {
  localDataUrlImages: "editor-import-compatible-public-unsupported";
  uploadedVideoDataUrls: "editor-import-compatible-public-rejected";
  externalVideoUrls: "http-https-only";
  simulations: "known-id-or-safe-url-only";
  futureAssetReferences: "validate-reference-shape-before-public";
};

export const SUPPORTED_DRAG_DROP_VARIANTS = ["sort", "buckets", "diagram", "timeline", "venn", "hierarchy", "longText"] as const;
export const LEGACY_READABLE_DRAG_DROP_VARIANTS = ["pairs", "equation", "blanks"] as const;
export const ALL_READABLE_DRAG_DROP_VARIANTS = [...SUPPORTED_DRAG_DROP_VARIANTS, ...LEGACY_READABLE_DRAG_DROP_VARIANTS] as const;

export const DRAG_DROP_VARIANT_POLICY: DragDropVariantPolicy = {
  officiallySupported: SUPPORTED_DRAG_DROP_VARIANTS,
  legacyReadableOnly: LEGACY_READABLE_DRAG_DROP_VARIANTS,
  rejectedAtCloudOrPublicBoundary: LEGACY_READABLE_DRAG_DROP_VARIANTS,
};

export const BOARD_HEADER_POLICY: BoardHeaderPolicy = {
  decision: "retained-official-v1-document-feature",
  notes: [
    "Board.header is retained in v1 for compatibility with current defaults, helpers, and local documents.",
    "Header blocks are structurally validated and limited to HEADER_ALLOWED_BLOCK_TYPES.",
    "Stage 2A does not redesign or remove header rendering behavior.",
  ],
};

export const LEARNER_PROGRESS_STATE_BOUNDARY: LearnerProgressStateBoundary = {
  allowedLater: [
    "currentPageId",
    "revealed",
    "miniPage.currentPageId",
    "tabbedContent.activeTab",
    "stepByStep.activeStep",
    "quiz.selected",
    "quiz.multiSelected",
    "quiz.answer",
    "quiz.blankAnswers",
    "quiz.dropdownAnswers",
    "quiz.enumerationAnswers",
    "quiz.submitted",
    "dragDrop.compactDraftState",
    "flashcard.order",
    "flashcard.index",
    "flashcard.flipped",
  ],
  practiceOnly: [
    "quiz.submitted",
    "dragDrop.submitted",
    "client feedback state",
  ],
  localOnly: [
    "whiteboard.drawing",
    "calculator.open",
    "calculator.state",
    "raw pointer movement",
  ],
  neverAuthoritative: [
    "client correctness",
    "client score",
    "client pass/fail",
    "secure assessment outcome",
  ],
};

export const BOARD_MEDIA_POLICY: BoardMediaPolicy = {
  localDataUrlImages: "editor-import-compatible-public-unsupported",
  uploadedVideoDataUrls: "editor-import-compatible-public-rejected",
  externalVideoUrls: "http-https-only",
  simulations: "known-id-or-safe-url-only",
  futureAssetReferences: "validate-reference-shape-before-public",
};

export function extractBoardEditorViewState(board: Board): BoardEditorViewState {
  return {
    currentPageId: board.currentPageId,
    updatedAt: board.updatedAt,
  };
}

export function getBoardDocumentVersion(value: unknown): LegacyBoardDocumentVersion | BoardDocumentVersion | "unknown" {
  if (!value || typeof value !== "object" || !("schemaVersion" in value)) return LEGACY_UNVERSIONED_BOARD_SCHEMA_VERSION;
  const version = (value as { schemaVersion?: unknown }).schemaVersion;
  if (version === BOARD_DOCUMENT_SCHEMA_VERSION) return BOARD_DOCUMENT_SCHEMA_VERSION;
  return "unknown";
}

export function isBoardDocumentV1(value: Board): value is BoardDocumentV1 {
  return value.schemaVersion === BOARD_DOCUMENT_SCHEMA_VERSION;
}

