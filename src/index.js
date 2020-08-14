import {
  tokenize,
  word,
  punctuation,
  whitespace,
  number_ as number,
} from './tokenizers';

import {
  normalizer,
  normalizerDestructive,
  normalizationsDestructive,
} from './normalizers';

import {
  occurrenceInString,
  occurrencesInString,
} from './occurrences';

import {
  selectionArray,
  spliceStringOnRanges,
  selectionsToRanges,
} from './selectionHelpers';

export {
  tokenize,
  normalizer,
  normalizerDestructive,
  normalizationsDestructive,
  occurrenceInString,
  occurrencesInString,
  selectionArray,
  spliceStringOnRanges,
  selectionsToRanges,
  word,
  punctuation,
  whitespace,
  number,
};
