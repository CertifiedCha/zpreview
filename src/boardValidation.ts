import { blockDefinitions } from "./blockRegistry";
import { HEADER_ALLOWED_BLOCK_TYPES } from "./boardState";
import {
  ALL_READABLE_DRAG_DROP_VARIANTS,
  BOARD_DOCUMENT_SCHEMA_VERSION,
  DRAG_DROP_VARIANT_POLICY,
  MAX_BOARD_DATA_URL_LENGTH,
  MAX_BOARD_NESTING_DEPTH,
  MAX_BOARD_STRING_LENGTH,
  type BoardDocumentV1,
  type BoardValidationBoundary,
  type BoardValidationIssue,
  type BoardValidationOptions,
  type BoardValidationResult,
} from "./boardContract";
import type { Block, BoardColumn, BoardHeader, MiniPage, Page } from "./types";

const QUIZ_VARIANTS = ["multipleChoice", "fillBlank", "shortAnswer", "multiSelect", "trueFalse", "matching", "dropdown", "enumeration"] as const;
const FLASHCARD_VARIANTS = ["flip", "deck"] as const;
const WHITEBOARD_VARIANTS = ["fixed", "popup"] as const;
const WHITEBOARD_PRESETS = ["whiteboard", "blackboard", "greenboard", "paperPencil", "paperPen"] as const;
const SAFE_TOP_LEVEL_KEYS = new Set(["schemaVersion", "id", "title", "description", "themeId", "advancedStyling", "blockGap", "hitboxInset", "defaultColumnCount", "frozenColumns", "pinnedFrozenColumnIds", "header", "studentProgressPersistence", "pages", "currentPageId", "updatedAt"]);
const UNSAFE_OBJECT_KEYS = new Set(["__proto__", "prototype", "constructor"]);

type ValidationContext = {
  boundary: BoardValidationBoundary;
  issues: BoardValidationIssue[];
  ids: Map<string, string>;
  boardPageIds: Set<string>;
};

export function validateBoardDocumentV1(document: BoardDocumentV1, options: BoardValidationOptions = {}): BoardValidationResult {
  const context: ValidationContext = {
    boundary: options.boundary ?? "editor",
    issues: [],
    ids: new Map(),
    boardPageIds: new Set(document.pages.map((page) => page.id)),
  };

  if (document.schemaVersion !== BOARD_DOCUMENT_SCHEMA_VERSION) {
    addIssue(context, "error", "unknown_schema_version", "schemaVersion", "Board document schemaVersion must be 1.");
  }

  validateUnsafeKeys(context, document, "$");
  validateTopLevelKeys(context, document);
  registerId(context, document.id, "id", "board");

  if (!document.pages.length) addIssue(context, "error", "missing_pages", "pages", "Board must contain at least one page.");
  if (!context.boardPageIds.has(document.currentPageId)) addIssue(context, "error", "invalid_current_page", "currentPageId", "currentPageId must reference an existing page.");

  if (document.header) validateHeader(context, document.header);
  document.frozenColumns.forEach((column, index) => validateColumn(context, column, `frozenColumns.${index}`, context.boardPageIds, 0));
  document.pages.forEach((page, index) => validatePage(context, page, `pages.${index}`));
  validatePinnedFrozenColumnIds(context, document.pinnedFrozenColumnIds ?? [], document.frozenColumns);

  const errors = context.issues.filter((issue) => issue.severity === "error");
  const warnings = context.issues.filter((issue) => issue.severity === "warning");
  return {
    ok: errors.length === 0,
    boundary: context.boundary,
    errors,
    warnings,
    issues: context.issues,
  };
}

function validateTopLevelKeys(context: ValidationContext, value: Record<string, unknown>) {
  if (context.boundary === "editor") return;
  for (const key of Object.keys(value)) {
    if (!SAFE_TOP_LEVEL_KEYS.has(key)) addIssue(context, "warning", "unknown_top_level_field", key, `Unknown top-level Board field "${key}" is not part of v1.`);
  }
}

function validateHeader(context: ValidationContext, header: BoardHeader) {
  validateUnsafeKeys(context, header, "header");
  header.children.content.forEach((block, index) => {
    if (!HEADER_ALLOWED_BLOCK_TYPES.includes(block.type)) {
      addIssue(context, "error", "invalid_header_block", `header.children.content.${index}.type`, `Header block type "${block.type}" is not allowed.`);
    }
    validateBlock(context, block, `header.children.content.${index}`, context.boardPageIds, 0);
  });
}

