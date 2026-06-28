export type CalculatorAngleMode = "DEG" | "RAD";

export type CalculatorSerializableAnswer = number | string | null;

export type CalculatorHistoryEntry = {
  id: string;
  expression: string;
  result: string;
  angleMode: CalculatorAngleMode;
  createdAt: string;
};

export type ScientificCalculatorState = {
  version: 1;
  expression: string;
  result: string;
  angleMode: CalculatorAngleMode;
  lastAnswer: CalculatorSerializableAnswer;
  history: CalculatorHistoryEntry[];
  error?: string;
};

export const EMPTY_CALCULATOR_STATE: ScientificCalculatorState = {
  version: 1,
  expression: "",
  result: "",
  angleMode: "DEG",
  lastAnswer: 0,
  history: [],
};

export function createScientificCalculatorState(patch: Partial<ScientificCalculatorState> = {}): ScientificCalculatorState {
  return {
    ...EMPTY_CALCULATOR_STATE,
    ...patch,
    version: 1,
    expression: typeof patch.expression === "string" ? patch.expression : EMPTY_CALCULATOR_STATE.expression,
    result: typeof patch.result === "string" ? patch.result : EMPTY_CALCULATOR_STATE.result,
    angleMode: patch.angleMode === "RAD" ? "RAD" : "DEG",
    lastAnswer: normalizeSerializableAnswer(patch.lastAnswer),
    history: Array.isArray(patch.history) ? patch.history.slice(0, 12).map(normalizeHistoryEntry).filter((entry): entry is CalculatorHistoryEntry => entry !== null) : [],
    error: typeof patch.error === "string" ? patch.error : undefined,
  };
}

export function reconcileScientificCalculatorState(value: unknown): ScientificCalculatorState {
  if (!value || typeof value !== "object") return createScientificCalculatorState();
  const candidate = value as Partial<ScientificCalculatorState>;
  if (candidate.version !== 1) return createScientificCalculatorState();
  return createScientificCalculatorState(candidate);
}

function normalizeHistoryEntry(value: unknown): CalculatorHistoryEntry | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<CalculatorHistoryEntry>;
  if (typeof candidate.expression !== "string" || typeof candidate.result !== "string") return null;
  return {
    id: typeof candidate.id === "string" && candidate.id ? candidate.id : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    expression: candidate.expression,
    result: candidate.result,
    angleMode: candidate.angleMode === "RAD" ? "RAD" : "DEG",
    createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : new Date().toISOString(),
  };
}

function normalizeSerializableAnswer(value: unknown): CalculatorSerializableAnswer {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") return value.length <= 120 ? value : null;
  return value === null || value === undefined ? 0 : null;
}
