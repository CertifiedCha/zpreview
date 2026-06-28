import type { Block } from "../../../types";
import { makeBlock } from "../../shared";
import { createDefaultDropdownQuizItems } from "./dropdownQuiz";
import { createDefaultEnumerationQuizItems } from "./enumerationQuiz";

export type QuizVariant = NonNullable<Block["settings"]["quizVariant"]>;

export function createQuizBaseBlock() {
  return makeBlock(
    "quiz",
    {
      label: "Quiz question",
      question: "This is the question your students answer.",
      text: "Select all that apply",
      choices: [
        { id: "a", text: "First answer option" },
        { id: "b", text: "Second answer option" },
        { id: "c", text: "Correct answer option" },
        { id: "d", text: "Another answer option" },
      ],
      correctChoiceId: "c",
      correctChoiceIds: "c",
      answerText: "Correct answer",
      hint: "This is a hint that your students see if they get the wrong answer. You can remove this.",
      correctExplanation: "This message shows after students answer correctly.",
      incorrectExplanation: "This message shows after students answer incorrectly.",
    },
    {
      style: {
        shell: "plain",
        buttonFillColor: "#2563eb",
        buttonFontColor: "#ffffff",
        questionFontColor: "#27272a",
        choiceFontColor: "#27272a",
        radius: 14,
      },
      settings: { retry: true, revealAnswer: false, quizVariant: "multipleChoice", quizChoiceVariant: "text", quizLayout: "clean", quizMarker: "letters", showChoiceMarkers: true, quizChoiceColumns: "two", quizButtonWidth: "full", fillBlankMode: "type", dropdownUseGlobalOptions: false },
    },
  );
}

export function isQuizVariant(block: Block, variants: QuizVariant[]) {
  return variants.includes(block.settings.quizVariant ?? "multipleChoice");
}

export function applyQuizVariantDefaults(block: Block, variant: QuizVariant): Block {
  const next: Block = { ...block, settings: { ...block.settings, quizVariant: variant } };

  if (variant === "dropdown") {
    return {
      ...next,
      settings: { ...next.settings, quizButtonWidth: "full", dropdownUseGlobalOptions: false },
      content: {
        ...next.content,
        question: next.content.question || "Choose the best answer for each statement.",
        dropdownQuizItems: next.content.dropdownQuizItems?.length ? next.content.dropdownQuizItems : createDefaultDropdownQuizItems(),
      },
    };
  }

  if (variant === "fillBlank") {
    return {
      ...next,
      settings: { ...next.settings, quizButtonWidth: "full", fillBlankMode: next.settings.fillBlankMode ?? "type" },
      content: {
        ...next.content,
        question: next.content.question || "Students fill each blank in this sentence.",
        text: next.content.text?.includes("___") ? next.content.text : "Add a sentence with a blank like ___ and another blank like ___.",
        answerText: next.content.answerText?.includes(",") ? next.content.answerText : "first answer, second answer",
        choices: next.content.choices?.length ? next.content.choices : [
          { id: "a", text: "first answer" },
          { id: "b", text: "second answer" },
          { id: "c", text: "extra option" },
          { id: "d", text: "another option" },
        ],
      },
    };
  }

  if (variant === "enumeration") {
    return {
      ...next,
      settings: { ...next.settings, quizButtonWidth: "full", enumerationCaseSensitive: next.settings.enumerationCaseSensitive ?? false, enumerationSpaceSensitive: next.settings.enumerationSpaceSensitive ?? false },
      content: {
        ...next.content,
        question: next.content.question || "Students list the required answers here.",
        enumerationItems: next.content.enumerationItems?.length ? next.content.enumerationItems : createDefaultEnumerationQuizItems(),
      },
    };
  }

  if (variant === "shortAnswer") {
    return {
      ...next,
      settings: { ...next.settings, quizButtonWidth: "inline" },
      content: {
        ...next.content,
        question: next.content.question || "Students type a short answer to this question.",
        answerText: next.content.answerText || "Expected answer",
      },
    };
  }

  if (variant === "multiSelect") {
    return {
      ...next,
      settings: { ...next.settings, quizMarker: "checkbox", quizChoiceColumns: "one", quizButtonWidth: "full" },
      content: {
        ...next.content,
        text: next.content.text || "Select all that apply",
        correctChoiceIds: next.content.correctChoiceIds || next.content.correctChoiceId || "a, c",
      },
    };
  }

  if (variant === "trueFalse") {
    return {
      ...next,
      settings: { ...next.settings, quizMarker: "trueFalse", quizChoiceColumns: "two" },
      content: {
        ...next.content,
        question: next.content.question || "Students choose whether this statement is true or false.",
        correctChoiceId: next.content.correctChoiceId === "false" ? "false" : "true",
      },
    };
  }

  return {
    ...next,
    settings: { ...next.settings, quizMarker: "letters", quizChoiceColumns: "two", quizButtonWidth: "inline" },
    content: {
      ...next.content,
      correctChoiceId: next.content.correctChoiceId && !["true", "false"].includes(next.content.correctChoiceId) ? next.content.correctChoiceId : next.content.choices?.[0]?.id,
    },
  };
}
