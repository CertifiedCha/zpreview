"use client";
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { Block, Board, MiniPage } from "./types";

export type StudentRuntimeSnapshot = {
  version: 1;
  boardId: string;
  currentPageId: string;
  revealed: Record<string, boolean>;
  blockStates: Record<string, Record<string, unknown>>;
};

type StudentRuntimeContextValue = {
  snapshot: StudentRuntimeSnapshot;
  setCurrentPageId: (pageId: string) => void;
  revealBlock: (blockId: string) => void;
  setBlockState: <T>(blockId: string, key: string, value: SetStateAction<T>, initialValue: T) => void;
  reset: () => void;
};

const StudentRuntimeContext = createContext<StudentRuntimeContextValue | null>(null);

export function studentProgressStorageKey(boardId: string) {
  return `edu-block-progress-v1:${boardId}`;
}

export function clearStudentProgress(boardId: string) {
  try {
    localStorage.removeItem(studentProgressStorageKey(boardId));
  } catch {
    // Storage can be unavailable in privacy-restricted previews.
  }
}

export function StudentRuntimeProvider({ board, children }: { board: Board; children: ReactNode }) {
  const createInitial = useCallback(() => loadSnapshot(board), [board]);
  const [snapshot, setSnapshot] = useState<StudentRuntimeSnapshot>(createInitial);
  const blockTypes = useMemo(() => collectBoardBlockTypes(board), [board]);
  useEffect(() => {
    if (board.studentProgressPersistence !== "resume") return;
    try {
      localStorage.setItem(studentProgressStorageKey(board.id), JSON.stringify(snapshot));
    } catch (error) {
      console.warn("Could not save student progress", error);
    }
  }, [board.id, board.studentProgressPersistence, snapshot]);

  useEffect(() => {
    function handleReset(event: Event) {
      const boardId = (event as CustomEvent<{ boardId?: string }>).detail?.boardId;
      if (!boardId || boardId === board.id) setSnapshot(createEmptyStudentRuntimeSnapshot(board));
    }
    window.addEventListener("student-progress-reset", handleReset);
    return () => window.removeEventListener("student-progress-reset", handleReset);
  }, [board]);

  const setBlockState = useCallback(<T,>(blockId: string, key: string, value: SetStateAction<T>, initialValue: T) => {
    setSnapshot((current) => {
      const blockState = current.blockStates[blockId] ?? {};
      const previous = key in blockState ? blockState[key] as T : initialValue;
      const nextValue = typeof value === "function" ? (value as (previous: T) => T)(previous) : value;
      return {
        ...current,
        blockStates: { ...current.blockStates, [blockId]: { ...blockState, __blockType: blockTypes.get(blockId), __stateVersion: 1, [key]: nextValue } },
      };
    });
  }, [blockTypes]);

  const value = useMemo<StudentRuntimeContextValue>(() => ({
    snapshot,
    setCurrentPageId: (currentPageId) => setSnapshot((current) => ({ ...current, currentPageId })),
    revealBlock: (blockId) => setSnapshot((current) => ({ ...current, revealed: { ...current.revealed, [blockId]: true } })),
    setBlockState,
    reset: () => {
      clearStudentProgress(board.id);
      setSnapshot(createEmptyStudentRuntimeSnapshot(board));
    },
  }), [board, setBlockState, snapshot]);

  return <StudentRuntimeContext.Provider value={value}>{children}</StudentRuntimeContext.Provider>;
}

export function useStudentRuntime() {
  const context = useContext(StudentRuntimeContext);
  if (!context) throw new Error("Student runtime hooks must be used inside StudentRuntimeProvider.");
  return context;
}

