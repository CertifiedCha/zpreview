import type { Block } from "../../../types";
import { makeBlock } from "../../shared";

export type QuizVariant = NonNullable<Block["settings"]["quizVariant"]>;

export function createQuizBaseBlock() {
  return makeBlock(
    "quiz",
    {
      label: "Sandbox active beat - rendering width (560px)",
      question: "Which of the following describes a scalar physics quantity?",
      text: "Select all that apply",
      choices: [
        { id: "a", text: "Mechanical Force" },
        { id: "b", text: "Particle Velocity" },
        { id: "c", text: "Inertial Mass" },
        { id: "d", text: "Linear Acceleration" },
      ],
      correctChoiceId: "c",
      correctChoiceIds: "c",
      answerText: "10",
      hint: "A scalar has magnitude only, not direction.",
      correctExplanation: "Correct. Inertial mass is scalar because it has magnitude without direction.",
      incorrectExplanation: "Not quite. Force, velocity, and acceleration are vector quantities.",
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
      settings: { retry: true, revealAnswer: false, quizVariant: "multipleChoice", quizLayout: "clean", quizMarker: "letters", quizChoiceColumns: "two", quizButtonWidth: "full", fillBlankMode: "type", showPromptLabel: false },
    },
  );
}

export function isQuizVariant(block: Block, variants: QuizVariant[]) {
  return variants.includes(block.settings.quizVariant ?? "multipleChoice");
}

export function applyQuizVariantDefaults(block: Block, variant: QuizVariant): Block {
  const next: Block = { ...block, settings: { ...block.settings, quizVariant: variant } };

  if (variant === "fillBlank") {
    return {
      ...next,
      settings: { ...next.settings, quizButtonWidth: "full", fillBlankMode: next.settings.fillBlankMode ?? "type" },
      content: {
        ...next.content,
        question: next.content.question || "Fill in the blanks.",
        text: next.content.text?.includes("___") ? next.content.text : "The capital of France is ___ and the capital of Japan is ___.",
        answerText: next.content.answerText?.includes(",") ? next.content.answerText : "Paris, Tokyo",
        choices: next.content.choices?.length ? next.content.choices : [
          { id: "a", text: "Paris" },
          { id: "b", text: "Tokyo" },
          { id: "c", text: "London" },
          { id: "d", text: "Seoul" },
        ],
      },
    };
  }

  if (variant === "shortAnswer") {
    return {
      ...next,
      settings: { ...next.settings, quizButtonWidth: "inline" },
      content: {
        ...next.content,
        question: next.content.question || "If a vehicle accelerates at 2m/s^2, what speed does it reach in 5s?",
        answerText: next.content.answerText || "10",
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
        question: next.content.question || "A scalar quantity has direction.",
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
