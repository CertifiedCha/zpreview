"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Block, Board, ThemeTokens } from "./types";
import { StudentBlockContent } from "./components/BlockRenderers";

type PreviewClientProps = {
  board: Board;
  theme: ThemeTokens;
};

export function PreviewClient({ board, theme }: PreviewClientProps) {
  const initialPageIndex = Math.max(0, board.pages.findIndex((page) => page.id === board.currentPageId));
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [pageDirection, setPageDirection] = useState(1);
  const [readyPageId, setReadyPageId] = useState(board.pages[initialPageIndex]?.id ?? "");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const page = board.pages[pageIndex] ?? board.pages[0];
  const blocksReady = readyPageId === page.id;

  useEffect(() => {
    const timer = window.setTimeout(() => setReadyPageId(page.id), 190);
    return () => window.clearTimeout(timer);
  }, [page.id]);

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
        <motion.main
          key={page.id}
          className="student-paper"
          initial={{ opacity: 0, x: pageDirection * 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: pageDirection * -28 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <StudentBlockList
            blocks={page.blocks}
            blocksReady={blocksReady}
            theme={theme}
            revealed={revealed}
            onReveal={(id) => setRevealed((current) => ({ ...current, [id]: true }))}
            onNextPage={() => {
              setPageDirection(1);
              setRevealed({});
              setPageIndex((current) => Math.min(board.pages.length - 1, current + 1));
            }}
          />
        </motion.main>
      </AnimatePresence>
    </div>
  );
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
