"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Block, Board, ThemeTokens } from "./types";
import { getComposedPage } from "./boardState";
import { StudentRuntimeProvider, useStudentRuntime } from "./studentRuntime";
import { StudentBlockContent } from "./components/BlockRenderers";

type PreviewClientProps = {
  board: Board;
  theme: ThemeTokens;
};

type PreviewStripProperties = CSSProperties & {
  zoom?: number;
  "--student-pin-top"?: string;
};

const COLUMN_WIDTH = 740;
const COLUMN_GAP = 8;

export function PreviewClient({ board, theme }: PreviewClientProps) {
  return <StudentRuntimeProvider board={board}><PreviewClientContent board={board} theme={theme} /></StudentRuntimeProvider>;
}

function PreviewClientContent({ board, theme }: PreviewClientProps) {
  const runtime = useStudentRuntime();
  const pageIndex = Math.max(0, board.pages.findIndex((page) => page.id === runtime.snapshot.currentPageId));
  const [pageDirection, setPageDirection] = useState(1);
  const [readyPageId, setReadyPageId] = useState(board.pages[pageIndex]?.id ?? "");
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const localPage = board.pages[pageIndex] ?? board.pages[0];
  const page = getComposedPage(board, localPage);
  const blocksReady = readyPageId === page.id;
  const multiColumn = page.columns.length > 1;
  const nativeWidth = page.columns.length * COLUMN_WIDTH + Math.max(0, page.columns.length - 1) * COLUMN_GAP;

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

  return (
    <div className="student-shell">
      <header className="preview-topbar">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">Lesson preview</p>
          <h1 className="text-lg font-black text-zinc-950">{board.title}</h1>
        </div>
        <span className="rounded-full px-4 py-2 text-sm font-bold" style={{ color: theme.primary, background: theme.bgLight }}>
          {pageIndex + 1}/{board.pages.length}
        </span>
      </header>
      <AnimatePresence mode="wait">
        <div ref={viewportRef} className={`student-board-viewport ${multiColumn ? "is-multi" : "is-single"}`}>
          <motion.main
            className={`student-board-strip ${multiColumn ? "is-multi" : "is-single"}`}
            style={multiColumn ? ({ width: `${nativeWidth}px`, zoom: previewZoom, "--student-pin-top": `${64 / previewZoom}px` } as PreviewStripProperties) : undefined}
            initial={{ opacity: 0, x: pageDirection * 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: pageDirection * -28 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {page.columns.map((column) => (
              <section key={column.id} className={`student-paper student-board-column${page.pinnedColumnIds?.includes(column.id) ? " is-pinned" : ""}`}>
                <StudentBlockList
                  blocks={column.blocks}
                  blocksReady={blocksReady}
                  theme={theme}
                  revealed={runtime.snapshot.revealed}
                  onReveal={runtime.revealBlock}
                  onNextPage={() => {
                    setPageDirection(1);
                    collectCalculatorBlockIds(localPage.columns.flatMap((item) => item.blocks)).forEach((blockId) => runtime.setBlockState(blockId, "calculator.open", false, false));
                    runtime.setCurrentPageId(board.pages[Math.min(board.pages.length - 1, pageIndex + 1)].id);
                  }}
                />
              </section>
            ))}
          </motion.main>
        </div>
      </AnimatePresence>
    </div>
  );
}

function collectCalculatorBlockIds(blocks: Block[]): string[] {
  return blocks.flatMap((block) => [
    ...(block.type === "calculator" ? [block.id] : []),
    ...collectCalculatorBlockIds(block.children?.left ?? []),
    ...collectCalculatorBlockIds(block.children?.right ?? []),
  ]);
}

function StudentBlockList({
  blocks,
  blocksReady = true,
  theme,
  revealed,
  onReveal,
  onNextPage,
}: {
  blocks: Block[];
  blocksReady?: boolean;
  theme: ThemeTokens;
  revealed: Record<string, boolean>;
  onReveal: (id: string) => void;
  onNextPage: () => void;
}) {
  const stopIndex = blocks.findIndex((block) => (block.type === "continue" || (block.type === "quiz" && block.settings.hideNextUntilAnswered)) && !revealed[block.id]);
  const visibleBlocks = (stopIndex >= 0 ? blocks.slice(0, stopIndex + 1) : blocks).filter((block) => block.type !== "continue" || !revealed[block.id]);

  return (
    <div className="space-y-6">
      <AnimatePresence initial={false}>
        {visibleBlocks.map((block, index) => (
          <motion.div
            key={block.id}
            layout
            className="student-block-frame"
            style={{ minHeight: block.style.minHeight ? `${block.style.minHeight}px` : undefined }}
            initial={{ opacity: 0, y: 8 }}
            animate={blocksReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, delay: blocksReady ? index * 0.035 : 0, ease: "easeOut" }}
          >
            <StudentBlockContent
              block={block}
              theme={theme}
              onContinue={() => onReveal(block.id)}
              onAnswer={() => onReveal(block.id)}
              onNextPage={onNextPage}
              renderChildren={(side) => (
                <StudentBlockList blocks={block.children?.[side] ?? []} blocksReady={blocksReady} theme={theme} revealed={revealed} onReveal={onReveal} onNextPage={onNextPage} />
              )}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
