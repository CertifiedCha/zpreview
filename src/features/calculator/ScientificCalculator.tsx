import React from "react";
import { evaluateCalculatorExpression } from "./calculatorEngine";
import { createScientificCalculatorState, reconcileScientificCalculatorState, type CalculatorAngleMode, type ScientificCalculatorState } from "./calculatorState";

type CalculatorButtonVariant = "number" | "operator" | "function" | "utility" | "equals" | "mode";
type CalculatorButtonAction = "append" | "clear" | "backspace" | "equals" | "toggleAngle" | "toggleSign";

type CalculatorButtonDefinition = {
  label: string;
  input?: string;
  action?: CalculatorButtonAction;
  variant?: CalculatorButtonVariant;
  ariaLabel?: string;
};

type ZakiScientificCalculatorProps = {
  savedState: unknown;
  onStateChange: (state: ScientificCalculatorState) => void;
  maxHistory?: number;
};

const CALCULATOR_BUTTONS: CalculatorButtonDefinition[] = [
  { label: "DEG", action: "toggleAngle", variant: "mode", ariaLabel: "Toggle degrees and radians" },
  { label: "AC", action: "clear", variant: "utility", ariaLabel: "Clear calculator" },
  { label: "⌫", action: "backspace", variant: "utility", ariaLabel: "Backspace" },
  { label: "(", input: "(", action: "append", variant: "utility", ariaLabel: "Open parenthesis" },
  { label: ")", input: ")", action: "append", variant: "utility", ariaLabel: "Close parenthesis" },
  { label: "sin", input: "sin(", action: "append", variant: "function", ariaLabel: "Sine" },
  { label: "cos", input: "cos(", action: "append", variant: "function", ariaLabel: "Cosine" },
  { label: "tan", input: "tan(", action: "append", variant: "function", ariaLabel: "Tangent" },
  { label: "x²", input: "^2", action: "append", variant: "function", ariaLabel: "Square" },
  { label: "^", input: "^", action: "append", variant: "operator", ariaLabel: "Power" },
  { label: "asin", input: "asin(", action: "append", variant: "function", ariaLabel: "Inverse sine" },
  { label: "acos", input: "acos(", action: "append", variant: "function", ariaLabel: "Inverse cosine" },
  { label: "atan", input: "atan(", action: "append", variant: "function", ariaLabel: "Inverse tangent" },
  { label: "√", input: "sqrt(", action: "append", variant: "function", ariaLabel: "Square root" },
  { label: "!", input: "!", action: "append", variant: "function", ariaLabel: "Factorial" },
  { label: "log", input: "log(", action: "append", variant: "function", ariaLabel: "Base ten logarithm" },
  { label: "ln", input: "ln(", action: "append", variant: "function", ariaLabel: "Natural logarithm" },
  { label: "abs", input: "abs(", action: "append", variant: "function", ariaLabel: "Absolute value" },
  { label: "π", input: "π", action: "append", variant: "function", ariaLabel: "Pi" },
  { label: "e", input: "e", action: "append", variant: "function", ariaLabel: "Euler's number" },
  { label: "7", input: "7", action: "append", variant: "number" },
  { label: "8", input: "8", action: "append", variant: "number" },
  { label: "9", input: "9", action: "append", variant: "number" },
  { label: "÷", input: "÷", action: "append", variant: "operator", ariaLabel: "Divide" },
  { label: "±", action: "toggleSign", variant: "utility", ariaLabel: "Toggle sign" },
  { label: "4", input: "4", action: "append", variant: "number" },
  { label: "5", input: "5", action: "append", variant: "number" },
  { label: "6", input: "6", action: "append", variant: "number" },
  { label: "×", input: "×", action: "append", variant: "operator", ariaLabel: "Multiply" },
  { label: "Ans", input: "Ans", action: "append", variant: "function", ariaLabel: "Previous answer" },
  { label: "1", input: "1", action: "append", variant: "number" },
  { label: "2", input: "2", action: "append", variant: "number" },
  { label: "3", input: "3", action: "append", variant: "number" },
  { label: "−", input: "−", action: "append", variant: "operator", ariaLabel: "Subtract" },
  { label: "=", action: "equals", variant: "equals", ariaLabel: "Equals" },
  { label: "0", input: "0", action: "append", variant: "number" },
  { label: ".", input: ".", action: "append", variant: "number", ariaLabel: "Decimal point" },
  { label: ",", input: ",", action: "append", variant: "utility", ariaLabel: "Comma" },
  { label: "+", input: "+", action: "append", variant: "operator", ariaLabel: "Add" },
  { label: "=", action: "equals", variant: "equals", ariaLabel: "Equals" },
];

