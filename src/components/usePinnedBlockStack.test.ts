import { describe, expect, it } from "vitest";
import { createDefaultBlock } from "../blockRegistry";
import { getPinnedBlockOffsets } from "./usePinnedBlockStack";

function block(id: string, pinned = false) {
  return { ...createDefaultBlock("paragraph"), id, pinned };
}

describe("pinned block stacking", () => {
  it("stacks multiple pinned blocks using their measured heights and gaps", () => {
    const first = block("first", true);
    const ignored = block("ignored");
    const second = block("second", true);
    second.settings.customBlockGap = true;
    second.style.blockGap = 7;
    const third = block("third", true);
    const heights = new Map([[first.id, 40], [second.id, 30], [third.id, 20]]);

    const offsets = getPinnedBlockOffsets([first, ignored, second, third], (id) => heights.get(id) ?? 0, 20, 12);

    expect(Object.fromEntries(offsets)).toEqual({ first: 12, second: 59, third: 109 });
  });

  it("returns no sticky offsets when no blocks are pinned", () => {
    expect(getPinnedBlockOffsets([block("one"), block("two")], () => 40).size).toBe(0);
  });
});
