"use client";
import React, { useId } from "react";
import { createPortal } from "react-dom";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, pointerWithin, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, rectSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import * as DropdownSelect from "@radix-ui/react-select";
import { ArrowLeft, ArrowLeftRight, ArrowRight, Atom, Check, CheckCheck, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, GripVertical, Image, Lightbulb, Link2, Maximize2, Navigation, PanelsTopLeft, Plus, Shapes, ThumbsDown, ThumbsUp, Video, X } from "lucide-react";
import type { Block, BlockChildSlot, DropdownQuizBlank, DropdownQuizItem, EnumerationQuizItem, ImageAnnotation, MiniPage, ThemeTokens, VennDiagramItem } from "../types";
import { shellClass, cn, uid } from "../theme";
import { allDropdownsAnswered, dropdownAnswersAreCorrect, syncDropdownQuizItem } from "../blocks/activities/quiz/dropdownQuiz";
import { allEnumerationAnswersFilled, createDefaultEnumerationQuizItems, createEnumerationQuizItem, enumerationAnswersAreCorrect } from "../blocks/activities/quiz/enumerationQuiz";
import { ZakiScientificCalculator, type ScientificCalculatorState } from "../features/calculator";
import { canStoreImageFile, showImageStorageLimitAlert } from "../utils/imageStorage";
import { resolveMiniPageNavigation, useStudentBlockState } from "../studentRuntime";
import { createMiniPage, miniPageContainerId } from "../boardState";
import { EditableText } from "./EditableText";
import { EditorFlashcardBlock, StudentFlashcardBlock } from "./FlashcardBlock";
import { MathFormula, MathText } from "./MathText";
import { EditorWhiteboardBlock, StudentWhiteboardBlock } from "./WhiteboardBlock";

type MiniPageNavigation = {
  onPreviousPage: () => void;
  onNextPage: () => void;
  onGoToPage: (pageId: string) => void;
  suppressRevealAnimation?: boolean;
};

const MINI_PAGE_SLIDE_DURATION = 0.6;
const MINI_PAGE_SLIDE_EASE = [0.22, 1, 0.36, 1] as const;
const STUDENT_VIDEO_PAUSE_EVENT = "student-video-pause";

type EditorBlockContentProps = {
  block: Block;
  theme: ThemeTokens;
  updateBlock: (block: Block) => void;
  commitBlockUpdate?: (block: Block) => void;
  renderChildren?: (side: BlockChildSlot) => React.ReactNode;
  renderMiniPage?: (miniPage: MiniPage, navigation?: MiniPageNavigation) => React.ReactNode;
};

type StudentBlockProps = {
  block: Block;
  theme: ThemeTokens;
  renderChildren?: (side: BlockChildSlot) => React.ReactNode;
  renderMiniPage?: (miniPage: MiniPage, navigation?: MiniPageNavigation) => React.ReactNode;
  onContinue?: () => void;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  onGoToPage?: (pageId: string) => void;
  onAnswer?: () => void;
};

export function EditorBlockContent({ block, theme, updateBlock, commitBlockUpdate, renderChildren, renderMiniPage }: EditorBlockContentProps) {
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
        <EditableText value={block.content.text} onChange={(text) => updateContent({ text })} className="text-[16px] leading-7 text-[#0b0b0b]" style={partTextStyle(block, "body")} placeholder="Write your paragraph here, explanation, description..." multiline />
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

  if (block.type === "vennDiagram") {
    return <EditorVennPresentation block={block} updateBlock={updateBlock} commitBlockUpdate={commitBlockUpdate ?? updateBlock} />;
  }

  if (block.type === "quiz") {
    return <EditableQuiz block={block} theme={theme} updateContent={updateContent} />;
  }

  if (block.type === "dragDrop") {
    return <EditableDragDrop block={block} theme={theme} updateContent={updateContent} />;
  }

  if (block.type === "flashcard") {
    return <EditorFlashcardBlock block={block} theme={theme} updateBlock={updateBlock} />;
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

  if (block.type === "popup") {
    return <EditorPopupBlock block={block} theme={theme} commitBlockUpdate={commitBlockUpdate ?? updateBlock} renderChildren={renderChildren} />;
  }

  if (block.type === "miniPage") {
    return <EditorMiniPageBlock block={block} updateBlock={updateBlock} renderMiniPage={renderMiniPage} />;
  }

  if (block.type === "calculator") {
    return <CalculatorToolBlock block={block} theme={theme} />;
  }

  if (block.type === "whiteboard") {
    return <EditorWhiteboardBlock block={block} />;
  }

  if (block.type === "continue") {
    return (
      <section className={cn("flex py-5", horizontalAlignClass(block))}>
        <div className="lesson-action-button rounded-full px-7 py-3" style={lessonButtonStyle(theme, 4, block)}>
          <EditableText value={block.content.label} onChange={(label) => updateContent({ label })} className="text-sm font-bold text-white" style={partTextStyle(block, "button")} />
        </div>
      </section>
    );
  }

  if (block.type === "nextPage") {
    return (
      <section className={cn("flex py-5", horizontalAlignClass(block))}>
        <div className="lesson-action-button inline-flex items-center gap-3 rounded-2xl px-7 py-3 text-sm font-bold text-white" style={lessonButtonStyle(theme, 4, block)}>
          <EditableText value={block.content.label} onChange={(label) => updateContent({ label })} className="text-sm font-bold text-white" style={partTextStyle(block, "button")} />
          <ArrowRight size={18} />
        </div>
      </section>
    );
  }

  if (block.type === "previousPage") {
    return (
      <section className={cn("flex py-5", horizontalAlignClass(block))}>
        <div className="lesson-action-button inline-flex items-center gap-3 rounded-2xl px-7 py-3 text-sm font-bold text-white" style={lessonButtonStyle(theme, 4, block)}>
          <ArrowLeft size={18} />
          <EditableText value={block.content.label} onChange={(label) => updateContent({ label })} className="text-sm font-bold text-white" style={partTextStyle(block, "button")} />
        </div>
      </section>
    );
  }

  if (block.type === "goToPage") {
    return (
      <section className={cn("flex py-5", horizontalAlignClass(block))}>
        <div className="lesson-action-button inline-flex items-center gap-3 rounded-2xl px-7 py-3 text-sm font-bold text-white" style={lessonButtonStyle(theme, 4, block)}>
          <EditableText value={block.content.label} onChange={(label) => updateContent({ label })} className="text-sm font-bold text-white" style={partTextStyle(block, "button")} />
          <Navigation size={18} />
        </div>
      </section>
    );
  }

  return null;
}

export function StudentBlockContent({ block, theme, renderChildren, renderMiniPage, onContinue, onPreviousPage, onNextPage, onGoToPage, onAnswer }: StudentBlockProps) {
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
        {hasBodyText && <MathText block text={block.content.text} className="text-[16px] leading-7 text-[#0b0b0b]" style={partTextStyle(block, "body")} />}
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

  if (block.type === "vennDiagram") {
    return <StudentVennPresentation block={block} />;
  }

  if (block.type === "quiz") {
    return <StudentQuiz block={block} theme={theme} onAnswer={onAnswer} />;
  }

  if (block.type === "dragDrop") {
    return <StudentDragDrop block={block} theme={theme} />;
  }

  if (block.type === "flashcard") {
    return <StudentFlashcardBlock block={block} theme={theme} />;
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
        <MathText text={block.content.label} className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: theme.primary }} />
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

  if (block.type === "popup") {
    return <StudentPopupBlock block={block} theme={theme} renderChildren={renderChildren} />;
  }

  if (block.type === "miniPage") {
    return <StudentMiniPageBlock block={block} renderMiniPage={renderMiniPage} />;
  }

  if (block.type === "calculator") {
    return <CalculatorToolBlock block={block} theme={theme} />;
  }

  if (block.type === "whiteboard") {
    return <StudentWhiteboardBlock block={block} />;
  }

  if (block.type === "continue") {
    return <StudentDelayedFlowButton block={block} theme={theme} onActivate={onContinue} />;
  }

  if (block.type === "nextPage") {
    return <StudentDelayedFlowButton block={block} theme={theme} onActivate={onNextPage} />;
  }

  if (block.type === "previousPage") {
    return <StudentDelayedFlowButton block={block} theme={theme} onActivate={onPreviousPage} />;
  }

  if (block.type === "goToPage") {
    const targetPageId = block.content.targetPageId;
    return <StudentDelayedFlowButton block={block} theme={theme} disabled={!targetPageId || !onGoToPage} onActivate={targetPageId ? () => onGoToPage?.(targetPageId) : undefined} />;
  }

  return null;
}

type PopupRendererProps = {
  block: Block;
  theme: ThemeTokens;
  renderChildren?: (side: BlockChildSlot) => React.ReactNode;
};

function EditorMiniPageBlock({ block, updateBlock, renderMiniPage }: { block: Block; updateBlock: (block: Block) => void; renderMiniPage?: (miniPage: MiniPage) => React.ReactNode }) {
  const pages = block.miniPages?.length ? block.miniPages : [createMiniPage()];
  const activePage = pages.find((page) => page.id === block.activeMiniPageId) ?? pages[0];
  const activeIndex = Math.max(0, pages.findIndex((page) => page.id === activePage.id));
  const surfaceStyle = miniPageSurfaceStyle(block);

  const setActivePage = (index: number) => {
    const nextPage = pages[Math.max(0, Math.min(pages.length - 1, index))];
    if (nextPage) updateBlock({ ...block, miniPages: pages, activeMiniPageId: nextPage.id });
  };

  const addPage = () => {
    const nextPage = createMiniPage();
    updateBlock({ ...block, miniPages: [...pages, nextPage], activeMiniPageId: nextPage.id });
  };

  return (
    <section className="mini-page-block py-0">
      <div className={cn("mini-page-surface", block.settings.miniPageFixedHeight && "is-fixed")} style={surfaceStyle} data-mini-page-container={miniPageContainerId(block.id, activePage.id)}>
        <div className="mini-page-controls" onClick={(event) => event.stopPropagation()}>
          <button className="mini-page-icon-button" type="button" onClick={addPage} aria-label="Add mini page" title="Add mini page"><Plus size={15} /></button>
        </div>
        <div className="mini-page-nav" onClick={(event) => event.stopPropagation()}>
          <button className="mini-page-icon-button" type="button" disabled={activeIndex <= 0} onClick={() => setActivePage(activeIndex - 1)} aria-label="Previous mini page" title="Previous mini page"><ChevronLeft size={16} /></button>
          <span>{activeIndex + 1}/{pages.length}</span>
          <button className="mini-page-icon-button" type="button" disabled={activeIndex >= pages.length - 1} onClick={() => setActivePage(activeIndex + 1)} aria-label="Next mini page" title="Next mini page"><ChevronRight size={16} /></button>
        </div>
        {renderMiniPage?.(activePage)}
      </div>
    </section>
  );
}

function StudentMiniPageBlock({ block, renderMiniPage }: { block: Block; renderMiniPage?: (miniPage: MiniPage, navigation?: MiniPageNavigation) => React.ReactNode }) {
  const pages = block.miniPages?.length ? block.miniPages : [];
  const fallbackPageId = (pages.find((page) => page.id === block.activeMiniPageId) ?? pages[0])?.id ?? "";
  const [currentPageId, setCurrentPageId] = useStudentBlockState(block.id, "miniPage.currentPageId", fallbackPageId);
  const [pageDirection, setPageDirection] = React.useState(1);
  const [pageTransitioning, setPageTransitioning] = React.useState(false);
  const activePage = pages.find((page) => page.id === currentPageId) ?? pages.find((page) => page.id === fallbackPageId) ?? pages[0];
  if (!activePage) return null;
  const activeIndex = Math.max(0, pages.findIndex((page) => page.id === activePage.id));
  const setMiniPage = (pageId: string, direction: number) => {
    setPageDirection(direction);
    setPageTransitioning(true);
    setCurrentPageId(pageId);
  };
  const navigation: MiniPageNavigation = {
    onPreviousPage: () => {
      const previous = pages[activeIndex - 1];
      if (previous) setMiniPage(previous.id, -1);
    },
    onNextPage: () => {
      const next = pages[activeIndex + 1];
      if (next) setMiniPage(next.id, 1);
    },
    onGoToPage: (pageId) => {
      const navigation = resolveMiniPageNavigation(pages, activePage.id, pageId);
      if (navigation) setMiniPage(navigation.pageId, navigation.direction);
    },
    suppressRevealAnimation: pageTransitioning,
  };
  return (
    <section className="mini-page-block py-0">
      <div className={cn("mini-page-surface is-student", block.settings.miniPageFixedHeight && "is-fixed")} style={miniPageSurfaceStyle(block)}>
        <div className="mini-page-student-viewport">
          <AnimatePresence custom={pageDirection} initial={false} mode="sync">
            <motion.div
              key={activePage.id}
              className="mini-page-student-page"
              custom={pageDirection}
              initial="enter"
              animate="center"
              exit="exit"
              variants={{
                enter: (direction: number) => ({ x: direction > 0 ? "100%" : "-100%" }),
                center: { x: 0 },
                exit: (direction: number) => ({ x: direction > 0 ? "-100%" : "100%" }),
              }}
              transition={{ duration: MINI_PAGE_SLIDE_DURATION, ease: MINI_PAGE_SLIDE_EASE }}
              onAnimationComplete={(definition) => {
                if (definition === "center") setPageTransitioning(false);
              }}
            >
              {renderMiniPage?.(activePage, navigation)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function miniPageSurfaceStyle(block: Block): React.CSSProperties {
  const shadowColor = block.style.shadowColor;
  return {
    minHeight: block.settings.miniPageFixedHeight ? undefined : block.style.minHeight ? `${block.style.minHeight}px` : undefined,
    height: block.settings.miniPageFixedHeight ? `${block.style.minHeight ?? 320}px` : undefined,
    background: block.style.fillColor ?? "transparent",
    borderColor: block.style.borderColor ?? "transparent",
    borderWidth: `${block.style.borderWidth ?? 0}px`,
    borderRadius: `${block.style.radius ?? 0}px`,
    boxShadow: shadowColor ? `0 12px 28px ${shadowColor}` : undefined,
  };
}

function EditorPopupBlock({ block, theme, renderChildren, commitBlockUpdate }: PopupRendererProps & { commitBlockUpdate: (block: Block) => void }) {
  const [open, setOpen] = React.useState(false);
  const [liveSize, setLiveSize] = React.useState<{ width: number; height: number } | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const mode = block.settings.popupDisplay ?? "floating";
  const size = liveSize ?? popupSize(block);

  return (
    <section className="popup-block py-3">
      <div className={cn("flex", horizontalAlignClass(block))}>
        <PopupTrigger block={block} theme={theme} open={open} triggerRef={triggerRef} onToggle={() => setOpen((current) => !current)} />
      </div>
      {open && (
        <PopupLayer block={block} mode={mode} size={size} triggerRef={triggerRef} onClose={() => setOpen(false)}>
          <PopupPanel block={block} title="Popup board" size={size} onClose={() => setOpen(false)} onResizeStart={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const startX = event.clientX;
            const startY = event.clientY;
            const startSize = size;
            let latest = startSize;
            let frame = 0;

            const resize = (moveEvent: PointerEvent) => {
              latest = {
                width: Math.max(280, Math.min(1200, Math.round(startSize.width + moveEvent.clientX - startX))),
                height: Math.max(220, Math.min(900, Math.round(startSize.height + moveEvent.clientY - startY))),
              };
              if (frame) return;
              frame = window.requestAnimationFrame(() => {
                frame = 0;
                setLiveSize(latest);
              });
            };
            const finish = () => {
              if (frame) window.cancelAnimationFrame(frame);
              window.removeEventListener("pointermove", resize);
              window.removeEventListener("pointerup", finish);
              window.removeEventListener("pointercancel", finish);
              setLiveSize(null);
              if (latest.width !== startSize.width || latest.height !== startSize.height) {
                commitBlockUpdate({ ...block, style: { ...block.style, popupWidth: latest.width, popupHeight: latest.height } });
              }
            };
            window.addEventListener("pointermove", resize);
            window.addEventListener("pointerup", finish, { once: true });
            window.addEventListener("pointercancel", finish, { once: true });
          }}>
            {renderChildren?.("content")}
          </PopupPanel>
        </PopupLayer>
      )}
    </section>
  );
}

function StudentPopupBlock({ block, theme, renderChildren }: PopupRendererProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const mode = block.settings.popupDisplay ?? "floating";
  const size = popupSize(block);

  React.useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("student-popup-close-all", close);
    return () => window.removeEventListener("student-popup-close-all", close);
  }, []);

  return (
    <section className="popup-block py-3">
      <div className={cn("flex", horizontalAlignClass(block))}>
        <PopupTrigger block={block} theme={theme} open={open} triggerRef={triggerRef} onToggle={() => setOpen((current) => !current)} />
      </div>
      {open && (
        <PopupLayer block={block} mode={mode} size={size} triggerRef={triggerRef} onClose={() => setOpen(false)}>
          <PopupPanel block={block} title={block.content.label?.trim() || "Popup"} size={size} onClose={() => setOpen(false)}>
            {renderChildren?.("content")}
          </PopupPanel>
        </PopupLayer>
      )}
    </section>
  );
}

