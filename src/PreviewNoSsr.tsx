"use client";

import dynamic from "next/dynamic";
import type { Board, ThemeTokens } from "./types";

const PreviewClient = dynamic(() => import("./PreviewClient").then((module) => module.PreviewClient), {
  ssr: false,
  loading: () => (
    <div className="student-shell">
      <main className="student-paper">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm font-bold text-zinc-500">Loading lesson...</div>
      </main>
    </div>
  ),
});

type PreviewNoSsrProps = {
  board: Board;
  theme: ThemeTokens;
};

export function PreviewNoSsr(props: PreviewNoSsrProps) {
  return <PreviewClient {...props} />;
}
