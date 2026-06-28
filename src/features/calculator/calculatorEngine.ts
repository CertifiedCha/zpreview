import { all, create } from "mathjs";
import type { CalculatorAngleMode, CalculatorSerializableAnswer } from "./calculatorState";

const MAX_EXPRESSION_LENGTH = 240;
const SAFE_EXPRESSION_PATTERN = /^[0-9A-Za-z+\-*/^().!,\s]+$/;
const ALLOWED_IDENTIFIERS = new Set(["sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "sqrt", "abs", "pi", "e", "Ans"]);
const BLOCKED_SYNTAX_CHARS = new Set(["=", ";", ":", "{", "}", "[", "]", "\"", "'", "`", "_", "$", "\\"]);

const math = create(all, {
  number: "number",
  precision: 14,
});

export type CalculatorEvaluationResult =
  | {
    ok: true;
    display: string;
    raw: CalculatorSerializableAnswer;
    normalizedExpression: string;
  }
  | {
    ok: false;
    display: "Error";
    error: string;
    normalizedExpression: string;
  };

export function normalizeCalculatorExpression(expression: string): string {
  return expression
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("−", "-")
    .replaceAll("π", "pi")
    .replaceAll("√", "sqrt")
    .replaceAll("²", "^2")
    .replaceAll(" ", "")
    .trim();
}

export function evaluateCalculatorExpression(expression: string, angleMode: CalculatorAngleMode, lastAnswer: CalculatorSerializableAnswer = 0): CalculatorEvaluationResult {
  const normalizedExpression = normalizeCalculatorExpression(expression);
  const guard = guardCalculatorExpression(normalizedExpression);
  if (!guard.ok) return { ok: false, display: "Error", error: guard.message, normalizedExpression };

  try {
    const compiled = math.compile(normalizedExpression);
    const raw = compiled.evaluate(makeScope(angleMode, lastAnswer));
    const display = formatCalculatorResult(raw);
    if (display === "Error") return { ok: false, display, error: "Result could not be displayed", normalizedExpression };
    return { ok: true, display, raw: normalizeRawAnswer(raw), normalizedExpression };
  } catch (error) {
    return {
      ok: false,
      display: "Error",
      error: error instanceof Error ? error.message : "Unknown calculator error",
      normalizedExpression,
    };
  }
}

function guardCalculatorExpression(expression: string): { ok: true } | { ok: false; message: string } {
  if (!expression.trim()) return { ok: false, message: "Empty expression" };
  if (expression.length > MAX_EXPRESSION_LENGTH) return { ok: false, message: "Expression is too long" };
  if (!SAFE_EXPRESSION_PATTERN.test(expression)) return { ok: false, message: "Expression contains unsupported characters" };
  if ([...expression].some((char) => BLOCKED_SYNTAX_CHARS.has(char))) return { ok: false, message: "Expression contains blocked syntax" };

  const identifiers = expression.match(/[A-Za-z]+/g) ?? [];
  for (const identifier of identifiers) {
    if (!ALLOWED_IDENTIFIERS.has(identifier)) return { ok: false, message: `Unsupported identifier: ${identifier}` };
  }

  return { ok: true };
}

function makeScope(angleMode: CalculatorAngleMode, lastAnswer: CalculatorSerializableAnswer) {
  return {
    Ans: lastAnswer ?? 0,
    sin: (x: unknown) => Math.sin(toRadians(x, angleMode)),
    cos: (x: unknown) => Math.cos(toRadians(x, angleMode)),
    tan: (x: unknown) => Math.tan(toRadians(x, angleMode)),
    asin: (x: unknown) => fromRadians(Math.asin(toNativeNumber(x)), angleMode),
    acos: (x: unknown) => fromRadians(Math.acos(toNativeNumber(x)), angleMode),
    atan: (x: unknown) => fromRadians(Math.atan(toNativeNumber(x)), angleMode),
    log: (x: unknown) => Math.log10(toNativeNumber(x)),
    ln: (x: unknown) => Math.log(toNativeNumber(x)),
  };
}

function toNativeNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value !== null && typeof value === "object" && "valueOf" in value && typeof value.valueOf === "function") {
    const converted = value.valueOf();
    if (typeof converted === "number") return converted;
  }
  return Number(value);
}

function toRadians(value: unknown, angleMode: CalculatorAngleMode): number {
  const numberValue = toNativeNumber(value);
  return angleMode === "DEG" ? (numberValue * Math.PI) / 180 : numberValue;
}

function fromRadians(value: number, angleMode: CalculatorAngleMode): number {
  return angleMode === "DEG" ? (value * 180) / Math.PI : value;
}

function formatCalculatorResult(value: unknown): string {
  if (typeof value === "number") {
    const cleaned = cleanFloatingPointNoise(value);
    if (!Number.isFinite(cleaned)) return "Error";
    return math.format(cleaned, {
      precision: 14,
      notation: "auto",
      lowerExp: -8,
      upperExp: 12,
    });
  }

  if (value === null || value === undefined) return "Error";
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object" && "toString" in value) {
    const text = String(value);
    return text === "[object Object]" ? "Error" : text;
  }
  return String(value);
}

function normalizeRawAnswer(value: unknown): CalculatorSerializableAnswer {
  if (typeof value === "number") return Number.isFinite(value) ? cleanFloatingPointNoise(value) : null;
  if (typeof value === "string") return value.length <= 120 ? value : null;
  const converted = toNativeNumber(value);
  return Number.isFinite(converted) ? cleanFloatingPointNoise(converted) : null;
}

function cleanFloatingPointNoise(value: number): number {
  if (!Number.isFinite(value)) return value;
  if (Math.abs(value) < 1e-12) return 0;
  const roundedInteger = Math.round(value);
  if (Math.abs(value - roundedInteger) < 1e-12) return roundedInteger;
  return value;
}