function validatePage(context: ValidationContext, page: Page, path: string) {
  registerId(context, page.id, `${path}.id`, "page");
  if (!page.columns.length) addIssue(context, "error", "missing_columns", `${path}.columns`, "Page must contain at least one column.");
  page.columns.forEach((column, index) => validateColumn(context, column, `${path}.columns.${index}`, context.boardPageIds, 0));
  for (const pinnedId of page.pinnedColumnIds ?? []) {
    if (!page.columns.some((column) => column.id === pinnedId)) addIssue(context, "error", "invalid_pinned_column", `${path}.pinnedColumnIds`, `Pinned column "${pinnedId}" does not exist on this page.`);
  }
}

function validateColumn(context: ValidationContext, column: BoardColumn, path: string, allowedTargetPageIds: Set<string>, depth: number) {
  registerId(context, column.id, `${path}.id`, "column");
  column.blocks.forEach((block, index) => validateBlock(context, block, `${path}.blocks.${index}`, allowedTargetPageIds, depth));
}

function validateBlock(context: ValidationContext, block: Block, path: string, allowedTargetPageIds: Set<string>, depth: number) {
  if (depth > MAX_BOARD_NESTING_DEPTH) addIssue(context, "error", "max_nesting_depth", path, `Block nesting exceeds maximum depth ${MAX_BOARD_NESTING_DEPTH}.`);
  registerId(context, block.id, `${path}.id`, "block");
  validateUnsafeKeys(context, block, path);
  validateStrings(context, block, path);

  if (!(block.type in blockDefinitions)) addIssue(context, "error", "unknown_block_type", `${path}.type`, `Unknown block type "${block.type}".`);

  if (block.type === "quiz") validateQuizBlock(context, block, path);
  if (block.type === "dragDrop") validateDragDropBlock(context, block, path);
  if (block.type === "flashcard") validateFlashcardBlock(context, block, path);
  if (block.type === "whiteboard") validateWhiteboardBlock(context, block, path);
  if (block.type === "popup") validatePopupBlock(context, block, path, allowedTargetPageIds, depth);
  if (block.type === "miniPage") validateMiniPageBlock(context, block, path, depth);
  if (block.type === "goToPage") validateTargetPageId(context, block, path, allowedTargetPageIds);
  validateMedia(context, block, path);

  if (block.type !== "popup" && block.children?.content?.length) {
    addIssue(context, "error", "invalid_content_children", `${path}.children.content`, "Only popup blocks may use children.content.");
  }
  if (block.type !== "twoColumn" && (block.children?.left?.length || block.children?.right?.length)) {
    addIssue(context, "error", "invalid_column_children", `${path}.children`, "Only twoColumn blocks may use children.left/right.");
  }
  if (block.type === "twoColumn") {
    block.children?.left?.forEach((child, index) => validateBlock(context, child, `${path}.children.left.${index}`, allowedTargetPageIds, depth + 1));
    block.children?.right?.forEach((child, index) => validateBlock(context, child, `${path}.children.right.${index}`, allowedTargetPageIds, depth + 1));
  }
}

function validateQuizBlock(context: ValidationContext, block: Block, path: string) {
  const variant = block.settings.quizVariant ?? "multipleChoice";
  if (!QUIZ_VARIANTS.includes(variant as (typeof QUIZ_VARIANTS)[number])) {
    addIssue(context, "error", "unknown_quiz_variant", `${path}.settings.quizVariant`, `Unknown quiz variant "${variant}".`);
  }
  if (variant === "dropdown" && !Array.isArray(block.content.dropdownQuizItems)) addIssue(context, "error", "invalid_dropdown_quiz", `${path}.content.dropdownQuizItems`, "Dropdown quiz must contain dropdownQuizItems.");
  if (variant === "enumeration" && !Array.isArray(block.content.enumerationItems)) addIssue(context, "error", "invalid_enumeration_quiz", `${path}.content.enumerationItems`, "Enumeration quiz must contain enumerationItems.");
  if (variant === "matching" && !Array.isArray(block.content.rows)) addIssue(context, "warning", "matching_rows_missing", `${path}.content.rows`, "Current matching quiz expects rows for matching pairs.");
}

