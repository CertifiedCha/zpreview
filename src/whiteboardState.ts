import type { BlockSettings } from "./types";

export type WhiteboardPreset = NonNullable<BlockSettings["whiteboardPreset"]>;
export type WhiteboardPoint = { x: number; y: number; pressure: number };
export type WhiteboardStroke = { id: string; tool: "ink" | "eraser"; color: string; size: number; points: WhiteboardPoint[] };
export type WhiteboardState = { version: 2; preset: WhiteboardPreset; actions: WhiteboardStroke[]; redo: WhiteboardStroke[]; heightScale: number; clearedActions?: WhiteboardStroke[]; redoClear?: boolean };

export const WHITEBOARD_POINT_BUDGET = 20_000;

export function createWhiteboardState(preset: WhiteboardPreset): WhiteboardState {
  return { version: 2, preset, actions: [], redo: [], heightScale: 1 };
}

export function reconcileWhiteboardState(value: unknown, preset: WhiteboardPreset): WhiteboardState {
  if (!value || typeof value !== "object") return createWhiteboardState(preset);
  const state = value as Partial<WhiteboardState>;
  if (state.version !== 2 || state.preset !== preset || !Array.isArray(state.actions) || !Array.isArray(state.redo)) return createWhiteboardState(preset);
  if (typeof state.heightScale === "number" && state.heightScale >= 1) return state as WhiteboardState;
  return { ...state, heightScale: 1 } as WhiteboardState;
}

export function countWhiteboardPoints(state: Pick<WhiteboardState, "actions">) {
  return state.actions.reduce((total, stroke) => total + stroke.points.length, 0);
}

export function appendWhiteboardStroke(state: WhiteboardState, stroke: WhiteboardStroke, budget = WHITEBOARD_POINT_BUDGET) {
  if (countWhiteboardPoints(state) + stroke.points.length > budget) return { state, accepted: false };
  return { state: { ...state, actions: [...state.actions, stroke], redo: [], clearedActions: undefined, redoClear: false }, accepted: true };
}

export function undoWhiteboard(state: WhiteboardState): WhiteboardState {
  const action = state.actions.at(-1);
  if (action) return { ...state, actions: state.actions.slice(0, -1), redo: [...state.redo, action], redoClear: false };
  if (state.clearedActions?.length) return { ...state, actions: state.clearedActions, clearedActions: undefined, redoClear: true };
  return state;
}

export function redoWhiteboard(state: WhiteboardState): WhiteboardState {
  if (state.redoClear && state.actions.length) return { ...state, clearedActions: state.actions, actions: [], redoClear: false };
  const action = state.redo.at(-1);
  return action ? { ...state, actions: [...state.actions, action], redo: state.redo.slice(0, -1) } : state;
}

export function clearWhiteboard(state: WhiteboardState): WhiteboardState {
  if (!state.actions.length) return state;
  return { ...state, actions: [], redo: [], clearedActions: state.actions, redoClear: false };
}

export function canUndoWhiteboard(state: WhiteboardState) { return state.actions.length > 0 || Boolean(state.clearedActions?.length); }
export function canRedoWhiteboard(state: WhiteboardState) { return state.redo.length > 0 || Boolean(state.redoClear); }

export function extendWhiteboardArea(state: WhiteboardState, increment = 0.65): WhiteboardState {
  const heightScale = Math.round((state.heightScale + increment) * 100) / 100;
  return { ...state, heightScale };
}

export function simplifyWhiteboardPoints(points: WhiteboardPoint[], minimumDistance = 0.002): WhiteboardPoint[] {
  if (points.length <= 2) return points.map(roundPoint);
  const result = [roundPoint(points[0])];
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = result[result.length - 1];
    const point = points[index];
    if (Math.hypot(point.x - previous.x, point.y - previous.y) >= minimumDistance) result.push(roundPoint(point));
  }
  result.push(roundPoint(points[points.length - 1]));
  return result;
}

function roundPoint(point: WhiteboardPoint): WhiteboardPoint {
  return { x: Math.round(Math.min(1, Math.max(0, point.x)) * 10_000) / 10_000, y: Math.round(Math.max(0, point.y) * 10_000) / 10_000, pressure: Math.round(Math.min(1, Math.max(0.05, point.pressure || 0.5)) * 100) / 100 };
}
