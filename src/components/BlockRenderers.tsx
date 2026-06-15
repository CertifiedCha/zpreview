import React, { useId } from "react";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, ArrowRight, Atom, Check, CheckCircle2, GripVertical, Image, Lightbulb, Link2, ThumbsDown, ThumbsUp, Video, X } from "lucide-react";
import type { Block, ImageAnnotation, ThemeTokens } from "../types";
import { shellClass, cn } from "../theme";
import { canStoreImageFile, showImageStorageLimitAlert } from "../utils/imageStorage";
import { loadJQueryCalculator } from "../utils/jqueryCalculator";
import { EditableText } from "./EditableText";
import { MathFormula, MathText } from "./MathText";

type EditorBlockContentProps = {
  block: Block;
  theme: ThemeTokens;
  updateBlock: (block: Block) => void;
  renderChildren?: (side: "left" | "right") => React.ReactNode;
};

type StudentBlockProps = {
  block: Block;
  theme: ThemeTokens;
  renderChildren?: (side: "left" | "right") => React.ReactNode;
  onContinue?: () => void;
  onNextPage?: () => void;
  onAnswer?: () => void;
};

export function EditorBlockContent({ block, theme, updateBlock, renderChildren }: EditorBlockContentProps) {
  const updateContent = (patch: Partial<Block["content"]>) => updateBlock({ ...block, content: { ...block.content, ...patch } });
  const hasTitle = hasText(block.content.title);
  const hasSubtitle = hasText(block.content.subtitle);
  const hasBodyText = hasText(block.content.text);

  if (block.type === "title") {
    return (
      <section className={cn(shellClass(block.style.shell), "py-5", textAlignClass(block, "center"))} style={blockSurfaceStyle(block)}>
        {(hasTitle || !hasSubtitle) && (
          <EditableText value={block.content.title} onChange={(title) => updateContent({ title })} className="text-[32px] font-bold leading-tight text-zinc-950 sm:text-[40px]" style={partTextStyle(block, "title")} placeholder="Title" />
        )}
        {hasSubtitle && <EditableText value={block.content.subtitle} onChange={(subtitle) => updateContent({ subtitle })} className="mx-auto mt-3 max-w-2xl text-[16px] font-medium leading-relaxed text-zinc-600" style={partTextStyle(block, "subtitle")} multiline />}
      </section>
    );
  }

  if (block.type === "paragraph") {
    return (
      <section className={cn(shellClass(block.style.shell), "py-3", textAlignClass(block))} style={blockSurfaceStyle(block)}>
        <EditableText value={block.content.text} onChange={(text) => updateContent({ text })} className="text-[16px] leading-7 text-zinc-700" style={partTextStyle(block, "body")} placeholder="Write your paragraph here, explanation, description..." multiline />
      </section>
    );
  }

  if (block.type === "sectionHeader") {
    const hasLabel = hasText(block.content.label);
    const hasIcon = hasText(block.content.icon);
    return (
      <section className={cn(shellClass(block.style.shell), "py-5", textAlignClass(block))} style={blockSurfaceStyle(block)}>
        {hasLabel && <EditableText value={block.content.label} onChange={(label) => updateContent({ label })} className="mb-3 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: block.style.accent ?? theme.primary }} placeholder="Unit 1" />}
        <div className="flex items-center gap-3">
          {hasIcon && <EditableText value={block.content.icon} onChange={(icon) => updateContent({ icon })} className="shrink-0 text-2xl leading-none" style={{ color: block.style.accent ?? theme.primary }} placeholder="🚀" />}
          <EditableText value={block.content.title} onChange={(title) => updateContent({ title })} className="text-[28px] font-black leading-tight text-zinc-950" style={partTextStyle(block, "title")} placeholder="Section title" />
        </div>
        <EditableText value={block.content.subtitle} onChange={(subtitle) => updateContent({ subtitle })} className={cn("mt-2 text-[15px] font-bold text-zinc-800", hasIcon && "pl-9")} style={partTextStyle(block, "subtitle")} placeholder="Subtitle" />
      </section>
    );
  }

  if (block.type === "keyPoints" || block.type === "checklist") {
    const rows = block.content.rows ?? [];
    const isChecklist = block.type === "checklist";
    return (
      <section className={cn(shellClass(block.style.shell), "py-5", textAlignClass(block))} style={blockSurfaceStyle(block)}>
        <EditableText value={block.content.title} onChange={(title) => updateContent({ title })} className={cn("mb-5 text-[18px] font-black text-zinc-950", !isChecklist && "border-l-4 pl-3")} style={{ ...partTextStyle(block, "title"), borderColor: block.style.accent ?? theme.primary }} placeholder={isChecklist ? "Checklist title" : "Key points title"} />
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-3">
              {isChecklist ? <span className="h-5 w-5 rounded-full border-2" style={{ borderColor: theme.primary }} /> : <CheckCircle2 className="shrink-0" size={18} style={{ color: theme.primary }} />}
              <EditableText value={row[0]} onChange={(value) => updateContent({ rows: rows.map((item, rowIndex) => (rowIndex === index ? [value] : item)) })} className="text-[15px] font-semibold text-zinc-800" style={partTextStyle(block, "body")} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "stepByStep") {
    return <StepByStepBlock block={block} theme={theme} editable updateContent={updateContent} />;
  }

  if (block.type === "tabbedContent") {
    return <TabbedContentBlock block={block} theme={theme} editable updateContent={updateContent} />;
  }

  if (block.type === "timeline") {
    return <TimelineBlock block={block} theme={theme} editable updateContent={updateContent} />;
  }

  if (block.type === "thumbsCheck") {
    return (
      <section className={cn(shellClass(block.style.shell ?? "card"), "mx-auto max-w-xl rounded-[28px] border p-8 text-center")} style={blockSurfaceStyle(block)}>
        <EditableText value={block.content.question} onChange={(question) => updateContent({ question })} className="text-[18px] font-black text-zinc-800" style={partTextStyle(block, "body")} placeholder="Do you understand this concept?" />
        <div className="mt-7 flex justify-center gap-8">
          <span className="grid h-20 w-20 place-items-center rounded-full border-4 border-zinc-200 bg-white text-zinc-400"><ThumbsDown size={34} /></span>
          <span className="grid h-20 w-20 place-items-center rounded-full border-4 bg-green-50 text-green-600 shadow-[0_0_30px_rgba(34,197,94,0.22)]" style={{ borderColor: "#22c55e" }}><ThumbsUp size={34} /></span>
        </div>
      </section>
    );
  }

  if (block.type === "equation") {
    return (
      <section className={cn(shellClass(block.style.shell), "equation-block-content py-1", textAlignClass(block, "center"))} style={equationSurfaceStyle(block)}>
        <MathFormula value={block.content.mathSource} display={block.settings.mathDisplay !== "inline"} className="equation-formula inline-block leading-none" style={blockTextStyle(block)} />
        {block.settings.showCaption && (
          <EditableText value={block.content.caption} onChange={(caption) => updateContent({ caption })} className="mt-0.5 text-[12px] font-medium leading-tight text-zinc-500" style={partTextStyle(block, "caption")} placeholder="Caption" />
        )}
      </section>
    );
  }

  if (block.type === "callout") {
    return (
      <section className={cn(shellClass(block.style.shell ?? "tinted"), "rounded-2xl border-2 p-5", textAlignClass(block))} style={blockSurfaceStyle(block, { background: theme.bgLight, borderColor: theme.borderLight })}>
        <div className="flex gap-3">
          <Lightbulb className="mt-1 shrink-0" size={22} style={{ color: theme.primary }} />
          <div className="min-w-0 flex-1">
            {(hasTitle || !hasBodyText) && <EditableText value={block.content.title} onChange={(title) => updateContent({ title })} className="text-[17px] font-bold text-zinc-900" style={partTextStyle(block, "title")} placeholder="Key idea" />}
            {hasBodyText && <EditableText value={block.content.text} onChange={(text) => updateContent({ text })} className={cn("text-[15px] leading-relaxed text-zinc-700", hasTitle && "mt-2")} style={partTextStyle(block, "body")} multiline />}
          </div>
        </div>
      </section>
    );
  }

  if (block.type === "table") {
    const rows = normalizeTableRows(block.content.rows);
    const columnCount = getTableColumnCount(rows);
    return (
      <section className={cn(shellClass(block.style.shell), "py-3")} style={blockSurfaceStyle(block)}>
        {(hasText(block.content.title) || rows.length === 0) && (
          <EditableText value={block.content.title} onChange={(title) => updateContent({ title })} className="mb-4 text-[18px] font-black text-zinc-950" style={partTextStyle(block, "title")} placeholder="Table title" />
        )}
        <div className={tableFrameClass(block)} style={tableFrameStyle(block)}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className={cn("grid", rowIndex === 0 ? "font-black uppercase tracking-[0.14em]" : "font-semibold")} style={tableRowStyle(block, rowIndex, columnCount)}>
              {Array.from({ length: columnCount }, (_, cellIndex) => row[cellIndex] ?? "").map((cell, cellIndex) => (
                <EditableText
                  key={`${rowIndex}-${cellIndex}`}
                  value={cell}
                  onChange={(value) => {
                    const nextRows = rows.map((currentRow, r) => currentRow.map((currentCell, c) => (r === rowIndex && c === cellIndex ? value : currentCell)));
                    updateContent({ rows: nextRows });
                  }}
                  className={cn("min-h-11 text-sm", tableCellBorderClass(block, cellIndex, columnCount), textAlignClass(block))}
                  style={tableCellStyle(block, rowIndex)}
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "quiz") {
    return <EditableQuiz block={block} theme={theme} updateContent={updateContent} />;
  }

  if (block.type === "dragDrop") {
    return <EditableDragDrop block={block} theme={theme} updateContent={updateContent} />;
  }

  if (block.type === "image") {
    return <ImageUploadBlock block={block} theme={theme} updateBlock={updateBlock} updateContent={updateContent} />;
  }

  if (block.type === "video") {
    return <VideoBlock block={block} theme={theme} updateContent={updateContent} editable />;
  }

  if (block.type === "simulation") {
    return <SimulationBlock block={block} theme={theme} editable />;
  }

  if (block.type === "hyperlink") {
    return <HyperlinkBlock block={block} editable updateContent={updateContent} />;
  }

  if (block.type === "separator") {
    return (
      <section className="flex items-center gap-3 py-4">
        <span className="h-0.5 flex-1 rounded-full" style={{ background: theme.borderLight }} />
        <EditableText value={block.content.label} onChange={(label) => updateContent({ label })} className="text-[11px] font-bold uppercase tracking-[0.14em]" />
        <span className="h-0.5 flex-1 rounded-full" style={{ background: theme.borderLight }} />
      </section>
    );
  }

  if (block.type === "line") {
    return <LineBlock block={block} />;
  }

  if (block.type === "twoColumn") {
    return (
      <section className="py-3">
        <div className={cn("grid gap-4", columnGridClass(block))}>
          {renderChildren?.("left")}
          {renderChildren?.("right")}
        </div>
      </section>
    );
  }

  if (block.type === "calculator") {
    return <CalculatorToolBlock block={block} theme={theme} />;
  }

  if (block.type === "continue") {
    return (
      <section className="py-5 text-center">
        <div className="lesson-action-button rounded-full px-7 py-3" style={lessonButtonStyle(theme, 4, block)}>
          <EditableText value={block.content.label} onChange={(label) => updateContent({ label })} className="text-sm font-bold text-white" style={partTextStyle(block, "button")} />
        </div>
      </section>
    );
  }

  if (block.type === "nextPage") {
    return (
      <section className="py-5 text-center">
        <div className="lesson-action-button inline-flex items-center gap-3 rounded-2xl px-7 py-3 text-sm font-bold text-white" style={lessonButtonStyle(theme, 4, block)}>
          <EditableText value={block.content.label} onChange={(label) => updateContent({ label })} className="text-sm font-bold text-white" style={partTextStyle(block, "button")} />
          <ArrowRight size={18} />
        </div>
      </section>
    );
  }

  return null;
}

export function StudentBlockContent({ block, theme, renderChildren, onContinue, onNextPage, onAnswer }: StudentBlockProps) {
  const hasTitle = hasText(block.content.title);
  const hasSubtitle = hasText(block.content.subtitle);
  const hasBodyText = hasText(block.content.text);

  if (block.type === "title") {
    return (
      <section className={cn(shellClass(block.style.shell), "py-5", textAlignClass(block, "center"))} style={blockSurfaceStyle(block)}>
        {hasTitle && <MathText block text={block.content.title} className="text-[32px] font-bold leading-tight text-zinc-950 sm:text-[40px]" style={partTextStyle(block, "title")} />}
        {hasSubtitle && <MathText block text={block.content.subtitle} className="mx-auto mt-3 max-w-2xl text-[16px] font-medium leading-relaxed text-zinc-600" style={partTextStyle(block, "subtitle")} />}
      </section>
    );
  }

  if (block.type === "paragraph") {
    return (
      <section className={cn(shellClass(block.style.shell), "py-3", textAlignClass(block))} style={blockSurfaceStyle(block)}>
        {hasBodyText && <MathText block text={block.content.text} className="text-[16px] leading-7 text-zinc-700" style={partTextStyle(block, "body")} />}
      </section>
    );
  }

  if (block.type === "sectionHeader") {
    const hasIcon = hasText(block.content.icon);
    return (
      <section className={cn(shellClass(block.style.shell), "py-5", textAlignClass(block))} style={blockSurfaceStyle(block)}>
        {block.content.label && <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: block.style.accent ?? theme.primary }}>{block.content.label}</p>}
        <div className="flex items-center gap-3">
          {hasIcon && <span className="shrink-0 text-2xl leading-none" style={{ color: block.style.accent ?? theme.primary }}>{block.content.icon}</span>}
          <MathText block text={block.content.title} className="text-[28px] font-black leading-tight text-zinc-950" style={partTextStyle(block, "title")} />
        </div>
        {block.content.subtitle && <MathText block text={block.content.subtitle} className={cn("mt-2 text-[15px] font-bold text-zinc-800", hasIcon && "pl-9")} style={partTextStyle(block, "subtitle")} />}
      </section>
    );
  }

  if (block.type === "keyPoints" || block.type === "checklist") {
    const rows = block.content.rows ?? [];
    const isChecklist = block.type === "checklist";
    return (
      <section className={cn(shellClass(block.style.shell), "py-5", textAlignClass(block))} style={blockSurfaceStyle(block)}>
        {block.content.title && <MathText block text={block.content.title} className={cn("mb-5 text-[18px] font-black text-zinc-950", !isChecklist && "border-l-4 pl-3")} style={{ ...partTextStyle(block, "title"), borderColor: block.style.accent ?? theme.primary }} />}
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-3">
              {isChecklist ? <span className="h-5 w-5 rounded-full border-2" style={{ borderColor: theme.primary }} /> : <CheckCircle2 className="shrink-0" size={18} style={{ color: theme.primary }} />}
              <MathText text={row[0]} className="text-[15px] font-semibold text-zinc-800" style={partTextStyle(block, "body")} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "stepByStep") return <StepByStepBlock block={block} theme={theme} />;
  if (block.type === "tabbedContent") return <TabbedContentBlock block={block} theme={theme} />;
  if (block.type === "timeline") return <TimelineBlock block={block} theme={theme} />;
  if (block.type === "thumbsCheck") return <ThumbsCheckBlock block={block} />;
  if (block.type === "equation") {
    return (
      <section className={cn(shellClass(block.style.shell), "equation-block-content py-1", textAlignClass(block, "center"))} style={equationSurfaceStyle(block)}>
        <MathFormula value={block.content.mathSource} display={block.settings.mathDisplay !== "inline"} className="equation-formula inline-block leading-none" style={blockTextStyle(block)} />
        {block.settings.showCaption && block.content.caption && <p className="mt-0.5 text-[12px] font-medium leading-tight text-zinc-500" style={partTextStyle(block, "caption")}>{block.content.caption}</p>}
      </section>
    );
  }

  if (block.type === "callout") {
    return (
      <section className={cn(shellClass(block.style.shell ?? "tinted"), "rounded-2xl border-2 p-5", textAlignClass(block))} style={blockSurfaceStyle(block, { background: theme.bgLight, borderColor: theme.borderLight })}>
        {hasTitle && (
          <MathText block text={block.content.title} className="text-[18px] font-bold" style={{ color: block.style.titleFontColor ?? block.style.fontColor ?? theme.primary, fontSize: block.style.titleFontSize ? `${block.style.titleFontSize}px` : scaledFontSize(block, 1.1) }} />
        )}
        {hasBodyText && <MathText block text={block.content.text} className={cn("text-[15px] leading-relaxed text-zinc-700", hasTitle && "mt-2")} style={partTextStyle(block, "body")} />}
      </section>
    );
  }

  if (block.type === "table") {
    const rows = normalizeTableRows(block.content.rows);
    const columnCount = getTableColumnCount(rows);
    return (
      <section className={cn(shellClass(block.style.shell), "py-3")} style={blockSurfaceStyle(block)}>
        {hasText(block.content.title) && <MathText block text={block.content.title} className="mb-4 text-[18px] font-black text-zinc-950" style={partTextStyle(block, "title")} />}
        <div className={tableFrameClass(block)} style={tableFrameStyle(block)}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className={cn("grid", rowIndex === 0 ? "font-black uppercase tracking-[0.14em]" : "font-semibold")} style={tableRowStyle(block, rowIndex, columnCount)}>
              {Array.from({ length: columnCount }, (_, cellIndex) => row[cellIndex] ?? "").map((cell, cellIndex) => (
                <div key={`${rowIndex}-${cellIndex}`} className={cn("min-h-11 text-sm", tableCellBorderClass(block, cellIndex, columnCount), textAlignClass(block))} style={tableCellStyle(block, rowIndex)}>
                  <MathText text={cell} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "quiz") {
    return <StudentQuiz block={block} theme={theme} onAnswer={onAnswer} />;
  }

  if (block.type === "dragDrop") {
    return <StudentDragDrop block={block} theme={theme} />;
  }

  if (block.type === "image") {
    return <StudentImageBlock block={block} theme={theme} />;
  }

  if (block.type === "video") {
    return <VideoBlock block={block} theme={theme} />;
  }

  if (block.type === "simulation") {
    return <SimulationBlock block={block} theme={theme} />;
  }

  if (block.type === "hyperlink") {
    return <HyperlinkBlock block={block} />;
  }

  if (block.type === "separator") {
    return (
      <section className="flex items-center gap-3 py-5">
        <span className="h-0.5 flex-1 rounded-full" style={{ background: theme.borderLight }} />
        <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: theme.primary }}>
          {block.content.label}
        </span>
        <span className="h-0.5 flex-1 rounded-full" style={{ background: theme.borderLight }} />
      </section>
    );
  }

  if (block.type === "line") {
    return <LineBlock block={block} />;
  }

  if (block.type === "twoColumn") {
    return (
      <section className="py-3">
        <div className={cn("grid gap-6", columnGridClass(block))}>
          {renderChildren?.("left")}
          {renderChildren?.("right")}
        </div>
      </section>
    );
  }

  if (block.type === "calculator") {
    return <CalculatorToolBlock block={block} theme={theme} />;
  }

  if (block.type === "continue") {
    return (
      <section className="py-5 text-center">
        <button className="lesson-action-button rounded-full px-7 py-3 text-sm font-bold text-white" style={lessonButtonStyle(theme, 4, block)} onClick={onContinue}>
          {block.content.label}
        </button>
      </section>
    );
  }

  if (block.type === "nextPage") {
    return (
      <section className="py-5 text-center">
        <button className="lesson-action-button inline-flex items-center gap-3 rounded-2xl px-7 py-3 text-sm font-bold text-white" style={lessonButtonStyle(theme, 4, block)} onClick={onNextPage}>
          {block.content.label}
          <ArrowRight size={18} />
        </button>
      </section>
    );
  }

  return null;
}

function LineBlock({ block }: { block: Block }) {
  const color = block.style.borderColor ?? "#d4d4d8";
  const thickness = block.style.lineThickness ?? 2;
  const width = `${block.style.lineWidth ?? 100}%`;
  const height = Math.max(12, thickness * 5);

  return (
    <section className={cn("flex py-4", lineAlignClass(block))}>
      {block.style.lineStyle === "wavy" ? (
        <svg className="block" width={width} height={height} viewBox="0 0 120 14" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 7 C10 1 20 13 30 7 S50 1 60 7 80 13 90 7 110 1 120 7" fill="none" stroke={color} strokeLinecap="round" strokeWidth={thickness} />
        </svg>
      ) : (
        <div
          aria-hidden="true"
          style={{
            width,
            borderTop: `${thickness}px ${cssLineStyle(block.style.lineStyle)} ${color}`,
          }}
        />
      )}
    </section>
  );
}

function CalculatorToolBlock({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const label = block.content.label?.trim() || "Show Calculator";
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 24, y: 24 });
  const dragState = React.useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function dragWindow(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragState.current;
    if (!drag) return;
    setPosition(
      clampCalculatorPosition({
        x: drag.originX + event.clientX - drag.startX,
        y: drag.originY + event.clientY - drag.startY,
      }),
    );
  }

  function stopDrag(event: React.PointerEvent<HTMLDivElement>) {
    dragState.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <section className="py-0 text-center">
      <button className="lesson-action-button rounded-full px-4 py-2 text-xs font-bold text-white" style={lessonButtonStyle(theme, 2, block)} onClick={() => setOpen((current) => !current)} type="button">
        {open ? "Hide Calculator" : label}
      </button>
      {open && (
        <div className="jquery-calculator-panel" data-calculator-window style={{ left: position.x, top: position.y }}>
          <div className="jquery-calculator-titlebar" onPointerCancel={stopDrag} onPointerDown={startDrag} onPointerMove={dragWindow} onPointerUp={stopDrag}>
            <GripVertical className="shrink-0 text-zinc-500" size={21} />
            <div className="min-w-0 flex-1 text-center text-base font-bold text-zinc-800">Calculator</div>
            <button className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800" onClick={() => setOpen(false)} onPointerDown={(event) => event.stopPropagation()} type="button" aria-label="Close calculator">
              <X size={21} />
            </button>
          </div>
          <JQueryScientificCalculator />
        </div>
      )}
    </section>
  );
}

type JQueryCalculatorOptions = {
  layout: string[];
  prompt: string;
  showAnim: string;
  value: number;
};

type JQueryCalculatorElement = JQuery<HTMLElement> & {
  calculator: (optionsOrMethod?: JQueryCalculatorOptions | "destroy") => void;
};

const khanCalculatorLayout = ["ASSNBSCECA", "ACCSLG@ECA", "ATTNPI1X@U", "LNLGSREXRN", "_7_8_9_*_+", "_4_5_6_/_-", "_1_2_3XYSR", "_._0+-_%_="];

function JQueryScientificCalculator() {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const host = hostRef.current;
    let destroyed = false;
    let hostElement: JQueryCalculatorElement | null = null;

    loadJQueryCalculator()
      .then(($calculator) => {
        if (destroyed || !host || !$calculator.calculator) return;
        hostElement = $calculator(host) as unknown as JQueryCalculatorElement;
        hostElement.calculator({
          layout: khanCalculatorLayout,
          prompt: "",
          showAnim: "",
          value: 0,
        });
        setReady(true);
      })
      .catch(() => setReady(false));

    return () => {
      destroyed = true;
      if (hostElement) {
        hostElement.calculator("destroy");
      }
    };
  }, []);

  return (
    <div className="jquery-calculator-body">
      <div className="jquery-calculator-scratch" aria-hidden="true" />
      <div ref={hostRef} className="jquery-calculator-host" />
      {!ready && <p className="px-3 pb-3 text-xs font-bold text-zinc-500">Loading calculator...</p>}
    </div>
  );
}

function clampCalculatorPosition(position: { x: number; y: number }) {
  const margin = 8;
  const width = Math.min(368, window.innerWidth - margin * 2);
  const height = Math.min(560, window.innerHeight - margin * 2);
  return {
    x: Math.max(margin, Math.min(position.x, window.innerWidth - width - margin)),
    y: Math.max(margin, Math.min(position.y, window.innerHeight - height - margin)),
  };
}

function HyperlinkBlock({ block, editable, updateContent }: { block: Block; editable?: boolean; updateContent?: (patch: Partial<Block["content"]>) => void }) {
  const align = block.style.textAlign ?? "left";
  const alignment = align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";
  const linkStyle: React.CSSProperties = {
    color: block.style.fontColor ?? "#2563eb",
    fontSize: block.style.fontSize ? `${block.style.fontSize}px` : undefined,
  };

  return (
    <section className={cn(shellClass(block.style.shell), "flex py-4", alignment)} style={blockSurfaceStyle(block)}>
      {editable && updateContent ? (
        <div className="inline-flex items-center gap-2 text-sm font-bold underline-offset-4 hover:underline" style={linkStyle}>
          <Link2 className="mr-2 shrink-0" size={16} />
          <EditableText value={block.content.linkLabel} onChange={(linkLabel) => updateContent({ linkLabel })} className="text-sm font-bold" style={linkStyle} placeholder="Link label" />
        </div>
      ) : (
        <a className="inline-flex items-center gap-2 text-sm font-bold underline-offset-4 hover:underline" href={safeHref(block.content.href)} rel="noreferrer" style={linkStyle} target="_blank">
          <Link2 size={16} />
          {block.content.linkLabel}
        </a>
      )}
    </section>
  );
}

function StepByStepBlock({ block, theme, editable, updateContent }: { block: Block; theme: ThemeTokens; editable?: boolean; updateContent?: (patch: Partial<Block["content"]>) => void }) {
  const rows = block.content.rows ?? [];
  const cards = block.settings.componentVariant === "card";
  const [visibleCount, setVisibleCount] = React.useState(1);
  const visibleRows = block.settings.interactive && !editable ? rows.slice(0, visibleCount) : rows;
  const updateRow = (index: number, cell: number, value: string) => updateContent?.({ rows: rows.map((row, rowIndex) => (rowIndex === index ? [cell === 0 ? value : row[0], cell === 1 ? value : row[1]] : row)) });
  return (
    <section className={cn(shellClass(block.style.shell), "py-5")} style={blockSurfaceStyle(block)}>
      {editable ? <EditableText value={block.content.title} onChange={(title) => updateContent?.({ title })} className="mb-7 border-l-4 pl-3 text-[19px] font-black text-zinc-950" style={{ ...partTextStyle(block, "title"), borderColor: theme.primary }} /> : <MathText block text={block.content.title} className="mb-7 block border-l-4 pl-3 text-[19px] font-black text-zinc-950" style={{ ...partTextStyle(block, "title"), borderColor: theme.primary }} />}
      <div className="relative space-y-7 pl-10 before:absolute before:bottom-4 before:left-[15px] before:top-2 before:w-1 before:rounded-full before:bg-zinc-200">
        <AnimatePresence initial={false}>
          {visibleRows.map((row, index) => (
            <motion.div
              key={index}
              layout
              className="relative"
              initial={editable ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <span className="absolute -left-10 top-0 z-10 grid h-9 w-9 place-items-center rounded-full border-2 border-zinc-200 bg-white text-sm font-black" style={{ color: theme.primary }}>{index + 1}</span>
              <div className={cn(cards ? "rounded-2xl border-2 border-zinc-200 border-b-[4px] bg-white px-7 py-6 shadow-sm" : "py-1")}>
                {editable ? <EditableText value={row[0]} onChange={(value) => updateRow(index, 0, value)} className="text-[17px] font-black" style={{ color: theme.primary }} /> : <MathText text={row[0]} className="block text-[17px] font-black" style={{ color: theme.primary }} />}
                {editable ? <EditableText value={row[1]} onChange={(value) => updateRow(index, 1, value)} className="mt-2 text-[15px] font-medium text-zinc-800" style={partTextStyle(block, "body")} multiline /> : <MathText text={row[1]} className="mt-2 block text-[15px] font-medium text-zinc-800" style={partTextStyle(block, "body")} />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {block.settings.interactive && !editable && visibleCount < rows.length && (
        <button className="lesson-action-button ml-10 mt-7 rounded-xl px-6 py-3 text-sm font-black text-white" style={lessonButtonStyle(theme, 4, block)} onClick={() => setVisibleCount((count) => Math.min(rows.length, count + 1))}>
          Next Step ↓
        </button>
      )}
    </section>
  );
}

function TabbedContentBlock({ block, theme, editable, updateContent }: { block: Block; theme: ThemeTokens; editable?: boolean; updateContent?: (patch: Partial<Block["content"]>) => void }) {
  const rows = block.content.rows ?? [];
  const [active, setActive] = React.useState(0);
  const current = rows[Math.min(active, Math.max(0, rows.length - 1))] ?? ["Overview", ""];
  const cards = block.settings.componentVariant === "card";
  const updateRow = (index: number, cell: number, value: string) => updateContent?.({ rows: rows.map((row, rowIndex) => (rowIndex === index ? [cell === 0 ? value : row[0], cell === 1 ? value : row[1]] : row)) });
  if (!block.settings.interactive && !editable) {
    return (
      <section className={cn(shellClass(block.style.shell), "py-5")} style={blockSurfaceStyle(block)}>
        <MathText block text={block.content.title} className="mb-6 text-[22px] font-black text-zinc-950" style={partTextStyle(block, "title")} />
        <div className="space-y-5">
          {rows.map((row, index) => (
            <div key={index}>
              <p className="mb-2 border-l-4 pl-3 text-[16px] font-black text-zinc-950" style={{ borderColor: theme.primary }}>{row[0]}</p>
              <MathText text={row[1]} className="text-[16px] font-medium text-zinc-800" />
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="flex min-h-0 flex-1 flex-col py-5">
      {hasText(block.content.title) &&
        (editable ? (
          <EditableText value={block.content.title} onChange={(title) => updateContent?.({ title })} className="mb-5 text-[22px] font-black text-zinc-950" style={partTextStyle(block, "title")} />
        ) : (
          <MathText block text={block.content.title} className="mb-5 text-[22px] font-black text-zinc-950" style={partTextStyle(block, "title")} />
        ))}
      <div className="my-4 flex flex-1 flex-col overflow-hidden rounded-2xl border-2 border-zinc-200 border-b-[4px] bg-white shadow-sm" style={blockSurfaceStyle(block, { background: "#ffffff", borderColor: "#e4e4e7", borderRadius: 18 })}>
        <div className="flex overflow-x-hidden overflow-y-hidden border-b-2 border-zinc-200 bg-zinc-50 sm:overflow-x-auto">
          {rows.map((row, index) => (
            <button
              key={index}
              className={cn(
                "flex min-w-0 flex-1 select-none items-center justify-center gap-1.5 border-r-2 border-zinc-200 px-4 py-3.5 text-[13px] font-bold transition-colors last:border-r-0 sm:min-w-[100px]",
                active === index ? "bg-white text-zinc-900" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
              )}
              style={{ boxShadow: active === index ? `inset 0 3px 0 ${theme.primary}, inset 0 -2px 0 #ffffff` : undefined }}
              onClick={() => setActive(index)}
              type="button"
            >
              {editable ? <EditableText value={row[0]} onChange={(value) => updateRow(index, 0, value)} className={cards ? "text-[12px]" : undefined} /> : <span className={cards ? "text-[12px]" : undefined}>{row[0]}</span>}
            </button>
          ))}
        </div>
        <div className={cn("flex flex-1 flex-col px-6 py-6", cards && "text-[14px]")}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              className="flex-1"
              initial={editable ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {editable ? <EditableText value={current[1]} onChange={(value) => updateRow(active, 1, value)} className="text-[16px] font-medium text-zinc-800" multiline /> : <MathText text={current[1]} className="text-[16px] font-medium text-zinc-800" />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function TimelineBlock({ block, theme, editable, updateContent }: { block: Block; theme: ThemeTokens; editable?: boolean; updateContent?: (patch: Partial<Block["content"]>) => void }) {
  const rows = block.content.rows ?? [];
  const cards = block.settings.componentVariant === "card";
  const updateRow = (index: number, cell: number, value: string) => updateContent?.({ rows: rows.map((row, rowIndex) => (rowIndex === index ? [cell === 0 ? value : row[0], cell === 1 ? value : row[1], cell === 2 ? value : row[2]] : row)) });
  return (
    <section className={cn(shellClass(block.style.shell), "py-6")} style={blockSurfaceStyle(block)}>
      {editable ? <EditableText value={block.content.title} onChange={(title) => updateContent?.({ title })} className="mb-8 text-center text-[22px] font-black text-zinc-950" style={partTextStyle(block, "title")} /> : <MathText block text={block.content.title} className="mb-8 block text-center text-[22px] font-black text-zinc-950" style={partTextStyle(block, "title")} />}
      <div className="relative space-y-9 pl-14 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-zinc-200">
        {rows.map((row, index) => (
          <div key={index} className="relative">
            <span className="absolute -left-[47px] top-2 grid h-5 w-5 place-items-center rounded-full border-4 border-white shadow-sm" style={{ background: theme.primary }} />
            <div className={cn(cards ? "rounded-2xl border-2 border-zinc-200 border-b-[4px] bg-white px-7 py-6 shadow-sm" : "py-1")}>
              {editable ? <EditableText value={row[0]} onChange={(value) => updateRow(index, 0, value)} className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black" style={{ color: theme.primary }} /> : <p className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black" style={{ color: theme.primary }}>{row[0]}</p>}
              {editable ? <EditableText value={row[1]} onChange={(value) => updateRow(index, 1, value)} className="block text-[17px] font-black text-zinc-950" /> : <MathText text={row[1]} className="block text-[17px] font-black text-zinc-950" />}
              {editable ? <EditableText value={row[2]} onChange={(value) => updateRow(index, 2, value)} className="mt-2 block text-[15px] font-medium text-zinc-800" multiline /> : <MathText text={row[2]} className="mt-2 block text-[15px] font-medium text-zinc-800" />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ThumbsCheckBlock({ block }: { block: Block }) {
  const [choice, setChoice] = React.useState<"down" | "up" | null>(null);
  return (
    <section className={cn(shellClass(block.style.shell ?? "card"), "mx-auto max-w-xl rounded-[28px] border p-8 text-center")} style={blockSurfaceStyle(block)}>
      <MathText text={block.content.question} className="text-[18px] font-black text-zinc-800" style={partTextStyle(block, "body")} />
      <div className="mt-7 flex justify-center gap-8">
        <button className={cn("grid h-20 w-20 place-items-center rounded-full border-4 bg-white text-zinc-400 transition", choice === "down" && "border-red-400 bg-red-50 text-red-500")} onClick={() => setChoice("down")} type="button"><ThumbsDown size={34} /></button>
        <button className={cn("grid h-20 w-20 place-items-center rounded-full border-4 bg-white text-zinc-400 transition", choice === "up" && "bg-green-50 text-green-600 shadow-[0_0_30px_rgba(34,197,94,0.22)]")} style={{ borderColor: choice === "up" ? "#22c55e" : "#e4e4e7" }} onClick={() => setChoice("up")} type="button"><ThumbsUp size={34} /></button>
      </div>
    </section>
  );
}

function SimulationBlock({ block, theme, editable }: { block: Block; theme: ThemeTokens; editable?: boolean }) {
  const simId = block.content.simulationId;
  const height = block.style.minHeight ?? 420;
  const src = simId ? phetEmbedUrl(simId) : "";

  return (
    <section className={cn(shellClass(block.style.shell), "py-3")} style={blockSurfaceStyle(block)}>
      {simId ? (
        <div className="overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-sm" style={{ height }}>
          <iframe
            title={block.content.simulationTitle || simId}
            src={src}
            width="100%"
            height="100%"
            scrolling="no"
            allowFullScreen
            loading="lazy"
            className={cn("block h-full w-full", editable && "pointer-events-none")}
          />
        </div>
      ) : (
        <div className="grid place-items-center rounded-2xl border-2 border-dashed border-blue-200 p-8 text-center" style={{ minHeight: height, background: theme.bgLight }}>
          <div>
            <Atom className="mx-auto mb-3" size={42} style={{ color: theme.primary }} />
            <p className="text-[16px] font-black text-zinc-800">Choose a PhET simulation</p>
            <p className="mt-2 text-sm font-semibold text-zinc-500">Select one in the config panel to embed it here.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function phetEmbedUrl(simId: string) {
  const safeId = simId.replace(/[^a-z0-9-]/gi, "");
  return `https://phet.colorado.edu/sims/html/${safeId}/latest/${safeId}_en.html`;
}

function VideoBlock({
  block,
  theme,
  updateContent,
  editable,
}: {
  block: Block;
  theme: ThemeTokens;
  updateContent?: (patch: Partial<Block["content"]>) => void;
  editable?: boolean;
}) {
  const inputId = useId();
  const sourceType = block.content.videoSourceType ?? "upload";
  const height = Math.max(block.style.minHeight ?? 360, 220);
  const url = block.content.videoUrl?.trim() || "";
  const youtubeEmbed = youtubeEmbedUrl(url);
  const isDirectVideo = sourceType === "link" || sourceType === "upload";

  function loadVideo(file?: File) {
    if (!file || !file.type.startsWith("video/") || !updateContent) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateContent({
        videoSourceType: "upload",
        videoUrl: String(reader.result),
        fileName: file.name,
        title: block.content.title || file.name,
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <section
      className={cn(shellClass(block.style.shell ?? "tinted"), "overflow-hidden rounded-2xl p-4")}
      style={blockSurfaceStyle(block, { background: theme.bgLight })}
      onDragOver={(event) => {
        if (!editable) return;
        event.preventDefault();
        event.stopPropagation();
      }}
      onDrop={(event) => {
        if (!editable) return;
        event.preventDefault();
        event.stopPropagation();
        loadVideo(event.dataTransfer.files[0]);
      }}
    >
      {editable && <input id={inputId} className="sr-only" type="file" accept="video/*" onChange={(event) => loadVideo(event.target.files?.[0])} />}
      {url ? (
        <div className="relative overflow-hidden rounded-xl bg-black shadow-sm" style={{ height }}>
          {youtubeEmbed ? (
            <iframe
              title={block.content.title || "Lesson video"}
              src={youtubeEmbed}
              className={cn("block h-full w-full", editable && "pointer-events-none")}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : isDirectVideo ? (
            <video className={cn("block h-full w-full bg-black", editable && "pointer-events-none")} src={url} controls preload="metadata" />
          ) : null}
          {editable && sourceType === "upload" && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <label className="cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 shadow-sm" htmlFor={inputId}>
                Replace video
              </label>
            </div>
          )}
        </div>
      ) : (
        <div className="grid place-items-center rounded-xl bg-white/55 px-6 py-8 text-center" style={{ minHeight: height }}>
          <div>
            <Video className="mx-auto mb-3" size={44} style={{ color: theme.primary }} />
            <p className="text-[16px] font-black text-zinc-800">{sourceType === "upload" ? "Choose or drop video here" : "Paste a video link in config"}</p>
            <p className="mt-2 max-w-sm text-sm font-semibold text-zinc-500">
              {sourceType === "youtube" ? "Use a YouTube watch, shorts, or embed URL." : sourceType === "link" ? "Use a direct .mp4, .webm, or browser-playable video URL." : "Uploaded videos are saved into this local board prototype."}
            </p>
            {editable && sourceType === "upload" && (
              <label className="lesson-action-button mt-5 inline-flex cursor-pointer rounded-full px-5 py-2.5 text-sm font-bold text-white" style={lessonButtonStyle(theme, 3, block)} htmlFor={inputId}>
                Choose video
              </label>
            )}
          </div>
        </div>
      )}
      {block.content.caption && <MathText text={block.content.caption} className="mt-3 text-center text-[13px] font-semibold text-zinc-500" style={partTextStyle(block, "body")} />}
    </section>
  );
}

function youtubeEmbedUrl(url: string) {
  if (!url) return "";
  
  // Quick check for 11-character video ID directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return `https://www.youtube.com/embed/${url.trim()}`;
  }

  try {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([^"&?/\s]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  } catch {
    return "";
  }
  
  return "";
}

function EditableDragDrop({ block, theme, updateContent }: { block: Block; theme: ThemeTokens; updateContent: (patch: Partial<Block["content"]>) => void }) {
  const variant = block.settings.dragVariant ?? "sort";
  const rows = normalizeDragRows(block);
  const isBucketLike = variant === "buckets" || variant === "venn";
  const isPairLike = variant === "pairs" || variant === "hierarchy";
  const isDiagram = variant === "diagram";
  const isBlanks = variant === "blanks";

  function updateRow(rowIndex: number, cellIndex: number, value: string) {
    updateContent({ rows: rows.map((row, index) => (index === rowIndex ? row.map((cellValue, currentCellIndex) => (currentCellIndex === cellIndex ? value : cellValue)) : row)) });
  }

  return (
    <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {block.settings.showPromptLabel && <EditableText value={block.content.label} onChange={(label) => updateContent({ label })} className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400" placeholder="Activity label" />}
      <EditableText value={block.content.question} onChange={(question) => updateContent({ question })} className="text-[17px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} placeholder="Activity prompt" multiline />
      {(isBucketLike || isBlanks || isDiagram) && (
        <EditableText value={block.content.text} onChange={(text) => updateContent({ text })} className="mt-2 text-[13px] font-medium text-zinc-500" placeholder="Optional supporting text" multiline />
      )}
      {isPairLike ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map((row, index) => (
            <div key={index} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-2">
              <EditableText value={row[0]} onChange={(value) => updateRow(index, 0, value)} className="rounded-xl bg-zinc-50 px-3 py-2 text-[14px] font-bold text-zinc-800" style={partTextStyle(block, "choice")} placeholder={variant === "hierarchy" ? "Node" : "Left card"} />
              <EditableText value={row[1]} onChange={(value) => updateRow(index, 1, value)} className="rounded-xl bg-blue-50 px-3 py-2 text-[13px] font-bold text-blue-700" placeholder={variant === "hierarchy" ? "Parent node" : "Right card"} />
            </div>
          ))}
        </div>
      ) : isDiagram ? (
        <div className="mt-5 space-y-4">
          <div className="relative min-h-64 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
            {block.content.src ? <img src={block.content.src} alt="" className="h-full min-h-64 w-full object-cover" draggable={false} /> : <div className="grid min-h-64 place-items-center text-sm font-bold text-zinc-400">Diagram image</div>}
            {rows.map((row, index) => (
              <span key={index} className="absolute min-w-20 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-dashed bg-white/90 px-3 py-2 text-center text-xs font-black" style={{ left: `${clampPercent(row[1], 50)}%`, top: `${clampPercent(row[2], 50)}%`, borderColor: theme.primary, color: theme.primary }}>
                {row[0]}
              </span>
            ))}
          </div>
        </div>
      ) : isBlanks ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-5 text-[16px] font-semibold leading-[3rem] text-zinc-800 shadow-sm">
            {(block.content.text || "The answer is ___.").split("___").map((part, index, parts) => (
              <React.Fragment key={`${part}-${index}`}>
                <MathText text={part} />
                {index < parts.length - 1 && <span className="mx-1 inline-flex h-10 min-w-20 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 align-middle" />}
              </React.Fragment>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white p-4">
            {(block.content.choices ?? []).map((choice) => <span key={choice.id} className="rounded-xl border border-b-[3px] border-zinc-200 bg-white px-3 py-2 text-sm font-bold">{choice.text}</span>)}
          </div>
        </div>
      ) : !isBucketLike ? (
        <div className="mt-5 space-y-3">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-3 rounded-2xl border-2 border-b-[4px] border-zinc-200 border-b-zinc-300 bg-white px-4 py-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-black" style={{ background: theme.bgLight, color: theme.primary }}>
                {index + 1}
              </span>
              <EditableText value={row[0]} onChange={(value) => updateRow(index, 0, value)} className="flex-1 text-[15px] font-bold text-zinc-800" style={partTextStyle(block, "choice")} placeholder="Ordered item" />
              <GripVertical className="text-zinc-300" size={18} />
            </div>
          ))}
          <QuizButtonPreview block={block} theme={theme} label={dragCheckLabel(block)} />
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {parseDragBuckets(block).map((bucket) => (
              <div key={bucket} className="min-h-24 rounded-2xl border-2 border-dashed px-4 py-3" style={{ borderColor: theme.borderLight, background: theme.bgLight }}>
                <p className="text-sm font-black" style={{ color: theme.primary }}>{bucket}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div key={index} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-2 sm:grid-cols-[1fr_150px]">
                <EditableText value={row[0]} onChange={(value) => updateRow(index, 0, value)} className="rounded-xl bg-zinc-50 px-3 py-2 text-[14px] font-bold text-zinc-800" style={partTextStyle(block, "choice")} placeholder="Draggable card" />
                <EditableText value={row[1]} onChange={(value) => updateRow(index, 1, value)} className="rounded-xl bg-blue-50 px-3 py-2 text-[13px] font-bold text-blue-700" placeholder="Bucket" />
              </div>
            ))}
          </div>
          <QuizButtonPreview block={block} theme={theme} label={variant === "venn" ? "Check Venn" : "Check buckets"} />
        </div>
      )}
    </section>
  );
}

function StudentDragDrop({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const resetKey = `${block.settings.dragVariant ?? "sort"}-${JSON.stringify(block.content.rows ?? [])}-${block.content.answerText ?? ""}`;
  if (block.settings.dragVariant === "buckets" || block.settings.dragVariant === "venn") return <StudentBucketDrag key={resetKey} block={block} theme={theme} />;
  if (block.settings.dragVariant === "pairs" || block.settings.dragVariant === "hierarchy") return <StudentDragPairs key={resetKey} block={block} theme={theme} />;
  if (block.settings.dragVariant === "diagram") return <StudentDragDiagram key={resetKey} block={block} theme={theme} />;
  if (block.settings.dragVariant === "blanks") return <StudentDragBlanks key={resetKey} block={block} theme={theme} />;
  return <StudentSortDrag key={resetKey} block={block} theme={theme} />;
}

function StudentSortDrag({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const rows = normalizeDragRows(block);
  const correctOrder = rows.map((_row, index) => String(index));
  const [items, setItems] = React.useState<string[]>(() => shuffleIds(correctOrder));
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );
  const correct = items.length === correctOrder.length && items.every((id, index) => id === correctOrder[index]);
  const activeRow = activeId ? rows[Number(activeId)] : undefined;

  return (
    <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {block.settings.showPromptLabel && block.content.label && <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">{block.content.label}</p>}
      <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />
      <DndContext
        sensors={sensors}
        onDragStart={(event) => setActiveId(String(event.active.id))}
        onDragEnd={(event) => {
          const active = String(event.active.id);
          const over = event.over?.id ? String(event.over.id) : "";
          if (over && active !== over && !submitted) {
            setItems((current) => arrayMove(current, current.indexOf(active), current.indexOf(over)));
          }
          setActiveId(null);
        }}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="mt-5 space-y-3">
            {items.map((id, index) => {
              const row = rows[Number(id)] ?? [""];
              const itemCorrect = submitted && id === correctOrder[index];
              const itemWrong = submitted && id !== correctOrder[index];
              return <SortableDragSortCard key={id} id={id} text={row[0]} index={index} block={block} theme={theme} submitted={submitted} correct={itemCorrect} wrong={itemWrong} />;
            })}
          </div>
        </SortableContext>
        <DragOverlay adjustScale={false}>
          {activeRow ? <DragCardShell text={activeRow[0]} index={Math.max(0, items.indexOf(activeId ?? ""))} block={block} theme={theme} active /> : null}
        </DragOverlay>
      </DndContext>
      <DragCheckControls block={block} theme={theme} submitted={submitted} correct={correct} checkLabel={dragCheckLabel(block)} onSubmit={() => setSubmitted(true)} onRetry={() => setSubmitted(false)} />
    </section>
  );
}

function SortableDragSortCard({ id, text, index, block, theme, submitted, correct, wrong }: { id: string; text: string; index: number; block: Block; theme: ThemeTokens; submitted: boolean; correct: boolean; wrong: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: submitted });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }}
      {...attributes}
      {...listeners}
    >
      <DragCardShell text={text} index={index} block={block} theme={theme} submitted={submitted} correct={correct} wrong={wrong} />
    </div>
  );
}

function StudentDragPairs({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const rows = normalizeDragRows(block);
  const matchRows = block.settings.dragVariant === "hierarchy" ? rows.filter((row) => row[1]) : rows;
  const answers = matchRows.map((row) => row[1]).filter(Boolean);
  const [matches, setMatches] = React.useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [activeAnswer, setActiveAnswer] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );
  const allPlaced = matchRows.length > 0 && matchRows.every((_row, index) => matches[index]);
  const correct = allPlaced && matchRows.every((row, index) => normalizeAnswer(matches[index]) === normalizeAnswer(row[1]));
  const matchedAnswers = Object.values(matches);

  function placeAnswer(index: number, answer: string) {
    setMatches((current) => {
      const next = Object.fromEntries(Object.entries(current).filter(([, value]) => value !== answer)) as Record<number, string>;
      next[index] = answer;
      return next;
    });
    setSelectedAnswer(null);
    setSubmitted(false);
  }

  return (
    <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {block.settings.showPromptLabel && block.content.label && <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">{block.content.label}</p>}
      <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />
      <DndContext
        sensors={sensors}
        onDragStart={(event) => setActiveAnswer(String(event.active.id).replace("pair-answer-", ""))}
        onDragEnd={(event) => {
          const rawOver = event.over?.id ? String(event.over.id) : "";
          const index = rawOver.startsWith("pair-slot-") ? Number(rawOver.replace("pair-slot-", "")) : Number.NaN;
          const answer = String(event.active.id).replace("pair-answer-", "");
          if (!Number.isNaN(index) && answer) placeAnswer(index, answer);
          setActiveAnswer(null);
        }}
        onDragCancel={() => setActiveAnswer(null)}
      >
        <div className="mt-5 grid gap-3">
          {matchRows.map((row, index) => {
            const current = matches[index];
            const isCorrect = submitted && normalizeAnswer(current) === normalizeAnswer(row[1]);
            const isWrong = submitted && !!current && !isCorrect;
            return (
              <div key={`${row[0]}-${index}`} className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-3 sm:grid-cols-[1fr_1fr]">
                <div className="rounded-xl bg-zinc-50 px-4 py-3 text-[15px] font-bold text-zinc-900" style={partTextStyle(block, "choice")}><MathText text={row[0]} /></div>
                <PairDropSlot index={index} answer={current} active={!!activeAnswer || !!selectedAnswer} correct={isCorrect} wrong={isWrong} onTap={() => selectedAnswer && placeAnswer(index, selectedAnswer)} />
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex min-h-[74px] flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-4">
          {answers.map((answer) => matchedAnswers.includes(answer) ? null : (
            <DraggablePairAnswer key={answer} answer={answer} block={block} theme={theme} selected={selectedAnswer === answer} submitted={submitted} onTap={() => setSelectedAnswer(selectedAnswer === answer ? null : answer)} />
          ))}
        </div>
        <DragOverlay adjustScale={false}>
          {activeAnswer ? <DragBucketChip text={activeAnswer} block={block} theme={theme} active /> : null}
        </DragOverlay>
      </DndContext>
      <DragCheckControls block={block} theme={theme} submitted={submitted} correct={correct} checkLabel={block.settings.dragVariant === "hierarchy" ? "Verify hierarchy" : "Check pairs"} disabled={!allPlaced} onSubmit={() => setSubmitted(true)} onRetry={() => setSubmitted(false)} />
    </section>
  );
}

function PairDropSlot({ index, answer, active, correct, wrong, onTap }: { index: number; answer?: string; active: boolean; correct: boolean; wrong: boolean; onTap: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `pair-slot-${index}` });
  return (
    <button
      ref={setNodeRef}
      className={cn(
        "min-h-12 rounded-xl border-2 border-dashed bg-zinc-50 px-4 py-3 text-left text-[15px] font-bold transition",
        (active || isOver) && "border-blue-300 bg-blue-50",
        answer && "border-solid border-zinc-200 border-b-[4px] bg-white text-zinc-900",
        correct && "border-green-500 border-b-green-700 bg-green-50 text-green-900",
        wrong && "border-red-400 border-b-red-600 bg-red-50 text-red-900",
      )}
      onClick={onTap}
      type="button"
    >
      {answer || <span className="text-zinc-400">Drop match</span>}
    </button>
  );
}

function DraggablePairAnswer({ answer, block, theme, selected, submitted, onTap }: { answer: string; block: Block; theme: ThemeTokens; selected: boolean; submitted: boolean; onTap: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `pair-answer-${answer}`, disabled: submitted });
  return (
    <button
      ref={setNodeRef}
      className={cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-40")}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      onClick={onTap}
      type="button"
      {...listeners}
      {...attributes}
    >
      <DragBucketChip text={answer} block={block} theme={theme} selected={selected} />
    </button>
  );
}

function StudentDragDiagram({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const rows = normalizeDragRows(block);
  const [placements, setPlacements] = React.useState<Record<number, number>>({});
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );
  const placedLabelIndexes = Object.values(placements);
  const allPlaced = rows.length > 0 && rows.every((_row, index) => placements[index] !== undefined);
  const correct = allPlaced && rows.every((_row, index) => placements[index] === index);

  function placeLabel(zoneIndex: number, labelIndex: number) {
    setPlacements((current) => {
      const next = Object.fromEntries(Object.entries(current).filter(([, value]) => value !== labelIndex)) as unknown as Record<number, number>;
      next[zoneIndex] = labelIndex;
      return next;
    });
    setSelectedIndex(null);
    setSubmitted(false);
  }

  return (
    <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {block.settings.showPromptLabel && block.content.label && <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">{block.content.label}</p>}
      <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />
      {block.content.text && <MathText text={block.content.text} className="mt-2 text-[13px] font-medium text-zinc-500" />}
      <DndContext
        sensors={sensors}
        onDragStart={(event) => setActiveIndex(Number(String(event.active.id).replace("diagram-label-", "")))}
        onDragEnd={(event) => {
          const zoneIndex = event.over?.id ? Number(String(event.over.id).replace("diagram-zone-", "")) : Number.NaN;
          const labelIndex = Number(String(event.active.id).replace("diagram-label-", ""));
          if (!Number.isNaN(zoneIndex) && !Number.isNaN(labelIndex)) placeLabel(zoneIndex, labelIndex);
          setActiveIndex(null);
        }}
        onDragCancel={() => setActiveIndex(null)}
      >
        <div className="relative mt-5 min-h-72 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
          {block.content.src ? <img src={block.content.src} alt="" className="h-full min-h-72 w-full object-cover" draggable={false} /> : <div className="grid min-h-72 place-items-center text-sm font-bold text-zinc-400">Add an image URL in Properties</div>}
          {rows.map((row, index) => {
            const placed = placements[index];
            const isCorrect = submitted && placed === index;
            const isWrong = submitted && placed !== undefined && placed !== index;
            return (
              <DiagramDropZone key={index} index={index} x={clampPercent(row[1], 50)} y={clampPercent(row[2], 50)} active={selectedIndex !== null || activeIndex !== null} correct={isCorrect} wrong={isWrong} theme={theme} onTap={() => selectedIndex !== null && placeLabel(index, selectedIndex)}>
                {placed !== undefined ? rows[placed]?.[0] : ""}
              </DiagramDropZone>
            );
          })}
        </div>
        <div className="mt-5 flex min-h-[74px] flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-4">
          {rows.map((row, index) => placedLabelIndexes.includes(index) ? null : (
            <DraggableDiagramLabel key={index} index={index} text={row[0]} block={block} theme={theme} selected={selectedIndex === index} submitted={submitted} onTap={() => setSelectedIndex(selectedIndex === index ? null : index)} />
          ))}
        </div>
        <DragOverlay adjustScale={false}>
          {activeIndex !== null && rows[activeIndex] ? <DragBucketChip text={rows[activeIndex][0]} block={block} theme={theme} active /> : null}
        </DragOverlay>
      </DndContext>
      <DragCheckControls block={block} theme={theme} submitted={submitted} correct={correct} checkLabel="Check labels" disabled={!allPlaced} onSubmit={() => setSubmitted(true)} onRetry={() => setSubmitted(false)} />
    </section>
  );
}

function DiagramDropZone({ index, x, y, active, correct, wrong, theme, children, onTap }: { index: number; x: number; y: number; active: boolean; correct: boolean; wrong: boolean; theme: ThemeTokens; children: React.ReactNode; onTap: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `diagram-zone-${index}` });
  return (
    <button
      ref={setNodeRef}
      className={cn(
        "absolute min-h-11 min-w-24 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-dashed bg-white/90 px-3 py-2 text-center text-xs font-black shadow-sm transition",
        (active || isOver) && "scale-105",
        correct && "border-green-500 bg-green-50 text-green-800",
        wrong && "border-red-400 bg-red-50 text-red-800",
      )}
      style={{ left: `${x}%`, top: `${y}%`, borderColor: correct || wrong ? undefined : theme.primary }}
      onClick={onTap}
      type="button"
    >
      {children || <span className="text-transparent">Target</span>}
    </button>
  );
}

function DraggableDiagramLabel({ index, text, block, theme, selected, submitted, onTap }: { index: number; text: string; block: Block; theme: ThemeTokens; selected: boolean; submitted: boolean; onTap: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `diagram-label-${index}`, disabled: submitted });
  return (
    <button ref={setNodeRef} className={cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-40")} style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined} onClick={onTap} type="button" {...listeners} {...attributes}>
      <DragBucketChip text={text} block={block} theme={theme} selected={selected} />
    </button>
  );
}

function StudentDragBlanks({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const blankCount = countBlanksForBlock(block);
  const correctAnswers = parseAnswerList(block.content.answerText);
  const [answers, setAnswers] = React.useState<string[]>([]);
  const [activeWord, setActiveWord] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );
  const correct = sameOrderedAnswers(answers, correctAnswers);

  function placeAnswer(index: number, word: string) {
    setAnswers((current) => {
      const next = current.map((answer) => (normalizeAnswer(answer) === normalizeAnswer(word) ? "" : answer));
      next[index] = word;
      return next;
    });
    setSubmitted(false);
  }

  return (
    <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {block.settings.showPromptLabel && block.content.label && <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">{block.content.label}</p>}
      <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />
      <DndContext
        sensors={sensors}
        onDragStart={(event) => setActiveWord(String(event.active.id).replace("drag-blank-word-", ""))}
        onDragEnd={(event) => {
          const overId = event.over?.id ? String(event.over.id) : "";
          const index = overId.startsWith("drag-blank-slot-") ? Number(overId.replace("drag-blank-slot-", "")) : Number.NaN;
          const word = String(event.active.id).replace("drag-blank-word-", "");
          if (!Number.isNaN(index) && word) placeAnswer(index, word);
          setActiveWord(null);
        }}
        onDragCancel={() => setActiveWord(null)}
      >
        <div className="mt-5 rounded-2xl border border-zinc-200 bg-white px-5 py-5 text-[16px] font-semibold leading-[3rem] text-zinc-800 shadow-sm">
          {normalizedBlankText(block.content.text || block.content.question).split("___").map((part, index, parts) => (
            <React.Fragment key={`${part}-${index}`}>
              <MathText text={part} />
              {index < parts.length - 1 && <DragBlankSlot index={index} word={answers[index]} active={!!activeWord} submitted={submitted} correct={normalizeAnswer(answers[index]) === normalizeAnswer(correctAnswers[index])} onClear={() => { setAnswers((current) => replaceAt(current, index, "")); setSubmitted(false); }} />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-5 flex min-h-[74px] flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-4">
          {(block.content.choices ?? []).map((choice) => answers.map(normalizeAnswer).includes(normalizeAnswer(choice.text)) ? null : <DraggableBlankWord key={choice.id} text={choice.text} block={block} theme={theme} />)}
        </div>
        <DragOverlay adjustScale={false}>
          {activeWord ? <DragBucketChip text={activeWord} block={block} theme={theme} active /> : null}
        </DragOverlay>
      </DndContext>
      <DragCheckControls block={block} theme={theme} submitted={submitted} correct={correct} checkLabel="Check blanks" disabled={!hasEveryBlankFilled(answers, blankCount)} onSubmit={() => setSubmitted(true)} onRetry={() => setSubmitted(false)} />
    </section>
  );
}

function DragBlankSlot({ index, word, active, submitted, correct, onClear }: { index: number; word?: string; active: boolean; submitted: boolean; correct: boolean; onClear: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `drag-blank-slot-${index}` });
  return (
    <button ref={setNodeRef} className={cn("mx-1 inline-flex h-10 min-w-24 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 align-middle text-[15px] font-bold text-transparent transition", (active || isOver) && !word && "border-blue-300 bg-blue-50", word && "border-solid border-blue-600 border-b-[4px] bg-white text-zinc-900 shadow-sm", submitted && word && (correct ? "border-green-500 border-b-green-700 bg-green-50 text-green-900" : "border-red-400 border-b-red-600 bg-red-50 text-red-900"))} onClick={onClear} type="button">
      {word || "blank"}
    </button>
  );
}

function DraggableBlankWord({ text, block, theme }: { text: string; block: Block; theme: ThemeTokens }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `drag-blank-word-${text}` });
  return (
    <button ref={setNodeRef} className={cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-40")} style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined} type="button" {...listeners} {...attributes}>
      <DragBucketChip text={text} block={block} theme={theme} />
    </button>
  );
}

function StudentBucketDrag({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const rows = normalizeDragRows(block);
  const buckets = parseDragBuckets(block);
  const [locations, setLocations] = React.useState<Record<number, string | null>>({});
  const [selected, setSelected] = React.useState<number | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );
  const allPlaced = rows.length > 0 && rows.every((_row, index) => locations[index]);
  const correct = allPlaced && rows.every((row, index) => normalizeAnswer(locations[index] ?? "") === normalizeAnswer(row[1]));
  const activeIndex = activeId?.startsWith("drag-item-") ? Number(activeId.replace("drag-item-", "")) : null;

  function placeItem(index: number, bucket: string | null) {
    setLocations((current) => ({ ...current, [index]: bucket }));
    setSelected(null);
    setSubmitted(false);
  }

  function chooseBucket(bucket: string) {
    if (selected !== null) placeItem(selected, bucket);
  }

  return (
    <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {block.settings.showPromptLabel && block.content.label && <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">{block.content.label}</p>}
      <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />
      {block.content.text && <MathText text={block.content.text} className="mt-2 text-[13px] font-medium text-zinc-500" />}
      <DndContext
        sensors={sensors}
        onDragStart={(event) => setActiveId(String(event.active.id))}
        onDragEnd={(event) => {
          const rawId = String(event.active.id);
          const index = Number(rawId.replace("drag-item-", ""));
          const bucket = event.over?.id ? String(event.over.id).replace("drag-bucket-", "") : "";
          if (!Number.isNaN(index) && bucket) placeItem(index, bucket);
          setActiveId(null);
        }}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="mt-5 flex min-h-[74px] flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-4">
          {rows.map((row, index) => locations[index] ? null : (
            <DraggableBucketCard key={index} id={`drag-item-${index}`} text={row[0]} block={block} theme={theme} selected={selected === index} submitted={submitted} onTap={() => setSelected(selected === index ? null : index)} />
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {buckets.map((bucket, bucketIndex) => (
            <DroppableBucketZone key={bucket} id={`drag-bucket-${bucket}`} bucket={bucket} index={bucketIndex} theme={theme} active={selected !== null} onTap={() => chooseBucket(bucket)}>
              {rows.map((row, index) => locations[index] === bucket ? (
                <DraggableBucketCard
                  key={index}
                  id={`drag-item-${index}`}
                  text={row[0]}
                  block={block}
                  theme={theme}
                  selected={selected === index}
                  submitted={submitted}
                  correct={submitted && normalizeAnswer(row[1]) === normalizeAnswer(bucket)}
                  wrong={submitted && normalizeAnswer(row[1]) !== normalizeAnswer(bucket)}
                  onTap={() => (submitted ? undefined : placeItem(index, null))}
                />
              ) : null)}
            </DroppableBucketZone>
          ))}
        </div>
        <DragOverlay adjustScale={false}>
          {activeIndex !== null && rows[activeIndex] ? <DragBucketChip text={rows[activeIndex][0]} block={block} theme={theme} active /> : null}
        </DragOverlay>
      </DndContext>
      <DragCheckControls block={block} theme={theme} submitted={submitted} correct={correct} checkLabel="Check buckets" disabled={!allPlaced} onSubmit={() => setSubmitted(true)} onRetry={() => setSubmitted(false)} />
    </section>
  );
}

function DragCardShell({ text, index, block, theme, submitted, correct, wrong, active }: { text: string; index: number; block: Block; theme: ThemeTokens; submitted?: boolean; correct?: boolean; wrong?: boolean; active?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border-2 border-b-[4px] bg-white px-5 py-4 text-left text-[15px] font-bold shadow-sm transition",
        submitted ? "" : "cursor-grab active:cursor-grabbing hover:border-zinc-300",
        correct && "border-green-500 border-b-green-700 bg-green-50 text-green-900",
        wrong && "border-red-400 border-b-red-600 bg-red-50 text-red-900",
        active && "scale-[1.02] shadow-xl",
      )}
      style={{ ...partTextStyle(block, "choice"), borderColor: active ? theme.primary : undefined, borderBottomColor: active ? theme.shadow : undefined }}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-black" style={{ background: correct ? "#16a34a" : wrong ? "#dc2626" : theme.bgLight, color: correct || wrong ? "#ffffff" : theme.primary }}>
        {submitted ? (correct ? <Check size={16} /> : wrong ? <X size={16} /> : index + 1) : index + 1}
      </span>
      <MathText text={text} className="min-w-0 flex-1" />
      {!submitted && <GripVertical className="shrink-0 text-zinc-300" size={18} />}
    </div>
  );
}

function DraggableBucketCard({ id, text, block, theme, selected, submitted, correct, wrong, onTap }: { id: string; text: string; block: Block; theme: ThemeTokens; selected: boolean; submitted: boolean; correct?: boolean; wrong?: boolean; onTap: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: submitted });
  return (
    <button
      ref={setNodeRef}
      className={cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-40")}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      onClick={onTap}
      type="button"
      {...listeners}
      {...attributes}
    >
      <DragBucketChip text={text} block={block} theme={theme} selected={selected} correct={correct} wrong={wrong} />
    </button>
  );
}

function DragBucketChip({ text, block, theme, selected, correct, wrong, active }: { text: string; block: Block; theme: ThemeTokens; selected?: boolean; correct?: boolean; wrong?: boolean; active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-xl border-2 border-b-[4px] bg-white px-4 py-2 text-[14px] font-bold text-zinc-900 shadow-sm transition",
        selected && "bg-blue-50",
        correct && "border-green-500 border-b-green-700 bg-green-50 text-green-900",
        wrong && "border-red-400 border-b-red-600 bg-red-50 text-red-900",
        active && "scale-105 shadow-xl",
      )}
      style={{ ...partTextStyle(block, "choice"), borderColor: selected || active ? theme.primary : undefined, borderBottomColor: selected || active ? theme.shadow : undefined }}
    >
      <MathText text={text} />
    </span>
  );
}

function DroppableBucketZone({ id, bucket, index, theme, active, children, onTap }: { id: string; bucket: string; index: number; theme: ThemeTokens; active: boolean; children: React.ReactNode; onTap: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn("min-h-36 rounded-2xl border-2 border-dashed bg-white p-3 text-left transition", (active || isOver) && "scale-[1.01] shadow-sm")}
      style={{ borderColor: isOver || active ? theme.primary : theme.borderLight, background: isOver ? theme.bgLight : "#ffffff" }}
      onClick={onTap}
      role="button"
      tabIndex={0}
    >
      <span className="mb-3 flex items-center gap-2 text-sm font-black" style={{ color: theme.primary }}>
        <span className="grid h-6 w-6 place-items-center rounded-lg text-[11px] text-white" style={{ background: dragBucketPalette[index % dragBucketPalette.length] }}>{index + 1}</span>
        {bucket}
      </span>
      <span className="flex min-h-16 flex-wrap gap-2">{children}</span>
    </div>
  );
}

function DragCheckControls({ block, theme, submitted, correct, checkLabel, disabled, onSubmit, onRetry }: { block: Block; theme: ThemeTokens; submitted: boolean; correct: boolean; checkLabel: string; disabled?: boolean; onSubmit: () => void; onRetry: () => void }) {
  if (!submitted) {
    return (
      <button disabled={disabled} className={cn("lesson-action-button mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40", block.settings.quizButtonWidth === "full" && "w-full")} style={lessonButtonStyle(theme, 3, block)} onClick={onSubmit}>
        <Check size={17} />
        {checkLabel}
      </button>
    );
  }

  return (
    <div className={cn("mt-4 rounded-xl border-2 p-4 text-sm font-semibold", correct ? "border-green-600 bg-green-50 text-green-800" : "border-red-300 bg-red-50 text-red-800")}>
      <p className="font-black">{correct ? "Correct!" : "Not quite yet"}</p>
      <p className="mt-1">{correct ? block.content.correctExplanation : block.content.incorrectExplanation}</p>
      {!correct && block.content.hint && (
        <p className="mt-2 border-l-[3px] border-red-300 pl-3">
          <strong>Hint:</strong> {block.content.hint}
        </p>
      )}
      {!correct && block.settings.retry && (
        <button className="mt-3 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-50" onClick={onRetry} type="button">
          Try again
        </button>
      )}
    </div>
  );
}

const dragBucketPalette = ["#2563eb", "#16a34a", "#ea580c", "#7c3aed"];

function normalizeDragRows(block: Block) {
  const rows = block.content.rows?.length ? block.content.rows : block.settings.dragVariant === "buckets" ? [["Item", "Bucket A"]] : [["First item"], ["Second item"]];
  if (block.settings.dragVariant === "buckets" || block.settings.dragVariant === "venn") return rows.map((row) => [row[0] ?? "", row[1] ?? "Bucket A"]);
  if (block.settings.dragVariant === "pairs" || block.settings.dragVariant === "hierarchy") return rows.map((row) => [row[0] ?? "", row[1] ?? ""]);
  if (block.settings.dragVariant === "diagram") return rows.map((row) => [row[0] ?? "", row[1] ?? "50", row[2] ?? "50"]);
  return rows.map((row) => [row[0] ?? ""]);
}

function parseDragBuckets(block: Block) {
  const fromAnswerText = (block.content.answerText ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const fromRows = Array.from(new Set(normalizeDragRows(block).map((row) => row[1]).filter(Boolean)));
  return fromAnswerText.length ? fromAnswerText : fromRows.length ? fromRows : ["Bucket A", "Bucket B"];
}

function shuffleIds(ids: string[]) {
  if (ids.length < 2) return ids;
  const next = [...ids];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next.every((id, index) => id === ids[index]) ? [...next.slice(1), next[0]] : next;
}

function dragCheckLabel(block: Block) {
  if (block.settings.dragVariant === "timeline") return "Check timeline";
  if (block.settings.dragVariant === "equation") return "Check expression";
  if (block.settings.dragVariant === "longText") return "Check text order";
  return "Check order";
}

function clampPercent(value: string | undefined, fallback: number) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(96, Math.max(4, numberValue));
}

function EditableQuiz({ block, theme, updateContent }: { block: Block; theme: ThemeTokens; updateContent: (patch: Partial<Block["content"]>) => void }) {
  const variant = block.settings.quizVariant ?? "multipleChoice";
  const isEmbossed = block.settings.quizLayout === "embossed" || block.style.shell === "embossed";

  return (
    <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {block.settings.showPromptLabel && <EditableText value={block.content.label} onChange={(label) => updateContent({ label })} className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400" placeholder="Problem 1" />}
      {variant !== "fillBlank" && variant !== "matching" && (
        <EditableText value={block.content.question} onChange={(question) => updateContent({ question })} className="text-[17px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} multiline />
      )}
      {variant === "fillBlank" && <EditableFillBlank block={block} updateContent={updateContent} />}
      {variant === "shortAnswer" && <EditableShortAnswer block={block} theme={theme} updateContent={updateContent} />}
      {variant === "multipleChoice" && <EditableChoiceGrid block={block} theme={theme} updateContent={updateContent} embossed={isEmbossed} />}
      {variant === "multiSelect" && <EditableMultiSelect block={block} theme={theme} updateContent={updateContent} embossed={isEmbossed} />}
      {variant === "trueFalse" && <EditableTrueFalse />}
      {variant === "matching" && <EditableMatching block={block} theme={theme} updateContent={updateContent} />}
    </section>
  );
}

function EditableChoiceGrid({ block, theme, updateContent, embossed }: { block: Block; theme: ThemeTokens; updateContent: (patch: Partial<Block["content"]>) => void; embossed: boolean }) {
  return (
    <div className={cn("mt-5 grid gap-3", choiceColumnsClass(block))}>
      {(block.content.choices ?? []).map((choice, index) => (
        <div key={choice.id} className={choiceCardClass(embossed, false)}>
          <ChoiceMarker index={index} selected={false} type={block.settings.quizMarker ?? "letters"} theme={theme} />
          <EditableText
            value={choice.text}
            onChange={(text) => updateContent({ choices: (block.content.choices ?? []).map((item) => (item.id === choice.id ? { ...item, text } : item)) })}
            className="flex-1 text-[15px] font-bold text-zinc-800"
            style={partTextStyle(block, "choice")}
          />
        </div>
      ))}
    </div>
  );
}

function EditableMultiSelect({ block, theme, updateContent, embossed }: { block: Block; theme: ThemeTokens; updateContent: (patch: Partial<Block["content"]>) => void; embossed: boolean }) {
  return (
    <div className="mt-5 space-y-3">
      <EditableText value={block.content.text} onChange={(text) => updateContent({ text })} className="text-[13px] font-medium text-zinc-500" placeholder="Select all that apply" />
      {(block.content.choices ?? []).map((choice) => (
        <div key={choice.id} className={choiceCardClass(embossed, false)}>
          <ChoiceMarker index={0} selected={false} type="checkbox" theme={theme} />
          <EditableText
            value={choice.text}
            onChange={(text) => updateContent({ choices: (block.content.choices ?? []).map((item) => (item.id === choice.id ? { ...item, text } : item)) })}
            className="flex-1 text-[15px] font-bold text-zinc-800"
            style={partTextStyle(block, "choice")}
          />
        </div>
      ))}
      <QuizButtonPreview block={block} theme={theme} label="Check Answers" />
    </div>
  );
}

function EditableFillBlank({ block, updateContent }: { block: Block; updateContent: (patch: Partial<Block["content"]>) => void }) {
  const dragMode = block.settings.fillBlankMode === "drag";
  return (
    <div className="space-y-4">
      {dragMode ? (
        <>
          <FillBlankSentence block={block} answers={[]} draggedChoiceId={null} preview onAnswer={() => undefined} />
          <FillBlankOptionBank block={block} answers={[]} draggedChoiceId={null} preview onChoose={() => undefined} onDragStart={() => undefined} onDragEnd={() => undefined} />
        </>
      ) : (
        <EditableText value={block.content.text} onChange={(text) => updateContent({ text })} className="text-[16px] font-medium leading-8 text-zinc-800" placeholder="The capital of France is ___ and the capital of Japan is ___." multiline />
      )}
      <QuizButtonPreview block={block} label="Check Answers" />
    </div>
  );
}

function EditableShortAnswer({ block, theme, updateContent }: { block: Block; theme: ThemeTokens; updateContent: (patch: Partial<Block["content"]>) => void }) {
  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input className="h-[60px] rounded-2xl border border-zinc-200 bg-white px-5 text-[15px] font-bold text-zinc-400 shadow-sm outline-none" readOnly value="Your answer..." />
        <QuizButtonPreview block={block} theme={theme} label="Check" className="mt-0 h-[60px]" />
      </div>
      <EditableText value={block.content.answerText} onChange={(answerText) => updateContent({ answerText })} className="mt-3 text-xs font-bold text-zinc-400" placeholder="Expected answer" />
    </div>
  );
}

function EditableTrueFalse() {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <div className={trueFalseEditorChoiceClass(false)}>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-green-100 text-green-700"><Check size={18} /></span>
        True
      </div>
      <div className={trueFalseEditorChoiceClass(false)}>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-red-100 text-red-700"><X size={18} /></span>
        False
      </div>
    </div>
  );
}

function EditableMatching({ block, theme, updateContent }: { block: Block; theme: ThemeTokens; updateContent: (patch: Partial<Block["content"]>) => void }) {
  const rows = normalizeMatchingRows(block.content.rows);
  const answerOptions = matchingAnswerOptions(block, rows);
  const iconColor = block.style.accent ?? theme.primary;
  if (block.settings.editMatchingAnswerKey) {
    return <EditableMatchingAnswerKey block={block} rows={rows} answers={answerOptions} updateContent={updateContent} />;
  }

  return (
    <>
      {block.settings.showPromptLabel && <EditableText value={block.content.label} onChange={(label) => updateContent({ label })} className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400" placeholder="Match check" />}
      {hasText(block.content.question) && <EditableText value={block.content.question} onChange={(question) => updateContent({ question })} className="text-[17px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} multiline />}
      <div className={cn("relative grid grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] gap-0", hasText(block.content.question) ? "mt-5" : "mt-0")}>
        <div className="space-y-3">
        {rows.map((row, index) => (
          <EditableText
            key={`left-${index}`}
            value={row[0]}
            onChange={(value) => updateContent({ rows: rows.map((item, rowIndex) => (rowIndex === index ? [value, item[1]] : item)) })}
            className={matchingCardClass(false, false, false, true)}
            style={partTextStyle(block, "choice")}
          />
        ))}
        </div>
        <div className="flex flex-col items-center justify-center text-zinc-300">
          <ArrowLeftRight size={18} style={{ color: iconColor }} />
        </div>
        <div className="space-y-3">
          {answerOptions.map((answer, answerIndex) => {
            const rowIndex = rows.findIndex((row) => row[1] === answer);
            const index = rowIndex >= 0 ? rowIndex : answerIndex;
            return (
              <EditableText
                key={`right-${answer}-${answerIndex}`}
                value={answer}
                onChange={(value) => updateContent({
                  rows: rows.map((item, itemIndex) => (itemIndex === index ? [item[0], value] : item)),
                  choices: updateMatchingAnswerChoiceTexts(block.content.choices, answerOptions, answer, value),
                })}
                className={matchingCardClass(false, false, false, true)}
                style={partTextStyle(block, "choice")}
              />
            );
          })}
        </div>
      </div>
      <QuizButtonPreview block={block} theme={theme} label="Check matches" />
    </>
  );
}

function ImageUploadBlock({
  block,
  theme,
  updateBlock,
  updateContent,
}: {
  block: Block;
  theme: ThemeTokens;
  updateBlock: (block: Block) => void;
  updateContent: (patch: Partial<Block["content"]>) => void;
}) {
  const inputId = useId();
  const [draft, setDraft] = React.useState<ImageAnnotation | null>(null);
  const [imageBox, setImageBox] = React.useState<ImageBox | null>(null);
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const annotationMode = block.settings.annotationMode === true;
  const tool = block.settings.annotationTool ?? "pen";
  const annotationColor = block.style.accent ?? theme.primary;
  const annotationWidth = block.style.lineThickness ?? 3;
  const fitWidth = block.settings.imageFit === "fitWidth" && !annotationMode;
  const frameHeight = fitWidth ? undefined : Math.max(block.style.minHeight ?? 320, annotationMode ? 460 : 220);

  const updateImageBox = React.useCallback(() => {
    setImageBox(resolveRenderedImageBox(frameRef.current, imageRef.current, block.settings.imageFit));
  }, [block.settings.imageFit]);

  React.useEffect(() => {
    updateImageBox();
    window.addEventListener("resize", updateImageBox);
    return () => window.removeEventListener("resize", updateImageBox);
  }, [block.content.src, block.style.minHeight, updateImageBox]);

  function loadImage(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    if (!canStoreImageFile(file)) {
      showImageStorageLimitAlert();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateContent({
        src: String(reader.result),
        fileName: file.name,
        alt: file.name,
        annotations: [],
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <section
      className={cn(shellClass(block.style.shell ?? "tinted"), "group/image relative overflow-hidden rounded-2xl text-center transition", block.content.src && fitWidth ? "p-0" : "p-4")}
      style={blockSurfaceStyle(block, { background: theme.bgLight })}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        loadImage(event.dataTransfer.files[0]);
      }}
    >
      <input id={inputId} className="sr-only" type="file" accept="image/*" onChange={(event) => loadImage(event.target.files?.[0])} />
      {block.content.src ? (
        <div
          ref={frameRef}
          className={cn("relative block overflow-hidden rounded-xl bg-white", annotationMode ? "cursor-crosshair ring-4 ring-blue-200/70" : "cursor-default")}
          style={frameHeight ? { height: `${frameHeight}px` } : undefined}
          onPointerDown={(event) => {
            if (event.target instanceof HTMLElement && event.target.closest("[data-image-tool]")) return;
            if (!annotationMode) return;
            event.preventDefault();
            const point = getNormalizedPoint(event, frameRef.current, imageBox);
            if (!point) return;
            if (tool === "text") {
              const text = window.prompt("Annotation text");
              if (!text) return;
              addAnnotation(block, updateBlock, { id: crypto.randomUUID(), type: "text", x: point.x, y: point.y, text, color: annotationColor, fontSize: 18 });
              return;
            }
            if (tool === "arrow") {
              setDraft({ id: crypto.randomUUID(), type: "arrow", start: point, end: point, color: annotationColor, strokeWidth: annotationWidth });
              return;
            }
            setDraft({ id: crypto.randomUUID(), type: "pen", points: [point], color: annotationColor, strokeWidth: annotationWidth });
          }}
          onPointerMove={(event) => {
            const point = getNormalizedPoint(event, frameRef.current, imageBox);
            if (!draft || !point) return;
            if (draft.type === "pen") setDraft({ ...draft, points: [...draft.points, point] });
            if (draft.type === "arrow") setDraft({ ...draft, end: point });
          }}
          onPointerUp={() => {
            if (!draft) return;
            addAnnotation(block, updateBlock, draft);
            setDraft(null);
          }}
        >
          <img ref={imageRef} className={cn("block w-full rounded-xl", fitWidth ? "h-auto" : "h-full")} style={{ objectFit: imageObjectFit(block) }} src={block.content.src} alt={block.content.alt ?? "Uploaded lesson image"} onLoad={updateImageBox} />
          <AnnotationOverlay annotations={[...(block.content.annotations ?? []), ...(draft ? [draft] : [])]} box={imageBox} />
          {annotationMode && (
            <div className="absolute left-3 top-3 flex flex-wrap gap-2" data-image-tool>
              {(["pen", "arrow", "text"] as const).map((item) => (
                <button key={item} className={cn("rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-sm", tool === item && "text-blue-600 ring-2 ring-blue-200")} type="button" onClick={() => updateBlock({ ...block, settings: { ...block.settings, annotationTool: item } })}>
                  {item}
                </button>
              ))}
              <button className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 shadow-sm" type="button" onClick={() => updateContent({ annotations: (block.content.annotations ?? []).slice(0, -1) })}>
                Undo
              </button>
              <button className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-red-600 shadow-sm" type="button" onClick={() => updateContent({ annotations: [] })}>
                Clear
              </button>
            </div>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2" data-image-tool>
            <label className="cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-600 shadow-sm" htmlFor={inputId}>
              Choose image
            </label>
          </div>
        </div>
      ) : (
        <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl bg-white/45 px-6 py-8" htmlFor={inputId}>
          <Image className="mb-3" size={42} style={{ color: theme.primary }} />
          <span className="text-[15px] font-bold text-zinc-700">Choose or drop image here</span>
        </label>
      )}
    </section>
  );
}

type ImageBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function StudentImageBlock({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const [imageBox, setImageBox] = React.useState<ImageBox | null>(null);
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const fitWidth = block.settings.imageFit === "fitWidth";
  const frameHeight = fitWidth ? undefined : block.style.minHeight ?? 320;

  const updateImageBox = React.useCallback(() => {
    setImageBox(resolveRenderedImageBox(frameRef.current, imageRef.current, block.settings.imageFit));
  }, [block.settings.imageFit]);

  React.useEffect(() => {
    updateImageBox();
    window.addEventListener("resize", updateImageBox);
    return () => window.removeEventListener("resize", updateImageBox);
  }, [block.content.src, block.style.minHeight, updateImageBox]);

  return (
    <section className="overflow-hidden rounded-2xl">
      {block.content.src ? (
        <div ref={frameRef} className="relative overflow-hidden rounded-2xl" style={frameHeight ? { height: `${frameHeight}px` } : undefined}>
          <img ref={imageRef} className={cn("block w-full rounded-2xl", fitWidth ? "h-auto" : "h-full")} style={{ objectFit: imageObjectFit(block) }} src={block.content.src} alt={block.content.alt ?? "Uploaded lesson image"} onLoad={updateImageBox} />
          <AnnotationOverlay annotations={block.content.annotations ?? []} box={imageBox} />
        </div>
      ) : (
        <div className="rounded-2xl p-8 text-center" style={{ background: theme.bgLight }}>
          <Image className="mx-auto mb-3" size={40} style={{ color: theme.primary }} />
          <p className="text-[15px] font-bold text-zinc-700">Choose or drop image here</p>
        </div>
      )}
    </section>
  );
}

function AnnotationOverlay({ annotations, box }: { annotations: ImageAnnotation[]; box?: ImageBox | null }) {
  const style: React.CSSProperties = box
    ? { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` }
    : { inset: 0, width: "100%", height: "100%" };

  return (
    <svg className="pointer-events-none absolute" preserveAspectRatio="none" style={style} viewBox="0 0 1000 1000">
      <defs>
        <marker id="annotation-arrow" markerHeight="10" markerWidth="10" orient="auto" refX="8" refY="3">
          <path d="M0,0 L0,6 L9,3 z" fill="context-stroke" />
        </marker>
      </defs>
      {annotations.map((annotation) => {
        if (annotation.type === "pen") {
          return <polyline key={annotation.id} fill="none" points={annotation.points.map((point) => `${point.x * 1000},${point.y * 1000}`).join(" ")} stroke={annotation.color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={annotation.strokeWidth * 3} />;
        }
        if (annotation.type === "arrow") {
          return <line key={annotation.id} markerEnd="url(#annotation-arrow)" stroke={annotation.color} strokeLinecap="round" strokeWidth={annotation.strokeWidth * 3} x1={annotation.start.x * 1000} x2={annotation.end.x * 1000} y1={annotation.start.y * 1000} y2={annotation.end.y * 1000} />;
        }
        return (
          <text key={annotation.id} fill={annotation.color} fontSize={annotation.fontSize * 3.2} fontWeight={800} x={annotation.x * 1000} y={annotation.y * 1000}>
            {annotation.text}
          </text>
        );
      })}
    </svg>
  );
}

function addAnnotation(block: Block, updateBlock: (block: Block) => void, annotation: ImageAnnotation) {
  if (annotation.type === "pen" && annotation.points.length < 2) return;
  updateBlock({
    ...block,
    content: {
      ...block.content,
      annotations: [...(block.content.annotations ?? []), annotation],
    },
  });
}

function getNormalizedPoint(event: React.PointerEvent, element: HTMLElement | null, box: ImageBox | null) {
  if (!element || !box) return null;
  const frameRect = element.getBoundingClientRect();
  const rect = {
    left: frameRect.left + box.left,
    top: frameRect.top + box.top,
    right: frameRect.left + box.left + box.width,
    bottom: frameRect.top + box.top + box.height,
    width: box.width,
    height: box.height,
  };
  if (rect.width <= 0 || rect.height <= 0) return null;
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return null;
  return {
    x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
    y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
  };
}

function resolveRenderedImageBox(frame: HTMLElement | null, image: HTMLImageElement | null, fit?: Block["settings"]["imageFit"]): ImageBox | null {
  if (!frame || !image) return null;
  const frameRect = frame.getBoundingClientRect();
  const imageRect = image.getBoundingClientRect();
  const boxLeft = imageRect.left - frameRect.left;
  const boxTop = imageRect.top - frameRect.top;
  const boxWidth = imageRect.width;
  const boxHeight = imageRect.height;
  if (boxWidth <= 0 || boxHeight <= 0) return null;
  if (!image.naturalWidth || !image.naturalHeight || fit === "fill" || fit === "cover") {
    return { left: boxLeft, top: boxTop, width: boxWidth, height: boxHeight };
  }

  const imageRatio = image.naturalWidth / image.naturalHeight;
  const boxRatio = boxWidth / boxHeight;
  if (fit === "contain" || !fit) {
    if (boxRatio > imageRatio) {
      const width = boxHeight * imageRatio;
      return { left: boxLeft + (boxWidth - width) / 2, top: boxTop, width, height: boxHeight };
    }
    const height = boxWidth / imageRatio;
    return { left: boxLeft, top: boxTop + (boxHeight - height) / 2, width: boxWidth, height };
  }

  return { left: boxLeft, top: boxTop, width: boxWidth, height: boxHeight };
}

function imageObjectFit(block: Block): React.CSSProperties["objectFit"] {
  if (block.settings.imageFit === "fitWidth") return "contain";
  if (block.settings.imageFit === "cover") return "cover";
  if (block.settings.imageFit === "fill") return "fill";
  return "contain";
}

function safeHref(href?: string) {
  if (!href) return "#";
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  return `https://${href}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function ChoiceMarker({ index, selected, type, theme }: { index: number; selected: boolean; type?: Block["settings"]["quizMarker"]; theme: ThemeTokens }) {
  if (type === "checkbox") {
    return <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border-2" style={{ borderColor: selected ? theme.primary : "#c7c7cc", background: selected ? theme.primary : "#ffffff" }}>{selected && <Check size={14} color="#fff" />}</span>;
  }

  if (type === "letters") {
    return (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-0 bg-[#f2efe6] text-sm font-bold" style={{ color: selected ? theme.primary : "#8a8f98" }}>
        {String.fromCharCode(65 + index)}
      </span>
    );
  }

  return <span className="h-4 w-4 shrink-0 rounded-full border-2" style={{ borderColor: selected ? theme.primary : "#d4d4d8", background: selected ? theme.primary : "#ffffff" }} />;
}

function StudentMatching({ block, theme, onAnswer }: { block: Block; theme: ThemeTokens; onAnswer?: () => void }) {
  const rows = normalizeMatchingRows(block.content.rows);
  const answerOptions = matchingAnswerOptions(block, rows);
  const [matches, setMatches] = React.useState<Record<number, string>>({});
  const [selectedLeft, setSelectedLeft] = React.useState<number | null>(null);
  const [selectedRight, setSelectedRight] = React.useState<string | null>(null);
  const [pressedMatchCard, setPressedMatchCard] = React.useState<string | null>(null);
  const [matchResetKey, setMatchResetKey] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const allMatched = rows.length > 0 && rows.every((_row, index) => matches[index]);
  const correct = rows.length > 0 && rows.every((row, index) => normalizeAnswer(matches[index]) === normalizeAnswer(row[1]));
  const matchedAnswers = Object.values(matches);

  function placeAnswer(index: number, answer: string) {
    setMatches((current) => {
      const next = Object.fromEntries(Object.entries(current).filter(([, value]) => value !== answer)) as Record<number, string>;
      next[index] = answer;
      return next;
    });
    setSelectedLeft(null);
    setSelectedRight(null);
    setSubmitted(false);
  }

  function chooseLeft(index: number) {
    if (selectedRight) {
      placeAnswer(index, selectedRight);
      return;
    }
    setSelectedLeft(selectedLeft === index ? null : index);
    setSelectedRight(null);
  }

  function chooseRight(answer: string) {
    if (selectedLeft !== null) {
      placeAnswer(selectedLeft, answer);
      return;
    }
    setSelectedRight(selectedRight === answer ? null : answer);
    setSelectedLeft(null);
  }

  function disconnectPair(index: number, answer?: string) {
    setMatches((current) => {
      const currentAnswer = answer ?? current[index];
      return Object.fromEntries(Object.entries(current).filter(([key, value]) => Number(key) !== index && value !== currentAnswer)) as Record<number, string>;
    });
    setSelectedLeft(null);
    setSelectedRight(null);
    setPressedMatchCard(null);
    setMatchResetKey((key) => key + 1);
    setSubmitted(false);
  }

  return (
    <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {block.settings.showPromptLabel && block.content.label && <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">{block.content.label}</p>}
      {hasText(block.content.question) && <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />}
      <div className={cn("relative grid grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] gap-0", hasText(block.content.question) ? "mt-5" : "mt-0")}>
        <div className="space-y-3">
          {rows.map((row, index) => {
            const answer = matches[index];
            const isCorrect = submitted && normalizeAnswer(answer) === normalizeAnswer(row[1]);
            const isWrong = submitted && !!answer && !isCorrect;
            const selected = selectedLeft === index;
            const paired = !!answer;
            const cardId = `left-${index}`;
            const state = matchingVisualState(selected, paired, isCorrect, isWrong);
            return (
              <button
                key={`${matchResetKey}-${row[0]}-${index}`}
                className={studentMatchingCardClass()}
                style={{ ...studentMatchingCardStyle(index, state, pressedMatchCard === cardId), ...partTextStyle(block, "choice") }}
                onClick={() => (answer && !selectedRight ? disconnectPair(index, answer) : chooseLeft(index))}
                onPointerDown={() => setPressedMatchCard(cardId)}
                onPointerLeave={() => setPressedMatchCard(null)}
                onPointerUp={() => setPressedMatchCard(null)}
                type="button"
              >
                <MathText text={row[0]} />
              </button>
            );
          })}
        </div>
        <div className="relative flex items-center justify-center">
          <MatchingLines rows={rows} answers={answerOptions} matches={matches} />
          <ArrowLeftRight className="pointer-events-none absolute text-blue-600" size={18} />
        </div>
        <div className="space-y-3">
          {answerOptions.map((answer) => {
            const matchedIndex = rows.findIndex((_row, index) => matches[index] === answer);
            const isCorrect = submitted && matchedIndex >= 0 && normalizeAnswer(answer) === normalizeAnswer(rows[matchedIndex][1]);
            const isWrong = submitted && matchedIndex >= 0 && !isCorrect;
            const selected = selectedRight === answer;
            const paired = matchedAnswers.includes(answer);
            const pairIndex = matchedIndex >= 0 ? matchedIndex : answerOptions.indexOf(answer);
            const cardId = `right-${answer}`;
            const state = matchingVisualState(selected, paired, isCorrect, isWrong);
            return (
              <button
                key={`${matchResetKey}-${answer}`}
                className={studentMatchingCardClass()}
                style={{ ...studentMatchingCardStyle(pairIndex, state, pressedMatchCard === cardId), ...partTextStyle(block, "choice") }}
                onClick={() => (matchedIndex >= 0 && selectedLeft === null ? disconnectPair(matchedIndex, answer) : chooseRight(answer))}
                onPointerDown={() => setPressedMatchCard(cardId)}
                onPointerLeave={() => setPressedMatchCard(null)}
                onPointerUp={() => setPressedMatchCard(null)}
                type="button"
              >
                {answer}
              </button>
            );
          })}
        </div>
      </div>
      {!submitted ? (
        <button disabled={!allMatched} className={cn("lesson-action-button mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40", block.settings.quizButtonWidth === "full" && "w-full")} style={lessonButtonStyle(theme, 3, block)} onClick={() => { setSubmitted(true); onAnswer?.(); }}>
          <Link2 size={17} />
          Check matches
        </button>
      ) : (
        <QuizFeedback block={block} correct={correct} />
      )}
    </section>
  );
}

function MatchingLines({ rows, answers, matches }: { rows: string[][]; answers: string[]; matches: Record<number, string> }) {
  const count = Math.max(rows.length, answers.length, 1);
  return (
    <svg className="pointer-events-none h-full w-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 100 ${count * 64}`} aria-hidden="true">
      {Object.entries(matches).map(([leftIndex, answer]) => {
        const rightIndex = answers.indexOf(answer);
        if (rightIndex < 0) return null;
        const color = matchingPairPalette[Number(leftIndex) % matchingPairPalette.length].line;
        const y1 = (Number(leftIndex) + 0.5) * 64;
        const y2 = (rightIndex + 0.5) * 64;
        return <line key={`${leftIndex}-${answer}`} x1="0" x2="100" y1={y1} y2={y2} stroke={color} strokeLinecap="round" strokeWidth="5" />;
      })}
    </svg>
  );
}

const matchingPairPalette = [
  { line: "#2563eb", bg: "#eff6ff", text: "#1d4ed8" },
  { line: "#16a34a", bg: "#f0fdf4", text: "#166534" },
  { line: "#ea580c", bg: "#fff7ed", text: "#9a3412" },
  { line: "#9333ea", bg: "#faf5ff", text: "#6b21a8" },
  { line: "#0891b2", bg: "#ecfeff", text: "#155e75" },
];

type MatchingVisualState = "neutral" | "selected" | "paired" | "correct" | "wrong";

function matchingVisualState(selected: boolean, paired: boolean, correct: boolean, wrong: boolean): MatchingVisualState {
  if (correct) return "correct";
  if (wrong) return "wrong";
  if (paired) return "paired";
  if (selected) return "selected";
  return "neutral";
}

function studentMatchingCardStyle(index: number, state: MatchingVisualState, pressed: boolean): React.CSSProperties {
  const pair = matchingPairPalette[index % matchingPairPalette.length];
  const pressStyle: React.CSSProperties = pressed ? { borderBottomWidth: "2px", transform: "translateY(3px)" } : {};
  if (state === "correct") {
    return {
      border: "1px solid #22c55e",
      borderBottomWidth: "4px",
      borderBottomColor: "#16a34a",
      background: "#f0fdf4",
      color: "#166534",
      boxShadow: "none",
      ...pressStyle,
    };
  }
  if (state === "wrong") {
    return {
      border: "1px solid #f87171",
      borderBottomWidth: "4px",
      borderBottomColor: "#ef4444",
      background: "#fef2f2",
      color: "#991b1b",
      boxShadow: "none",
      ...pressStyle,
    };
  }
  if (state === "selected" || state === "paired") {
    return {
      border: `1px solid ${pair.line}`,
      borderBottomWidth: "4px",
      borderBottomColor: pair.line,
      background: pair.bg,
      color: pair.text,
      boxShadow: "none",
      ...pressStyle,
    };
  }
  return {
    border: "1px solid #d5d9e2",
    borderBottomWidth: "4px",
    borderBottomColor: "#c8ccd6",
    background: "#ffffff",
    boxShadow: "none",
    ...pressStyle,
  };
}

function matchingCardClass(active: boolean, correct: boolean, wrong: boolean, editable = false) {
  return cn(
    "min-h-[52px] w-full rounded-xl border-2 border-zinc-200 border-b-[4px] border-b-zinc-300 bg-white px-5 py-4 text-left text-[15px] font-semibold text-zinc-900 shadow-sm transition",
    !editable && "hover:-translate-y-0.5 hover:border-blue-300",
    active && "border-[var(--matching-active)] bg-[var(--matching-active-bg)] text-[var(--matching-active-text)]",
    correct && "border-green-500 bg-green-50 text-green-800",
    wrong && "border-red-400 bg-red-50 text-red-800",
  );
}

function EditableMatchingAnswerKey({
  block,
  rows,
  answers,
  updateContent,
}: {
  block: Block;
  rows: string[][];
  answers: string[];
  updateContent: (patch: Partial<Block["content"]>) => void;
}) {
  const [selectedLeft, setSelectedLeft] = React.useState<number | null>(null);
  const [selectedRight, setSelectedRight] = React.useState<string | null>(null);
  const [pressedCard, setPressedCard] = React.useState<string | null>(null);
  const [disconnectedLefts, setDisconnectedLefts] = React.useState<number[]>([]);
  const matches = Object.fromEntries(rows.map((row, index) => [index, disconnectedLefts.includes(index) ? "" : row[1]])) as Record<number, string>;
  const matchedAnswers = Object.values(matches);

  function connectPair(leftIndex: number, answer: string) {
    const nextRows = rows.map((row, index) => {
      if (index === leftIndex) return [row[0], answer];
      if (row[1] === answer) return [row[0], ""];
      return row;
    });
    updateContent({ rows: nextRows, choices: ensureMatchingAnswerChoices(answers, nextRows) });
    setDisconnectedLefts((items) => items.filter((item) => item !== leftIndex));
    setSelectedLeft(null);
    setSelectedRight(null);
    setPressedCard(null);
  }

  function chooseLeft(index: number) {
    if (selectedRight) {
      connectPair(index, selectedRight);
      return;
    }
    setSelectedLeft(selectedLeft === index ? null : index);
    setSelectedRight(null);
  }

  function chooseRight(answer: string) {
    if (selectedLeft !== null) {
      connectPair(selectedLeft, answer);
      return;
    }
    setSelectedRight(selectedRight === answer ? null : answer);
    setSelectedLeft(null);
  }

  function disconnectPair(index: number) {
    setDisconnectedLefts((items) => (items.includes(index) ? items : [...items, index]));
    setSelectedLeft(null);
    setSelectedRight(null);
    setPressedCard(null);
  }

  return (
    <>
      {block.settings.showPromptLabel && <EditableText value={block.content.label} onChange={(label) => updateContent({ label })} className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400" placeholder="Match check" />}
      {hasText(block.content.question) && <EditableText value={block.content.question} onChange={(question) => updateContent({ question })} className="text-[17px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} multiline />}
      <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">Editing answer key: click a connected left card to disconnect it, then connect a left card to the correct right card.</div>
      <div className={cn("relative grid grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] gap-0", hasText(block.content.question) ? "mt-5" : "mt-3")}>
        <div className="space-y-3">
          {rows.map((row, index) => {
            const answer = matches[index];
            const selected = selectedLeft === index;
            const paired = !!answer;
            const cardId = `key-left-${index}`;
            const state = matchingVisualState(selected, paired, false, false);
            return (
              <button
                key={`${row[0]}-${index}`}
                className={studentMatchingCardClass()}
                style={{ ...studentMatchingCardStyle(index, state, pressedCard === cardId), ...partTextStyle(block, "choice") }}
                onClick={() => (paired && !selectedRight ? disconnectPair(index) : chooseLeft(index))}
                onPointerDown={() => setPressedCard(cardId)}
                onPointerLeave={() => setPressedCard(null)}
                onPointerUp={() => setPressedCard(null)}
                type="button"
              >
                <MathText text={row[0]} />
              </button>
            );
          })}
        </div>
        <div className="relative flex items-center justify-center">
          <MatchingLines rows={rows} answers={answers} matches={matches} />
          <ArrowLeftRight className="pointer-events-none absolute text-blue-600" size={18} />
        </div>
        <div className="space-y-3">
          {answers.map((answer) => {
            const matchedIndex = rows.findIndex((_row, index) => matches[index] === answer);
            const selected = selectedRight === answer;
            const paired = matchedAnswers.includes(answer);
            const originalIndex = rows.findIndex((row) => row[1] === answer);
            const pairIndex = matchedIndex >= 0 ? matchedIndex : originalIndex >= 0 ? originalIndex : answers.indexOf(answer);
            const cardId = `key-right-${answer}`;
            const state = matchingVisualState(selected, paired, false, false);
            return (
              <button
                key={answer || "empty-answer"}
                className={studentMatchingCardClass()}
                style={{ ...studentMatchingCardStyle(pairIndex, state, pressedCard === cardId), ...partTextStyle(block, "choice") }}
                onClick={() => (matchedIndex >= 0 && selectedLeft === null ? disconnectPair(matchedIndex) : chooseRight(answer))}
                onPointerDown={() => setPressedCard(cardId)}
                onPointerLeave={() => setPressedCard(null)}
                onPointerUp={() => setPressedCard(null)}
                type="button"
              >
                {answer || "Unassigned"}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function studentMatchingCardClass() {
  return "min-h-[52px] w-full rounded-xl bg-white px-5 py-4 text-left text-[15px] font-semibold text-zinc-900 transition";
}

function StudentQuiz({ block, theme, onAnswer }: { block: Block; theme: ThemeTokens; onAnswer?: () => void }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [multiSelected, setMultiSelected] = React.useState<string[]>([]);
  const [answer, setAnswer] = React.useState("");
  const [blankAnswers, setBlankAnswers] = React.useState<string[]>([]);
  const [submitted, setSubmitted] = React.useState(false);
  const [activeBlankWord, setActiveBlankWord] = React.useState<string | null>(null);
  const fillBlankSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );
  const variant = block.settings.quizVariant ?? "multipleChoice";
  const correct =
    variant === "multiSelect"
      ? sameStringSet(multiSelected, parseCorrectIds(block))
      : variant === "fillBlank"
        ? sameOrderedAnswers(blankAnswers, parseAnswerList(block.content.answerText))
      : variant === "shortAnswer"
        ? normalizeAnswer(answer) === normalizeAnswer(block.content.answerText)
        : selected === block.content.correctChoiceId;
  const actionButtonStyle = lessonButtonStyle(theme, 3, block);
  const embossed = block.settings.quizLayout === "embossed" || block.style.shell === "embossed";
  const submitAnswer = React.useCallback(() => {
    setSubmitted(true);
    onAnswer?.();
  }, [onAnswer]);

  if (variant === "matching") {
    return <StudentMatching block={block} theme={theme} onAnswer={onAnswer} />;
  }

  if (variant === "shortAnswer") {
    return (
      <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
        {block.settings.showPromptLabel && block.content.label && <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">{block.content.label}</p>}
        <MathText block text={block.content.question} className="text-[19px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />
        <ShortAnswerControls block={block} answer={answer} submitted={submitted} theme={theme} onAnswer={setAnswer} onSubmit={submitAnswer} />
        {submitted && <QuizFeedback block={block} correct={correct} />}
      </section>
    );
  }

  if (variant === "fillBlank") {
    const dragMode = block.settings.fillBlankMode === "drag";

    function placeBlankAnswer(index: number, value: string) {
      setBlankAnswers((current) => {
        const next = current.map((answer) => (normalizeAnswer(answer) === normalizeAnswer(value) ? "" : answer));
        next[index] = value;
        return next;
      });
      setSubmitted(false);
    }

    return (
      <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
        {block.settings.showPromptLabel && block.content.label && <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">{block.content.label}</p>}
        <DndContext
          sensors={fillBlankSensors}
          onDragStart={(event) => setActiveBlankWord(String(event.active.id).replace("fill-word-", ""))}
          onDragEnd={(event: DragEndEvent) => {
            const overId = event.over?.id ? String(event.over.id) : "";
            const blankIndex = overId.startsWith("fill-blank-") ? Number(overId.replace("fill-blank-", "")) : Number.NaN;
            const word = String(event.active.id).replace("fill-word-", "");
            if (!Number.isNaN(blankIndex) && word) placeBlankAnswer(blankIndex, word);
            setActiveBlankWord(null);
          }}
          onDragCancel={() => setActiveBlankWord(null)}
        >
          <FillBlankSentence
            block={block}
            answers={blankAnswers}
            draggedChoiceId={activeBlankWord}
            onAnswer={(index, value) => {
              if (value) placeBlankAnswer(index, value);
              else {
                setBlankAnswers((current) => replaceAt(current, index, ""));
                setSubmitted(false);
              }
            }}
          />
          {dragMode && (
            <FillBlankOptionBank
              block={block}
              answers={blankAnswers}
              draggedChoiceId={activeBlankWord}
              onChoose={(choiceText) => {
                const index = firstEmptyBlankIndex(blankAnswers, countBlanksForBlock(block));
                placeBlankAnswer(index, choiceText);
              }}
              onDragStart={setActiveBlankWord}
              onDragEnd={() => setActiveBlankWord(null)}
            />
          )}
          <DragOverlay adjustScale={false}>
            {activeBlankWord ? <FillBlankWordChip text={activeBlankWord} active /> : null}
          </DragOverlay>
        </DndContext>
        <div className={cn("mt-4", block.settings.quizButtonWidth === "full" && "w-full")}>
          <button disabled={!hasEveryBlankFilled(blankAnswers, countBlanksForBlock(block))} className={cn("lesson-action-button mx-auto inline-flex rounded-xl px-8 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40", block.settings.quizButtonWidth === "full" ? "w-full" : "w-auto max-w-[448px]")} style={actionButtonStyle} onClick={submitAnswer}>
            <Check size={17} className="mr-2" />
            Check Answers
          </button>
        </div>
        {submitted && <QuizFeedback block={block} correct={correct} />}
      </section>
    );
  }

  if (variant === "trueFalse") {
    return (
      <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
        {block.content.question && <MathText block text={block.content.question} className="text-[17px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {["true", "false"].map((value) => {
            const isSelected = selected === value;
            return (
              <button key={value} className={cn("flex items-center justify-center gap-3 rounded-2xl border px-5 py-5 text-[16px] font-bold text-zinc-800 shadow-sm transition", isSelected ? "border-blue-300 bg-blue-50" : "border-zinc-200 bg-[#f7f3ea]")} onClick={() => { setSelected(value); submitAnswer(); }}>
                <span className={cn("grid h-8 w-8 place-items-center rounded-full", value === "true" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{value === "true" ? <Check size={18} /> : <X size={18} />}</span>
                {value === "true" ? "True" : "False"}
              </button>
            );
          })}
        </div>
        {submitted && <QuizFeedback block={block} correct={correct} />}
      </section>
    );
  }

  if (variant === "multiSelect") {
    return (
      <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
        {block.settings.showPromptLabel && block.content.label && <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">{block.content.label}</p>}
        <MathText block text={block.content.question} className="text-[17px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />
        {block.content.text && <p className="mt-5 text-[13px] font-medium text-zinc-500">{block.content.text}</p>}
        <div className="mt-3 space-y-3">
          {(block.content.choices ?? []).map((choice) => {
            const isSelected = multiSelected.includes(choice.id);
            return (
              <button key={choice.id} className={choiceCardClass(embossed, isSelected)} onClick={() => {
                setMultiSelected((current) => (current.includes(choice.id) ? current.filter((id) => id !== choice.id) : [...current, choice.id]));
                setSubmitted(false);
              }}>
                <ChoiceMarker index={0} selected={isSelected} type="checkbox" theme={theme} />
                <MathText text={choice.text} className="flex-1 text-[15px] font-bold text-zinc-800" style={partTextStyle(block, "choice")} />
              </button>
            );
          })}
        </div>
        <div className="mt-5">
          <button disabled={!multiSelected.length} className={cn("lesson-action-button rounded-full px-8 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40", block.settings.quizButtonWidth === "full" && "w-full")} style={actionButtonStyle} onClick={submitAnswer}>
            Check Answers
          </button>
        </div>
        {submitted && <QuizFeedback block={block} correct={correct} />}
      </section>
    );
  }

  return (
    <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {block.settings.showPromptLabel && block.content.label && <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">{block.content.label}</p>}
      <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />
      <div className={cn("mt-5 grid gap-3", choiceColumnsClass(block))}>
        {(block.content.choices ?? []).map((choice) => {
          const isSelected = selected === choice.id;
          const isCorrectChoice = submitted && choice.id === block.content.correctChoiceId;
          const isWrongSelected = submitted && isSelected && !isCorrectChoice;
          return (
            <button
              key={choice.id}
              className={cn(choiceCardClass(embossed, isSelected), isCorrectChoice && "border-green-500 bg-green-50 text-green-800", isWrongSelected && "border-red-500 bg-red-50 text-red-800")}
              style={partTextStyle(block, "choice")}
              onClick={() => {
                if (!submitted || block.settings.retry) {
                  setSelected(choice.id);
                  setSubmitted(false);
                }
              }}
            >
              <ChoiceMarker index={Number(choice.id.charCodeAt(0) - 97) || 0} selected={isSelected || isCorrectChoice} type={block.settings.quizMarker ?? "letters"} theme={theme} />
              <MathText text={choice.text} className="flex-1" />
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button disabled={!selected} className={cn("lesson-action-button mt-5 rounded-full px-8 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40", block.settings.quizButtonWidth === "full" && "w-full")} style={actionButtonStyle} onClick={submitAnswer}>
          Check answer
        </button>
      ) : (
        <QuizFeedback block={block} correct={correct} />
      )}
    </section>
  );
}

function ShortAnswerControls({ block, answer, submitted, theme, onAnswer, onSubmit }: { block: Block; answer: string; submitted: boolean; theme: ThemeTokens; onAnswer: (answer: string) => void; onSubmit: () => void }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
      <input className="h-[60px] rounded-2xl border border-zinc-200 bg-white px-5 text-[15px] font-bold text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400" disabled={submitted && !block.settings.retry} placeholder="Your answer..." value={answer} onChange={(event) => onAnswer(event.target.value)} />
      <button disabled={!answer.trim()} className="lesson-action-button rounded-2xl px-7 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40" style={lessonButtonStyle(theme, 3, block)} onClick={onSubmit}>
        Check
      </button>
    </div>
  );
}

function FillBlankSentence({
  block,
  answers,
  draggedChoiceId,
  preview = false,
  onAnswer,
}: {
  block: Block;
  answers: string[];
  draggedChoiceId?: string | null;
  preview?: boolean;
  onAnswer: (index: number, answer: string) => void;
}) {
  const source = normalizedBlankText(block.content.text || block.content.question);
  const parts = source.split("___");
  const dragMode = block.settings.fillBlankMode === "drag";
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-5 text-[16px] font-semibold leading-[3rem] text-zinc-800 shadow-sm">
      {parts.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          <MathText text={part} />
          {index < parts.length - 1 &&
            (dragMode ? (
              <FillBlankDropSlot index={index} word={answers[index]} preview={preview} active={!!draggedChoiceId} onTap={() => !preview && onAnswer(index, "")} />
            ) : (
              <input className="mx-1 inline-flex h-10 w-[92px] rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 align-middle text-[15px] font-bold outline-none focus:border-blue-500" value={answers[index] ?? ""} onChange={(event) => onAnswer(index, event.target.value)} />
            ))}
        </React.Fragment>
      ))}
    </div>
  );
}

function FillBlankOptionBank({
  block,
  answers,
  draggedChoiceId,
  preview = false,
  onChoose,
  onDragStart,
  onDragEnd,
}: {
  block: Block;
  answers: string[];
  draggedChoiceId: string | null;
  preview?: boolean;
  onChoose: (choiceText: string) => void;
  onDragStart: (choiceId: string) => void;
  onDragEnd: () => void;
}) {
  const usedAnswers = answers.map((answer) => normalizeAnswer(answer));
  return (
    <div className="mt-6 flex min-h-[74px] flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-4">
      {(block.content.choices ?? []).map((choice) => {
        const isUsed = usedAnswers.includes(normalizeAnswer(choice.text));
        return (
          <DraggableFillBlankWord
            key={choice.id}
            text={choice.text}
            hidden={isUsed}
            selected={draggedChoiceId === choice.text}
            preview={preview}
            onTap={() => !preview && onChoose(choice.text)}
            onDragStart={() => onDragStart(choice.text)}
            onDragEnd={onDragEnd}
          />
        );
      })}
    </div>
  );
}

function FillBlankDropSlot({ index, word, preview, active, onTap }: { index: number; word?: string; preview?: boolean; active: boolean; onTap: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `fill-blank-${index}`, disabled: preview });
  return (
    <button
      ref={setNodeRef}
      className={cn(
        "mx-1 inline-flex h-10 min-w-[82px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 align-middle text-[15px] font-bold text-transparent transition",
        (active || isOver) && !word && "border-blue-300 bg-blue-50",
        word && "border-solid border-blue-600 border-b-[4px] bg-white text-zinc-900 shadow-sm",
      )}
      onClick={onTap}
      type="button"
    >
      {word || "blank"}
    </button>
  );
}

function DraggableFillBlankWord({ text, hidden, selected, preview, onTap, onDragStart, onDragEnd }: { text: string; hidden: boolean; selected: boolean; preview?: boolean; onTap: () => void; onDragStart: () => void; onDragEnd: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `fill-word-${text}`, disabled: preview || hidden });
  const style: React.CSSProperties = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {};

  if (hidden) return null;

  return (
    <button
      ref={setNodeRef}
      className={cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-40")}
      style={style}
      onClick={onTap}
      onPointerDown={() => !preview && onDragStart()}
      onPointerUp={onDragEnd}
      type="button"
      {...listeners}
      {...attributes}
    >
      <FillBlankWordChip text={text} selected={selected} />
    </button>
  );
}

function FillBlankWordChip({ text, selected, active }: { text: string; selected?: boolean; active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-white px-4 text-[14px] font-bold text-zinc-900 shadow-[0_2px_0_#d4d4d8,0_0_0_1px_rgba(228,228,231,0.85)] transition",
        selected && "shadow-[0_3px_0_#1d4ed8,0_0_0_2px_#2563eb]",
        active && "scale-105 shadow-[0_4px_0_#1d4ed8,0_0_0_2px_#2563eb]",
      )}
    >
      {text}
    </span>
  );
}

function QuizFeedback({ block, correct }: { block: Block; correct: boolean }) {
  return (
    <div className={cn("mt-4 rounded-xl border-2 p-4 text-sm font-semibold", correct ? "border-green-600 bg-green-50 text-green-800" : "border-red-300 bg-red-50 text-red-800")}>
      {correct ? block.content.correctExplanation : block.content.incorrectExplanation}
      {!correct && block.content.hint && (
        <p className="mt-2 border-l-[3px] border-red-300 pl-3">
          <strong>Hint:</strong> {block.content.hint}
        </p>
      )}
    </div>
  );
}

function QuizButtonPreview({ block, theme, label, className }: { block: Block; theme?: ThemeTokens; label: string; className?: string }) {
  const buttonTheme = theme ?? {
    id: "brilliant-blue",
    name: "Brilliant Blue",
    primary: "#a8c6e6",
    shadow: "#7da6cf",
    accent: "#3b82f6",
    bgLight: "#eff6ff",
    borderLight: "#bfdbfe",
    bgHover: "#dbeafe",
  };
  return (
      <div className={cn("mt-5 flex justify-center", block.settings.quizButtonWidth === "full" && "w-full", className)}>
        <div className={cn("lesson-action-button inline-flex items-center justify-center rounded-xl px-8 py-4 text-sm font-bold text-white", block.settings.quizButtonWidth === "full" ? "w-full" : "max-w-[448px]")} style={lessonButtonStyle(buttonTheme, 3, block)}>
          {label}
        </div>
      </div>
  );
}

function quizShellClass(block: Block) {
  if (block.settings.quizLayout === "embossed" || block.style.shell === "embossed") {
    return cn(shellClass(block.style.shell ?? "embossed"), "space-y-4 rounded-2xl border-2 border-zinc-200 border-b-[4px] bg-white p-5 shadow-sm");
  }
  return cn(shellClass(block.style.shell), "py-5");
}

function choiceColumnsClass(block: Block) {
  return block.settings.quizChoiceColumns === "one" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";
}

function choiceCardClass(embossed: boolean, selected = false, correct = false) {
  if (embossed) {
    return cn(
      "flex w-full items-center gap-4 rounded-2xl border-2 border-b-[4px] px-5 py-4 text-left text-[15px] font-bold transition",
      correct ? "border-green-500 border-b-green-700 bg-green-50 text-green-900" : selected ? "border-blue-300 border-b-blue-500 bg-blue-50" : "border-zinc-200 border-b-zinc-300 bg-white text-zinc-800",
    );
  }
  return cn(
    "flex w-full items-center gap-4 rounded-2xl border bg-white px-5 py-4 text-left text-[15px] font-bold shadow-sm transition hover:border-zinc-300",
    correct ? "border-2 border-green-500 bg-green-50 text-green-900" : selected ? "border-blue-300 bg-blue-50" : "border-zinc-200",
  );
}

function trueFalseEditorChoiceClass(correct: boolean) {
  return cn(
    "flex items-center justify-center gap-3 rounded-2xl border px-5 py-5 text-[16px] font-bold text-zinc-800 shadow-sm",
    correct ? "border-2 border-green-500 bg-green-50 text-green-900" : "border-zinc-200 bg-[#f7f3ea]",
  );
}

function parseCorrectIds(block: Block) {
  return (block.content.correctChoiceIds || block.content.correctChoiceId || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function normalizeMatchingRows(rows?: string[][]) {
  const source = rows?.length
    ? rows
    : [
        ["Term", "Definition"],
        ["Example", "Matched example"],
      ];
  return source.map((row) => [row[0] ?? "", row[1] ?? ""]);
}

function shuffleMatchingAnswers(rows: string[][]) {
  const answers = rows.map((row) => row[1]).filter(Boolean);
  if (answers.length < 2) return answers;
  return [...answers.slice(1), answers[0]];
}

function matchingAnswerOptions(block: Block, rows: string[][]) {
  const fromChoices = (block.content.choices ?? []).map((choice) => choice.text).filter(Boolean);
  const rowAnswers = rows.map((row) => row[1]).filter(Boolean);
  if (isCurrentMatchingAnswerBank(fromChoices, rowAnswers, rows.length)) return fromChoices;
  return rowAnswers.length ? rowAnswers : shuffleMatchingAnswers(rows);
}

function isCurrentMatchingAnswerBank(choices: string[], rowAnswers: string[], rowCount: number) {
  if (!choices.length) return false;
  if (choices.length !== rowCount) return false;
  return rowAnswers.every((answer) => choices.includes(answer));
}

function ensureMatchingAnswerChoices(currentAnswers: string[], rows: string[][]) {
  const nextTexts = [...currentAnswers];
  rows.forEach((row) => {
    const value = row[1];
    if (value && !nextTexts.includes(value)) nextTexts.push(value);
  });
  return nextTexts.filter(Boolean).map((text, index) => ({ id: String.fromCharCode(97 + index), text }));
}

function updateMatchingAnswerChoiceTexts(choices: Block["content"]["choices"], currentAnswers: string[], previous: string, next: string) {
  const source = choices?.length ? choices.map((choice) => choice.text) : currentAnswers;
  return source.map((text, index) => ({
    id: choices?.[index]?.id ?? String.fromCharCode(97 + index),
    text: text === previous ? next : text,
  }));
}

function sameStringSet(left: string[], right: string[]) {
  return left.length === right.length && left.every((item) => right.includes(item));
}

function sameOrderedAnswers(left: string[], right: string[]) {
  return right.length > 0 && right.every((expected, index) => normalizeAnswer(left[index]) === normalizeAnswer(expected));
}

function countBlanksForBlock(block: Block) {
  return normalizedBlankText(block.content.text || block.content.question).split("___").length - 1;
}

function firstEmptyBlankIndex(answers: string[], blankCount: number) {
  const emptyIndex = Array.from({ length: blankCount }, (_, index) => index).find((index) => !answers[index]?.trim());
  return emptyIndex ?? Math.max(0, blankCount - 1);
}

function hasEveryBlankFilled(answers: string[], blankCount: number) {
  return blankCount > 0 && Array.from({ length: blankCount }, (_, index) => answers[index]).every((answer) => answer?.trim());
}

function parseAnswerList(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function replaceAt(items: string[], index: number, value: string) {
  const next = [...items];
  next[index] = value;
  return next;
}

function normalizedBlankText(value?: string) {
  if (value?.includes("___")) return value;
  return "The answer is ___.";
}

function normalizeTableRows(rows?: string[][]) {
  const source = rows?.length ? rows : [["Header 1", "Header 2"], ["Cell", "Cell"]];
  const columnCount = getTableColumnCount(source);
  return source.map((row) => Array.from({ length: columnCount }, (_, index) => row[index] ?? ""));
}

function getTableColumnCount(rows: string[][]) {
  return Math.max(1, ...rows.map((row) => row.length));
}

function tableGridStyle(columnCount: number): React.CSSProperties {
  return { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` };
}

function tableFrameClass(block: Block) {
  return cn(block.style.tableBorderMode === "grid" && "overflow-hidden rounded-2xl border", block.style.tableBorderMode !== "grid" && "overflow-hidden");
}

function tableFrameStyle(block: Block): React.CSSProperties {
  if (block.style.tableBorderMode !== "grid") return {};
  return { borderColor: block.style.tableGridColor ?? "#e4e4e7", borderRadius: block.style.radius };
}

function tableRowStyle(block: Block, rowIndex: number, columnCount: number): React.CSSProperties {
  return {
    ...tableGridStyle(columnCount),
    background: rowIndex === 0 ? cssTransparent(block.style.tableHeaderFillColor, "#f4f4f5") : cssTransparent(block.style.tableRowFillColor, "#ffffff"),
    color: rowIndex === 0 ? block.style.tableHeaderFontColor ?? "#18181b" : block.style.fontColor ?? "#3f3f46",
    fontSize: block.style.fontSize ? `${block.style.fontSize}px` : undefined,
  };
}

function tableCellBorderClass(block: Block, cellIndex: number, columnCount: number) {
  if (block.style.tableBorderMode === "none") return "";
  if (block.style.tableBorderMode === "rows") return "border-t";
  return cn("border-t", cellIndex < columnCount - 1 && "border-r");
}

function tableCellStyle(block: Block, rowIndex: number): React.CSSProperties {
  return {
    borderColor: block.style.tableGridColor ?? "#e4e4e7",
    color: rowIndex === 0 ? block.style.tableHeaderFontColor ?? "#18181b" : block.style.fontColor ?? "#3f3f46",
    padding: `${block.style.tableCellPadding ?? 12}px`,
    fontSize: block.style.fontSize ? `${block.style.fontSize}px` : undefined,
  };
}

function cssTransparent(value: string | undefined, fallback: string) {
  return value === "transparent" ? "transparent" : value ?? fallback;
}

function normalizeAnswer(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function lessonButtonStyle(theme: ThemeTokens, depth = 4, block?: Block): React.CSSProperties {
  const defaultButtonColor = block?.type === "quiz" ? "#2563eb" : theme.primary;
  const defaultShadowColor = block?.type === "quiz" ? "#1d4ed8" : theme.shadow;
  const buttonColor = block?.style.buttonFillColor ?? defaultButtonColor;
  return {
    "--button-bg": buttonColor,
    "--button-shadow": block?.style.shadowColor ?? defaultShadowColor,
    "--button-depth": `${depth}px`,
    color: block?.style.buttonFontColor ?? block?.style.fontColor ?? "#ffffff",
    fontSize: block?.style.buttonFontSize ? `${block.style.buttonFontSize}px` : scaledFontSize(block),
    borderColor: block?.style.borderColor,
    borderWidth: block?.style.borderWidth,
    borderRadius: block?.style.radius,
  } as React.CSSProperties;
}

function hasText(value?: string) {
  return !!value?.trim();
}

function textAlignClass(block: Block, fallback: "left" | "center" | "right" = "left") {
  const align = block.style.textAlign ?? fallback;
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

function lineAlignClass(block: Block) {
  const align = block.style.textAlign ?? "center";
  if (align === "left") return "justify-start";
  if (align === "right") return "justify-end";
  return "justify-center";
}

function cssLineStyle(style?: Block["style"]["lineStyle"]) {
  if (style === "dashed" || style === "dotted" || style === "double") return style;
  return "solid";
}

function columnGridClass(block: Block) {
  if (block.settings.mobileStack === false) {
    if (block.style.columns === "leftWide") return "grid-cols-[1.35fr_0.65fr]";
    if (block.style.columns === "rightWide") return "grid-cols-[0.65fr_1.35fr]";
    return "grid-cols-2";
  }
  if (block.style.columns === "leftWide") return "md:grid-cols-[1.35fr_0.65fr]";
  if (block.style.columns === "rightWide") return "md:grid-cols-[0.65fr_1.35fr]";
  return "md:grid-cols-2";
}

function blockSurfaceStyle(block: Block, base: React.CSSProperties = {}): React.CSSProperties {
  const depth = block.style.shell === "embossed" ? block.style.shadowColor ?? "#1e3a8a" : undefined;
  const scale = blockHeightScale(block);
  const compressedPadding = scale < 1 ? `${Math.max(2, Math.round(12 * scale))}px` : undefined;
  return {
    ...base,
    background: block.style.fillColor ?? base.background,
    borderColor: block.style.borderColor ?? base.borderColor,
    borderWidth: block.style.borderWidth ?? base.borderWidth,
    borderRadius: block.style.radius ?? base.borderRadius,
    boxShadow: depth ? `0 5px 0 ${depth}` : base.boxShadow,
    paddingTop: compressedPadding ?? base.paddingTop,
    paddingBottom: compressedPadding ?? base.paddingBottom,
  };
}

function equationSurfaceStyle(block: Block): React.CSSProperties {
  const align = block.style.textAlign ?? "center";
  return {
    ...blockSurfaceStyle(block),
    alignItems: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
  };
}

function blockTextStyle(block?: Block, scale = 1): React.CSSProperties | undefined {
  if (!block) return undefined;
  const style: React.CSSProperties = {};
  const fontSize = scaledFontSize(block, scale);
  if (fontSize) style.fontSize = fontSize;
  if (blockHeightScale(block) < 1) style.lineHeight = 1.08;
  if (block.style.fontColor) style.color = block.style.fontColor;
  return Object.keys(style).length ? style : undefined;
}

function scaledFontSize(block?: Block, scale = 1) {
  if (!block) return undefined;
  const heightScale = blockHeightScale(block);
  const baseSize = block.style.fontSize ?? (heightScale < 1 ? 16 : undefined);
  return baseSize ? `${Math.max(10, Math.round(baseSize * scale * heightScale))}px` : undefined;
}

function partTextStyle(block: Block, part: "title" | "subtitle" | "body" | "question" | "choice" | "button" | "caption"): React.CSSProperties | undefined {
  const sizeByPart = {
    title: block.style.titleFontSize,
    subtitle: block.style.subtitleFontSize,
    body: block.style.bodyFontSize,
    question: block.style.questionFontSize,
    choice: block.style.choiceFontSize,
    button: block.style.buttonFontSize,
    caption: block.style.bodyFontSize,
  };
  const colorByPart = {
    title: block.style.titleFontColor,
    subtitle: block.style.subtitleFontColor,
    body: block.style.bodyFontColor,
    question: block.style.questionFontColor,
    choice: block.style.choiceFontColor,
    button: block.style.buttonFontColor,
    caption: block.style.bodyFontColor,
  };
  const defaultSizeByPart = {
    title: 32,
    subtitle: 16,
    body: 16,
    question: 18,
    choice: 15,
    button: 14,
    caption: 12,
  };
  const heightScale = blockHeightScale(block);
  const style: React.CSSProperties = {};
  const size = sizeByPart[part] ?? block.style.fontSize ?? (heightScale < 1 ? defaultSizeByPart[part] : undefined);
  const color = colorByPart[part] ?? block.style.fontColor;
  if (size) style.fontSize = `${Math.max(10, Math.round(size * heightScale))}px`;
  if (heightScale < 1) style.lineHeight = part === "title" ? 1.05 : 1.22;
  if (color) style.color = color;
  return Object.keys(style).length ? style : undefined;
}

function blockHeightScale(block?: Block) {
  if (!block?.style.minHeight) return 1;
  const naturalHeightByType: Partial<Record<Block["type"], number>> = {
    title: 150,
    paragraph: 92,
    sectionHeader: 136,
    keyPoints: 210,
    checklist: 190,
    callout: 128,
    table: 260,
    quiz: 270,
    dragDrop: 300,
    equation: 132,
    tabbedContent: 230,
    timeline: 320,
    stepByStep: 320,
    thumbsCheck: 240,
    hyperlink: 76,
    calculator: 44,
  };
  const naturalHeight = naturalHeightByType[block.type] ?? 160;
  if (block.style.minHeight >= naturalHeight) return 1;
  return Math.max(0.56, block.style.minHeight / naturalHeight);
}
