import { dropdownQuizVariant } from "./dropdown";
import { enumerationQuizVariant } from "./enumeration";
import { fillBlankQuizVariant } from "./fillBlank";
import { matchingQuizVariant } from "./matching";
import { multipleChoiceQuizVariant } from "./multipleChoice";
import { multiSelectQuizVariant } from "./multiSelect";
import { shortAnswerQuizVariant } from "./shortAnswer";
import { trueFalseQuizVariant } from "./trueFalse";

export const quizFamilyVariants = [
  multipleChoiceQuizVariant,
  dropdownQuizVariant,
  enumerationQuizVariant,
  fillBlankQuizVariant,
  shortAnswerQuizVariant,
  trueFalseQuizVariant,
  multiSelectQuizVariant,
  matchingQuizVariant,
];