export function useStudentBlockState<T>(blockId: string, key: string, initialValue: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const runtime = useContext(StudentRuntimeContext);
  const initial = useMemo(() => typeof initialValue === "function" ? (initialValue as () => T)() : initialValue, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [localValue, setLocalValue] = useState(initial);
  const stored = runtime?.snapshot.blockStates[blockId]?.[key];
  const runtimeSetter = runtime?.setBlockState;
  const value = (stored === undefined ? initial : stored) as T;
  const setValue = useCallback<Dispatch<SetStateAction<T>>>((next) => {
    if (runtimeSetter) runtimeSetter(blockId, key, next, initial);
    else setLocalValue(next);
  }, [blockId, initial, key, runtimeSetter]);
  return runtime ? [value, setValue] : [localValue, setValue];
}

export function createEmptyStudentRuntimeSnapshot(board: Board): StudentRuntimeSnapshot {
  const currentPageId = board.pages.some((page) => page.id === board.currentPageId) ? board.currentPageId : board.pages[0]?.id ?? "";
  return { version: 1, boardId: board.id, currentPageId, revealed: {}, blockStates: {} };
}

export function resolvePageNavigation(board: Board, currentPageId: string, targetPageId: string) {
  const currentIndex = board.pages.findIndex((page) => page.id === currentPageId);
  const targetIndex = board.pages.findIndex((page) => page.id === targetPageId);
  if (currentIndex < 0 || targetIndex < 0 || currentIndex === targetIndex) return null;
  return { pageId: board.pages[targetIndex].id, direction: targetIndex > currentIndex ? 1 : -1 } as const;
}

export function resolveMiniPageNavigation(pages: MiniPage[], currentPageId: string, targetPageId: string) {
  const currentIndex = pages.findIndex((page) => page.id === currentPageId);
  const targetIndex = pages.findIndex((page) => page.id === targetPageId);
  if (currentIndex < 0 || targetIndex < 0 || currentIndex === targetIndex) return null;
  return { pageId: pages[targetIndex].id, direction: targetIndex > currentIndex ? 1 : -1 } as const;
}

function loadSnapshot(board: Board): StudentRuntimeSnapshot {
  if (board.studentProgressPersistence !== "resume") return createEmptyStudentRuntimeSnapshot(board);
  try {
    const raw = localStorage.getItem(studentProgressStorageKey(board.id));
    if (!raw) return createEmptyStudentRuntimeSnapshot(board);
    const parsed = JSON.parse(raw) as Partial<StudentRuntimeSnapshot>;
    if (parsed.version !== 1 || parsed.boardId !== board.id) return createEmptyStudentRuntimeSnapshot(board);
    return reconcileStudentRuntimeSnapshot({
      version: 1,
      boardId: board.id,
      currentPageId: typeof parsed.currentPageId === "string" ? parsed.currentPageId : board.pages[0]?.id ?? "",
      revealed: parsed.revealed && typeof parsed.revealed === "object" ? parsed.revealed : {},
      blockStates: parsed.blockStates && typeof parsed.blockStates === "object" ? parsed.blockStates : {},
    }, board);
  } catch {
    clearStudentProgress(board.id);
    return createEmptyStudentRuntimeSnapshot(board);
  }
}

export function reconcileStudentRuntimeSnapshot(snapshot: StudentRuntimeSnapshot, board: Board, validBlockTypes = collectBoardBlockTypes(board)): StudentRuntimeSnapshot {
  const blockStates = Object.fromEntries(Object.entries(snapshot.blockStates).filter(([blockId, state]) => {
    const currentType = validBlockTypes.get(blockId);
    const storedType = typeof state.__blockType === "string" ? state.__blockType : undefined;
    const storedVersion = typeof state.__stateVersion === "number" ? state.__stateVersion : 1;
    return Boolean(currentType) && (!storedType || storedType === currentType) && storedVersion === 1;
  }));
  const validBlockIds = new Set(validBlockTypes.keys());
  const revealed = Object.fromEntries(Object.entries(snapshot.revealed).filter(([blockId]) => validBlockIds.has(blockId)));
  const currentPageId = board.pages.some((page) => page.id === snapshot.currentPageId) ? snapshot.currentPageId : board.pages[0]?.id ?? "";
  if (snapshot.boardId === board.id && currentPageId === snapshot.currentPageId && Object.keys(blockStates).length === Object.keys(snapshot.blockStates).length && Object.keys(revealed).length === Object.keys(snapshot.revealed).length) return snapshot;
  return { version: 1, boardId: board.id, currentPageId, blockStates, revealed };
}

function collectBoardBlockTypes(board: Board) {
  const types = new Map<string, Block["type"]>();
  const visit = (blocks: Block[]) => blocks.forEach((block) => {
    types.set(block.id, block.type);
    if (block.children?.left) visit(block.children.left);
    if (block.children?.right) visit(block.children.right);
    if (block.children?.content) visit(block.children.content);
    block.miniPages?.forEach((page) => visit(page.blocks));
  });
  board.frozenColumns.forEach((column) => visit(column.blocks));
  board.pages.forEach((page) => page.columns.forEach((column) => visit(column.blocks)));
  return types;
}
