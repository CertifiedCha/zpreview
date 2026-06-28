import { describe, expect, it } from "vitest";
import { allDropdownsAnswered, createDropdownQuizBlank, createDropdownQuizItem, dropdownAnswersAreCorrect, mergeDropdownQuizOptions, removeDropdownOption, syncDropdownQuizItem } from "./dropdownQuiz";

describe("dropdown quiz data", () => {
  it("keeps one blank record per marker", () => {
    const item = createDropdownQuizItem("First ___", [createDropdownQuizBlank(["A", "B"], 1)]);
    const expanded = syncDropdownQuizItem(item, "First ___ then ___");
    const reduced = syncDropdownQuizItem(expanded, "Only ___");

    expect(expanded.blanks).toHaveLength(2);
    expect(expanded.blanks[0].id).toBe(item.blanks[0].id);
    expect(expanded.blanks[1].options.map((option) => option.text)).toEqual(item.blanks[0].options.map((option) => option.text));
    expect(expanded.blanks[1].options.find((option) => option.id === expanded.blanks[1].correctOptionId)?.text).toBe("B");
    expect(reduced.blanks).toHaveLength(1);
    expect(reduced.blanks[0].id).toBe(item.blanks[0].id);
  });

  it("inserts a new dropdown at the edited marker and inherits the previous answer key", () => {
    const first = createDropdownQuizBlank(["A", "B"], 1);
    const second = createDropdownQuizBlank(["X", "Y"], 0);
    const item = createDropdownQuizItem("First ___ then ___", [first, second]);
    const expanded = syncDropdownQuizItem(item, "First ___ inserted ___ then ___", first.options, 1, first);

    expect(expanded.blanks.map((blank) => blank.options.map((option) => option.text))).toEqual([["A", "B"], ["A", "B"], ["X", "Y"]]);
    expect(expanded.blanks[1].options.find((option) => option.id === expanded.blanks[1].correctOptionId)?.text).toBe("B");
    expect(expanded.blanks[2].id).toBe(second.id);
  });

  it("merges option labels case-insensitively and preserves correct answers by text", () => {
    const first = createDropdownQuizBlank(["Random", "Systematic"], 1);
    const second = createDropdownQuizBlank(["random", "Both"], 1);
    const items = [createDropdownQuizItem("One ___", [first]), createDropdownQuizItem("Two ___", [second])];
    const merged = mergeDropdownQuizOptions(items);

    expect(merged[0].blanks[0].options.map((option) => option.text)).toEqual(["Random", "Systematic", "Both"]);
    expect(merged[1].blanks[0].options.map((option) => option.text)).toEqual(["Random", "Systematic", "Both"]);
    expect(merged[0].blanks[0].options.find((option) => option.id === merged[0].blanks[0].correctOptionId)?.text).toBe("Systematic");
    expect(merged[1].blanks[0].options.find((option) => option.id === merged[1].blanks[0].correctOptionId)?.text).toBe("Both");
  });

  it("reassigns a removed correct option and grades every dropdown", () => {
    const blank = createDropdownQuizBlank(["A", "B", "C"], 1);
    const next = removeDropdownOption(blank, blank.correctOptionId);
    const item = createDropdownQuizItem("Choose ___", [next]);
    const correctAnswers = { [next.id]: next.correctOptionId };

    expect(next.options).toHaveLength(2);
    expect(next.correctOptionId).toBe(next.options[0].id);
    expect(allDropdownsAnswered([item], correctAnswers)).toBe(true);
    expect(dropdownAnswersAreCorrect([item], correctAnswers)).toBe(true);
    expect(dropdownAnswersAreCorrect([item], { [next.id]: next.options[1].id })).toBe(false);
  });
});
