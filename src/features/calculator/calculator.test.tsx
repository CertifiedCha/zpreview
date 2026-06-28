import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import runtimeRenderer from "../../components/BlockRenderers.tsx?raw";
import { ZakiScientificCalculator, createScientificCalculatorState, evaluateCalculatorExpression, normalizeCalculatorExpression, reconcileScientificCalculatorState } from ".";

describe("Zaki calculator compatibility", () => {
  it("renders the local scientific calculator without loading Desmos", () => {
    const markup = renderToStaticMarkup(<ZakiScientificCalculator savedState={null} onStateChange={() => undefined} />);
    expect(markup).toContain("Scientific");
    expect(markup).toContain("aria-label=\"Equals\"");
    expect(markup).toContain("No history yet");
  });

  it("keeps the calculator runtime path independent of Desmos and Vite env", () => {
    expect(runtimeRenderer).toContain("ZakiScientificCalculator");
    expect(runtimeRenderer).not.toContain("loadDesmosCalculator");
    expect(runtimeRenderer).not.toContain("DesmosScientificCalculator");
    expect(runtimeRenderer).not.toContain("import.meta.env.VITE_DESMOS_API_KEY");
  });

  it("evaluates basic and scientific operations with guarded mathjs parsing", () => {
    expect(normalizeCalculatorExpression("2×π÷√(4)")).toBe("2*pi/sqrt(4)");
    expect(evaluateCalculatorExpression("2+3×4", "DEG")).toMatchObject({ ok: true, display: "14" });
    const trig = evaluateCalculatorExpression("sin(30)", "DEG");
    expect(trig.ok).toBe(true);
    if (trig.ok) expect(Number(trig.display)).toBeCloseTo(0.5, 12);
  });

  it("rejects unsupported identifiers instead of evaluating arbitrary expressions", () => {
    expect(evaluateCalculatorExpression("import(1)", "DEG")).toMatchObject({ ok: false });
    expect(evaluateCalculatorExpression("Function(1)", "DEG")).toMatchObject({ ok: false });
  });

  it("uses an explicit small persisted state shape", () => {
    const state = createScientificCalculatorState({
      expression: "2+2",
      result: "4",
      angleMode: "RAD",
      lastAnswer: 4,
      history: [{ id: "history-1", expression: "2+2", result: "4", angleMode: "DEG", createdAt: "2026-06-27T00:00:00.000Z" }],
    });
    expect(state).toEqual({
      version: 1,
      expression: "2+2",
      result: "4",
      angleMode: "RAD",
      lastAnswer: 4,
      history: [{ id: "history-1", expression: "2+2", result: "4", angleMode: "DEG", createdAt: "2026-06-27T00:00:00.000Z" }],
      error: undefined,
    });
    expect(reconcileScientificCalculatorState({ expression: "legacy" })).toEqual(createScientificCalculatorState());
  });
});