function PopupTrigger({ block, theme, open, triggerRef, onToggle }: { block: Block; theme: ThemeTokens; open: boolean; triggerRef: React.RefObject<HTMLButtonElement | null>; onToggle: () => void }) {
  return (
    <button
      ref={triggerRef}
      className={cn("popup-trigger-button lesson-action-button rounded-2xl px-3 py-2.5 font-bold", open && "is-pressed")}
      style={popupTriggerStyle(block, theme)}
      aria-expanded={open}
      aria-controls={`popup-panel-${block.id}`}
      onClick={onToggle}
      type="button"
    >
      <span className="popup-trigger-icon" style={{ background: theme.primary, color: "white" }} aria-hidden="true"><PanelsTopLeft size={17} /></span>
      <span className="popup-trigger-label">{block.content.label?.trim() || "Open popup"}</span>
      <span className="popup-trigger-status" aria-hidden="true">{open ? "Close" : "Open"}</span>
    </button>
  );
}

function PopupLayer({ block, mode, size, triggerRef, onClose, children }: { block: Block; mode: NonNullable<Block["settings"]["popupDisplay"]>; size: { width: number; height: number }; triggerRef: React.RefObject<HTMLButtonElement | null>; onClose: () => void; children: React.ReactNode }) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = React.useState({ left: 16, top: 16 });

  React.useLayoutEffect(() => {
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const responsiveWidth = Math.min(size.width, window.innerWidth - 32);
      const responsiveHeight = Math.min(size.height, window.innerHeight - 32);
      const rightCandidate = rect.right + 12;
      const leftCandidate = rect.left - responsiveWidth - 12;
      const left = rightCandidate + responsiveWidth <= window.innerWidth - 16
        ? rightCandidate
        : leftCandidate >= 16
          ? leftCandidate
          : Math.max(16, Math.min(rect.left, window.innerWidth - responsiveWidth - 16));
      setPosition({
        left,
        top: Math.max(16, Math.min(rect.bottom + 10, window.innerHeight - responsiveHeight - 16)),
      });
    };
    update();
    if (mode !== "floating") return;
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [mode, size.height, size.width, triggerRef]);

  React.useEffect(() => {
    panelRef.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [onClose, triggerRef]);

  const content = (
    <div
      ref={panelRef}
      id={`popup-panel-${block.id}`}
      className={cn("popup-layer", `popup-layer--${mode}`)}
      style={mode === "floating" ? { left: position.left, top: position.top } : undefined}
      role="dialog"
      aria-modal={mode === "modal" ? true : undefined}
      aria-label={block.content.label?.trim() || "Popup board"}
      tabIndex={-1}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  );

  if (mode === "inline") return content;
  if (typeof document === "undefined") return null;
  if (mode === "modal") {
    return createPortal(<div className="popup-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>{content}</div>, document.body);
  }
  return createPortal(content, document.body);
}

function PopupPanel({ block, title, size, onClose, onResizeStart, children }: { block: Block; title: string; size: { width: number; height: number }; onClose: () => void; onResizeStart?: (event: React.PointerEvent<HTMLButtonElement>) => void; children: React.ReactNode }) {
  return (
    <div className="popup-panel" style={{ ...popupPanelStyle(block), width: `min(${size.width}px, calc(100vw - 32px))`, height: `min(${size.height}px, calc(100vh - 32px))` }}>
      <header className="popup-panel-header">
        <span className="truncate text-sm font-black text-zinc-800">{title}</span>
        <button className="popup-close-button" onClick={onClose} type="button" aria-label="Close popup"><X size={18} /></button>
      </header>
      <div className="popup-panel-content">{children}</div>
      {onResizeStart && <button className="popup-resize-handle" onPointerDown={onResizeStart} type="button" aria-label="Resize popup" title="Resize popup" />}
    </div>
  );
}

function popupSize(block: Block) {
  return { width: block.style.popupWidth ?? 640, height: block.style.popupHeight ?? 480 };
}

function popupTriggerStyle(block: Block, theme: ThemeTokens): React.CSSProperties {
  const customizedFill = block.style.buttonFillColor;
  return {
    ...lessonButtonStyle(theme, 3, block),
    "--button-bg": customizedFill ?? theme.bgLight,
    "--button-shadow": block.style.shadowColor ?? theme.borderLight,
    color: block.style.buttonFontColor ?? block.style.fontColor ?? (customizedFill ? "#ffffff" : theme.primary),
    borderColor: block.style.borderColor ?? theme.borderLight,
    borderWidth: block.style.borderWidth ?? 2,
  } as React.CSSProperties;
}

function popupPanelStyle(block: Block): React.CSSProperties {
  return {
    background: block.style.fillColor ?? "#ffffff",
    borderColor: block.style.borderColor ?? "#e4e4e7",
    borderWidth: `${block.style.borderWidth ?? 2}px`,
    borderRadius: `${block.style.radius ?? 20}px`,
    boxShadow: `0 20px 60px ${block.style.shadowColor ?? "rgba(15, 23, 42, 0.22)"}`,
  };
}

function LineBlock({ block }: { block: Block }) {
  const color = block.style.borderColor ?? "#d4d4d8";
  const thickness = block.style.lineThickness ?? 2;
  const width = `${block.style.lineWidth ?? 100}%`;
  const height = Math.max(12, thickness * 5);

  return (
    <section className={cn("flex py-4", horizontalAlignClass(block))}>
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
  const [open, setOpen] = useStudentBlockState(block.id, "calculator.open", false);
  const [position, setPosition] = useStudentBlockState<{ x: number; y: number } | null>(block.id, "calculator.position", null);
  const [calculatorState, setCalculatorState] = useStudentBlockState<ScientificCalculatorState | null>(block.id, "calculator.state", null);
  const [zIndex, setZIndex] = useStudentBlockState(block.id, "calculator.zIndex", 100);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const dragState = React.useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const cleanupDrag = React.useRef<(() => void) | null>(null);

  React.useEffect(() => () => cleanupDrag.current?.(), []);

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    cleanupDrag.current?.();
    const drag = {
      startX: event.clientX,
      startY: event.clientY,
      originX: position?.x ?? 24,
      originY: position?.y ?? 24,
    };
    dragState.current = drag;

    function moveWindow(moveEvent: PointerEvent) {
      setPosition(
        clampCalculatorPosition({
          x: drag.originX + moveEvent.clientX - drag.startX,
          y: drag.originY + moveEvent.clientY - drag.startY,
        }),
      );
    }

    function finishDrag() {
      dragState.current = null;
      window.removeEventListener("pointermove", moveWindow);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
      cleanupDrag.current = null;
    }

    cleanupDrag.current = finishDrag;
    window.addEventListener("pointermove", moveWindow);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
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
    if (event.type === "pointercancel") cleanupDrag.current?.();
  }

  return (
    <section className={cn("py-0", textAlignClass(block, "center"))}>
      <button
        ref={triggerRef}
        className={cn("calculator-trigger-button", open && "is-pressed")}
        style={calculatorTriggerStyle(block, theme)}
        aria-pressed={open}
        onClick={() => {
          if (!open && !position) {
            const rect = triggerRef.current?.getBoundingClientRect();
            setPosition(clampCalculatorPosition({ x: rect ? rect.right + 12 : 24, y: rect ? rect.top : 24 }));
          }
          setOpen((current) => !current);
        }}
        type="button"
      >
        {open ? "Hide Calculator" : label}
      </button>
      {open && position && typeof document !== "undefined" && createPortal(
        <div className="desmos-calculator-panel" data-calculator-window style={{ left: position.x, top: position.y, zIndex }} onPointerDown={() => setZIndex(Date.now())}>
          <div className="desmos-calculator-titlebar" onPointerCancel={stopDrag} onPointerDown={startDrag} onPointerMove={dragWindow} onPointerUp={stopDrag}>
            <GripVertical className="shrink-0 text-zinc-500" size={21} />
            <div className="min-w-0 flex-1 text-center text-base font-bold text-zinc-800">Calculator</div>
            <button className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800" onClick={() => setOpen(false)} onPointerDown={(event) => event.stopPropagation()} type="button" aria-label="Close calculator">
              <X size={21} />
            </button>
          </div>
          <div className="desmos-calculator-body">
            <ZakiScientificCalculator savedState={calculatorState} onStateChange={setCalculatorState} />
          </div>
        </div>
        , document.body)}
    </section>
  );
}

function StudentDelayedFlowButton({ block, theme, onActivate, disabled = false }: { block: Block; theme: ThemeTokens; onActivate?: () => void; disabled?: boolean }) {
  const delaySeconds = Math.max(0, block.settings.continueDelaySeconds ?? 5);
  const delayed = !!block.settings.continueDelayEnabled && delaySeconds > 0;
  const delayKey = `${block.id}:${delayed ? delaySeconds : 0}`;

  return <StudentDelayedFlowButtonContent key={delayKey} block={block} theme={theme} onActivate={onActivate} disabled={disabled} delaySeconds={delaySeconds} delayed={delayed} />;
}

function StudentDelayedFlowButtonContent({ block, theme, onActivate, disabled = false, delaySeconds, delayed }: { block: Block; theme: ThemeTokens; onActivate?: () => void; disabled?: boolean; delaySeconds: number; delayed: boolean }) {
  const [locked, setLocked] = React.useState(delayed);

  React.useEffect(() => {
    if (!delayed) return;
    const timer = window.setTimeout(() => setLocked(false), delaySeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [delaySeconds, delayed]);

  const normalStyle = lessonButtonStyle(theme, 4, block);
  const activate = () => {
    window.dispatchEvent(new Event(STUDENT_VIDEO_PAUSE_EVENT));
    onActivate?.();
  };

  return (
    <section className={cn("flex py-5", horizontalAlignClass(block))}>
      <button
        className={cn("continue-delay-button lesson-action-button relative isolate overflow-hidden px-7 py-3 text-sm font-bold text-white", block.type === "nextPage" || block.type === "previousPage" || block.type === "goToPage" ? "gap-3 rounded-2xl" : "rounded-full", (locked || disabled) && "is-locked")}
        style={normalStyle}
        disabled={locked || disabled}
        onClick={activate}
      >
        {locked && (
          <span
            aria-hidden="true"
            className="continue-delay-fill"
            style={{ background: block.style.buttonFillColor ?? theme.primary, animationDuration: `${delaySeconds}s` }}
          />
        )}
        {block.type === "previousPage" && <ArrowLeft className="relative z-10" size={18} />}
        <span className="relative z-10">{block.content.label}</span>
        {block.type === "nextPage" && <ArrowRight className="relative z-10" size={18} />}
        {block.type === "goToPage" && <Navigation className="relative z-10" size={18} />}
      </button>
    </section>
  );
}

function clampCalculatorPosition(position: { x: number; y: number }) {
  const margin = 8;
  const width = Math.min(580, window.innerWidth - margin * 2);
  const height = Math.min(560, window.innerHeight - margin * 2);
  return {
    x: Math.max(margin, Math.min(position.x, window.innerWidth - width - margin)),
    y: Math.max(margin, Math.min(position.y, window.innerHeight - height - margin)),
  };
}

function calculatorTriggerStyle(block: Block, theme: ThemeTokens): React.CSSProperties {
  const accent = block.style.buttonFillColor ?? theme.primary;
  const customTextColor = block.style.buttonFontColor && block.style.buttonFontColor !== "#ffffff" ? block.style.buttonFontColor : accent;
  return {
    "--calculator-trigger-accent": accent,
    "--calculator-trigger-text": customTextColor,
    fontSize: block.style.buttonFontSize ? `${block.style.buttonFontSize}px` : undefined,
    borderRadius: block.style.radius ? `${block.style.radius}px` : undefined,
  } as React.CSSProperties;
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
  const [visibleCount, setVisibleCount] = useStudentBlockState(block.id, "step.visibleCount", 1);
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
  const [active, setActive] = useStudentBlockState(block.id, "tabs.active", 0);
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
  const [choice, setChoice] = useStudentBlockState<"down" | "up" | null>(block.id, "thumbs.choice", null);
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
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  const sourceType = block.content.videoSourceType ?? "upload";
  const height = Math.max(block.style.minHeight ?? 360, 220);
  const url = block.content.videoUrl?.trim() || "";
  const youtubeEmbed = youtubeEmbedUrl(url, block.settings);
  const isDirectVideo = sourceType === "link" || sourceType === "upload";
  const allowFullscreen = block.settings.youtubeAllowFullscreen !== false;
  const hasYoutubeRange = hasLockedYoutubeRange(block.settings);

  React.useEffect(() => {
    if (editable) return;
    const pause = () => {
      videoRef.current?.pause();
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "https://www.youtube.com");
    };
    window.addEventListener(STUDENT_VIDEO_PAUSE_EVENT, pause);
    return () => window.removeEventListener(STUDENT_VIDEO_PAUSE_EVENT, pause);
  }, [editable]);

  const enterFullscreen = () => {
    frameRef.current?.requestFullscreen?.();
  };

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
        <div ref={frameRef} className="relative overflow-hidden rounded-xl bg-black shadow-sm" style={{ height }}>
          {youtubeEmbed ? (
            <iframe
              ref={iframeRef}
              title={block.content.title || "Lesson video"}
              src={youtubeEmbed}
              className={cn("block h-full w-full", editable && "pointer-events-none")}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen={allowFullscreen}
              loading="lazy"
            />
          ) : isDirectVideo ? (
            <video ref={videoRef} className={cn("block h-full w-full bg-black", editable && "pointer-events-none")} src={url} controls preload="metadata" />
          ) : null}
          {youtubeEmbed && allowFullscreen && !editable && (
            <button
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/65 text-white shadow-sm transition hover:bg-black/80"
              type="button"
              onClick={enterFullscreen}
              aria-label="Fullscreen video"
              title="Fullscreen video"
            >
              <Maximize2 size={18} />
            </button>
          )}
          {youtubeEmbed && hasYoutubeRange && (
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-1 text-[11px] font-bold text-white">
              Locked range
            </div>
          )}
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

function youtubeEmbedUrl(url: string, settings: Block["settings"]) {
  if (!url) return "";

  let videoId = "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) videoId = url.trim();

  if (!videoId) try {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([^"&?/\s]{11})/);
    if (match?.[1]) videoId = match[1];
  } catch {
    return "";
  }

  if (!videoId) return "";
  const params = new URLSearchParams();
  const start = Math.max(0, Math.floor(settings.youtubeStartSeconds ?? 0));
  const end = Math.max(0, Math.floor(settings.youtubeEndSeconds ?? 0));
  const lockedRange = start > 0 || end > start;
  if (start > 0) params.set("start", String(start));
  if (end > start) params.set("end", String(end));
  params.set("enablejsapi", "1");
  if (typeof window !== "undefined") params.set("origin", window.location.origin);
  if (settings.youtubeAutoplay) params.set("autoplay", "1");
  if (settings.youtubeMuted) params.set("mute", "1");
  if (settings.youtubeShowControls && !lockedRange) {
    params.set("controls", "1");
  } else {
    params.set("controls", "0");
    params.set("disablekb", "1");
  }
  params.set("fs", settings.youtubeAllowFullscreen === false ? "0" : "1");
  params.set("rel", "0");
  params.set("iv_load_policy", "3");
  if (settings.youtubeLoop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }
  if (settings.youtubeCaptions) params.set("cc_load_policy", "1");
  if (settings.youtubePlaysInline !== false) params.set("playsinline", "1");
  const query = params.toString();
  return `https://www.youtube.com/embed/${videoId}${query ? `?${query}` : ""}`;
}

function hasLockedYoutubeRange(settings: Block["settings"]) {
  const start = Math.max(0, Math.floor(settings.youtubeStartSeconds ?? 0));
  const end = Math.max(0, Math.floor(settings.youtubeEndSeconds ?? 0));
  return start > 0 || end > start;
}

function EditableDragDrop({ block, theme, updateContent }: { block: Block; theme: ThemeTokens; updateContent: (patch: Partial<Block["content"]>) => void }) {
  const variant = block.settings.dragVariant ?? "sort";
  const rows = normalizeDragRows(block);
  const isBucketLike = variant === "buckets";
  const isVenn = variant === "venn";
  const isPairLike = variant === "pairs";
  const isHierarchy = variant === "hierarchy";
  const isDiagram = variant === "diagram";
  const isBlanks = variant === "blanks";

  function updateRow(rowIndex: number, cellIndex: number, value: string) {
    updateContent({ rows: rows.map((row, index) => (index === rowIndex ? row.map((cellValue, currentCellIndex) => (currentCellIndex === cellIndex ? value : cellValue)) : row)) });
  }

  return (
    <section className={variant === "buckets" ? classifyShellClass(block) : quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {hasText(block.content.question) && <div className={cn(variant === "buckets" && "flex items-start gap-3")}>
        {variant === "buckets" && <Shapes className="mt-0.5 shrink-0 text-blue-600" size={20} />}
        <EditableText value={block.content.question} onChange={(question) => updateContent({ question })} className="text-[17px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} placeholder="Activity prompt" multiline />
      </div>}
      {(isBucketLike || isBlanks || isDiagram) && hasText(block.content.text) && (
        <EditableText value={block.content.text} onChange={(text) => updateContent({ text })} className="mt-2 text-[13px] font-medium text-zinc-500" placeholder="Optional supporting text" multiline />
      )}
      {isHierarchy ? (
        <EditableHierarchyBuilder block={block} rows={rows} updateContent={updateContent} />
      ) : isPairLike ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map((row, index) => (
            <div key={index} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-2">
              <EditableText value={row[0]} onChange={(value) => updateRow(index, 0, value)} className="rounded-xl bg-zinc-50 px-3 py-2 text-[14px] font-bold text-zinc-800" style={partTextStyle(block, "choice")} placeholder="Left card" />
              <EditableText value={row[1]} onChange={(value) => updateRow(index, 1, value)} className="rounded-xl bg-blue-50 px-3 py-2 text-[13px] font-bold text-blue-700" placeholder="Right card" />
            </div>
          ))}
        </div>
      ) : isDiagram ? (
        <div className="mt-5 space-y-4">
          <div className="relative mx-auto overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50" style={{ width: `${block.content.diagramImageWidthPercent ?? 100}%`, height: `${block.content.diagramImageHeight ?? 320}px` }}>
            {block.content.src ? <img src={block.content.src} alt="" className="h-full w-full object-contain" draggable={false} /> : <div className="grid h-full place-items-center text-sm font-bold text-zinc-400">Open the diagram editor to add an image</div>}
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
      ) : isVenn ? (
        <EditableVennDiagram block={block} rows={rows} updateContent={updateContent} />
      ) : variant === "timeline" ? (
        <EditableTimelineOrder key={rows.length} block={block} theme={theme} rows={rows} updateContent={updateContent} />
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
        </div>
      ) : (
        <div className={cn(hasText(block.content.question) || hasText(block.content.text) ? "mt-4" : "mt-0")}>
          <div className="flex flex-wrap gap-3">
            {rows.map((row, index) => (
              <EditableText key={index} value={row[0]} onChange={(value) => updateRow(index, 0, value)} className="rounded-xl border-2 border-b-[4px] border-zinc-200 bg-white px-4 py-2.5 text-[14px] font-bold text-zinc-800 shadow-sm" style={partTextStyle(block, "choice")} placeholder="Draggable item" />
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {parseDragBuckets(block).map((bucket, index) => <ClassifyZonePreview key={bucket} bucket={bucket} index={index} />)}
          </div>
        </div>
      )}
    </section>
  );
}

function EditableHierarchyBuilder({ block, rows, updateContent }: { block: Block; rows: string[][]; updateContent: (patch: Partial<Block["content"]>) => void }) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [activeWidth, setActiveWidth] = React.useState(96);
  const [activeZoom, setActiveZoom] = React.useState(1);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }));
  const setParent = (index: number, parentIndex: number | null) => {
    if (parentIndex === index || hierarchyWouldCycle(rows, index, parentIndex)) return;
    updateContent({ rows: rows.map((row, rowIndex) => rowIndex === index ? [row[0], parentIndex === null ? "" : rows[parentIndex]?.[0] ?? ""] : row) });
  };
  return <div className="mt-5">
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={(event) => { setActiveIndex(Number(String(event.active.id).replace("hierarchy-node-", ""))); setActiveWidth(event.active.rect.current.initial?.width ?? 96); setActiveZoom(hierarchyDragZoom(event.activatorEvent)); }} onDragEnd={(event) => { const index = Number(String(event.active.id).replace("hierarchy-node-", "")); const over = String(event.over?.id ?? ""); if (over === "hierarchy-root") setParent(index, null); else if (over.startsWith("hierarchy-parent-")) setParent(index, Number(over.replace("hierarchy-parent-", ""))); setActiveIndex(null); }} onDragCancel={() => setActiveIndex(null)}>
      <div className="flex min-h-20 flex-wrap items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 p-4">
        {rows.map((row, index) => row[1] === "__unplaced__" ? <EditorHierarchyNode key={index} index={index} text={row[0]} block={block} onTextChange={(text) => updateContent({ rows: rows.map((item, itemIndex) => itemIndex === index ? [text, item[1]] : item) })} /> : null)}
        <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600" onClick={() => updateContent({ rows: [...rows, [nextHierarchyNodeName(rows), "__unplaced__"]] })}><Plus size={16} />Add node</button>
      </div>
      <HierarchyRootZone>
        <HierarchyForest rows={rows} draggingIndex={activeIndex} parentFor={(index) => rows[index]?.[1] ?? ""} renderNode={(index) => <EditorHierarchyNode index={index} text={rows[index]?.[0] ?? ""} block={block} root={!rows[index]?.[1]} onTextChange={(text) => updateContent({ rows: rows.map((row, rowIndex) => rowIndex === index ? [text, row[1]] : row).map((row) => [row[0], row[1] === rows[index]?.[0] ? text : row[1]]) })} />} />
      </HierarchyRootZone>
      <HierarchyDragOverlay zoom={activeZoom}>{activeIndex !== null ? <HierarchySubtreePreview rows={rows} rootIndex={activeIndex} anchorWidth={activeWidth / activeZoom} parentFor={(index) => rows[index]?.[1] ?? ""} /> : null}</HierarchyDragOverlay>
    </DndContext>
  </div>;
}

function StudentHierarchyBuilder({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const rows = normalizeDragRows(block);
  const roots = Object.fromEntries(rows.map((row, index) => [index, row[1] ? null : ""])) as Record<number, string | null>;
  const [parents, setParents] = useStudentBlockState<Record<number, string | null>>(block.id, "hierarchy.parents", roots);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [activeWidth, setActiveWidth] = React.useState(96);
  const [activeZoom, setActiveZoom] = React.useState(1);
  const [submitted, setSubmitted] = useStudentBlockState(block.id, "drag.submitted", false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }));
  const placed = (index: number) => parents[index] !== null && parents[index] !== undefined;
  const allPlaced = rows.every((_row, index) => placed(index));
  const correct = allPlaced && rows.every((row, index) => normalizeAnswer(parents[index] ?? "") === normalizeAnswer(row[1] ?? ""));
  const setParent = (index: number, parentIndex: number | null) => { if (parentIndex === index || hierarchyWouldCycle(rows, index, parentIndex, parents)) return; setParents((current) => ({ ...current, [index]: parentIndex === null ? "" : rows[parentIndex]?.[0] ?? "" })); setSubmitted(false); };
  return <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
    {hasText(block.content.question) && <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />}
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={(event) => { setActiveIndex(Number(String(event.active.id).replace("hierarchy-node-", ""))); setActiveWidth(event.active.rect.current.initial?.width ?? 96); setActiveZoom(hierarchyDragZoom(event.activatorEvent)); }} onDragEnd={(event) => { const index = Number(String(event.active.id).replace("hierarchy-node-", "")); const over = String(event.over?.id ?? ""); if (over === "hierarchy-root") setParent(index, null); else if (over.startsWith("hierarchy-parent-")) setParent(index, Number(over.replace("hierarchy-parent-", ""))); setActiveIndex(null); }} onDragCancel={() => setActiveIndex(null)}>
      <div className="mt-5 flex min-h-20 flex-wrap items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 p-4">{rows.map((row, index) => placed(index) ? null : <StudentHierarchyNode key={index} index={index} text={row[0]} />)}</div>
      <HierarchyRootZone><HierarchyForest rows={rows} draggingIndex={activeIndex} parentFor={(index) => parents[index] ?? "__unplaced__"} renderNode={(index) => <StudentHierarchyNode index={index} text={rows[index]?.[0] ?? ""} root={parents[index] === ""} />} /></HierarchyRootZone>
      <HierarchyDragOverlay zoom={activeZoom}>{activeIndex !== null ? <HierarchySubtreePreview rows={rows} rootIndex={activeIndex} anchorWidth={activeWidth / activeZoom} parentFor={(index) => parents[index] ?? "__unplaced__"} /> : null}</HierarchyDragOverlay>
    </DndContext>
    <DragCheckControls block={block} theme={theme} submitted={submitted} correct={correct} checkLabel="Verify Hierarchy" disabled={!allPlaced} onSubmit={() => setSubmitted(true)} onRetry={() => setSubmitted(false)} />
  </section>;
}

function HierarchyRootZone({ children }: { children: React.ReactNode }) { const { setNodeRef, isOver } = useDroppable({ id: "hierarchy-root" }); return <div ref={setNodeRef} className={cn("mt-5 min-h-[280px] overflow-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition", isOver && "bg-blue-50")}>{children}</div>; }

function HierarchyDragOverlay({ children, zoom }: { children: React.ReactNode; zoom: number }) {
  const overlay = <DragOverlay adjustScale={false} dropAnimation={null}><div style={{ zoom }}>{children}</div></DragOverlay>;
  return typeof document === "undefined" ? overlay : createPortal(overlay, document.body);
}

function hierarchyDragZoom(event: Event) {
  let element = event.target instanceof Element ? event.target : null;
  while (element) {
    const zoom = Number.parseFloat(getComputedStyle(element).zoom);
    if (Number.isFinite(zoom) && zoom !== 1) return zoom;
    element = element.parentElement;
  }
  return 1;
}

function HierarchyForest({ rows, parentFor, renderNode, draggingIndex }: { rows: string[][]; parentFor: (index: number) => string; renderNode: (index: number) => React.ReactNode; draggingIndex?: number | null }) {
  const roots = rows.map((_row, index) => index).filter((index) => !parentFor(index));
  const branch = (index: number, seen: Set<number>): React.ReactNode => {
    if (seen.has(index)) return null;
    const nextSeen = new Set(seen).add(index);
    const children = rows.map((_row, child) => child).filter((child) => parentFor(child) === rows[index]?.[0]);
    return <div className={cn("flex min-w-max flex-col items-center", draggingIndex === index && "opacity-0")}>
      <div>{renderNode(index)}</div>
      {children.length > 0 && <>
        <span className="h-6 w-[2px] bg-[#cbd5e1]" />
        <div className="relative flex items-start">
          {children.map((child, childIndex) => <div key={child} className="relative px-4 pt-6">
            <span className="absolute left-1/2 top-0 h-6 w-[2px] -translate-x-1/2 bg-[#cbd5e1]" />
            {childIndex > 0 && <span className="absolute left-0 right-1/2 top-0 border-t-2 border-[#cbd5e1]" />}
            {childIndex < children.length - 1 && <span className="absolute left-1/2 right-0 top-0 border-t-2 border-[#cbd5e1]" />}
            {branch(child, nextSeen)}
          </div>)}
        </div>
      </>}
    </div>;
  };
  return <div className="flex min-w-max items-start justify-center gap-12">{roots.map((root) => <React.Fragment key={root}>{branch(root, new Set())}</React.Fragment>)}</div>;
}

function HierarchySubtreePreview({ rows, rootIndex, parentFor, anchorWidth }: { rows: string[][]; rootIndex: number; parentFor: (index: number) => string; anchorWidth: number }) {
  const branch = (index: number, seen: Set<number>): React.ReactNode => {
    if (seen.has(index)) return null;
    const nextSeen = new Set(seen).add(index);
    const children = rows.map((_row, child) => child).filter((child) => parentFor(child) === rows[index]?.[0]);
    return <div className="flex min-w-max flex-col items-center">
      <HierarchyNodeShell text={rows[index]?.[0] ?? ""} active={index === rootIndex} />
      {children.length > 0 && <><span className="h-6 w-[2px] bg-[#cbd5e1]" /><div className="relative flex items-start">{children.map((child, childIndex) => <div key={child} className="relative px-4 pt-6"><span className="absolute left-1/2 top-0 h-6 w-[2px] -translate-x-1/2 bg-[#cbd5e1]" />{childIndex > 0 && <span className="absolute left-0 right-1/2 top-0 border-t-2 border-[#cbd5e1]" />}{childIndex < children.length - 1 && <span className="absolute left-1/2 right-0 top-0 border-t-2 border-[#cbd5e1]" />}{branch(child, nextSeen)}</div>)}</div></>}
    </div>;
  };
  return <div className="pointer-events-none" style={{ width: `${anchorWidth}px` }}><div className="relative left-1/2 w-max -translate-x-1/2">{branch(rootIndex, new Set())}</div></div>;
}

function EditorHierarchyNode({ index, text, block, root, onTextChange }: { index: number; text: string; block: Block; root?: boolean; onTextChange: (text: string) => void }) { const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({ id: `hierarchy-node-${index}` }); const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `hierarchy-parent-${index}` }); return <div ref={(node) => { setDragRef(node); setDropRef(node); }} className={cn("relative cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-0")} style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined} {...listeners} {...attributes}><HierarchyNodeShell text={text} over={isOver} root={root}><EditableText value={text} onChange={onTextChange} className={cn("min-w-14 text-center text-sm font-bold", root && "text-white")} style={{ ...partTextStyle(block, "choice"), ...(root ? { color: "#ffffff" } : {}) }} /></HierarchyNodeShell></div>; }

