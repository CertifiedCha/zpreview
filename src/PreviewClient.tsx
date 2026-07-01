"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Block, Board, BoardColumn, ThemeTokens } from "./types";
import { DEFAULT_BLOCK_GAP, DEFAULT_HITBOX_INSET, getComposedPage, getFrozenColumns } from "./boardState";
import { resolvePageNavigation, StudentRuntimeProvider, useStudentRuntime } from "./studentRuntime";
import { StudentBlockContent } from "./components/BlockRenderers";
import { usePinnedBlockStack } from "./components/usePinnedBlockStack";

type PreviewClientProps = {
  board: Board;
  theme: ThemeTokens;
};

type BlockLayoutProperties = CSSProperties & {
  "--board-block-gap"?: string;
  "--board-hitbox-inset"?: string;
  "--block-gap"?: string;
  "--block-hitbox-inset"?: string;
};

type PreviewStripProperties = CSSProperties & {
  zoom?: number;
  "--student-pin-top"?: string;
};

const COLUMN_WIDTH = 740;
const COLUMN_GAP = 8;
const PAGE_SLIDE_DURATION = 0.6;
const PAGE_SLIDE_EASE = [0.22, 1, 0.36, 1] as const;

export function PreviewClient({ board, theme }: PreviewClientProps) {
  return <StudentRuntimeProvider board={board}><PreviewClientContent board={board} theme={theme} /></StudentRuntimeProvider>;
}

