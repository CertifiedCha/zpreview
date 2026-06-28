"use client";
import { Eraser, Maximize2, Pencil, Redo2, RotateCcw, Trash2, Undo2, X } from "lucide-react";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStudentBlockState } from "../studentRuntime";
import type { Block } from "../types";
import { appendWhiteboardStroke, canRedoWhiteboard, canUndoWhiteboard, clearWhiteboard, countWhiteboardPoints, createWhiteboardState, extendWhiteboardArea, reconcileWhiteboardState, redoWhiteboard, simplifyWhiteboardPoints, undoWhiteboard, WHITEBOARD_POINT_BUDGET, type WhiteboardPoint, type WhiteboardPreset, type WhiteboardState, type WhiteboardStroke } from "../whiteboardState";
import { cn } from "../theme";

type WhiteboardTool = "ink" | "eraser";

const PRESETS: Record<WhiteboardPreset, { name: string; medium: string; colors: string[]; sizes: number[] }> = {
  whiteboard: { name: "Whiteboard", medium: "Marker", colors: ["#172033", "#dc2626", "#2563eb", "#15803d"], sizes: [3, 6, 10] },
  blackboard: { name: "Blackboard", medium: "Chalk", colors: ["#f8fafc", "#fde047", "#7dd3fc", "#f9a8d4"], sizes: [4, 8, 13] },
  greenboard: { name: "Greenboard", medium: "Chalk", colors: ["#f8fafc", "#fde047", "#93c5fd", "#f9a8d4"], sizes: [4, 8, 13] },
  paperPencil: { name: "Paper", medium: "Pencil", colors: ["#374151", "#6b7280", "#111827"], sizes: [2, 4, 7] },
  paperPen: { name: "Paper", medium: "Pen", colors: ["#111827", "#1d4ed8", "#dc2626", "#15803d"], sizes: [2, 4, 7] },
};

export function EditorWhiteboardBlock({ block }: { block: Block }) {
  const preset = getPreset(block);
  if (block.settings.whiteboardVariant === "popup") return <WhiteboardTrigger block={block} editor />;
  return <div className={cn("whiteboard-shell whiteboard-editor", heightClass(block))}><WhiteboardToolbarPreview block={block} /><BoardSurface preset={preset} /></div>;
}

export function StudentWhiteboardBlock({ block }: { block: Block }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  if (block.settings.whiteboardVariant !== "popup") return <WhiteboardWorkspace key={getPreset(block)} block={block} className={heightClass(block)} />;
  return <>
    <WhiteboardTrigger block={block} onClick={() => setOpen(true)} />
    {open && createPortal(
      <div className={cn("whiteboard-overlay", block.settings.whiteboardPopupMode === "fullscreen" && "is-fullscreen")} role="dialog" aria-modal="true" aria-label={`${PRESETS[getPreset(block)].name} scratch board`}>
        <div className="whiteboard-dialog">
          <div className="whiteboard-dialog-titlebar">
            <div><strong>{PRESETS[getPreset(block)].name}</strong><span>Student scratch space</span></div>
            <button autoFocus type="button" onClick={() => setOpen(false)} aria-label="Close scratch board"><X size={20} /></button>
          </div>
          <WhiteboardWorkspace key={getPreset(block)} block={block} className="whiteboard-popup-workspace" />
        </div>
      </div>, document.body,
    )}
  </>;
}