function StudentHierarchyNode({ index, text, root }: { index: number; text: string; root?: boolean }) { const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({ id: `hierarchy-node-${index}` }); const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `hierarchy-parent-${index}` }); return <div ref={(node) => { setDragRef(node); setDropRef(node); }} className={cn("touch-none", isDragging && "opacity-0")} style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined} {...listeners} {...attributes}><HierarchyNodeShell text={text} over={isOver} root={root} /></div>; }

function HierarchyNodeShell({ text, children, over, active, root }: { text: string; children?: React.ReactNode; over?: boolean; active?: boolean; root?: boolean }) { return <div className={cn("inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-b-[4px] px-4 py-2 text-sm font-bold shadow-sm", root ? "border-zinc-950 border-b-black bg-zinc-800 text-white" : "border-zinc-200 bg-white text-zinc-800", over && "border-blue-500 bg-blue-50 text-zinc-900", active && "scale-105 shadow-xl")}>{children ?? text}</div>; }

function nextHierarchyNodeName(rows: string[][]) { let number = rows.length + 1; let name = `New node ${number}`; while (rows.some((row) => row[0] === name)) { number += 1; name = `New node ${number}`; } return name; }

function hierarchyWouldCycle(rows: string[][], movingIndex: number, parentIndex: number | null, parents?: Record<number, string | null>) { if (parentIndex === null) return false; const movingName = rows[movingIndex]?.[0]; let current: number | undefined = parentIndex; const seen = new Set<number>(); while (current !== undefined && !seen.has(current)) { if (current === movingIndex) return true; seen.add(current); const parentName = parents ? parents[current] : rows[current]?.[1]; if (!parentName) return false; current = rows.findIndex((row) => row[0] === parentName); if (current < 0) return false; } return rows[parentIndex]?.[0] === movingName; }