function validateDragDropBlock(context: ValidationContext, block: Block, path: string) {
  const variant = block.settings.dragVariant ?? "sort";
  if (!ALL_READABLE_DRAG_DROP_VARIANTS.includes(variant as (typeof ALL_READABLE_DRAG_DROP_VARIANTS)[number])) {
    addIssue(context, "error", "unknown_drag_variant", `${path}.settings.dragVariant`, `Unknown drag-drop variant "${variant}".`);
    return;
  }

  if ((DRAG_DROP_VARIANT_POLICY.legacyReadableOnly as readonly string[]).includes(variant)) {
    const severity = context.boundary === "cloud" || context.boundary === "public" ? "error" : "warning";
    addIssue(context, severity, "legacy_drag_variant", `${path}.settings.dragVariant`, `Drag-drop variant "${variant}" is legacy-readable only and not exposed as a current creator variant.`);
  }
}

function validateFlashcardBlock(context: ValidationContext, block: Block, path: string) {
  const variant = block.settings.flashcardVariant ?? "flip";
  if (!FLASHCARD_VARIANTS.includes(variant as (typeof FLASHCARD_VARIANTS)[number])) {
    addIssue(context, "error", "unknown_flashcard_variant", `${path}.settings.flashcardVariant`, `Unknown flashcard variant "${variant}".`);
  }
  if (!Array.isArray(block.content.flashcards) || block.content.flashcards.length === 0) {
    addIssue(context, "error", "invalid_flashcard_items", `${path}.content.flashcards`, "Flashcard blocks must contain at least one flashcard item.");
    return;
  }
  block.content.flashcards.forEach((card, index) => {
    if (!card.id || typeof card.frontText !== "string" || typeof card.backText !== "string") {
      addIssue(context, "error", "invalid_flashcard_item", `${path}.content.flashcards.${index}`, "Flashcard items require id, frontText, and backText strings.");
    }
  });
}

function validateWhiteboardBlock(context: ValidationContext, block: Block, path: string) {
  const variant = block.settings.whiteboardVariant ?? "fixed";
  const preset = block.settings.whiteboardPreset ?? "whiteboard";
  if (!WHITEBOARD_VARIANTS.includes(variant as (typeof WHITEBOARD_VARIANTS)[number])) {
    addIssue(context, "error", "unknown_whiteboard_variant", `${path}.settings.whiteboardVariant`, `Unknown whiteboard variant "${variant}".`);
  }
  if (!WHITEBOARD_PRESETS.includes(preset as (typeof WHITEBOARD_PRESETS)[number])) {
    addIssue(context, "error", "unknown_whiteboard_preset", `${path}.settings.whiteboardPreset`, `Unknown whiteboard preset "${preset}".`);
  }
  if ("whiteboardState" in block.content || "drawing" in block.content) {
    addIssue(context, "error", "whiteboard_state_in_document", `${path}.content`, "Whiteboard drawing state is learner progress/local state and must not be stored in the Board document.");
  }
}

function validatePopupBlock(context: ValidationContext, block: Block, path: string, allowedTargetPageIds: Set<string>, depth: number) {
  if (!block.children?.content) addIssue(context, "error", "invalid_popup_children", `${path}.children.content`, "Popup blocks must carry children.content.");
  block.children?.content?.forEach((child, index) => validateBlock(context, child, `${path}.children.content.${index}`, allowedTargetPageIds, depth + 1));
}

function validateMiniPageBlock(context: ValidationContext, block: Block, path: string, depth: number) {
  if (!block.miniPages?.length) {
    addIssue(context, "error", "invalid_mini_pages", `${path}.miniPages`, "Mini page blocks must contain at least one mini page.");
    return;
  }
  const miniPageIds = new Set(block.miniPages.map((page) => page.id));
  if (block.activeMiniPageId && !miniPageIds.has(block.activeMiniPageId)) addIssue(context, "error", "invalid_active_mini_page", `${path}.activeMiniPageId`, "activeMiniPageId must reference a mini page on the same block.");
  block.miniPages.forEach((miniPage, index) => validateMiniPage(context, miniPage, `${path}.miniPages.${index}`, miniPageIds, depth + 1));
}

function validateMiniPage(context: ValidationContext, miniPage: MiniPage, path: string, allowedTargetPageIds: Set<string>, depth: number) {
  registerId(context, miniPage.id, `${path}.id`, "miniPage");
  miniPage.blocks.forEach((block, index) => validateBlock(context, block, `${path}.blocks.${index}`, allowedTargetPageIds, depth));
}

