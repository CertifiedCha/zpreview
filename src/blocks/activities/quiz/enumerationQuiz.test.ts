import { describe, expect, it } from "vitest";
import { createEnumerationQuizItem, enumerationAnswersAreCorrect, normalizeEnumerationQuizItems } from "./enumerationQuiz";

describe("enumeration quiz data", () => {
  it("accepts aliases only within their own answer slot", () => {
    const items = [
      createEnumerationQuizItem(["First Law of Motion", "Newton's First Law"]),
      createEnumerationQuizItem(["Second Law of Motion", "Force-mass Law"]),
    ];

    expect(enumerationAnswersAreCorrect(items, ["First Law of Motion", "Second Law of Motion"])).toBe(true);
    expect(enumerationAnswersAreCorrect(items, ["First Law of Motion", "Newton's First Law"])).toBe(false);
  });

  it("ignores case and spaces by default, then honors toggles", () => {
    const items = [createEnumerationQuizItem(["Force mass Law"])];

    expect(enumerationAnswersAreCorrect(items, ["force masslaw"])).toBe(true);
    expect(enumerationAnswersAreCorrect(items, ["force masslaw"], { caseSensitive: true })).toBe(false);
    expect(enumerationAnswersAreCorrect(items, ["force masslaw"], { spaceSensitive: true })).toBe(false);
  });

  it("normalizes missing accepted answers", () => {
    const [item] = normalizeEnumerationQuizItems([{ id: "one", accepted: ["", "  "] }]);

    expect(item.id).toBe("one");
    expect(item.accepted).toEqual(["New answer"]);
  });
});
