"use client";
import { ArrowLeft, ArrowRight, RefreshCw, Shuffle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { Block, FlashcardItem, ThemeTokens } from "../types";
import { cn } from "../theme";
import { useStudentBlockState } from "../studentRuntime";
import { reconcileFlashcardOrder, shuffleFlashcardIds } from "../flashcardState";
import { EditableText } from "./EditableText";
import { MathText } from "./MathText";

type EditorProps = { block: Block; theme: ThemeTokens; updateBlock: (block: Block) => void };
type StudentProps = { block: Block; theme: ThemeTokens };

export function EditorFlashcardBlock({ block, theme, updateBlock }: EditorProps) {
  const cards = block.content.flashcards ?? [];
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const safeIndex = Math.min(index, Math.max(0, cards.length - 1));
  const current = cards[safeIndex];
  const updateCard = (patch: Partial<FlashcardItem>) => {
    if (!current) return;
    updateBlock({
      ...block,
      content: { ...block.content, flashcards: cards.map((item) => item.id === current.id ? { ...item, ...patch } : item) },
    });
  };

  return (
    <FlashcardFrame block={block} theme={theme} current={current} index={safeIndex} count={cards.length} flipped={flipped} editable onFlip={() => setFlipped((value) => !value)} onTextChange={(value) => updateCard(flipped ? { backText: value } : { frontText: value })}>
      {block.settings.flashcardVariant === "deck" && <DeckControls index={safeIndex} count={cards.length} onPrevious={() => { setIndex(Math.max(0, safeIndex - 1)); setFlipped(false); }} onNext={() => { setIndex(Math.min(cards.length - 1, safeIndex + 1)); setFlipped(false); }} />}
    </FlashcardFrame>
  );
}

export function StudentFlashcardBlock({ block, theme }: StudentProps) {
  const cards = useMemo(() => block.content.flashcards ?? [], [block.content.flashcards]);
  const initialOrder = useMemo(() => cards.map((card) => card.id), [cards]);
  const [storedOrder, setStoredOrder] = useStudentBlockState<string[]>(block.id, "flashcard.order", initialOrder);
  const [index, setIndex] = useStudentBlockState(block.id, "flashcard.index", 0);
  const [flipped, setFlipped] = useStudentBlockState(block.id, "flashcard.flipped", false);
  const order = reconcileFlashcardOrder(storedOrder, cards);
  const orderedCards = order.map((id) => cards.find((card) => card.id === id)).filter((card): card is FlashcardItem => Boolean(card));
  const safeIndex = Math.min(index, Math.max(0, orderedCards.length - 1));
  const current = orderedCards[safeIndex];
  const navigate = (nextIndex: number) => { setIndex(nextIndex); setFlipped(false); };
  const shuffle = () => {
    setStoredOrder(shuffleFlashcardIds(order));
    setIndex(0);
    setFlipped(false);
  };

  return (
    <FlashcardFrame block={block} theme={theme} current={current} index={safeIndex} count={orderedCards.length} flipped={flipped} onFlip={() => setFlipped((value) => !value)}>
      {block.settings.flashcardVariant === "deck" && (
        <>
          <DeckControls index={safeIndex} count={orderedCards.length} onPrevious={() => navigate(Math.max(0, safeIndex - 1))} onNext={() => navigate(Math.min(orderedCards.length - 1, safeIndex + 1))} />
          {block.settings.flashcardAllowShuffle && <button className="flashcard-control mx-auto mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black hover:bg-zinc-50" onClick={shuffle} type="button"><Shuffle size={14} /> Shuffle deck</button>}
        </>
      )}
    </FlashcardFrame>
  );
}

function FlashcardFrame({ block, theme, current, index, count, flipped, editable = false, onFlip, onTextChange, children }: { block: Block; theme: ThemeTokens; current?: FlashcardItem; index: number; count: number; flipped: boolean; editable?: boolean; onFlip: () => void; onTextChange?: (value: string) => void; children?: ReactNode }) {
  const radius = block.style.radius ?? 24;
  const controlColor = block.style.flashcardControlColor ?? block.style.accent ?? theme.primary;
  const duration = block.settings.flashcardAnimationSpeed === "fast" ? 0.3 : block.settings.flashcardAnimationSpeed === "slow" ? 0.7 : 0.48;
  const horizontal = block.settings.flashcardFlipDirection !== "vertical";
  const aspectRatio = block.settings.flashcardAspectRatio === "square" ? "1 / 1" : block.settings.flashcardAspectRatio === "wide" ? "16 / 8.5" : "16 / 10";
  const rotate = horizontal ? `rotateY(${flipped ? 180 : 0}deg)` : `rotateX(${flipped ? 180 : 0}deg)`;
  const backRotate = horizontal ? "rotateY(180deg)" : "rotateX(180deg)";
  const activate = (target: EventTarget | null) => {
    const element = target as HTMLElement | null;
    if (element?.closest("button, a, input, textarea, [contenteditable='true']")) return;
    onFlip();
  };

  return (
    <section className="mx-auto w-full max-w-2xl py-3" style={{ "--flashcard-control": controlColor } as CSSProperties}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={current?.id ?? "empty"} initial={{ opacity: 0, x: 24, scale: 0.985 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -18, scale: 0.985 }} transition={{ duration: 0.22 }}>
          <div className="flashcard-perspective w-full" style={{ aspectRatio, minHeight: block.style.minHeight }}>
            <div
              className="flashcard-flipper relative h-full w-full cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
              style={{ transform: rotate, transitionDuration: `${duration}s`, borderRadius: radius }}
              role="button"
              tabIndex={0}
              aria-label={`Show ${flipped ? "front" : "back"} of flashcard`}
              onClick={(event) => activate(event.target)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                if ((event.target as HTMLElement).closest("[contenteditable='true']")) return;
                event.preventDefault();
                onFlip();
              }}
            >
              <FlashcardFace block={block} current={current} side="front" active={!flipped} editable={editable && !flipped} onTextChange={onTextChange} radius={radius} controlColor={controlColor} count={count} index={index} />
              <FlashcardFace block={block} current={current} side="back" active={flipped} editable={editable && flipped} onTextChange={onTextChange} radius={radius} controlColor={controlColor} count={count} index={index} transform={backRotate} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {children}
    </section>
  );
}