function WhiteboardWorkspace({ block, className }: { block: Block; className?: string }) {
  const preset = getPreset(block);
  const presetInfo = PRESETS[preset];
  const initial = createWhiteboardState(preset);
  const [storedState, setStoredState] = useStudentBlockState<WhiteboardState>(block.id, "whiteboard.drawing", initial);
  const state = reconcileWhiteboardState(storedState, preset);
  const [tool, setTool] = useState<WhiteboardTool>("ink");
  const [color, setColor] = useState(presetInfo.colors[0]);
  const [size, setSize] = useState(presetInfo.sizes[1]);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (storedState !== state) setStoredState(state);
  }, [state, setStoredState, storedState]);
  const effectiveTool = block.settings.whiteboardAllowEraser === false ? "ink" : tool;

  const update = (recipe: (current: WhiteboardState) => WhiteboardState) => setStoredState((current) => recipe(reconcileWhiteboardState(current, preset)));
  return <div className={cn("whiteboard-shell", className)}>
    <div className="whiteboard-toolbar" role="toolbar" aria-label={`${presetInfo.medium} tools`}>
      <button className={cn(effectiveTool === "ink" && "is-active")} type="button" onClick={() => setTool("ink")} aria-pressed={effectiveTool === "ink"}><Pencil size={17} /><span>{presetInfo.medium}</span></button>
      {block.settings.whiteboardAllowEraser !== false && <button className={cn(effectiveTool === "eraser" && "is-active")} type="button" onClick={() => setTool("eraser")} aria-pressed={effectiveTool === "eraser"}><Eraser size={17} /><span>Eraser</span></button>}
      {block.settings.whiteboardAllowColors !== false && <div className="whiteboard-color-group" aria-label="Writing color">{presetInfo.colors.map((item) => <button key={item} className={cn("whiteboard-color", color === item && "is-active")} type="button" style={{ backgroundColor: item }} onClick={() => { setColor(item); setTool("ink"); }} aria-label={`Use ${item} ${presetInfo.medium.toLowerCase()}`} aria-pressed={color === item} />)}</div>}
      {block.settings.whiteboardAllowSizes !== false && <div className="whiteboard-size-group" aria-label="Stroke size">{presetInfo.sizes.map((item, index) => <button key={item} className={cn("whiteboard-size", size === item && "is-active")} type="button" onClick={() => setSize(item)} aria-label={`Use ${["thin", "medium", "thick"][index]} stroke`} aria-pressed={size === item}><i style={{ width: item + 3, height: item + 3 }} /></button>)}</div>}
      <span className="whiteboard-toolbar-spacer" />
      {block.settings.whiteboardAllowUndoRedo !== false && <><button type="button" disabled={!canUndoWhiteboard(state)} onClick={() => update(undoWhiteboard)} aria-label="Undo"><Undo2 size={17} /></button><button type="button" disabled={!canRedoWhiteboard(state)} onClick={() => update(redoWhiteboard)} aria-label="Redo"><Redo2 size={17} /></button></>}
      {block.settings.whiteboardAllowClear !== false && <button type="button" disabled={!state.actions.length} onClick={() => update(clearWhiteboard)} aria-label="Clear board"><Trash2 size={17} /></button>}
    </div>
    <DrawingCanvas preset={preset} state={state} tool={effectiveTool} color={color} size={size} allowHistory={block.settings.whiteboardAllowUndoRedo !== false} onUndo={() => update(undoWhiteboard)} onRedo={() => update(redoWhiteboard)} onStroke={(stroke) => {
      if (countWhiteboardPoints(state) + stroke.points.length > WHITEBOARD_POINT_BUDGET) {
        setWarning("This scratch board has reached its drawing limit. Undo or clear work before adding more.");
        return;
      }
      setStoredState((currentValue) => {
        const current = reconcileWhiteboardState(currentValue, preset);
        const result = appendWhiteboardStroke(current, stroke);
        if (!result.accepted) return current;
        const reachesBottom = stroke.points.some((point) => point.y >= current.heightScale - 0.12);
        return block.settings.whiteboardUnlimitedArea && reachesBottom ? extendWhiteboardArea(result.state) : result.state;
      });
      setWarning("");
    }} />
    {warning && <p className="whiteboard-warning" role="status">{warning}</p>}
  </div>;
}