const BUTTON_VARIANT_CLASS: Record<CalculatorButtonVariant, string> = {
  number: "border-slate-200 bg-white text-slate-950 hover:bg-slate-50 active:bg-slate-100",
  operator: "border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100 active:bg-blue-200",
  function: "border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100 active:bg-violet-200",
  utility: "border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300",
  equals: "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
  mode: "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 active:bg-amber-200",
};

export function ZakiScientificCalculator({ savedState, onStateChange, maxHistory = 8 }: ZakiScientificCalculatorProps) {
  const [state, setState] = React.useState(() => reconcileScientificCalculatorState(savedState));
  const [justEvaluated, setJustEvaluated] = React.useState(false);
  const onStateChangeRef = React.useRef(onStateChange);

  React.useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  React.useEffect(() => {
    onStateChangeRef.current(state);
  }, [state]);

  const buttons = React.useMemo(
    () => CALCULATOR_BUTTONS.map((button) => (button.action === "toggleAngle" ? { ...button, label: state.angleMode } : button)),
    [state.angleMode],
  );

  const commitState = React.useCallback((updater: (current: ScientificCalculatorState) => ScientificCalculatorState) => {
    setState((current) => updater(current));
  }, []);

  const appendInput = React.useCallback((input: string) => {
    commitState((current) => {
      const shouldContinueFromResult = justEvaluated && current.result && isOperatorInput(input);
      const expression = justEvaluated && !shouldContinueFromResult ? input : `${shouldContinueFromResult ? current.result : current.expression}${input}`;
      return { ...current, expression, error: undefined };
    });
    setJustEvaluated(false);
  }, [commitState, justEvaluated]);

  const clear = React.useCallback(() => {
    commitState(() => createScientificCalculatorState());
    setJustEvaluated(false);
  }, [commitState]);

  const backspace = React.useCallback(() => {
    commitState((current) => ({ ...current, expression: current.expression.slice(0, -1), error: undefined }));
    setJustEvaluated(false);
  }, [commitState]);

  const toggleAngle = React.useCallback(() => {
    commitState((current) => ({ ...current, angleMode: current.angleMode === "DEG" ? "RAD" : "DEG", error: undefined }));
  }, [commitState]);

  const toggleSign = React.useCallback(() => {
    commitState((current) => ({ ...current, expression: current.expression ? `−(${current.expression})` : "−", error: undefined }));
    setJustEvaluated(false);
  }, [commitState]);

  const evaluateCurrentExpression = React.useCallback(() => {
    if (!state.expression.trim()) return;
    const answer = evaluateCalculatorExpression(state.expression, state.angleMode, state.lastAnswer);
    const nextState: ScientificCalculatorState = answer.ok
      ? {
        ...state,
        result: answer.display,
        lastAnswer: answer.raw,
        error: undefined,
        history: [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            expression: state.expression,
            result: answer.display,
            angleMode: state.angleMode,
            createdAt: new Date().toISOString(),
          },
          ...state.history,
        ].slice(0, maxHistory),
      }
      : {
        ...state,
        result: answer.display,
        error: answer.error,
      };
    setState(nextState);
    setJustEvaluated(true);
  }, [maxHistory, state]);

  const handleButtonPress = React.useCallback((button: CalculatorButtonDefinition) => {
    switch (button.action) {
      case "clear":
        clear();
        break;
      case "backspace":
        backspace();
        break;
      case "equals":
        evaluateCurrentExpression();
        break;
      case "toggleAngle":
        toggleAngle();
        break;
      case "toggleSign":
        toggleSign();
        break;
      case "append":
      default:
        if (button.input) appendInput(button.input);
    }
  }, [appendInput, backspace, clear, evaluateCurrentExpression, toggleAngle, toggleSign]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const mapped = mapKeyboardInput(event.key);
    if (mapped) {
      event.preventDefault();
      appendInput(mapped);
      return;
    }
    if (event.key === "Enter" || event.key === "=") {
      event.preventDefault();
      evaluateCurrentExpression();
      return;
    }
    if (event.key === "Backspace") {
      event.preventDefault();
      backspace();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      clear();
    }
  }, [appendInput, backspace, clear, evaluateCurrentExpression]);

  return (
    <div className="zaki-scientific-calculator grid h-full min-h-0 gap-3 p-3" onKeyDown={handleKeyDown}>
      <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <CalculatorDisplay expression={state.expression} result={state.result} angleMode={state.angleMode} error={state.error} />
        <div className="mt-3 grid grid-cols-5 gap-2">
          {buttons.map((button, index) => (
            <CalculatorButton key={`${button.label}-${index}`} button={button} onClick={() => handleButtonPress(button)} />
          ))}
        </div>
      </section>
      <CalculatorHistory
        records={state.history}
        onUseExpression={(expression) => {
          commitState((current) => ({ ...current, expression, error: undefined }));
          setJustEvaluated(false);
        }}
        onClearHistory={() => commitState((current) => ({ ...current, history: [] }))}
      />
    </div>
  );
}

