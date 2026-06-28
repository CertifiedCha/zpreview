import { ListChecks } from "lucide-react";
import type { BlockDefinition } from "../../../types";
import { baseTypographyGroup, containerStyleGroup, iconSize, quizTypographyFields } from "../../shared";
import { createQuizBaseBlock, isQuizVariant } from "./shared";
import { renderMiniQuiz } from "./previews";
import { quizFamilyVariants } from "./variants";

export const quizBlock: BlockDefinition = {
  type: "quiz",
  label: "Quiz Check",
  category: "assessment",
  icon: <ListChecks size={iconSize} />,
  defaultBlock: createQuizBaseBlock,
  preview: (block, theme) => renderMiniQuiz(block, theme),
  family: {
    label: "Quiz Check",
    thumbnail: { src: "/thumbnails/quiz-check.png", alt: "Quiz Check thumbnail" },
    variants: quizFamilyVariants,
  },
  config: {
    content: [
      {
        section: "content",
        kind: "select",
        target: "settings",
        key: "quizChoiceVariant",
        label: "Variant",
        disabled: (block) => !isQuizVariant(block, ["multipleChoice"]),
        optionsFor: (block) => isQuizVariant(block, ["multipleChoice"])
          ? [
              { label: "Text", value: "text" },
              { label: "Picture only", value: "image" },
              { label: "Picture + text", value: "imageText" },
            ]
          : [{ label: "Default", value: "text" }],
        options: [{ label: "Text", value: "text" }],
      },
      { section: "content", kind: "toggle", target: "settings", key: "showChoiceMarkers", label: "Show ABCD on options", defaultChecked: true, visibleWhen: (block) => isQuizVariant(block, ["multipleChoice"]) },
      { section: "content", kind: "textarea", key: "question", label: "Question", visibleWhen: (block) => !isQuizVariant(block, ["fillBlank"]) },
      { section: "content", kind: "textarea", key: "text", label: "Supporting text / blank sentence", visibleWhen: (block) => isQuizVariant(block, ["multiSelect"]) },
      {
        section: "content",
        kind: "select",
        key: "correctChoiceId",
        label: "Correct single choice",
        visibleWhen: (block) => isQuizVariant(block, ["multipleChoice", "trueFalse"]),
        optionsFor: (block) => isQuizVariant(block, ["trueFalse"])
          ? [
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ]
          : (block.content.choices ?? []).map((choice) => ({ label: choice.text, value: choice.id })),
        options: [
          { label: "Choice A", value: "a" },
          { label: "Choice B", value: "b" },
          { label: "Choice C", value: "c" },
          { label: "Choice D", value: "d" },
        ],
      },
      { section: "content", kind: "text", key: "correctChoiceIds", label: "Correct choices (comma-separated ids)", visibleWhen: (block) => isQuizVariant(block, ["multiSelect"]) },
      { section: "content", kind: "text", key: "answerText", label: "Expected typed answer", visibleWhen: (block) => isQuizVariant(block, ["shortAnswer"]) },
    ],
    layout: [
      {
        section: "layout",
        kind: "select",
        target: "settings",
        key: "quizLayout",
        label: "Visual layout",
        options: [
          { label: "Clean default", value: "clean" },
          { label: "Embossed cards", value: "embossed" },
        ],
      },
      {
        section: "layout",
        kind: "select",
        target: "settings",
        key: "quizMarker",
        label: "Choice marker",
        visibleWhen: (block) => isQuizVariant(block, ["multipleChoice", "multiSelect"]),
        options: [
          { label: "Radio", value: "radio" },
          { label: "Letters", value: "letters" },
          { label: "Checkbox", value: "checkbox" },
          { label: "True / false icons", value: "trueFalse" },
        ],
      },
      {
        section: "layout",
        kind: "select",
        target: "settings",
        key: "quizChoiceColumns",
        label: "Choice columns",
        visibleWhen: (block) => isQuizVariant(block, ["multipleChoice", "multiSelect"]),
        options: [
          { label: "One column", value: "one" },
          { label: "Two columns", value: "two" },
        ],
      },
      {
        section: "layout",
        kind: "select",
        target: "settings",
        key: "quizButtonWidth",
        label: "Check button width",
        visibleWhen: (block) => isQuizVariant(block, ["fillBlank", "shortAnswer", "multiSelect", "dropdown", "enumeration"]),
        options: [
          { label: "Inline", value: "inline" },
          { label: "Full width", value: "full" },
        ],
      },
      { section: "layout", kind: "toggle", target: "settings", key: "showExplanationLink", label: "Show explanation link" },
    ],
    feedback: [
      { section: "feedback", kind: "textarea", key: "hint", label: "Hint after mistake" },
      { section: "feedback", kind: "textarea", key: "correctExplanation", label: "Correct explanation" },
      { section: "feedback", kind: "textarea", key: "incorrectExplanation", label: "Incorrect explanation" },
      { section: "feedback", kind: "toggle", target: "settings", key: "retry", label: "Allow retry" },
      { section: "feedback", kind: "toggle", target: "settings", key: "revealAnswer", label: "Reveal answer" },
      { section: "feedback", kind: "toggle", target: "settings", key: "hideNextUntilAnswered", label: "Hide next content until answered" },
      { section: "feedback", kind: "toggle", target: "settings", key: "enumerationCaseSensitive", label: "Case sensitive answers", visibleWhen: (block) => isQuizVariant(block, ["enumeration"]) },
      { section: "feedback", kind: "toggle", target: "settings", key: "enumerationSpaceSensitive", label: "Space sensitive answers", visibleWhen: (block) => isQuizVariant(block, ["enumeration"]) },
    ],
    stylePresets: [
      {
        id: "clean-quiz",
        label: "Clean Blue",
        style: { shell: "plain", fillColor: undefined, borderColor: undefined, shadowColor: "#1d4ed8", borderWidth: undefined, radius: 14, fontColor: "#27272a", questionFontColor: "#27272a", choiceFontColor: "#27272a", buttonFillColor: "#2563eb", buttonFontColor: "#ffffff" },
      },
      {
        id: "soft-paper-quiz",
        label: "Soft Paper",
        style: { shell: "card", fillColor: "#ffffff", borderColor: "#e4e4e7", shadowColor: "#1f2937", borderWidth: 1, radius: 18, fontColor: "#27272a", questionFontColor: "#27272a", choiceFontColor: "#27272a", buttonFillColor: "#334155", buttonFontColor: "#ffffff" },
      },
      {
        id: "warm-check-quiz",
        label: "Warm Check",
        style: { shell: "tinted", fillColor: "#fff7ed", borderColor: "#fed7aa", shadowColor: "#c2410c", borderWidth: 1, radius: 18, fontColor: "#292524", questionFontColor: "#292524", choiceFontColor: "#292524", buttonFillColor: "#ea580c", buttonFontColor: "#ffffff" },
      },
      {
        id: "exam-card-quiz",
        label: "Exam Card",
        style: { shell: "card", fillColor: "#ffffff", borderColor: "#d4d4d8", shadowColor: "#09090b", borderWidth: 1, radius: 12, fontColor: "#18181b", questionFontColor: "#18181b", choiceFontColor: "#27272a", buttonFillColor: "#18181b", buttonFontColor: "#ffffff" },
      },
      {
        id: "fresh-check-quiz",
        label: "Fresh Check",
        style: { shell: "tinted", fillColor: "#f0fdf4", borderColor: "#bbf7d0", shadowColor: "#15803d", borderWidth: 1, radius: 18, fontColor: "#14532d", questionFontColor: "#14532d", choiceFontColor: "#1f2937", buttonFillColor: "#16a34a", buttonFontColor: "#ffffff" },
      },
    ],
    styleGroups: [
      containerStyleGroup,
      baseTypographyGroup,
      {
        title: "Question Text",
        description: "Overrides for the quiz prompt.",
        defaultOpen: true,
        fields: quizTypographyFields.slice(0, 2),
      },
      {
        title: "Choice Text",
        description: "Overrides for answer choices.",
        fields: quizTypographyFields.slice(2),
      },
    ],
    contentControls: (block) => {
      if (isQuizVariant(block, ["dropdown"])) return ["dropdownQuiz"];
      if (isQuizVariant(block, ["enumeration"])) return ["enumerationQuiz"];
      if (isQuizVariant(block, ["fillBlank"])) return ["fillBlank"];
      if (isQuizVariant(block, ["matching"])) return ["matchingAnswerKey"];
      if (isQuizVariant(block, ["multipleChoice", "multiSelect"])) return ["quizChoices"];
      return [];
    },
  },
};
