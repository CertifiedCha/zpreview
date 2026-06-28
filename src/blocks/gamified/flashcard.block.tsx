import { Layers3 } from "lucide-react";
import type { Block, BlockDefinition, BlockFamilyVariant, FlashcardItem } from "../../types";
import { uid } from "../../theme";
import { baseTypographyGroup, containerStyleGroup, iconSize, makeBlock } from "../shared";

function card(frontText: string, backText: string): FlashcardItem {
  return { id: uid("card"), frontText, backText };
}

export function createFlipCardBlock(): Block {
  return makeBlock(
    "flashcard",
    { flashcards: [card("This is the front of the flashcard.", "This is the back answer students see after flipping.")] },
    {
      style: { shell: "card", flashcardFrontFillColor: "#fffdf7", flashcardBackFillColor: "#f5f3ff", flashcardFrontTextColor: "#18181b", flashcardBackTextColor: "#3b0764", flashcardControlColor: "#7c3aed", borderColor: "#ddd6fe", shadowColor: "#7c3aed", borderWidth: 2, radius: 24 },
      settings: { flashcardVariant: "flip", flashcardAllowShuffle: false, flashcardFlipDirection: "horizontal", flashcardAnimationSpeed: "normal", flashcardAspectRatio: "classic", flashcardImageLayout: "top", flashcardImageFit: "contain", flashcardShowSideLabel: true, flashcardShowFlipHint: true },
    },
  );
}

export function createStudyDeckBlock(): Block {
  return makeBlock(
    "flashcard",
    {
      flashcards: [
        card("Card front 1", "Card back 1"),
        card("Card front 2", "Card back 2"),
        card("Card front 3", "Card back 3"),
      ],
    },
    {
      style: { shell: "card", flashcardFrontFillColor: "#fffdf7", flashcardBackFillColor: "#f5f3ff", flashcardFrontTextColor: "#18181b", flashcardBackTextColor: "#3b0764", flashcardControlColor: "#7c3aed", borderColor: "#ddd6fe", shadowColor: "#7c3aed", borderWidth: 2, radius: 24 },
      settings: { flashcardVariant: "deck", flashcardAllowShuffle: false, flashcardFlipDirection: "horizontal", flashcardAnimationSpeed: "normal", flashcardAspectRatio: "classic", flashcardImageLayout: "top", flashcardImageFit: "contain", flashcardShowSideLabel: true, flashcardShowFlipHint: true },
    },
  );
}

function preview(block: Block) {
  const first = block.content.flashcards?.[0];
  const isDeck = block.settings.flashcardVariant === "deck";
  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 shadow-[0_4px_0_#7c3aed]">
      <div className="mb-3 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.14em] text-violet-600">
        <span>{isDeck ? "Study deck" : "Front"}</span>
        {isDeck && <span>1 / {block.content.flashcards?.length ?? 1}</span>}
      </div>
      <p className="line-clamp-3 min-h-12 text-center text-[13px] font-black leading-snug text-zinc-900">{first?.frontText || "Flashcard front"}</p>
      <p className="mt-3 text-center text-[10px] font-bold text-violet-500">Tap to flip</p>
    </div>
  );
}

export const flashcardFamilyVariants: BlockFamilyVariant[] = [
  { id: "flip", label: "Flip Card", createBlock: createFlipCardBlock, preview: (block) => preview(block) },
  { id: "deck", label: "Study Deck", createBlock: createStudyDeckBlock, preview: (block) => preview(block) },
];