function CalculatorDisplay({ expression, result, angleMode, error }: { expression: string; result: string; angleMode: CalculatorAngleMode; error?: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-950 p-3 text-right text-white shadow-inner">
      <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        <span>Scientific</span>
        <span>{angleMode}</span>
      </div>
      <div className="min-h-6 overflow-x-auto whitespace-nowrap text-sm text-slate-300" aria-label="Current expression">
        {expression || "0"}
      </div>
      <div className="mt-1 min-h-9 overflow-x-auto whitespace-nowrap text-2xl font-black tracking-tight" aria-live="polite" aria-label="Calculator result">
        {result || "0"}
      </div>
      {error && (
        <p className="mt-2 text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

function CalculatorButton({ button, onClick }: { button: CalculatorButtonDefinition; onClick: () => void }) {
  const variant = button.variant ?? "number";
  return (
    <button
      type="button"
      aria-label={button.ariaLabel ?? button.label}
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-2xl border px-2 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        BUTTON_VARIANT_CLASS[variant],
      )}
    >
      {button.label}
    </button>
  );
}

function CalculatorHistory({ records, onUseExpression, onClearHistory }: { records: ScientificCalculatorState["history"]; onUseExpression: (expression: string) => void; onClearHistory: () => void }) {
  if (!records.length) {
    return (
      <aside className="rounded-2xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">
        No history yet. Solve something and it will appear here.
      </aside>
    );
  }

  return (
    <aside className="min-h-0 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-slate-900">History</h2>
        <button type="button" onClick={onClearHistory} className="rounded-full px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900">
          Clear
        </button>
      </div>
      <div className="max-h-28 space-y-2 overflow-y-auto pr-1">
        {records.map((record) => (
          <button key={record.id} type="button" onClick={() => onUseExpression(record.expression)} className="w-full rounded-xl border border-slate-100 p-2 text-left transition hover:bg-slate-50">
            <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <span>{record.angleMode}</span>
              <span>{new Date(record.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="mt-1 truncate text-xs text-slate-600">{record.expression}</div>
            <div className="truncate text-sm font-black text-slate-950">= {record.result}</div>
          </button>
        ))}
      </div>
    </aside>
  );
}

function mapKeyboardInput(key: string) {
  if (/^[0-9.]$/.test(key)) return key;
  const keyboardMap: Record<string, string> = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
    "^": "^",
    "(": "(",
    ")": ")",
    p: "π",
    P: "π",
    e: "e",
  };
  return keyboardMap[key];
}

function isOperatorInput(input: string) {
  return ["+", "−", "-", "×", "÷", "*", "/", "^", "!"].includes(input);
}

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}