function EditableVennDiagram({ block, rows, updateContent }: { block: Block; rows: string[][]; updateContent: (patch: Partial<Block["content"]>) => void }) {
  const visualVariant = block.settings.dragVisualVariant ?? "default";
  const showImage = visualVariant !== "default";
  const showText = visualVariant !== "image";
  const regions = vennRegions(block);
  const updateRow = (rowIndex: number, cellIndex: number, value: string) => updateContent({ rows: rows.map((row, index) => index === rowIndex ? row.map((cell, current) => current === cellIndex ? value : cell) : row) });
  return (
    <div className={cn(hasText(block.content.question) || hasText(block.content.text) ? "mt-4" : "mt-0")}>
      <div className="flex min-h-11 flex-wrap gap-3">
        {rows.map((row, index) => (
          <div key={index} className="w-36 rounded-xl border-2 border-b-[4px] border-zinc-200 bg-white p-2 text-center shadow-sm">
            {showImage && <EditableTimelineImage row={row} onChangeCell={(cell, value) => updateRow(index, cell, value)} onChangeImage={(src, alt) => updateContent({ rows: rows.map((item, itemIndex) => itemIndex === index ? [item[0], item[1], src, alt, item[4] ?? "100"] : item) })} />}
            {showText && <EditableText value={row[0]} onChange={(value) => updateRow(index, 0, value)} className={cn("text-[13px] font-bold", showImage && "mt-2")} placeholder="Draggable item" multiline />}
          </div>
        ))}
      </div>
      <VennSurface block={block} regions={regions} renderRegion={() => null} />
    </div>
  );
}

function EditableTimelineOrder({ block, theme, rows, updateContent }: { block: Block; theme: ThemeTokens; rows: string[][]; updateContent: (patch: Partial<Block["content"]>) => void }) {
  const wrapped = rows.length > 3;
  const [ids, setIds] = React.useState(() => rows.map(() => uid("editor-timeline")));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }));
  return (
    <div className="mt-5">
      <DndContext sensors={sensors} onDragEnd={(event) => { const from = ids.indexOf(String(event.active.id)); const to = ids.indexOf(String(event.over?.id ?? "")); if (from >= 0 && to >= 0 && from !== to) { setIds((current) => arrayMove(current, from, to)); updateContent({ rows: arrayMove(rows, from, to) }); } }}>
        <SortableContext items={ids} strategy={wrapped ? rectSortingStrategy : horizontalListSortingStrategy}>
          <div className={cn("relative rounded-xl border-2 border-zinc-200 bg-zinc-50 px-6 py-6", wrapped ? "overflow-visible" : "overflow-x-auto")}>
            <div className={cn("relative z-10", wrapped && "min-w-0 sm:min-w-[540px]")}>
              {!wrapped && <span className="absolute left-20 right-20 top-1/2 h-1 -translate-y-1/2 bg-zinc-200" />}
              <div className={wrapped ? "timeline-snake-grid" : "flex min-w-max gap-4"}>
                {wrapped && <TimelineConnectorLayer count={rows.length} />}
                {rows.map((row, index) => <EditableTimelineCard key={ids[index]} id={ids[index]} row={row} index={index} wrapped={wrapped} block={block} onChangeCell={(cellIndex, value) => updateContent({ rows: rows.map((item, itemIndex) => itemIndex === index ? item.map((cell, currentCellIndex) => currentCellIndex === cellIndex ? value : cell) : item) })} onChangeImage={(src, alt) => updateContent({ rows: rows.map((item, itemIndex) => itemIndex === index ? [item[0], item[1], src, alt, item[4]] : item) })} />)}
              </div>
            </div>
          </div>
        </SortableContext>
      </DndContext>
      <QuizButtonPreview block={block} theme={theme} label="Check Order" />
    </div>
  );
}

function EditableTimelineCard({ id, row, index, wrapped, block, onChangeCell, onChangeImage }: { id: string; row: string[]; index: number; wrapped: boolean; block: Block; onChangeCell: (cellIndex: number, value: string) => void; onChangeImage: (src: string, alt: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const visualVariant = block.settings.dragVisualVariant ?? "default";
  const showImage = visualVariant !== "default";
  const showText = visualVariant !== "image";
  return (
    <div ref={setNodeRef} className={cn(wrapped && timelineGridItemClass())} style={{ ...(wrapped ? timelineGridItemStyle(index) : undefined), transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}>
      <div className={cn("relative flex shrink-0 items-center justify-center rounded-xl border-2 border-b-[5px] border-zinc-200 border-b-zinc-300 bg-white text-center shadow-sm", showImage ? "flex-col p-2 pt-6" : "px-5 py-6", wrapped ? "w-full" : "w-40")}>
        <span className="absolute left-1/2 top-0 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-blue-600 text-xs font-black text-white">{index + 1}</span>
        <button className="absolute right-2 top-2 grid h-7 w-7 cursor-grab touch-none place-items-center rounded-lg text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 active:cursor-grabbing" type="button" aria-label={`Reorder event ${index + 1}`} {...listeners} {...attributes}><GripVertical size={14} /></button>
        {showImage && <EditableTimelineImage row={row} onChangeCell={onChangeCell} onChangeImage={onChangeImage} />}
        {showText && <EditableText value={row[0]} onChange={(value) => onChangeCell(0, value)} className={cn("text-[14px] font-bold leading-snug text-zinc-800", showImage && "mt-3")} style={partTextStyle(block, "choice")} placeholder="Timeline event" multiline />}
        {(showTimelineDates(block) || block.settings.answerTimelineDates) && <EditableText value={row[1]} onChange={(value) => onChangeCell(1, value)} className="absolute bottom-0 left-1/2 min-w-16 -translate-x-1/2 translate-y-1/2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-black text-blue-700 shadow-sm" placeholder="Date" />}
      </div>
    </div>
  );
}

function EditableTimelineImage({ row, onChangeCell, onChangeImage }: { row: string[]; onChangeCell: (cellIndex: number, value: string) => void; onChangeImage: (src: string, alt: string) => void }) {
  const inputId = useId();
  const frameRef = React.useRef<HTMLDivElement>(null);
  const [liveWidth, setLiveWidth] = React.useState(Math.max(25, Math.min(100, Number(row[4]) || 100)));
  function loadImage(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    if (!canStoreImageFile(file)) { showImageStorageLimitAlert(); return; }
    const reader = new FileReader();
    reader.onload = () => onChangeImage(String(reader.result), file.name);
    reader.readAsDataURL(file);
  }
  function startResize(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault(); event.stopPropagation();
    const startX = event.clientX; const startWidth = liveWidth; const frameWidth = Math.max(1, frameRef.current?.clientWidth ?? 1); let latest = startWidth;
    const move = (moveEvent: PointerEvent) => { latest = Math.max(25, Math.min(100, Math.round(startWidth + ((moveEvent.clientX - startX) / frameWidth) * 100))); setLiveWidth(latest); };
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); window.removeEventListener("pointercancel", stop); onChangeCell(4, String(latest)); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", stop, { once: true }); window.addEventListener("pointercancel", stop, { once: true });
  }
  return (
    <div ref={frameRef} className="relative w-full">
      <input id={inputId} className="sr-only" type="file" accept="image/*" onChange={(event) => loadImage(event.target.files?.[0])} />
      <div className="relative mx-auto" style={{ width: `${liveWidth}%` }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); event.stopPropagation(); loadImage(event.dataTransfer.files[0]); }}>
        {row[2] ? <label className="block cursor-pointer overflow-hidden rounded-lg bg-zinc-100" htmlFor={inputId}><img className="aspect-[4/3] w-full object-cover" src={row[2]} alt={row[3] || row[0] || "Timeline event"} draggable={false} /></label> : <label className="grid aspect-[4/3] cursor-pointer place-items-center rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-2 text-[10px] font-bold text-blue-600" htmlFor={inputId}><span><Image className="mx-auto mb-1" size={18} />Add image</span></label>}
        <button className="absolute -bottom-1 -right-1 h-4 w-4 cursor-nwse-resize rounded-md border-2 border-white bg-blue-600 shadow" onPointerDown={startResize} type="button" title="Resize image" />
      </div>
    </div>
  );
}

