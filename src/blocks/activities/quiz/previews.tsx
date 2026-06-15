import type { ReactNode } from "react";
import type { Block, ThemeTokens } from "../../../types";

export function renderMiniQuiz(block: Block, theme: ThemeTokens) {
  const choices = block.content.choices ?? [];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[8.5px] font-black uppercase tracking-[0.12em] text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.primary }} />
        Quiz sampler
      </div>
      <div className="grid grid-cols-2 gap-2">
        {miniQuizPanel(
          "Choice",
          <>
            <p className="mb-1.5 line-clamp-2 text-[9.5px] font-black leading-snug text-zinc-950">{block.content.question}</p>
            <div className="grid grid-cols-2 gap-1">
              {choices.slice(0, 4).map((choice, index) => (
                <div key={choice.id} className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-1.5 py-1 text-[8.5px] font-bold text-zinc-700">
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-md bg-[#f2efe6] text-[8px] text-zinc-500">{String.fromCharCode(65 + index)}</span>
                  <span className="truncate">{choice.text}</span>
                </div>
              ))}
            </div>
          </>,
        )}
        {miniQuizPanel(
          "Blank",
          <>
            <p className="text-[9.5px] font-semibold leading-5 text-zinc-800">
              France is <span className="inline-block h-5 w-10 rounded-md border border-blue-200 bg-white align-middle" /> and Japan is <span className="inline-block h-5 w-8 rounded-md border border-blue-200 bg-white align-middle" />.
            </p>
            <div className="mt-2 h-5 rounded-full" style={{ background: theme.borderLight }} />
          </>,
        )}
        {miniQuizPanel(
          "Answer",
          <>
            <p className="mb-2 line-clamp-2 text-[9.5px] font-black leading-snug text-zinc-950">What speed is reached?</p>
            <div className="grid grid-cols-[1fr_36px] gap-1">
              <div className="h-8 rounded-xl border border-zinc-200 bg-white" />
              <div className="h-8 rounded-xl" style={{ background: theme.borderLight }} />
            </div>
          </>,
        )}
        {miniQuizPanel(
          "True / Multi",
          <>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-[#f7f3ea] py-2 text-[9px] font-black text-zinc-700">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-green-100 text-green-700">T</span>
                True
              </div>
              <div className="flex items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-[#f7f3ea] py-2 text-[9px] font-black text-zinc-700">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-red-100 text-red-700">F</span>
                False
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="h-4 rounded-lg border border-zinc-200 bg-white" />
              <div className="h-4 rounded-lg border border-zinc-200 bg-white" />
            </div>
          </>,
        )}
      </div>
    </div>
  );
}

export function renderMiniMatching(block: Block, theme: ThemeTokens) {
  const rows = block.content.rows?.length
    ? block.content.rows
    : [
        ["Heart", "Circulatory"],
        ["Lung", "Respiratory"],
        ["Kidney", "Excretory"],
        ["Brain", "Nervous"],
      ];
  const right = [...rows.slice(1).map((row) => row[1] ?? ""), rows[0]?.[1] ?? ""].filter(Boolean);

  return (
    <div className="space-y-2">
      {block.content.question && <p className="line-clamp-2 text-[9.5px] font-semibold leading-snug text-zinc-950">{block.content.question}</p>}
      <div className="grid grid-cols-[1fr_16px_1fr] gap-1.5">
        <div className="space-y-1.5">
          {rows.slice(0, 4).map((row, index) => (
            <div key={`${row[0]}-${index}`} className="rounded-lg border border-b-[3px] border-zinc-200 bg-white px-2 py-1.5 text-[8.5px] font-semibold text-zinc-800">
              {row[0]}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <span className="text-[13px] font-semibold" style={{ color: theme.primary }}>{"<->"}</span>
        </div>
        <div className="space-y-1.5">
          {right.slice(0, 4).map((item, index) => (
            <div key={`${item}-${index}`} className="rounded-lg border border-b-[3px] border-zinc-200 bg-white px-2 py-1.5 text-[8.5px] font-semibold text-zinc-800">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function miniQuizPanel(title: string, children: ReactNode) {
  return (
    <div className="min-h-[90px] rounded-2xl border border-zinc-200 bg-[#fbfbfa] p-2 shadow-sm">
      <div className="mb-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-zinc-400">{title}</div>
      {children}
    </div>
  );
}