export const flashcardBlock: BlockDefinition = {
  type: "flashcard",
  label: "Flashcards",
  category: "gamified",
  icon: <Layers3 size={iconSize} />,
  defaultBlock: createFlipCardBlock,
  preview: (block) => preview(block),
  family: { label: "Flashcards", variants: flashcardFamilyVariants },
  config: {
    contentControls: () => ["flashcardItems"],
    layout: [
      { section: "layout", kind: "select", target: "settings", key: "flashcardFlipDirection", label: "Flip direction", options: [{ label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }] },
      { section: "layout", kind: "select", target: "settings", key: "flashcardAnimationSpeed", label: "Animation speed", options: [{ label: "Fast", value: "fast" }, { label: "Normal", value: "normal" }, { label: "Slow", value: "slow" }] },
      { section: "layout", kind: "select", target: "settings", key: "flashcardAspectRatio", label: "Card shape", options: [{ label: "Wide", value: "wide" }, { label: "Classic", value: "classic" }, { label: "Square", value: "square" }] },
      { section: "layout", kind: "select", target: "settings", key: "flashcardImageLayout", label: "Image layout", options: [{ label: "Above text", value: "top" }, { label: "Beside text", value: "side" }] },
      { section: "layout", kind: "select", target: "settings", key: "flashcardImageFit", label: "Image fit", options: [{ label: "Contain", value: "contain" }, { label: "Cover", value: "cover" }] },
      { section: "layout", kind: "toggle", target: "settings", key: "flashcardShowSideLabel", label: "Show front / back label", defaultChecked: true },
      { section: "layout", kind: "toggle", target: "settings", key: "flashcardShowFlipHint", label: "Show flip hint", defaultChecked: true },
      {
        section: "layout",
        kind: "toggle",
        target: "settings",
        key: "flashcardAllowShuffle",
        label: "Let students shuffle",
        visibleWhen: (block) => block.settings.flashcardVariant === "deck",
      },
    ],
    stylePresets: [
      { id: "classic-study", label: "Classic Study", style: { flashcardFrontFillColor: "#fffdf7", flashcardBackFillColor: "#f5f3ff", flashcardFrontTextColor: "#18181b", flashcardBackTextColor: "#3b0764", flashcardControlColor: "#7c3aed", borderColor: "#ddd6fe", shadowColor: "#7c3aed", borderWidth: 2, radius: 24 } },
      { id: "quiz-blue", label: "Quiz Blue", style: { flashcardFrontFillColor: "#ffffff", flashcardBackFillColor: "#eff6ff", flashcardFrontTextColor: "#172554", flashcardBackTextColor: "#1e3a8a", flashcardControlColor: "#2563eb", borderColor: "#bfdbfe", shadowColor: "#2563eb", borderWidth: 2, radius: 22 } },
      { id: "playful-pop", label: "Playful Pop", style: { flashcardFrontFillColor: "#fef08a", flashcardBackFillColor: "#f0abfc", flashcardFrontTextColor: "#422006", flashcardBackTextColor: "#4a044e", flashcardControlColor: "#c026d3", borderColor: "#18181b", shadowColor: "#18181b", borderWidth: 3, radius: 28 } },
      { id: "midnight-neon", label: "Midnight Neon", style: { flashcardFrontFillColor: "#09090b", flashcardBackFillColor: "#18181b", flashcardFrontTextColor: "#a7f3d0", flashcardBackTextColor: "#c4b5fd", flashcardControlColor: "#8b5cf6", borderColor: "#8b5cf6", shadowColor: "#4c1d95", borderWidth: 2, radius: 22 } },
      { id: "minimal", label: "Minimal", style: { flashcardFrontFillColor: "#ffffff", flashcardBackFillColor: "#fafafa", flashcardFrontTextColor: "#18181b", flashcardBackTextColor: "#27272a", flashcardControlColor: "#52525b", borderColor: "#e4e4e7", shadowColor: "#e4e4e7", borderWidth: 1, radius: 16 } },
    ],
    styleGroups: [
      { title: "Card Faces", description: "Customize each side of the flashcard.", defaultOpen: true, fields: [
        { section: "styling", kind: "color", target: "style", key: "flashcardFrontFillColor", label: "Front fill", defaultColor: "#fffdf7" },
        { section: "styling", kind: "color", target: "style", key: "flashcardBackFillColor", label: "Back fill", defaultColor: "#f5f3ff" },
        { section: "styling", kind: "color", target: "style", key: "flashcardFrontTextColor", label: "Front text", defaultColor: "#18181b" },
        { section: "styling", kind: "color", target: "style", key: "flashcardBackTextColor", label: "Back text", defaultColor: "#3b0764" },
        { section: "styling", kind: "color", target: "style", key: "flashcardControlColor", label: "Controls and progress", defaultColor: "#7c3aed" },
      ] },
      containerStyleGroup,
      baseTypographyGroup,
    ],
  },
};