function StudentDragDrop({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const resetKey = `${block.settings.dragVariant ?? "sort"}-${JSON.stringify(block.content.rows ?? [])}-${block.content.answerText ?? ""}`;
  if (block.settings.dragVariant === "venn") return <StudentVennDrag key={resetKey} block={block} theme={theme} />;
  if (block.settings.dragVariant === "buckets") return <StudentBucketDrag key={resetKey} block={block} theme={theme} />;
  if (block.settings.dragVariant === "hierarchy") return <StudentHierarchyBuilder key={resetKey} block={block} theme={theme} />;
  if (block.settings.dragVariant === "pairs") return <StudentDragPairs key={resetKey} block={block} theme={theme} />;
  if (block.settings.dragVariant === "diagram") return <StudentDragDiagram key={resetKey} block={block} theme={theme} />;
  if (block.settings.dragVariant === "blanks") return <StudentDragBlanks key={resetKey} block={block} theme={theme} />;
  return <StudentSortDrag key={resetKey} block={block} theme={theme} />;
}

function StudentSortDrag({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const rows = normalizeDragRows(block);
  const isTimeline = block.settings.dragVariant === "timeline";
  const wrappedTimeline = isTimeline && rows.length > 3;
  const correctOrder = rows.map((_row, index) => String(index));
  const [items, setItems] = useStudentBlockState<string[]>(block.id, "drag.items", () => shuffleIds(correctOrder));
  const [timelineDateAnswers, setTimelineDateAnswers] = useStudentBlockState<Record<string, string>>(block.id, "drag.timelineDates", {});
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = useStudentBlockState(block.id, "drag.submitted", false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );
  const answerTimelineDates = isTimeline && block.settings.answerTimelineDates === true;
  const datesComplete = !answerTimelineDates || rows.every((_row, index) => timelineDateAnswers[String(index)]?.trim());
  const datesCorrect = !answerTimelineDates || rows.every((row, index) => normalizeAnswer(timelineDateAnswers[String(index)] ?? "") === normalizeAnswer(row[1] ?? ""));
  const correct = items.length === correctOrder.length && items.every((id, index) => id === correctOrder[index]) && datesCorrect;
  const activeRow = activeId ? rows[Number(activeId)] : undefined;
  function updateTimelineDate(id: string, value: string) {
    setTimelineDateAnswers((current) => ({ ...current, [id]: value }));
    setSubmitted(false);
  }

  return (
    <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {hasText(block.content.question) && <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />}
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
        <SortableContext items={items} strategy={wrappedTimeline ? rectSortingStrategy : isTimeline ? horizontalListSortingStrategy : verticalListSortingStrategy}>
          <div className={cn("mt-5", isTimeline && "relative rounded-xl border-2 border-zinc-200 bg-zinc-50 px-6 py-6", isTimeline && (wrappedTimeline ? "overflow-visible" : "overflow-x-auto"))}>
            <div className={cn(isTimeline ? wrappedTimeline ? "timeline-snake-grid relative z-10" : "relative z-10 flex min-w-max gap-4" : "space-y-3")}>
              {isTimeline && wrappedTimeline && <TimelineConnectorLayer count={items.length} />}
              {isTimeline && !wrappedTimeline && <span className="absolute left-20 right-20 top-1/2 h-1 -translate-y-1/2 bg-zinc-200" />}
              {items.map((id, index) => {
                const row = rows[Number(id)] ?? [""];
                const itemCorrect = submitted && id === correctOrder[index];
                const itemWrong = submitted && id !== correctOrder[index];
                return isTimeline
                  ? <SortableTimelineCard key={id} id={id} text={row[0]} year={row[1] ?? ""} dateAnswer={timelineDateAnswers[id] ?? ""} answerDates={answerTimelineDates} onDateAnswer={(value) => updateTimelineDate(id, value)} imageSrc={row[2]} imageAlt={row[3]} imageWidth={Number(row[4]) || 100} index={index} wrapped={wrappedTimeline} block={block} submitted={submitted} correct={itemCorrect && (!answerTimelineDates || normalizeAnswer(timelineDateAnswers[id] ?? "") === normalizeAnswer(row[1] ?? ""))} wrong={submitted && (!itemCorrect || (answerTimelineDates && normalizeAnswer(timelineDateAnswers[id] ?? "") !== normalizeAnswer(row[1] ?? "")))} />
                  : <SortableDragSortCard key={id} id={id} text={row[0]} index={index} block={block} theme={theme} submitted={submitted} correct={itemCorrect} wrong={itemWrong} />;
              })}
            </div>
          </div>
        </SortableContext>
        <DragOverlay adjustScale={false} dropAnimation={isTimeline ? null : undefined}>
          {activeRow ? (isTimeline ? <TimelineCardShell text={activeRow[0]} imageSrc={activeRow[2]} imageAlt={activeRow[3]} imageWidth={Number(activeRow[4]) || 100} index={Math.max(0, items.indexOf(activeId ?? ""))} block={block} active /> : <DragCardShell text={activeRow[0]} index={Math.max(0, items.indexOf(activeId ?? ""))} block={block} theme={theme} active />) : null}
        </DragOverlay>
      </DndContext>
      <DragCheckControls block={block} theme={theme} submitted={submitted} correct={correct} checkLabel={dragCheckLabel(block)} disabled={!datesComplete} onSubmit={() => setSubmitted(true)} onRetry={() => setSubmitted(false)} />
    </section>
  );
}

function SortableDragSortCard({ id, text, index, block, theme, submitted, correct, wrong }: { id: string; text: string; index: number; block: Block; theme: ThemeTokens; submitted: boolean; correct: boolean; wrong: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: submitted });
  return (
    <div
      ref={setNodeRef}
      className="touch-none"
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
  const [matches, setMatches] = useStudentBlockState<Record<number, string>>(block.id, "drag.matches", {});
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [activeAnswer, setActiveAnswer] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = useStudentBlockState(block.id, "drag.submitted", false);
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
      {hasText(block.content.question) && <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />}
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
      className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-40")}
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
  const [placements, setPlacements] = useStudentBlockState<Record<number, number>>(block.id, "drag.placements", {});
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [submitted, setSubmitted] = useStudentBlockState(block.id, "drag.submitted", false);
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
    <section className={block.settings.dragVariant === "buckets" ? classifyShellClass(block) : quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {hasText(block.content.question) && <div className="flex items-start gap-3"><Shapes className="mt-0.5 shrink-0 text-blue-600" size={20} /><MathText block text={block.content.question} className="text-[17px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} /></div>}
      {hasText(block.content.text) && <MathText text={block.content.text} className="mt-3 text-[13px] font-semibold text-zinc-400" />}
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
        <div className="relative mx-auto mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50" style={{ width: `${block.content.diagramImageWidthPercent ?? 100}%`, height: `${block.content.diagramImageHeight ?? 320}px` }}>
          {block.content.src ? <img src={block.content.src} alt="" className="h-full w-full object-contain" draggable={false} /> : <div className="grid h-full place-items-center text-sm font-bold text-zinc-400">Diagram image not added</div>}
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
        <div className={cn(hasText(block.content.question) || hasText(block.content.text) ? "mt-4" : "mt-0", "flex flex-wrap gap-3")}>
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
    <button ref={setNodeRef} className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-40")} style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined} onClick={onTap} type="button" {...listeners} {...attributes}>
      <DragBucketChip text={text} block={block} theme={theme} selected={selected} />
    </button>
  );
}

function StudentDragBlanks({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const blankCount = countBlanksForBlock(block);
  const correctAnswers = parseAnswerList(block.content.answerText);
  const [answers, setAnswers] = useStudentBlockState<string[]>(block.id, "drag.answers", []);
  const [activeWord, setActiveWord] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = useStudentBlockState(block.id, "drag.submitted", false);
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
      {hasText(block.content.question) && <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />}
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
    <button ref={setNodeRef} className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-40")} style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined} type="button" {...listeners} {...attributes}>
      <DragBucketChip text={text} block={block} theme={theme} />
    </button>
  );
}

function StudentVennDrag({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const rows = normalizeDragRows(block);
  const regions = vennRegions(block);
  const [locations, setLocations] = useStudentBlockState<Record<number, string | null>>(block.id, "drag.locations", {});
  const [selected, setSelected] = React.useState<number | null>(null);
  const [dragZoom, setDragZoom] = React.useState(1);
  const [submitted, setSubmitted] = useStudentBlockState(block.id, "drag.submitted", false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }));
  const surfaceRef = React.useRef<HTMLDivElement | null>(null);
  const allPlaced = rows.length > 0 && rows.every((_row, index) => !!locations[index]);
  const correct = allPlaced && rows.every((row, index) => normalizeAnswer(locations[index] ?? "") === normalizeAnswer(row[1]));
  const placeItem = (index: number, region: string | null) => { setLocations((current) => ({ ...current, [index]: region })); setSelected(null); setSubmitted(false); };
  return (
    <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {hasText(block.content.question) && <div className="flex items-start gap-3"><Shapes className="mt-0.5 shrink-0 text-blue-600" size={20} /><MathText block text={block.content.question} className="text-[17px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} /></div>}
      {hasText(block.content.text) && <MathText text={block.content.text} className="mt-3 text-[13px] font-semibold text-zinc-400" />}
      <DndContext sensors={sensors} onDragStart={(event) => setDragZoom(hierarchyDragZoom(event.activatorEvent))} onDragEnd={(event) => { const index = Number(String(event.active.id).replace("venn-item-", "")); const translated = event.active.rect.current.translated; const surface = surfaceRef.current?.getBoundingClientRect(); const region = translated && surface ? vennRegionFromPoint(block, translated.left + translated.width / 2, translated.top + translated.height / 2, surface) : null; if (!Number.isNaN(index) && region) placeItem(index, region); setDragZoom(1); }} onDragCancel={() => setDragZoom(1)}>
        <div className="mt-4 flex min-h-11 flex-wrap content-start gap-3">
          {rows.map((row, index) => locations[index] ? null : <DraggableVennItem key={index} index={index} row={row} block={block} dragZoom={dragZoom} selected={selected === index} submitted={submitted} onTap={() => setSelected(selected === index ? null : index)} />)}
        </div>
        <DroppableVennSurface block={block} regions={regions} surfaceRef={(node) => { surfaceRef.current = node; }} renderRegion={(region) => (
          <VennDropRegion key={region.label} region={region} active={selected !== null} onTap={() => selected !== null && placeItem(selected, region.label)}>
            {rows.map((row, index) => locations[index] === region.label ? <DraggableVennItem key={index} index={index} row={row} block={block} dragZoom={dragZoom} selected={selected === index} submitted={submitted} correct={submitted && normalizeAnswer(row[1]) === normalizeAnswer(region.label)} wrong={submitted && normalizeAnswer(row[1]) !== normalizeAnswer(region.label)} onTap={() => submitted ? undefined : placeItem(index, null)} /> : null)}
          </VennDropRegion>
        )} />
      </DndContext>
      <DragCheckControls block={block} theme={theme} submitted={submitted} correct={correct} checkLabel="Check Diagram" disabled={!allPlaced} onSubmit={() => setSubmitted(true)} onRetry={() => setSubmitted(false)} />
    </section>
  );
}

function EditorVennPresentation({ block, updateBlock, commitBlockUpdate }: { block: Block; updateBlock: (block: Block) => void; commitBlockUpdate: (block: Block) => void }) {
  const surfaceRef = React.useRef<HTMLDivElement | null>(null);
  const items = block.content.vennItems ?? [];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );

  function updateItems(nextItems: VennDiagramItem[]) {
    updateBlock({ ...block, content: { ...block.content, vennItems: nextItems } });
  }

  function addItem() {
    const number = items.length + 1;
    updateItems([...items, { id: uid("venn-item"), text: number === 1 ? "New item" : `New item ${number}`, x: 9, y: 14 }]);
  }

  function moveItem(event: DragEndEvent) {
    const itemIndex = items.findIndex((item) => item.id === String(event.active.id));
    const surface = surfaceRef.current?.getBoundingClientRect();
    if (itemIndex < 0 || !surface) return;
    const nextItems = items.map((current, index) => index === itemIndex ? {
      ...current,
      x: clampVennItemPosition(current.x + (event.delta.x / surface.width) * 100),
      y: clampVennItemPosition(current.y + (event.delta.y / surface.height) * 100),
    } : current);
    commitBlockUpdate({ ...block, content: { ...block.content, vennItems: nextItems } });
  }

  return (
    <section className={cn(shellClass(block.style.shell), "py-0")} style={blockSurfaceStyle(block)}>
      <DndContext sensors={sensors} onDragEnd={moveItem}>
        <VennSurface block={block} regions={[]} renderRegion={() => null} surfaceRef={(node) => { surfaceRef.current = node; }} className="mt-0" presentation>
          {!block.locked && (
            <button type="button" className="absolute left-3 top-3 z-40 grid h-9 w-9 place-items-center rounded-xl border-2 border-b-[4px] border-zinc-200 bg-white text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50" onClick={(event) => { event.stopPropagation(); addItem(); }} aria-label="Add Venn diagram item" title="Add item">
              <Plus size={17} strokeWidth={3} />
            </button>
          )}
          {items.map((item) => (
            <PositionedVennItem
              key={item.id}
              block={block}
              item={item}
              editable={!block.locked}
              onChange={(text) => updateItems(items.map((current) => current.id === item.id ? { ...current, text } : current))}
              onDelete={() => updateItems(items.filter((current) => current.id !== item.id))}
            />
          ))}
        </VennSurface>
      </DndContext>
    </section>
  );
}

function StudentVennPresentation({ block }: { block: Block }) {
  return (
    <section className={cn(shellClass(block.style.shell), "py-0")} style={blockSurfaceStyle(block)}>
      <VennSurface block={block} regions={[]} renderRegion={() => null} className="mt-0" presentation>
        {(block.content.vennItems ?? []).map((item) => <PositionedVennItem key={item.id} block={block} item={item} />)}
      </VennSurface>
    </section>
  );
}

function PositionedVennItem({ block, item, editable, onChange, onDelete }: { block: Block; item: VennDiagramItem; editable?: boolean; onChange?: (text: string) => void; onDelete?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id, disabled: !editable });
  const dragTransform = transform ? ` translate3d(${transform.x}px, ${transform.y}px, 0)` : "";
  return (
    <div
      ref={setNodeRef}
      className={cn("absolute z-30 -translate-x-1/2 -translate-y-1/2", editable && "cursor-grab touch-none active:cursor-grabbing", isDragging && "z-50 opacity-80")}
      style={{ left: `${clampVennItemPosition(item.x)}%`, top: `${clampVennItemPosition(item.y)}%`, transform: `translate(-50%, -50%)${dragTransform}` }}
      {...(editable ? attributes : {})}
      {...(editable ? listeners : {})}
    >
      <div className="relative min-w-20 max-w-36 rounded-xl border-2 border-b-[4px] border-zinc-200 bg-white px-3 py-2 text-center text-[12px] font-bold text-zinc-800 shadow-sm" style={partTextStyle(block, "body")}>
        {editable ? <EditableText value={item.text} onChange={(value) => onChange?.(value)} className="min-w-14" placeholder="Item label" /> : <MathText text={item.text} />}
        {editable && (
          <button type="button" className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full border border-red-200 bg-white text-red-500 shadow-sm hover:bg-red-50" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onDelete?.(); }} aria-label={`Delete ${item.text || "Venn item"}`} title="Delete item">
            <X size={11} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
}

function clampVennItemPosition(value: number) {
  return Math.max(5, Math.min(95, Number.isFinite(value) ? value : 50));
}

type VennRegion = { label: string; x: number; y: number; width: number; height: number };

function VennSurface({ block, regions, renderRegion, surfaceRef, className, children, presentation }: { block: Block; regions: VennRegion[]; renderRegion: (region: VennRegion) => React.ReactNode; surfaceRef?: (node: HTMLDivElement | null) => void; className?: string; children?: React.ReactNode; presentation?: boolean }) {
  const three = block.settings.vennCircleCount === "three";
  const labels = vennCircleLabels(block);
  return (
    <div ref={surfaceRef} className={cn("relative mx-auto mt-5 w-full max-w-[760px] overflow-hidden", presentation ? cn(three ? "aspect-[8/7]" : "aspect-[3/2]", "bg-transparent") : "aspect-[4/3] rounded-2xl border-2 border-zinc-200 bg-zinc-50/70 sm:h-[460px] sm:aspect-auto", className)}>
      <span className={cn("absolute aspect-square rounded-full border-[3px] border-red-400 bg-red-100/50", presentation ? (three ? "left-[5%] top-[1%] w-[54%]" : "left-0 top-[2%] w-[62%]") : (three ? "left-[7%] top-[2%] w-[54%]" : "left-[2%] top-[7%] w-[58%]"))} />
      <span className={cn("absolute aspect-square rounded-full border-[3px] border-blue-400 bg-blue-100/50", presentation ? (three ? "right-[5%] top-[1%] w-[54%]" : "right-0 top-[2%] w-[62%]") : (three ? "right-[7%] top-[2%] w-[54%]" : "right-[2%] top-[7%] w-[58%]"))} />
      {three && <span className={cn("absolute left-1/2 aspect-square -translate-x-1/2 rounded-full border-[3px] border-amber-400 bg-amber-100/50", presentation ? "bottom-[1%] w-[54%]" : "bottom-[2%] w-[54%]")} />}
      <span className={cn("absolute z-20 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-red-600 shadow-sm", presentation ? (three ? "left-[32%] top-0" : "left-[29%] top-0") : (three ? "left-[27%] top-[1%]" : "left-[31%] top-[4%]"))}>{labels[0]}</span>
      <span className={cn("absolute z-20 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-blue-600 shadow-sm", presentation ? (three ? "left-[68%] top-0" : "left-[71%] top-0") : (three ? "left-[73%] top-[1%]" : "left-[69%] top-[4%]"))}>{labels[1]}</span>
      {three && <span className={cn("absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-amber-600 shadow-sm", presentation ? "bottom-0" : "bottom-[1%]")}>{labels[2]}</span>}
      {regions.map((region) => <React.Fragment key={region.label}>{renderRegion(region)}</React.Fragment>)}
      {children}
    </div>
  );
}

function DroppableVennSurface({ block, regions, renderRegion, surfaceRef }: { block: Block; regions: VennRegion[]; renderRegion: (region: VennRegion) => React.ReactNode; surfaceRef: (node: HTMLDivElement | null) => void }) {
  const { setNodeRef } = useDroppable({ id: "venn-surface" });
  return <VennSurface block={block} regions={regions} renderRegion={renderRegion} surfaceRef={(node) => { setNodeRef(node); surfaceRef(node); }} />;
}

function VennDropRegion({ region, active, children, onTap }: { region: VennRegion; active: boolean; children: React.ReactNode; onTap: () => void }) {
  return <button type="button" onClick={onTap} aria-label={`Place item in ${region.label}`} className={cn("absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-xl border-2 border-transparent bg-transparent p-2 text-[10px] font-black transition", active && "bg-white/10")} style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.width}%`, height: `${region.height}%` }}>{children}</button>;
}

function DraggableVennItem({ index, row, block, dragZoom, selected, submitted, correct, wrong, onTap }: { index: number; row: string[]; block: Block; dragZoom: number; selected: boolean; submitted: boolean; correct?: boolean; wrong?: boolean; onTap: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `venn-item-${index}`, disabled: submitted });
  const scale = Number.isFinite(dragZoom) && dragZoom > 0 ? dragZoom : 1;
  return <button ref={setNodeRef} className={cn("relative cursor-grab touch-none active:cursor-grabbing", isDragging && "z-50")} style={transform ? { transform: `translate3d(${transform.x / scale}px, ${transform.y / scale}px, 0)` } : undefined} type="button" onClick={onTap} {...listeners} {...attributes}><VennItemChip row={row} block={block} selected={selected} correct={correct} wrong={wrong} active={isDragging} /></button>;
}

function VennItemChip({ row, block, selected, correct, wrong, active }: { row: string[]; block: Block; selected?: boolean; correct?: boolean; wrong?: boolean; active?: boolean }) {
  const visual = block.settings.dragVisualVariant ?? "default";
  const showImage = visual !== "default";
  const showText = visual !== "image";
  return <span className={cn("inline-flex max-w-32 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-b-[4px] border-zinc-200 bg-white p-2 text-[12px] font-bold shadow-sm", selected && "border-blue-500 bg-blue-50", correct && "border-green-500 bg-green-50", wrong && "border-red-500 bg-red-50", active && "scale-105 shadow-xl")}>
    {showImage && (row[2] ? <img src={row[2]} alt={row[3] || row[0] || "Venn item"} className="aspect-[4/3] w-full rounded-md object-cover" draggable={false} /> : <span className="grid aspect-[4/3] w-20 place-items-center rounded-md bg-zinc-100 text-zinc-400"><Image size={18} /></span>)}
    {showText && <MathText text={row[0]} className={cn(showImage && "mt-1")} />}
  </span>;
}

function StudentBucketDrag({ block, theme }: { block: Block; theme: ThemeTokens }) {
  const rows = normalizeDragRows(block);
  const buckets = parseDragBuckets(block);
  const [locations, setLocations] = useStudentBlockState<Record<number, string | null>>(block.id, "drag.locations", {});
  const [selected, setSelected] = React.useState<number | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = useStudentBlockState(block.id, "drag.submitted", false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );
  const activeIndex = activeId?.startsWith("drag-item-") ? Number(activeId.replace("drag-item-", "")) : null;
  const allPlaced = rows.length > 0 && rows.every((_row, index) => locations[index]);
  const correct = allPlaced && rows.every((row, index) => normalizeAnswer(locations[index] ?? "") === normalizeAnswer(row[1]));

  function placeItem(index: number, bucket: string | null) {
    setLocations((current) => ({ ...current, [index]: bucket }));
    setSelected(null);
    setSubmitted(false);
  }

  function chooseBucket(bucket: string) {
    if (selected !== null) placeItem(selected, bucket);
  }

  return (
    <section className={block.settings.dragVariant === "buckets" ? classifyShellClass(block) : quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {hasText(block.content.question) && <div className="flex items-start gap-3"><Shapes className="mt-0.5 shrink-0 text-blue-600" size={20} /><MathText block text={block.content.question} className="text-[17px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} /></div>}
      {hasText(block.content.text) && <MathText text={block.content.text} className="mt-3 text-[13px] font-semibold text-zinc-400" />}
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
        <div className={cn(hasText(block.content.question) || hasText(block.content.text) ? "mt-4" : "mt-0", "flex min-h-11 flex-wrap content-start gap-3")}>
          {rows.map((row, index) => locations[index] ? null : (
            <DraggableBucketCard key={index} id={`drag-item-${index}`} text={row[0]} block={block} theme={theme} selected={selected === index} submitted={submitted} onTap={() => setSelected(selected === index ? null : index)} />
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
        <DragOverlay adjustScale={false} dropAnimation={null}>
          {activeIndex !== null && rows[activeIndex] ? <DragBucketChip text={rows[activeIndex][0]} block={block} theme={theme} active /> : null}
        </DragOverlay>
      </DndContext>
      <DragCheckControls block={block} theme={theme} submitted={submitted} correct={correct} checkLabel="Check Categories" disabled={!allPlaced} onSubmit={() => setSubmitted(true)} onRetry={() => setSubmitted(false)} />
    </section>
  );
}

function DragCardShell({ text, index, block, theme, submitted, correct, wrong, active }: { text: string; index: number; block: Block; theme: ThemeTokens; submitted?: boolean; correct?: boolean; wrong?: boolean; active?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border-2 border-b-[4px] bg-white px-5 py-4 text-left text-[15px] font-bold shadow-sm transition",
        submitted ? "" : "cursor-grab touch-none active:cursor-grabbing hover:border-zinc-300",
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
      className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-40")}
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
      className={cn("min-h-[168px] overflow-hidden rounded-xl border-2 border-b-[4px] bg-white text-left transition", (active || isOver) && "scale-[1.01] shadow-sm")}
      style={{ borderColor: isOver || active ? theme.primary : classifyColor(index).border, background: isOver ? theme.bgLight : "#ffffff" }}
      onClick={onTap}
      role="button"
      tabIndex={0}
    >
      <span className="flex h-11 items-center justify-center px-3 text-[13px] font-black uppercase tracking-[0.08em]" style={{ color: classifyColor(index).text, background: classifyColor(index).header }}>{bucket}</span>
      <span className="flex min-h-28 flex-wrap content-start gap-2 p-3">{children}</span>
    </div>
  );
}

function DragCheckControls({ block, theme, submitted, correct, checkLabel, disabled, onSubmit, onRetry }: { block: Block; theme: ThemeTokens; submitted: boolean; correct: boolean; checkLabel: string; disabled?: boolean; onSubmit: () => void; onRetry: () => void }) {
  if (!submitted) {
    return (
      <button disabled={disabled} className={cn("lesson-action-button mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40", block.settings.quizButtonWidth === "full" && "w-full")} style={lessonButtonStyle(theme, 3, block)} onClick={onSubmit}>
        {checkLabel === "Check Categories" ? <Shapes size={17} /> : checkLabel === "Check Order" ? <CheckCheck size={18} /> : <Check size={17} />}
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

function normalizeDragRows(block: Block) {
  const rows = block.content.rows?.length ? block.content.rows : block.settings.dragVariant === "buckets" ? [["Item", "Bucket A"]] : [["First item"], ["Second item"]];
  if (block.settings.dragVariant === "venn") return rows.map((row) => [row[0] ?? "", row[1] ?? "Only A", row[2] ?? "", row[3] ?? "", row[4] ?? "100"]);
  if (block.settings.dragVariant === "buckets") return rows.map((row) => [row[0] ?? "", row[1] ?? "Bucket A"]);
  if (block.settings.dragVariant === "pairs" || block.settings.dragVariant === "hierarchy") return rows.map((row) => [row[0] ?? "", row[1] ?? ""]);
  if (block.settings.dragVariant === "diagram") return rows.map((row) => [row[0] ?? "", row[1] ?? "50", row[2] ?? "50"]);
  if (block.settings.dragVariant === "timeline") return rows.map((row) => [row[0] ?? "", row[1] ?? "", row[2] ?? "", row[3] ?? "", row[4] ?? "100"]);
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
  if (block.settings.dragVariant === "timeline") return "Check Order";
  if (block.settings.dragVariant === "equation") return "Check expression";
  if (block.settings.dragVariant === "longText") return "Check sequence";
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
      {variant !== "fillBlank" && variant !== "matching" && hasText(block.content.question) && (
        <EditableText value={block.content.question} onChange={(question) => updateContent({ question })} className="text-[17px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} multiline />
      )}
      {variant === "fillBlank" && <EditableFillBlank block={block} updateContent={updateContent} />}
      {variant === "dropdown" && <EditableDropdownQuiz block={block} theme={theme} updateContent={updateContent} />}
      {variant === "enumeration" && <EditableEnumerationQuiz block={block} theme={theme} updateContent={updateContent} />}
      {variant === "shortAnswer" && <EditableShortAnswer block={block} theme={theme} updateContent={updateContent} />}
      {variant === "multipleChoice" && <><EditableChoiceGrid block={block} theme={theme} updateContent={updateContent} embossed={isEmbossed} /><QuizButtonPreview block={block} theme={theme} label="Check answer" /></>}
      {variant === "multiSelect" && <EditableMultiSelect block={block} theme={theme} updateContent={updateContent} embossed={isEmbossed} />}
      {variant === "trueFalse" && <EditableTrueFalse />}
      {variant === "matching" && <EditableMatching block={block} theme={theme} updateContent={updateContent} />}
    </section>
  );
}

function EditableChoiceGrid({ block, theme, updateContent, embossed }: { block: Block; theme: ThemeTokens; updateContent: (patch: Partial<Block["content"]>) => void; embossed: boolean }) {
  const visualVariant = block.settings.quizChoiceVariant ?? "text";
  const showImage = visualVariant !== "text";
  const showText = visualVariant !== "image";
  const showMarker = block.settings.showChoiceMarkers !== false;
  const updateChoice = (choiceId: string, patch: Partial<NonNullable<Block["content"]["choices"]>[number]>) =>
    updateContent({ choices: (block.content.choices ?? []).map((item) => (item.id === choiceId ? { ...item, ...patch } : item)) });

  return (
    <div className={cn("mt-5 grid gap-3", choiceColumnsClass(block))}>
      {(block.content.choices ?? []).map((choice, index) => (
        <div key={choice.id} className={cn(choiceCardClass(embossed, false), showImage && "relative flex-col items-stretch")}>
          {showMarker && <ChoiceMarker index={index} selected={false} type={block.settings.quizMarker ?? "letters"} theme={theme} />}
          {showImage && <EditableQuizChoiceImage choice={choice} hasMarker={showMarker} onChange={(patch) => updateChoice(choice.id, patch)} />}
          {showText && <EditableText
            value={choice.text}
            onChange={(text) => updateChoice(choice.id, { text })}
            className={cn("flex-1 text-[15px] font-bold text-zinc-800", showImage && "w-full text-center")}
            style={partTextStyle(block, "choice")}
          />}
        </div>
      ))}
    </div>
  );
}

function vennRegions(block: Block): VennRegion[] {
  if (block.settings.vennCircleCount === "three") {
    return [
      { label: "Only A", x: 18, y: 27, width: 36, height: 46 },
      { label: "A + B", x: 50, y: 18, width: 28, height: 30 },
      { label: "Only B", x: 82, y: 27, width: 36, height: 46 },
      { label: "A + C", x: 30, y: 61, width: 30, height: 34 },
      { label: "All three", x: 50, y: 49, width: 20, height: 26 },
      { label: "B + C", x: 70, y: 61, width: 30, height: 34 },
      { label: "Only C", x: 50, y: 86, width: 40, height: 28 },
    ];
  }
  return [{ label: "Only A", x: 20, y: 52, width: 40, height: 90 }, { label: "Both", x: 50, y: 52, width: 20, height: 90 }, { label: "Only B", x: 80, y: 52, width: 40, height: 90 }];
}

function vennCircleLabels(block: Block) {
  const labels = (block.content.vennLabels ?? "Group A, Group B, Group C").split(",").map((label) => label.trim()).filter(Boolean);
  return [labels[0] || "Group A", labels[1] || "Group B", labels[2] || "Group C"];
}

function vennRegionFromPoint(block: Block, clientX: number, clientY: number, rect: DOMRect) {
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const three = block.settings.vennCircleCount === "three";
  const diameter = rect.width * (three ? 0.54 : 0.58);
  const radius = diameter / 2;
  const inside = (centerX: number, centerY: number) => ((x - centerX) ** 2) + ((y - centerY) ** 2) <= radius ** 2;
  const inA = inside(rect.width * (three ? 0.34 : 0.31), rect.height * (three ? 0.02 : 0.07) + radius);
  const inB = inside(rect.width * (three ? 0.66 : 0.69), rect.height * (three ? 0.02 : 0.07) + radius);
  if (!three) {
    if (inA && inB) return "Both";
    if (inA) return "Only A";
    if (inB) return "Only B";
    return null;
  }
  const inC = inside(rect.width * 0.5, rect.height * 0.98 - radius);
  if (inA && inB && inC) return "All three";
  if (inA && inB) return "A + B";
  if (inA && inC) return "A + C";
  if (inB && inC) return "B + C";
  if (inA) return "Only A";
  if (inB) return "Only B";
  if (inC) return "Only C";
  return null;
}

function SortableTimelineCard({
  id,
  text,
  year,
  dateAnswer,
  answerDates,
  onDateAnswer,
  imageSrc,
  imageAlt,
  imageWidth,
  index,
  wrapped,
  block,
  submitted,
  correct,
  wrong,
}: {
  id: string;
  text: string;
  year: string;
  dateAnswer: string;
  answerDates: boolean;
  onDateAnswer: (value: string) => void;
  imageSrc?: string;
  imageAlt?: string;
  imageWidth: number;
  index: number;
  wrapped: boolean;
  block: Block;
  submitted: boolean;
  correct: boolean;
  wrong: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: submitted });
  return (
    <div ref={setNodeRef} className={cn("relative touch-none", wrapped && timelineGridItemClass())} style={wrapped ? timelineGridItemStyle(index) : undefined} {...attributes} {...listeners}>
      <div style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }}><TimelineCardShell text={text} year={year} dateAnswer={dateAnswer} answerDates={answerDates} onDateAnswer={onDateAnswer} imageSrc={imageSrc} imageAlt={imageAlt} imageWidth={imageWidth} index={index} block={block} submitted={submitted} correct={correct} wrong={wrong} expanded={wrapped} /></div>
    </div>
  );
}

function TimelineCardShell({ text, year, dateAnswer, answerDates, onDateAnswer, imageSrc, imageAlt, imageWidth = 100, index, block, submitted, correct, wrong, active, expanded }: { text: string; year?: string; dateAnswer?: string; answerDates?: boolean; onDateAnswer?: (value: string) => void; imageSrc?: string; imageAlt?: string; imageWidth?: number; index: number; block: Block; submitted?: boolean; correct?: boolean; wrong?: boolean; active?: boolean; expanded?: boolean }) {
  const visualVariant = block.settings.dragVisualVariant ?? "default";
  const showImage = visualVariant !== "default";
  const showText = visualVariant !== "image";
  return (
    <div className={cn("relative flex shrink-0 cursor-grab touch-none items-center justify-center rounded-xl border-2 border-b-[5px] border-zinc-200 border-b-zinc-300 bg-white text-center shadow-sm transition active:cursor-grabbing", showImage ? "flex-col p-2 pt-6" : "px-5 py-6", (answerDates || showTimelineDates(block)) && "pb-8", expanded ? "w-full" : "w-40", correct && "border-green-500 border-b-green-700 bg-green-50", wrong && "border-red-400 border-b-red-600 bg-red-50", active && "scale-[1.03] shadow-xl")}>
      <span className={cn("absolute left-1/2 top-0 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-blue-600 text-xs font-black text-white", correct && "bg-green-600", wrong && "bg-red-500")}>{submitted ? (correct ? <Check size={13} /> : wrong ? <X size={13} /> : index + 1) : index + 1}</span>
      {showImage && <div className="mx-auto w-full" style={{ maxWidth: `${Math.max(25, Math.min(100, imageWidth))}%` }}>{imageSrc ? <img className="aspect-[4/3] w-full rounded-lg object-cover" src={imageSrc} alt={imageAlt || text || "Timeline event"} draggable={false} /> : <div className="grid aspect-[4/3] place-items-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 text-[10px] font-bold text-zinc-400"><span><Image className="mx-auto mb-1" size={18} />Image</span></div>}</div>}
      {showText && <MathText text={text} className={cn("text-[14px] font-bold leading-snug text-zinc-800", showImage && "mt-3")} style={partTextStyle(block, "choice")} />}
      {answerDates ? (
        <input
          className="absolute bottom-0 left-1/2 z-20 h-8 min-w-20 -translate-x-1/2 translate-y-1/2 rounded-full border border-blue-200 bg-blue-50 px-3 text-center text-xs font-black text-blue-700 shadow-sm outline-none placeholder:text-blue-300 focus:border-blue-500 focus:bg-white"
          value={dateAnswer ?? ""}
          placeholder="Date"
          disabled={submitted && !block.settings.retry}
          onChange={(event) => onDateAnswer?.(event.target.value)}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        />
      ) : showTimelineDates(block) && year ? (
        <span className="absolute bottom-0 left-1/2 z-20 min-w-16 -translate-x-1/2 translate-y-1/2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-center text-sm font-black text-blue-700 shadow-sm">{year}</span>
      ) : null}
    </div>
  );
}

function showTimelineDates(block: Block) {
  return block.settings.showTimelineYears ?? false;
}

function timelineGridItemClass() {
  return "timeline-snake-item";
}

function TimelineConnectorLayer({ count }: { count: number }) {
  return (
    <>
      <TimelineConnectorSegments count={count} columns={2} mode="mobile" />
      <TimelineConnectorSegments count={count} columns={3} mode="desktop" />
    </>
  );
}

function TimelineConnectorSegments({ count, columns, mode }: { count: number; columns: 2 | 3; mode: "mobile" | "desktop" }) {
  const rows = Math.max(1, Math.ceil(count / columns));
  return (
    <>
      {Array.from({ length: Math.max(0, count - 1) }, (_value, index) => {
        const current = timelineGridPosition(index, columns);
        const next = timelineGridPosition(index + 1, columns);
        const style = timelineConnectorSegmentStyle(current, next, rows, columns);
        const horizontal = current.row === next.row;
        return <span key={`timeline-${mode}-${index}`} className={cn("timeline-route-segment", `timeline-route-${mode}`, horizontal ? "timeline-route-segment-horizontal" : "timeline-route-segment-vertical")} style={style} aria-hidden="true" />;
      })}
    </>
  );
}

function timelineConnectorSegmentStyle(current: { row: number; column: number }, next: { row: number; column: number }, rows: number, columns: number): React.CSSProperties {
  const x1 = ((current.column + 0.5) / columns) * 100;
  const y1 = ((current.row + 0.5) / rows) * 100;
  const x2 = ((next.column + 0.5) / columns) * 100;
  const y2 = ((next.row + 0.5) / rows) * 100;
  if (current.row === next.row) {
    return {
      left: `${Math.min(x1, x2)}%`,
      top: `${y1}%`,
      width: `${Math.abs(x2 - x1)}%`,
    };
  }
  return {
    left: `${x1}%`,
    top: `${Math.min(y1, y2)}%`,
    height: `${Math.abs(y2 - y1)}%`,
  };
}

function timelineGridItemStyle(index: number): React.CSSProperties {
  const mobile = timelineGridPosition(index, 2);
  const desktop = timelineGridPosition(index, 3);
  return {
    "--timeline-mobile-row": mobile.row + 1,
    "--timeline-mobile-col": mobile.column + 1,
    "--timeline-desktop-row": desktop.row + 1,
    "--timeline-desktop-col": desktop.column + 1,
  } as React.CSSProperties;
}

function timelineGridPosition(index: number, columns: 2 | 3) {
  const row = Math.floor(index / columns);
  const logicalColumn = index % columns;
  return { row, column: row % 2 === 0 ? logicalColumn : columns - 1 - logicalColumn };
}

function EditableQuizChoiceImage({ choice, hasMarker, onChange }: { choice: NonNullable<Block["content"]["choices"]>[number]; hasMarker: boolean; onChange: (patch: Partial<NonNullable<Block["content"]["choices"]>[number]>) => void }) {
  const inputId = useId();
  const frameRef = React.useRef<HTMLDivElement>(null);
  const [liveWidth, setLiveWidth] = React.useState(choice.imageWidthPercent ?? 100);

  function loadImage(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    if (!canStoreImageFile(file)) {
      showImageStorageLimitAlert();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange({ imageSrc: String(reader.result), imageAlt: file.name, imageWidthPercent: choice.imageWidthPercent ?? 100 });
    reader.readAsDataURL(file);
  }

  function startResize(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = liveWidth;
    const frameWidth = Math.max(1, frameRef.current?.clientWidth ?? 1);
    let latestWidth = startWidth;
    const resize = (moveEvent: PointerEvent) => {
      latestWidth = Math.max(25, Math.min(100, Math.round(startWidth + ((moveEvent.clientX - startX) / frameWidth) * 100)));
      setLiveWidth(latestWidth);
    };
    const stopResize = () => {
      window.removeEventListener("pointermove", resize);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
      if (latestWidth !== (choice.imageWidthPercent ?? 100)) onChange({ imageWidthPercent: latestWidth });
    };
    window.addEventListener("pointermove", resize);
    window.addEventListener("pointerup", stopResize, { once: true });
    window.addEventListener("pointercancel", stopResize, { once: true });
  }

  return (
    <div ref={frameRef} className={cn("relative w-full", hasMarker && "pt-8")}>
      <input id={inputId} className="sr-only" type="file" accept="image/*" onChange={(event) => loadImage(event.target.files?.[0])} />
      <div className="relative mx-auto" style={{ width: `${liveWidth}%` }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); event.stopPropagation(); loadImage(event.dataTransfer.files[0]); }}>
        {choice.imageSrc ? (
          <label className="block cursor-pointer overflow-hidden rounded-xl bg-zinc-100" htmlFor={inputId} title="Replace image">
            <img className="block h-auto w-full" src={choice.imageSrc} alt={choice.imageAlt || choice.text || "Answer choice"} draggable={false} />
          </label>
        ) : (
          <label className="grid min-h-32 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 text-center text-xs font-bold text-blue-600" htmlFor={inputId}>
            <span><Image className="mx-auto mb-2" size={24} />Choose or drop image</span>
          </label>
        )}
        <button className="absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-white bg-blue-600 shadow" onPointerDown={startResize} type="button" title="Resize image" />
      </div>
    </div>
  );
}

function EditableMultiSelect({ block, theme, updateContent, embossed }: { block: Block; theme: ThemeTokens; updateContent: (patch: Partial<Block["content"]>) => void; embossed: boolean }) {
  return (
    <div className={cn(hasText(block.content.question) && "mt-5", "space-y-3")}>
      {hasText(block.content.text) && <EditableText value={block.content.text} onChange={(text) => updateContent({ text })} className="text-[13px] font-medium text-zinc-500" placeholder="Select all that apply" />}
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

function EditableEnumerationQuiz({ block, theme, updateContent }: { block: Block; theme: ThemeTokens; updateContent: (patch: Partial<Block["content"]>) => void }) {
  const items = block.content.enumerationItems?.length ? block.content.enumerationItems : createDefaultEnumerationQuizItems();
  const updateItems = (enumerationItems: EnumerationQuizItem[]) => updateContent({ enumerationItems });
  const updateItem = (itemId: string, acceptedText: string) => updateItems(items.map((item) => item.id === itemId ? { ...item, accepted: parseAnswerList(acceptedText) } : item));

  return (
    <div className="mt-5 space-y-3">
      {items.map((item, index) => (
        <div key={item.id} className="grid gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-100 text-xs font-black text-zinc-500">{index + 1}</span>
          <EditableText
            value={item.accepted.join(", ")}
            onChange={(value) => updateItem(item.id, value)}
            className="min-h-11 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] font-bold text-zinc-800 shadow-sm"
            placeholder="Main answer, accepted alternate"
          />
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={items.length <= 1}
            onClick={() => updateItems(items.filter((candidate) => candidate.id !== item.id))}
            title="Remove answer"
            type="button"
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <button className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100" onClick={() => updateItems([...items, createEnumerationQuizItem([`Answer ${items.length + 1}`])])} type="button">
        <Plus size={16} />
        Add answer
      </button>
      <QuizButtonPreview block={block} theme={theme} label="Check Answers" />
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
  function addPair() {
    const nextIndex = rows.length + 1;
    const nextRows = [...rows, [`Term ${nextIndex}`, `Match ${nextIndex}`]];
    updateContent({ rows: nextRows, choices: ensureMatchingAnswerChoices(answerOptions, nextRows) });
  }

  if (block.settings.editMatchingAnswerKey) {
    return <EditableMatchingAnswerKey block={block} rows={rows} answers={answerOptions} updateContent={updateContent} />;
  }

  return (
    <>
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
      <button
        type="button"
        aria-label="Add matching pair"
        title="Add matching pair"
        onClick={addPair}
        className="mt-3 grid h-8 w-8 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:border-zinc-300 hover:text-zinc-900"
      >
        <Plus size={16} />
      </button>
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
              addAnnotation(block, updateBlock, { id: uid("image-annotation"), type: "text", x: point.x, y: point.y, text, color: annotationColor, fontSize: 18 });
              return;
            }
            if (tool === "arrow") {
              setDraft({ id: uid("image-annotation"), type: "arrow", start: point, end: point, color: annotationColor, strokeWidth: annotationWidth });
              return;
            }
            setDraft({ id: uid("image-annotation"), type: "pen", points: [point], color: annotationColor, strokeWidth: annotationWidth });
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
  const [matches, setMatches] = useStudentBlockState<Record<number, string>>(block.id, "quiz.matches", {});
  const [selectedLeft, setSelectedLeft] = React.useState<number | null>(null);
  const [selectedRight, setSelectedRight] = React.useState<string | null>(null);
  const [pressedMatchCard, setPressedMatchCard] = React.useState<string | null>(null);
  const [matchResetKey, setMatchResetKey] = React.useState(0);
  const [submitted, setSubmitted] = useStudentBlockState(block.id, "quiz.submitted", false);
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
                <MathText text={answer} />
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
  const [selected, setSelected] = useStudentBlockState<string | null>(block.id, "quiz.selected", null);
  const [multiSelected, setMultiSelected] = useStudentBlockState<string[]>(block.id, "quiz.multiSelected", []);
  const [answer, setAnswer] = useStudentBlockState(block.id, "quiz.answer", "");
  const [blankAnswers, setBlankAnswers] = useStudentBlockState<string[]>(block.id, "quiz.blankAnswers", []);
  const [dropdownAnswers, setDropdownAnswers] = useStudentBlockState<Record<string, string>>(block.id, "quiz.dropdownAnswers", {});
  const [enumerationAnswers, setEnumerationAnswers] = useStudentBlockState<string[]>(block.id, "quiz.enumerationAnswers", []);
  const [submitted, setSubmitted] = useStudentBlockState(block.id, "quiz.submitted", false);
  const [activeBlankWord, setActiveBlankWord] = React.useState<string | null>(null);
  const fillBlankSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
  );
  const variant = block.settings.quizVariant ?? "multipleChoice";
  const correct =
    variant === "dropdown"
      ? dropdownAnswersAreCorrect(block.content.dropdownQuizItems ?? [], dropdownAnswers)
      : variant === "multiSelect"
        ? sameStringSet(multiSelected, parseCorrectIds(block))
        : variant === "fillBlank"
          ? sameOrderedAnswers(blankAnswers, parseAnswerList(block.content.answerText))
          : variant === "enumeration"
            ? enumerationAnswersAreCorrect(block.content.enumerationItems ?? [], enumerationAnswers, { caseSensitive: block.settings.enumerationCaseSensitive, spaceSensitive: block.settings.enumerationSpaceSensitive })
            : variant === "shortAnswer"
              ? normalizeAnswer(answer) === normalizeAnswer(block.content.answerText)
              : selected === block.content.correctChoiceId;
  const actionButtonStyle = lessonButtonStyle(theme, 3, block);
  const embossed = block.settings.quizLayout === "embossed" || block.style.shell === "embossed";
  const submitAnswer = React.useCallback(() => {
    setSubmitted(true);
    onAnswer?.();
  }, [onAnswer, setSubmitted]);

  if (variant === "matching") {
    return <StudentMatching block={block} theme={theme} onAnswer={onAnswer} />;
  }

  if (variant === "dropdown") {
    return <StudentDropdownQuiz block={block} theme={theme} answers={dropdownAnswers} submitted={submitted} onAnswersChange={setDropdownAnswers} onSubmittedChange={setSubmitted} onAnswer={onAnswer} />;
  }

  if (variant === "shortAnswer") {
    return (
      <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
        {hasText(block.content.question) && <MathText block text={block.content.question} className="text-[19px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />}
        <ShortAnswerControls block={block} answer={answer} submitted={submitted} theme={theme} onAnswer={setAnswer} onSubmit={submitAnswer} />
        {submitted && <QuizFeedback block={block} correct={correct} />}
      </section>
    );
  }

  if (variant === "enumeration") {
    const items = block.content.enumerationItems ?? [];
    return (
      <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
        {hasText(block.content.question) && <MathText block text={block.content.question} className="text-[19px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />}
        <div className="mt-5 space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-[auto_1fr] items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-100 text-xs font-black text-zinc-500">{index + 1}</span>
              <input
                className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-[15px] font-bold text-zinc-800 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:opacity-70"
                disabled={submitted && !block.settings.retry}
                value={enumerationAnswers[index] ?? ""}
                onChange={(event) => {
                  setEnumerationAnswers((current) => replaceAt(current, index, event.target.value));
                  setSubmitted(false);
                }}
                placeholder={`Answer ${index + 1}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-5">
          <button disabled={!allEnumerationAnswersFilled(items, enumerationAnswers)} className={cn("lesson-action-button rounded-full px-8 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40", block.settings.quizButtonWidth === "full" && "w-full")} style={actionButtonStyle} onClick={submitAnswer}>
            Check Answers
          </button>
        </div>
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
        {hasText(block.content.question) && <MathText block text={block.content.question} className="text-[17px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />}
        {hasText(block.content.text) && <MathText text={block.content.text} className="mt-5 text-[13px] font-medium text-zinc-500" />}
        <div className="mt-3 space-y-3">
          {(block.content.choices ?? []).map((choice) => {
            const isSelected = multiSelected.includes(choice.id);
            return (
              <button key={choice.id} className={cn(choiceCardClass(embossed, isSelected), !embossed && "student-quiz-choice-card--clean")} onClick={() => {
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
      {hasText(block.content.question) && <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />}
      <div className={cn("mt-5 grid gap-3", choiceColumnsClass(block))}>
        {(block.content.choices ?? []).map((choice) => {
          const visualVariant = block.settings.quizChoiceVariant ?? "text";
          const showImage = visualVariant !== "text";
          const showText = visualVariant !== "image";
          const showMarker = block.settings.showChoiceMarkers !== false;
          const isSelected = selected === choice.id;
          const isCorrectChoice = submitted && choice.id === block.content.correctChoiceId;
          const isWrongSelected = submitted && isSelected && !isCorrectChoice;
          return (
            <button
              key={choice.id}
              className={cn(choiceCardClass(embossed, isSelected), !embossed && "student-quiz-choice-card--clean", showImage && "flex-col items-stretch", isCorrectChoice && "border-green-500 bg-green-50 text-green-800", isWrongSelected && "border-red-500 bg-red-50 text-red-800")}
              style={partTextStyle(block, "choice")}
              onClick={() => {
                if (!submitted || block.settings.retry) {
                  setSelected(choice.id);
                  setSubmitted(false);
                }
              }}
            >
              {showMarker && <ChoiceMarker index={Number(choice.id.charCodeAt(0) - 97) || 0} selected={isSelected || isCorrectChoice} type={block.settings.quizMarker ?? "letters"} theme={theme} />}
              {showImage && <QuizChoiceImage choice={choice} />}
              {showText && <MathText text={choice.text} className={cn("flex-1", showImage && "w-full text-center")} />}
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

function EditableDropdownQuiz({ block, theme, updateContent }: { block: Block; theme: ThemeTokens; updateContent: (patch: Partial<Block["content"]>) => void }) {
  const items = block.content.dropdownQuizItems ?? [];
  const answers = Object.fromEntries(items.flatMap((item) => item.blanks.map((blank) => [blank.id, blank.correctOptionId])));
  const setAnswerKey = (blankId: string, correctOptionId: string) => updateContent({
    dropdownQuizItems: items.map((item) => ({
      ...item,
      blanks: item.blanks.map((blank) => blank.id === blankId ? { ...blank, correctOptionId } : blank),
    })),
  });
  const updateStatementPart = (itemIndex: number, partIndex: number, partText: string) => {
    const item = items[itemIndex];
    if (!item) return;
    const parts = item.text.split("___");
    parts[partIndex] = partText;
    const previousBlank = item.blanks[partIndex - 1]
      ?? items.slice(0, itemIndex).flatMap((candidate) => candidate.blanks).at(-1);
    const nextItem = syncDropdownQuizItem(item, parts.join("___"), previousBlank?.options, partIndex, previousBlank);
    updateContent({ dropdownQuizItems: items.map((candidate, index) => index === itemIndex ? nextItem : candidate) });
  };
  return (
    <div className={cn("space-y-3", hasText(block.content.question) && "mt-5")}>
      {items.map((item, itemIndex) => (
        <DropdownQuizStatement key={item.id} block={block} item={item} itemIndex={itemIndex} theme={theme} answers={answers} onChoose={setAnswerKey} onTextPartChange={(partIndex, text) => updateStatementPart(itemIndex, partIndex, text)} />
      ))}
      <QuizButtonPreview block={block} theme={theme} label="Check Answers" />
    </div>
  );
}

function StudentDropdownQuiz({
  block,
  theme,
  answers,
  submitted,
  onAnswersChange,
  onSubmittedChange,
  onAnswer,
}: {
  block: Block;
  theme: ThemeTokens;
  answers: Record<string, string>;
  submitted: boolean;
  onAnswersChange: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmittedChange: React.Dispatch<React.SetStateAction<boolean>>;
  onAnswer?: () => void;
}) {
  const items = block.content.dropdownQuizItems ?? [];
  const correct = dropdownAnswersAreCorrect(items, answers);
  const canSubmit = allDropdownsAnswered(items, answers);
  const locked = submitted && !block.settings.retry;

  function choose(blankId: string, optionId: string) {
    if (locked) return;
    onAnswersChange((current) => ({ ...current, [blankId]: optionId }));
    if (submitted) onSubmittedChange(false);
  }

  function submit() {
    if (!canSubmit) return;
    onSubmittedChange(true);
    onAnswer?.();
  }

  return (
    <section className={quizShellClass(block)} style={blockSurfaceStyle(block)}>
      {hasText(block.content.question) && <MathText block text={block.content.question} className="text-[18px] font-bold leading-snug text-zinc-950" style={partTextStyle(block, "question")} />}
      <div className={cn("space-y-3", hasText(block.content.question) && "mt-5")}>
        {items.map((item, itemIndex) => (
          <DropdownQuizStatement
            key={item.id}
            block={block}
            item={item}
            itemIndex={itemIndex}
            theme={theme}
            answers={answers}
            submitted={submitted}
            locked={locked}
            onChoose={choose}
          />
        ))}
      </div>
      {(!submitted || block.settings.retry) && (
        <button
          disabled={!canSubmit}
          className={cn("lesson-action-button mt-5 inline-flex items-center justify-center rounded-xl px-8 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40", block.settings.quizButtonWidth === "full" && "w-full")}
          style={lessonButtonStyle(theme, 3, block)}
          onClick={submit}
        >
          <Check size={17} className="mr-2" />
          {submitted ? "Check Again" : "Check Answers"}
        </button>
      )}
      {submitted && <QuizFeedback block={block} correct={correct} />}
    </section>
  );
}

function DropdownQuizStatement({
  block,
  item,
  itemIndex,
  theme,
  answers = {},
  submitted = false,
  locked = false,
  onChoose,
  onTextPartChange,
}: {
  block: Block;
  item: DropdownQuizItem;
  itemIndex: number;
  theme: ThemeTokens;
  answers?: Record<string, string>;
  submitted?: boolean;
  locked?: boolean;
  onChoose?: (blankId: string, optionId: string) => void;
  onTextPartChange?: (partIndex: number, text: string) => void;
}) {
  const parts = item.text.split("___");
  return (
    <div className="dropdown-quiz-statement flex items-start gap-2 py-1">
      <span className="mt-0.5 shrink-0 text-[16px] font-bold leading-10 text-zinc-500">{itemIndex + 1}.</span>
      <div className="min-w-0 flex-1 text-[17px] font-medium leading-10 text-zinc-700" style={partTextStyle(block, "choice")}>
        {parts.map((part, partIndex) => {
          const blank = item.blanks[partIndex];
          return (
            <React.Fragment key={`${item.id}-${partIndex}`}>
              {onTextPartChange ? (
                <EditableDropdownQuizTextPart
                  key={`${item.id}-${partIndex}-${part}`}
                  value={part}
                  placeholder={parts.length === 1 && partIndex === 0 ? "Type a statement and add ___ for a dropdown." : undefined}
                  onCommit={(text) => onTextPartChange(partIndex, text)}
                />
              ) : <MathText text={part} />}
              {partIndex < parts.length - 1 && blank && (
                <DropdownQuizControl
                  blank={blank}
                  itemIndex={itemIndex}
                  blankIndex={partIndex}
                  theme={theme}
                  value={answers[blank.id]}
                  submitted={submitted}
                  locked={locked}
                  revealAnswer={block.settings.revealAnswer === true}
                  onValueChange={(optionId) => onChoose?.(blank.id, optionId)}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function EditableDropdownQuizTextPart({ value, placeholder, onCommit }: { value: string; placeholder?: string; onCommit: (value: string) => void }) {
  const [draft, setDraft] = React.useState(value);

  return (
    <EditableText
      value={draft}
      onChange={setDraft}
      onBlur={onCommit}
      className="dropdown-quiz-editable-part inline min-w-[1ch] px-0.5"
      placeholder={placeholder}
      multiline
    />
  );
}

function DropdownQuizControl({ blank, itemIndex, blankIndex, theme, value, submitted, locked, revealAnswer, onValueChange }: { blank: DropdownQuizBlank; itemIndex: number; blankIndex: number; theme: ThemeTokens; value?: string; submitted: boolean; locked: boolean; revealAnswer: boolean; onValueChange: (optionId: string) => void }) {
  const correct = submitted && value === blank.correctOptionId;
  const wrong = submitted && Boolean(value) && !correct;
  const correctLabel = blank.options.find((option) => option.id === blank.correctOptionId)?.text ?? "";
  const controlStyle = { "--dropdown-accent": theme.primary, "--dropdown-accent-light": theme.bgLight } as React.CSSProperties;

  return (
    <>
      <span className="inline-flex max-w-full align-middle">
        <DropdownSelect.Root
          value={value}
          disabled={locked}
          onValueChange={onValueChange}
        >
          <DropdownSelect.Trigger
            aria-label={`Statement ${itemIndex + 1}, dropdown ${blankIndex + 1}`}
            className={cn("dropdown-quiz-trigger relative mx-1 inline-flex min-h-9 min-w-24 max-w-full items-center justify-center rounded-lg bg-white px-7 align-middle text-center text-[13px] font-semibold leading-5 text-zinc-700 outline-none", correct && "is-correct", wrong && "is-wrong")}
            style={controlStyle}
          >
            <DropdownSelect.Value placeholder="Select" />
            <DropdownSelect.Icon className="absolute right-2 shrink-0 text-zinc-400"><ChevronDown size={14} /></DropdownSelect.Icon>
          </DropdownSelect.Trigger>
          <DropdownSelect.Portal>
            <DropdownSelect.Content className="dropdown-quiz-menu z-[220] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl bg-white shadow-xl" position="popper" sideOffset={6} collisionPadding={12} style={controlStyle}>
              <DropdownSelect.Viewport>
                {blank.options.map((option) => (
                  <DropdownSelect.Item key={option.id} value={option.id} className="dropdown-quiz-option relative flex min-h-11 cursor-pointer select-none items-center justify-center px-4 py-2 text-center text-[15px] font-medium text-zinc-700 outline-none data-[highlighted]:bg-[var(--dropdown-accent-light)] data-[highlighted]:text-zinc-950">
                    <DropdownSelect.ItemText>{option.text || "Untitled option"}</DropdownSelect.ItemText>
                  </DropdownSelect.Item>
                ))}
              </DropdownSelect.Viewport>
            </DropdownSelect.Content>
          </DropdownSelect.Portal>
        </DropdownSelect.Root>
      </span>
      {wrong && revealAnswer && correctLabel && <span className="mr-1 inline-flex text-[12px] font-bold leading-5 text-green-700">Correct: {correctLabel}</span>}
    </>
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
      className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-40")}
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
    return cn(shellClass(block.style.shell ?? "embossed"), "space-y-4 rounded-2xl border-2 border-zinc-200 border-b-[4px] bg-white p-5 shadow-sm [&>*:first-child]:mt-0");
  }
  return cn(shellClass(block.style.shell), "py-5 [&>*:first-child]:mt-0");
}

function classifyShellClass(block: Block) {
  return cn(shellClass(block.style.shell), "py-5 [&>*:first-child]:mt-0");
}

function classifyColor(index: number) {
  return index % 2 === 0
    ? { border: "#f2aaaa", header: "#fff4f4", text: "#d9464f" }
    : { border: "#9fbaff", header: "#f1f5ff", text: "#527df0" };
}

function ClassifyZonePreview({ bucket, index }: { bucket: string; index: number }) {
  const color = classifyColor(index);
  return (
    <div className="min-h-[168px] overflow-hidden rounded-xl border-2 border-b-[4px] bg-white" style={{ borderColor: color.border }}>
      <div className="flex h-11 items-center justify-center px-3 text-[13px] font-black uppercase tracking-[0.08em]" style={{ background: color.header, color: color.text }}>{bucket}</div>
    </div>
  );
}

function QuizChoiceImage({ choice }: { choice: NonNullable<Block["content"]["choices"]>[number] }) {
  return (
    <div className="mx-auto w-full pt-2" style={{ maxWidth: `${choice.imageWidthPercent ?? 100}%` }}>
      {choice.imageSrc ? (
        <img className="block h-auto w-full rounded-xl bg-zinc-100" src={choice.imageSrc} alt={choice.imageAlt || choice.text || "Answer choice"} draggable={false} />
      ) : (
        <div className="grid min-h-32 place-items-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-4 text-center text-xs font-bold text-zinc-400">
          <span><Image className="mx-auto mb-2" size={24} />Image not added</span>
        </div>
      )}
    </div>
  );
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
  const shadowColor = block?.type === "dragDrop" ? buttonColor : block?.style.shadowColor ?? defaultShadowColor;
  return {
    "--button-bg": buttonColor,
    "--button-shadow": shadowColor,
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

function horizontalAlignClass(block: Block) {
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
    flashcard: 360,
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
