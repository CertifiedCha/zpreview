import type { Block, ThemeTokens } from "../../../types";

export function renderMiniDragSort(block: Block, theme: ThemeTokens) {
  const rows = block.content.rows?.length ? block.content.rows : [["First"], ["Second"], ["Third"]];
  return (
    <div className="source-quiz-preview">
      <p className="mb-3 line-clamp-2 text-[12px] font-black leading-snug text-zinc-950">{block.content.question}</p>
      <div className="space-y-2">
        {rows.slice(0, 4).map((row, index) => (
          <span key={`${row[0]}-${index}`} className="flex items-center gap-2 rounded-xl border border-b-[3px] border-zinc-200 bg-white px-3 py-2 text-[10px] font-bold text-zinc-800">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md text-[9px]" style={{ background: theme.bgLight, color: theme.primary }}>{index + 1}</span>
            <span className="truncate">{row[0]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function renderMiniDragBuckets(block: Block, theme: ThemeTokens) {
  const buckets = parseBucketNames(block);
  const rows = block.content.rows?.length ? block.content.rows : [["Item A", buckets[0]], ["Item B", buckets[1] ?? buckets[0]]];
  return (
    <div className="source-quiz-preview">
      <p className="mb-3 line-clamp-2 text-[12px] font-black leading-snug text-zinc-950">{block.content.question}</p>
      <div className="grid grid-cols-2 gap-2">
        {buckets.slice(0, 2).map((bucket) => (
          <span key={bucket} className="min-h-16 rounded-xl border border-dashed px-2 py-2 text-[9px] font-black" style={{ borderColor: theme.borderLight, background: theme.bgLight, color: theme.primary }}>
            {bucket}
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        {rows.slice(0, 3).map((row, index) => (
          <span key={`${row[0]}-${index}`} className="min-w-0 flex-1 truncate rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[9px] font-bold text-zinc-700">{row[0]}</span>
        ))}
      </div>
    </div>
  );
}

export function renderMiniDragPairs(block: Block, theme: ThemeTokens) {
  const rows = block.content.rows?.length ? block.content.rows : [["Term", "Match"], ["Term", "Match"]];
  return (
    <div className="source-quiz-preview">
      <p className="mb-3 line-clamp-2 text-[12px] font-black leading-snug text-zinc-950">{block.content.question}</p>
      <div className="grid grid-cols-[1fr_18px_1fr] gap-1.5">
        <div className="space-y-1.5">{rows.slice(0, 3).map((row, index) => <span key={`${row[0]}-${index}`} className="block truncate rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[9px] font-bold text-zinc-800">{row[0]}</span>)}</div>
        <div className="grid place-items-center text-[13px] font-black" style={{ color: theme.primary }}>{"<->"}</div>
        <div className="space-y-1.5">{rows.slice(0, 3).map((row, index) => <span key={`${row[1]}-${index}`} className="block truncate rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[9px] font-bold text-zinc-800">{row[1]}</span>)}</div>
      </div>
    </div>
  );
}

export function renderMiniDragDiagram(block: Block, theme: ThemeTokens) {
  return (
    <div className="source-quiz-preview">
      <p className="mb-3 line-clamp-2 text-[12px] font-black leading-snug text-zinc-950">{block.content.question}</p>
      <div className="relative h-28 rounded-xl border border-zinc-200 bg-zinc-50">
        <span className="absolute left-[50%] top-[18%] h-5 w-14 -translate-x-1/2 rounded-lg border border-dashed" style={{ borderColor: theme.primary }} />
        <span className="absolute left-[24%] top-[52%] h-5 w-14 -translate-x-1/2 rounded-lg border border-dashed" style={{ borderColor: theme.borderLight }} />
        <span className="absolute bottom-2 left-3 rounded-lg bg-white px-2 py-1 text-[9px] font-bold shadow-sm">Label</span>
      </div>
    </div>
  );
}

export function renderMiniDragVenn(block: Block, theme: ThemeTokens) {
  return (
    <div className="source-quiz-preview">
      <p className="mb-3 line-clamp-2 text-[12px] font-black leading-snug text-zinc-950">{block.content.question}</p>
      <div className="relative mx-auto h-28 max-w-44">
        <span className="absolute left-3 top-2 h-24 w-24 rounded-full border-2" style={{ borderColor: theme.primary, background: `${theme.primary}18` }} />
        <span className="absolute right-3 top-2 h-24 w-24 rounded-full border-2" style={{ borderColor: theme.accent, background: `${theme.accent}18` }} />
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-lg bg-white px-2 py-1 text-[9px] font-bold shadow-sm">Both</span>
      </div>
    </div>
  );
}

export function renderMiniGenericOrder(block: Block, theme: ThemeTokens) {
  const variant = block.settings.dragVariant ?? "sort";
  if (variant === "timeline") {
    return (
      <div className="source-quiz-preview">
        <p className="mb-3 line-clamp-2 text-[12px] font-black leading-snug text-zinc-950">{block.content.question}</p>
        <div className="grid grid-cols-2 gap-2">
          {(block.content.rows ?? []).slice(0, 4).map((row, index) => <span key={index} className="rounded-xl border border-b-[3px] border-zinc-200 bg-white px-2 py-2 text-center text-[9px] font-bold">{row[0]}</span>)}
        </div>
      </div>
    );
  }

  if (variant === "equation") {
    return (
      <div className="source-quiz-preview">
        <p className="mb-3 line-clamp-2 text-[12px] font-black leading-snug text-zinc-950">{block.content.question}</p>
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-zinc-200 bg-white p-3">
          {(block.content.rows ?? []).slice(0, 5).map((row, index) => <span key={index} className="rounded-lg px-2 py-1 text-[10px] font-black" style={{ background: theme.bgLight, color: theme.primary }}>{row[0]}</span>)}
        </div>
      </div>
    );
  }

  return renderMiniDragSort(block, theme);
}

function parseBucketNames(block: Block) {
  const fromAnswerText = (block.content.answerText ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const fromRows = Array.from(new Set((block.content.rows ?? []).map((row) => row[1]).filter(Boolean)));
  return fromAnswerText.length ? fromAnswerText : fromRows.length ? fromRows : ["Bucket A", "Bucket B"];
}
