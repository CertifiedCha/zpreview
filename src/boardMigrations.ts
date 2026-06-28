import { BOARD_DOCUMENT_SCHEMA_VERSION, getBoardDocumentVersion, type BoardDocumentV1, type BoardMigrationResult } from "./boardContract";
import { normalizeBoard } from "./boardState";

export function migrateBoardDocumentToV1(value: unknown): BoardMigrationResult {
  const sourceVersion = getBoardDocumentVersion(value);
  if (sourceVersion === "unknown") {
    return {
      ok: false,
      sourceVersion,
      targetVersion: BOARD_DOCUMENT_SCHEMA_VERSION,
      errors: ["Unsupported Board schemaVersion."],
      warnings: [],
    };
  }

  const document = normalizeBoard(value) as BoardDocumentV1;
  return {
    ok: true,
    sourceVersion,
    targetVersion: BOARD_DOCUMENT_SCHEMA_VERSION,
    document,
    changed: sourceVersion !== BOARD_DOCUMENT_SCHEMA_VERSION || JSON.stringify(value) !== JSON.stringify(document),
    warnings: sourceVersion === 0 ? ["Migrated unversioned Board document from v0 to v1."] : [],
  };
}

export function migrateBoardDocument(value: unknown) {
  return migrateBoardDocumentToV1(value);
}