function validateTargetPageId(context: ValidationContext, block: Block, path: string, allowedTargetPageIds: Set<string>) {
  const targetPageId = block.content.targetPageId;
  if (!targetPageId) {
    addIssue(context, "warning", "missing_target_page", `${path}.content.targetPageId`, "goToPage block has no targetPageId.");
    return;
  }
  if (!allowedTargetPageIds.has(targetPageId)) addIssue(context, "error", "invalid_target_page", `${path}.content.targetPageId`, `targetPageId "${targetPageId}" does not exist in this navigation scope.`);
}

function validateMedia(context: ValidationContext, block: Block, path: string) {
  const src = block.content.src;
  if (typeof src === "string") validateUrlLike(context, src, `${path}.content.src`, block.type === "image");
  const href = block.content.href;
  if (typeof href === "string") validateUrlLike(context, href, `${path}.content.href`, false);
  const videoUrl = block.content.videoUrl;
  if (typeof videoUrl === "string") validateUrlLike(context, videoUrl, `${path}.content.videoUrl`, false);
  if (block.type === "video" && block.content.videoSourceType === "upload" && typeof videoUrl === "string" && videoUrl.startsWith("data:")) {
    const severity = context.boundary === "cloud" || context.boundary === "public" ? "error" : "warning";
    addIssue(context, severity, "uploaded_video_data_url", `${path}.content.videoUrl`, "Uploaded video data URLs are local-editor compatible only and must not cross cloud/public boundaries.");
  }
}

function validateUrlLike(context: ValidationContext, value: string, path: string, allowImageDataUrl: boolean) {
  if (value.length > MAX_BOARD_DATA_URL_LENGTH && value.startsWith("data:")) addIssue(context, "error", "oversized_data_url", path, `Data URL exceeds ${MAX_BOARD_DATA_URL_LENGTH} characters.`);
  if (value.startsWith("data:")) {
    const severity = context.boundary === "cloud" || context.boundary === "public" ? "error" : "warning";
    addIssue(context, severity, "local_data_url_media", path, allowImageDataUrl ? "Data URL images remain local-editor compatible but unsupported at cloud/public boundaries." : "Data URL media is local-editor compatible only and unsupported at cloud/public boundaries.");
    return;
  }
  if (/^https?:\/\//i.test(value) || value.startsWith("/") || value === "") return;
  addIssue(context, "error", "invalid_url", path, "URL must be empty, root-relative, http(s), or a supported local data URL.");
}

function validatePinnedFrozenColumnIds(context: ValidationContext, pinnedFrozenColumnIds: string[], frozenColumns: BoardColumn[]) {
  for (const pinnedId of pinnedFrozenColumnIds) {
    if (!frozenColumns.some((column) => column.id === pinnedId)) addIssue(context, "error", "invalid_pinned_frozen_column", "pinnedFrozenColumnIds", `Pinned frozen column "${pinnedId}" does not exist.`);
  }
}

function registerId(context: ValidationContext, id: string, path: string, kind: string) {
  if (!id || typeof id !== "string") {
    addIssue(context, "error", "missing_id", path, `${kind} id must be a non-empty string.`);
    return;
  }
  const previousPath = context.ids.get(id);
  if (previousPath) addIssue(context, "error", "duplicate_id", path, `${kind} id "${id}" duplicates ${previousPath}.`);
  else context.ids.set(id, path);
}

function validateStrings(context: ValidationContext, value: unknown, path: string) {
  if (typeof value === "string") {
    if (value.length > MAX_BOARD_STRING_LENGTH) addIssue(context, "error", "oversized_string", path, `String exceeds ${MAX_BOARD_STRING_LENGTH} characters.`);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) validateStrings(context, child, `${path}.${key}`);
}

function validateUnsafeKeys(context: ValidationContext, value: unknown, path: string) {
  if (!value || typeof value !== "object") return;
  for (const key of Object.keys(value)) {
    if (UNSAFE_OBJECT_KEYS.has(key)) addIssue(context, "error", "unsafe_object_key", `${path}.${key}`, `Unsafe object key "${key}" is not allowed.`);
    validateUnsafeKeys(context, (value as Record<string, unknown>)[key], `${path}.${key}`);
  }
}

function addIssue(context: ValidationContext, severity: "error" | "warning", code: string, path: string, message: string) {
  context.issues.push({ severity, code, path, message });
}