function DrawingCanvas({ preset, state, tool, color, size, allowHistory, onUndo, onRedo, onStroke }: { preset: WhiteboardPreset; state: WhiteboardState; tool: WhiteboardTool; color: string; size: number; allowHistory: boolean; onUndo: () => void; onRedo: () => void; onStroke: (stroke: WhiteboardStroke) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<WhiteboardStroke | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const onStrokeRef = useRef(onStroke);
  const [active, setActive] = useState<WhiteboardStroke | null>(null);

  useLayoutEffect(() => { onStrokeRef.current = onStroke; }, [onStroke]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const render = () => drawCanvas(canvas, preset, state.actions, active, state.heightScale);
    render();
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [active, preset, state.actions, state.heightScale]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): WhiteboardPoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width, y: ((event.clientY - rect.top) / rect.height) * state.heightScale, pressure: event.pointerType === "mouse" ? 0.5 : event.pressure || 0.5 };
  };
  const finishActiveStroke = useCallback((pointerId: number | null) => {
    const stroke = activeRef.current;
    if (!stroke || (pointerId !== null && pointerId !== activePointerIdRef.current)) return;
    const capturedPointerId = activePointerIdRef.current;
    const finished = { ...stroke, points: simplifyWhiteboardPoints(stroke.points) };
    activeRef.current = null;
    activePointerIdRef.current = null;
    const canvas = canvasRef.current;
    if (canvas && capturedPointerId !== null && canvas.hasPointerCapture(capturedPointerId)) canvas.releasePointerCapture(capturedPointerId);
    setActive(null);
    onStrokeRef.current(finished);
  }, []);

  useEffect(() => {
    const finishPointer = (event: PointerEvent) => finishActiveStroke(event.pointerId);
    const finishOnBlur = () => finishActiveStroke(null);
    window.addEventListener("pointerup", finishPointer, true);
    window.addEventListener("pointercancel", finishPointer, true);
    window.addEventListener("blur", finishOnBlur);
    return () => {
      window.removeEventListener("pointerup", finishPointer, true);
      window.removeEventListener("pointercancel", finishPointer, true);
      window.removeEventListener("blur", finishOnBlur);
    };
  }, [finishActiveStroke]);
  return <div ref={scrollRef} className="whiteboard-canvas-scroll">
  <canvas
    ref={canvasRef}
    className={`whiteboard-canvas whiteboard-surface--${preset}`}
    style={{ height: `${state.heightScale * 100}%` }}
    aria-label={`${PRESETS[preset].name} drawing area`}
    tabIndex={0}
    onKeyDown={(event) => {
      if (!allowHistory || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      if (event.shiftKey) onRedo(); else onUndo();
    }}
    onPointerDown={(event) => {
      if (event.button !== 0) return;
      if (activePointerIdRef.current !== null) return;
      event.currentTarget.focus();
      event.currentTarget.setPointerCapture(event.pointerId);
      activePointerIdRef.current = event.pointerId;
      const stroke: WhiteboardStroke = { id: `${Date.now()}-${event.pointerId}`, tool, color, size, points: [pointFromEvent(event)] };
      activeRef.current = stroke;
      setActive(stroke);
    }}
    onPointerMove={(event) => {
      const stroke = activeRef.current;
      if (!stroke || event.pointerId !== activePointerIdRef.current) return;
      const next = { ...stroke, points: [...stroke.points, pointFromEvent(event)] };
      activeRef.current = next;
      setActive(next);
    }}
    onPointerUp={(event) => finishActiveStroke(event.pointerId)}
    onPointerCancel={(event) => finishActiveStroke(event.pointerId)}
    onLostPointerCapture={(event) => finishActiveStroke(event.pointerId)}
  /></div>;
}

function drawCanvas(canvas: HTMLCanvasElement, preset: WhiteboardPreset, strokes: WhiteboardStroke[], active: WhiteboardStroke | null, heightScale: number) {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, width, height);
  context.save();
  context.scale(ratio, ratio);
  const baseAreaHeight = rect.height / Math.max(1, heightScale);
  [...strokes, ...(active ? [active] : [])].forEach((stroke) => drawStroke(context, stroke, rect.width, baseAreaHeight, preset));
  context.restore();
}