function PreviewClientContent({ board, theme }: PreviewClientProps) {
  const runtime = useStudentRuntime();
  const pageIndex = Math.max(0, board.pages.findIndex((page) => page.id === runtime.snapshot.currentPageId));
  const [pageDirection, setPageDirection] = useState(1);
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [readyPageId, setReadyPageId] = useState(board.pages[pageIndex]?.id ?? "");
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const localPage = board.pages[pageIndex] ?? board.pages[0];
  const page = getComposedPage(board, localPage);
  const leftSharedColumns = getFrozenColumns(board, "left");
  const rightSharedColumns = getFrozenColumns(board, "right");
  const blocksReady = readyPageId === page.id;
  const multiColumn = page.columns.length > 1;
  const nativeWidth = page.columns.length * COLUMN_WIDTH + Math.max(0, page.columns.length - 1) * COLUMN_GAP;
  const localColumnsWidth = localPage.columns.length * COLUMN_WIDTH + Math.max(0, localPage.columns.length - 1) * COLUMN_GAP;

  const fitColumns = useCallback(() => {
    if (!multiColumn) {
      setPreviewZoom(1);
      return;
    }
    if (window.matchMedia("(max-width: 780px)").matches) {
      setPreviewZoom(1);
      return;
    }
    const availableWidth = Math.max(1, (viewportRef.current?.clientWidth ?? window.innerWidth) - 32);
    setPreviewZoom(Math.min(1, availableWidth / nativeWidth));
  }, [multiColumn, nativeWidth]);

  useEffect(() => {
    const timer = window.setTimeout(() => setReadyPageId(page.id), 190);
    window.dispatchEvent(new Event("student-popup-close-all"));
    return () => window.clearTimeout(timer);
  }, [page.id]);

  useLayoutEffect(() => {
    // Measure before paint so background tabs cannot expose an unfitted strip.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fitColumns();
    const observer = new ResizeObserver(fitColumns);
    const portraitQuery = window.matchMedia("(max-width: 780px)");
    if (viewportRef.current) observer.observe(viewportRef.current);
    window.addEventListener("resize", fitColumns);
    portraitQuery.addEventListener("change", fitColumns);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fitColumns);
      portraitQuery.removeEventListener("change", fitColumns);
    };
  }, [fitColumns, page.id]);

  const goToPage = (targetPageId: string) => {
    const navigation = resolvePageNavigation(board, runtime.snapshot.currentPageId, targetPageId);
    if (!navigation) return;
    setPageDirection(navigation.direction);
    setPageTransitioning(true);
    collectCalculatorBlockIds(localPage.columns.flatMap((item) => item.blocks)).forEach((blockId) => runtime.setBlockState(blockId, "calculator.open", false, false));
    runtime.setCurrentPageId(navigation.pageId);
  };

  const goToPreviousPage = () => goToPage(board.pages[pageIndex - 1]?.id ?? "");
  const goToNextPage = () => goToPage(board.pages[pageIndex + 1]?.id ?? "");

  const renderColumn = (column: BoardColumn, shared: boolean) => (
    <section key={column.id} className={`student-paper student-board-column${shared ? " is-shared" : ""}${page.pinnedColumnIds?.includes(column.id) ? " is-pinned" : ""}`}>
      <StudentBlockList
        board={board}
        blocks={column.blocks}
        blocksReady={shared ? true : blocksReady}
        suppressRevealAnimation={!shared && pageTransitioning}
        theme={theme}
        revealed={runtime.snapshot.revealed}
        onReveal={runtime.revealBlock}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        onGoToPage={goToPage}
      />
    </section>
  );

  return (
    <div className="student-shell">
      <header className="student-topbar preview-topbar">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">Lesson preview</p>
          <h1 className="text-lg font-black text-zinc-950">{board.title}</h1>
        </div>
        <span className="rounded-full px-4 py-2 text-sm font-bold" style={{ color: theme.primary, background: theme.bgLight }}>
          {pageIndex + 1}/{board.pages.length}
        </span>
      </header>
      <div ref={viewportRef} className={`student-board-viewport ${multiColumn ? "is-multi" : "is-single"}`}>
        <AnimatePresence custom={pageDirection} initial={false} mode="sync">
          <motion.div
            key={page.id}
            className="student-page-scroller"
            initial="enter"
            animate="center"
            exit="exit"
            variants={{ enter: {}, center: {}, exit: {} }}
          >
            <main
              className={`student-board-strip ${multiColumn ? "is-multi" : "is-single"}`}
              style={multiColumn ? ({ width: `${nativeWidth}px`, zoom: previewZoom, "--student-pin-top": `${64 / previewZoom}px` } as PreviewStripProperties) : undefined}
            >
              <div className={`student-page-content ${multiColumn ? "is-multi" : "is-single"}`}>
                {leftSharedColumns.map((column) => renderColumn(column, true))}
                <div className="student-local-column-viewport" style={multiColumn ? ({ "--student-local-columns-width": `${localColumnsWidth}px` } as CSSProperties) : undefined}>
                  <motion.div
                    className="student-local-column-strip"
                    initial={{ x: pageDirection > 0 ? "100%" : "-100%" }}
                    variants={{
                      center: { x: 0 },
                      exit: (direction: number) => ({ x: direction > 0 ? "-100%" : "100%" }),
                    }}
                    transition={{ duration: PAGE_SLIDE_DURATION, ease: PAGE_SLIDE_EASE }}
                    onAnimationComplete={(definition) => {
                      if (definition === "center") setPageTransitioning(false);
                    }}
                  >
                    {localPage.columns.map((column) => renderColumn(column, false))}
                  </motion.div>
                </div>
                {rightSharedColumns.map((column) => renderColumn(column, true))}
              </div>
            </main>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function collectCalculatorBlockIds(blocks: Block[]): string[] {
  return blocks.flatMap((block) => [
    ...(block.type === "calculator" ? [block.id] : []),
    ...collectCalculatorBlockIds(block.children?.left ?? []),
    ...collectCalculatorBlockIds(block.children?.right ?? []),
    ...collectCalculatorBlockIds(block.children?.content ?? []),
    ...(block.miniPages ?? []).flatMap((page) => collectCalculatorBlockIds(page.blocks)),
  ]);
}

function StudentBlockList({
  board,
  blocks,
  blocksReady = true,
  suppressRevealAnimation = false,
  theme,
  revealed,
  onReveal,
  onPreviousPage,
  onNextPage,
  onGoToPage,
}: {
  board: Board;
  blocks: Block[];
  blocksReady?: boolean;
  suppressRevealAnimation?: boolean;
  theme: ThemeTokens;
  revealed: Record<string, boolean>;
  onReveal: (id: string) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onGoToPage: (pageId: string) => void;
}) {
  const stopIndex = blocks.findIndex((block) => (block.type === "continue" || (block.type === "quiz" && block.settings.hideNextUntilAnswered)) && !revealed[block.id]);
  const visibleRange = stopIndex >= 0 ? blocks.slice(0, stopIndex + 1) : blocks;
  const registerPinnedBlock = usePinnedBlockStack(visibleRange, board.blockGap ?? DEFAULT_BLOCK_GAP);
  const revealSegments = visibleRange.reduce<Block[][]>((segments, block, index) => {
    const nextBlock = visibleRange[index + 1];
    const gateFeedsContinue = block.type === "quiz" && block.settings.hideNextUntilAnswered && nextBlock?.type === "continue";
    const current = segments[segments.length - 1] ?? [];
    if (!segments.length) segments.push(current);
    if (block.type !== "continue" || !revealed[block.id]) current.push(block);
    if (block.type === "continue" || (block.type === "quiz" && block.settings.hideNextUntilAnswered && !gateFeedsContinue)) segments.push([]);
    return segments;
  }, []).filter((segment) => segment.length > 0);

  return (
    <div
      className="block-stack"
      style={{
        "--board-block-gap": `${board.blockGap ?? DEFAULT_BLOCK_GAP}px`,
        "--board-hitbox-inset": `${board.hitboxInset ?? DEFAULT_HITBOX_INSET}px`,
      } as BlockLayoutProperties}
    >
      <AnimatePresence initial={false}>
        {revealSegments.map((segment) => (
          <motion.div
            key={segment[0].id}
            layout={suppressRevealAnimation ? false : "position"}
            className={`student-reveal-segment${segment.some((block) => block.pinned) ? " has-pinned-block" : ""}`}
            initial={suppressRevealAnimation ? false : { opacity: 0, y: 24 }}
            animate={suppressRevealAnimation || blocksReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {segment.map((block) => (
              <div
                ref={(node) => registerPinnedBlock(block.id, node)}
                key={block.id}
                className={`student-block-frame${block.pinned ? " is-pinned" : ""}`}
                data-block-type={block.type}
                style={{
                  minHeight: block.style.minHeight ? `${block.style.minHeight}px` : undefined,
                  "--block-gap": block.settings.customBlockGap ? `${block.style.blockGap ?? 0}px` : undefined,
                  "--block-hitbox-inset": block.settings.customHitboxInset ? `${block.style.hitboxInset ?? 0}px` : undefined,
                } as BlockLayoutProperties}
              >
                <StudentBlockContent
                  block={block}
                  theme={theme}
                  onContinue={() => onReveal(block.id)}
                  onAnswer={() => onReveal(block.id)}
                  onPreviousPage={onPreviousPage}
                  onNextPage={onNextPage}
                  onGoToPage={onGoToPage}
                  renderMiniPage={(miniPage, navigation) => (
                    <StudentBlockList
                      board={board}
                      blocks={miniPage.blocks}
                      blocksReady={blocksReady}
                      suppressRevealAnimation={suppressRevealAnimation || Boolean(navigation?.suppressRevealAnimation)}
                      theme={theme}
                      revealed={revealed}
                      onReveal={onReveal}
                      onPreviousPage={navigation?.onPreviousPage ?? onPreviousPage}
                      onNextPage={navigation?.onNextPage ?? onNextPage}
                      onGoToPage={navigation?.onGoToPage ?? onGoToPage}
                    />
                  )}
                  renderChildren={(side) => (
                    <StudentBlockList board={board} blocks={block.children?.[side] ?? []} blocksReady={blocksReady} suppressRevealAnimation={suppressRevealAnimation} theme={theme} revealed={revealed} onReveal={onReveal} onPreviousPage={onPreviousPage} onNextPage={onNextPage} onGoToPage={onGoToPage} />
                  )}
                />
              </div>
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
