import type { FlashcardItem } from "./types";

export function reconcileFlashcardOrder(order: string[], cards: FlashcardItem[]) {
  const ids = cards.map((card) => card.id);
  const valid = order.filter((id, index) => ids.includes(id) && order.indexOf(id) === index);
  return [...valid, ...ids.filter((id) => !valid.includes(id))];
}

export function shuffleFlashcardIds(ids: string[], random = Math.random) {
  const next = [...ids];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}