function drawStroke(context: CanvasRenderingContext2D, stroke: WhiteboardStroke, width: number, height: number, preset: WhiteboardPreset) {
  const points = stroke.points;
  if (!points.length) return;
  context.save();
  context.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
  context.strokeStyle = stroke.tool === "eraser" ? "rgba(0,0,0,1)" : stroke.color;
  context.fillStyle = context.strokeStyle;
  context.lineCap = "round";
  context.lineJoin = "round";
  if (stroke.tool === "eraser") {
    drawStrokePass(context, stroke, width, height, 0, 0, 3, 1, false);
  } else if (preset === "whiteboard") {
    drawStrokePass(context, stroke, width, height, 0, 0, 1.28, 0.16, false);
    drawStrokePass(context, stroke, width, height, 0, 0, 0.92, 0.94, false);
    drawStrokePass(context, stroke, width, height, -0.35, -0.25, 0.18, 0.28, false);
  } else if (preset === "paperPen") {
    drawStrokePass(context, stroke, width, height, 0, 0, 0.86, 0.98, true);
    drawStrokePass(context, stroke, width, height, 0.22, 0.16, 0.2, 0.22, true);
  } else if (preset === "paperPencil") {
    [[-0.55, 0.2], [0.45, -0.35], [0, 0]].forEach(([x, y], index) => drawStrokePass(context, stroke, width, height, x, y, index === 2 ? 0.62 : 0.42, index === 2 ? 0.48 : 0.2, true));
  } else {
    [-1.1, -0.55, 0, 0.55, 1.1].forEach((offset, index) => drawStrokePass(context, stroke, width, height, offset, ((index * 7) % 3 - 1) * 0.45, index === 2 ? 0.8 : 0.52, index === 2 ? 0.46 : 0.16, false));
    context.globalAlpha = 0.22;
    points.forEach((point, index) => {
      if (index % 2) return;
      const jitterX = ((index * 17) % 9 - 4) * 0.45;
      const jitterY = ((index * 11) % 7 - 3) * 0.45;
      context.beginPath();
      context.arc(point.x * width + jitterX, point.y * height + jitterY, Math.max(0.6, stroke.size * 0.11), 0, Math.PI * 2);
      context.fill();
    });
  }
  context.restore();
}

function drawStrokePass(context: CanvasRenderingContext2D, stroke: WhiteboardStroke, width: number, height: number, offsetX: number, offsetY: number, widthFactor: number, alpha: number, pressureSensitive: boolean) {
  const points = stroke.points;
  context.globalAlpha = alpha;
  if (points.length === 1) {
    context.beginPath();
    context.arc(points[0].x * width + offsetX, points[0].y * height + offsetY, Math.max(0.8, stroke.size * widthFactor / 2), 0, Math.PI * 2);
    context.fill();
    return;
  }
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const pressure = pressureSensitive ? 0.48 + (from.pressure + to.pressure) * 0.38 : 1;
    context.lineWidth = Math.max(0.7, stroke.size * widthFactor * pressure);
    context.beginPath();
    context.moveTo(from.x * width + offsetX, from.y * height + offsetY);
    context.lineTo(to.x * width + offsetX, to.y * height + offsetY);
    context.stroke();
  }
}

function WhiteboardTrigger({ block, editor, onClick }: { block: Block; editor?: boolean; onClick?: () => void }) {
  const preset = getPreset(block);
  const info = PRESETS[preset];
  const content = <><span className={`whiteboard-trigger-board whiteboard-surface--${preset}`}><i /><b /></span><span><strong>{info.name}</strong><small>Open scratch board</small></span><Maximize2 size={17} /></>;
  return editor ? <div className="whiteboard-trigger is-editor">{content}</div> : <button className="whiteboard-trigger" type="button" onClick={onClick} aria-label={`Open ${info.name.toLowerCase()} scratch board`}>{content}</button>;
}

function WhiteboardToolbarPreview({ block }: { block: Block }) {
  const info = PRESETS[getPreset(block)];
  return <div className="whiteboard-toolbar is-preview"><span><Pencil size={15} />{info.medium}</span>{block.settings.whiteboardAllowEraser !== false && <span><Eraser size={15} />Eraser</span>}{block.settings.whiteboardAllowColors !== false && <div className="whiteboard-color-group">{info.colors.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</div>}{block.settings.whiteboardAllowUndoRedo !== false && <span className="ml-auto"><RotateCcw size={15} />Undo</span>}</div>;
}

function BoardSurface({ preset }: { preset: WhiteboardPreset }) {
  return <div className={`whiteboard-editor-surface whiteboard-surface--${preset}`} aria-hidden="true" />;
}

function getPreset(block: Block): WhiteboardPreset { return block.settings.whiteboardPreset ?? "whiteboard"; }
function heightClass(block: Block) { return `whiteboard-height--${block.settings.whiteboardHeight ?? "medium"}`; }
