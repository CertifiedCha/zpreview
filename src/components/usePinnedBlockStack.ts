import { useCallback, useLayoutEffect, useRef } from "react";
import { DEFAULT_BLOCK_GAP } from "../boardState";
import type { Block } from "../types";

const DEFAULT_PIN_TOP = 12;

export function getPinnedBlockOffsets(
  blocks: Block[],
  heightFor: (blockId: string) => number,
  defaultGap = DEFAULT_BLOCK_GAP,
  baseTop = DEFAULT_PIN_TOP,
) {
  const offsets = new Map<string, number>();
  let top = baseTop;
  let pinnedCount = 0;

  for (const block of blocks) {
    if (!block.pinned) continue;
    if (pinnedCount > 0) top += resolvedBlockGap(block, defaultGap);
    offsets.set(block.id, top);
    top += Math.max(0, heightFor(block.id));
    pinnedCount += 1;
  }

  return offsets;
}

export function usePinnedBlockStack(blocks: Block[], defaultGap = DEFAULT_BLOCK_GAP, baseTop = DEFAULT_PIN_TOP) {
  const nodes = useRef(new Map<string, HTMLDivElement>());

  const registerPinnedBlock = useCallback((blockId: string, node: HTMLDivElement | null) => {
    if (node) nodes.current.set(blockId, node);
    else nodes.current.delete(blockId);
  }, []);

  useLayoutEffect(() => {
    const updateOffsets = () => {
      const offsets = getPinnedBlockOffsets(blocks, (blockId) => nodes.current.get(blockId)?.offsetHeight ?? 0, defaultGap, baseTop);
      nodes.current.forEach((node, blockId) => {
        const offset = offsets.get(blockId);
        if (offset === undefined) node.style.removeProperty("--pinned-block-top");
        else node.style.setProperty("--pinned-block-top", `${offset}px`);
      });
    };

    updateOffsets();
    const pinnedNodes = blocks.flatMap((block) => {
      const node = block.pinned ? nodes.current.get(block.id) : undefined;
      return node ? [node] : [];
    });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateOffsets);
    pinnedNodes.forEach((node) => {
      observer?.observe(node);
      node.addEventListener("load", updateOffsets, true);
    });
    window.addEventListener("resize", updateOffsets);

    return () => {
      observer?.disconnect();
      pinnedNodes.forEach((node) => node.removeEventListener("load", updateOffsets, true));
      window.removeEventListener("resize", updateOffsets);
    };
  }, [baseTop, blocks, defaultGap]);

  return registerPinnedBlock;
}

function resolvedBlockGap(block: Block, defaultGap: number) {
  const gap = block.settings.customBlockGap ? block.style.blockGap ?? 0 : defaultGap;
  return Math.max(0, gap);
}