function FlashcardFace({ block, current, side, active, editable, onTextChange, radius, controlColor, count, index, transform }: { block: Block; current?: FlashcardItem; side: "front" | "back"; active: boolean; editable: boolean; onTextChange?: (value: string) => void; radius: number; controlColor: string; count: number; index: number; transform?: string }) {
  const isBack = side === "back";
  const text = isBack ? current?.backText : current?.frontText;
  const imageSrc = isBack ? current?.backImageSrc : current?.frontImageSrc;
  const imageAlt = isBack ? current?.backImageAlt : current?.frontImageAlt;
  const textColor = isBack ? block.style.flashcardBackTextColor : block.style.flashcardFrontTextColor;
  const fillColor = isBack ? block.style.flashcardBackFillColor : block.style.flashcardFrontFillColor;
  const imageBeside = block.settings.flashcardImageLayout === "side";
  return (
    <div
      className={cn("flashcard-face absolute inset-0 flex flex-col overflow-hidden border p-6 sm:p-8", !active && "pointer-events-none")}
      style={{
        transform,
        background: fillColor ?? block.style.fillColor ?? "#ffffff",
        borderColor: block.style.borderColor ?? "#e4e4e7",
        borderWidth: block.style.borderWidth ?? 2,
        borderRadius: radius,
        boxShadow: `0 8px 0 ${block.style.shadowColor ?? "#d4d4d8"}, 0 18px 45px color-mix(in srgb, ${block.style.shadowColor ?? "#18181b"} 20%, transparent)`,
        color: textColor ?? block.style.fontColor,
      }}
      aria-hidden={!active}
    >
      <div className="flex min-h-6 items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: controlColor }}>
        <span>{block.settings.flashcardShowSideLabel !== false ? side : ""}</span>
        {block.settings.flashcardVariant === "deck" && <span>{Math.min(index + 1, count)} / {count}</span>}
      </div>
      <div className={cn("flex min-h-0 flex-1 items-center justify-center gap-5 py-4 text-center", imageSrc && imageBeside ? "flex-row text-left" : "flex-col")}>
        {imageSrc && <img className={cn("rounded-2xl", imageBeside ? "max-h-[80%] max-w-[46%]" : "max-h-[48%] max-w-[82%]")} style={{ objectFit: block.settings.flashcardImageFit ?? "contain" }} src={imageSrc} alt={imageAlt || `${side} flashcard image`} draggable={false} />}
        {editable ? <EditableText value={text} onChange={(value) => onTextChange?.(value)} className="min-w-0 text-xl font-black leading-relaxed sm:text-2xl" style={{ color: textColor ?? block.style.fontColor, fontSize: block.style.bodyFontSize }} placeholder={`${side === "front" ? "Front" : "Back"} text`} multiline /> : <MathText block text={text} className="min-w-0 text-xl font-black leading-relaxed sm:text-2xl" style={{ color: textColor ?? block.style.fontColor, fontSize: block.style.bodyFontSize }} />}
      </div>
      <div className="flex min-h-6 items-center justify-center gap-2 text-xs font-bold opacity-70" style={{ color: controlColor }}>
        {block.settings.flashcardShowFlipHint !== false && <><RefreshCw size={14} /><span>Click card to flip</span></>}
      </div>
    </div>
  );
}

function DeckControls({ index, count, onPrevious, onNext }: { index: number; count: number; onPrevious: () => void; onNext: () => void }) {
  return (
    <div className="mt-5 flex items-center justify-between gap-4">
      <button className="flashcard-control flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black disabled:opacity-40" disabled={index <= 0} onClick={onPrevious} type="button"><ArrowLeft size={16} /> Previous</button>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200" aria-label={`${Math.min(index + 1, count)} of ${count} cards`}><span className="flashcard-progress block h-full rounded-full transition-all" style={{ width: `${count ? ((index + 1) / count) * 100 : 0}%` }} /></div>
      <button className="flashcard-control flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-black disabled:opacity-40" disabled={index >= count - 1} onClick={onNext} type="button">Next <ArrowRight size={16} /></button>
    </div>
  );
}
