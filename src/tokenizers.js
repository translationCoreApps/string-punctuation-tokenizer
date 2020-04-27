import xRegExp from 'xregexp';
import {occurrenceInTokens, occurrencesInTokens} from './occurrences';
// constants
export const _word = '[\\pL\\pM\\u200D\\u2060]+';
export const _number = '[\\pN\\pNd\\pNl\\pNo]+';
export const _wordOrNumber = '(' + _word + '|' + _number + ')';
export const _greedyWord = '(' + _wordOrNumber + '([-\'’]' + _word + ')+|' + _word + '’?)';
export const _greedyNumber = '(' + _number + '([:.,]?' + _number + ')+|' + _number + ')';
export const word = xRegExp(_word, '');
export const greedyWord = xRegExp(_greedyWord, '');
export const punctuation = xRegExp('(^\\p{P}|[<>]{2})', '');
export const whitespace = /\s+/;
export const number = xRegExp(_number);
export const greedyNumber = xRegExp(_greedyNumber); //  /(\d+([:.,]?\d)+|\d+)/;
export const number_ = xRegExp(number);

export const normalizations = [
  [[/(\u200B)/g], ''],
  [[/\s+/g], ' '],
];

/**
 * Tokenize a string into an array of words
 * @param {Object} params - string to be tokenized
 * @return {Array} - array of tokenized words/strings
 */
export const tokenize = ({
  text = '',
  includeWords = true,
  includeNumbers = true,
  includePunctuation = false,
  includeWhitespace = false,
  greedy = false,
  verbose = false,
  occurrences = false,
  parsers = {word, whitespace, punctuation, number},
  normalize = false,
  normalizations = normalizations,
}) => {
  const greedyParsers = {...parsers, word: greedyWord, number: greedyNumber};
  const _parsers = greedy ? greedyParsers : parsers;
  let tokens = classifyTokens(text, _parsers, null, normalize, normalizations);
  const types = [];
  if (includeWords) types.push('word');
  if (includeNumbers) types.push('number');
  if (includeWhitespace) types.push('whitespace');
  if (includePunctuation) types.push('punctuation');
  tokens = tokens.filter((token) => types.includes(token.type));
  if (occurrences) {
    tokens = tokens.map((token, index) => {
      const _occurrences = occurrencesInTokens(tokens, token.token);
      const _occurrence = occurrenceInTokens(tokens, index, token.token);
      return {...token, occurrence: _occurrence, occurrences: _occurrences};
    });
  }
  if (verbose) {
    tokens = tokens.map((token) => {
      delete token.matches;
      return token;
    });
  } else {
    tokens = tokens.map((token) => token.token);
  }
  return tokens;
};

/**
 * Tiny tokenizer - https://gist.github.com/borgar/451393
 * @param {String} string - string to be tokenized
 * @param {Object} parsers - { word:/\w+/, whitespace:/\s+/, punctuation:/[^\w\s]/ }
 * @param {String} deftok - type to label tokens that are not classified with the above parsers
 * @param {boolean} normalize - This flag will perform normalization on output tokens
 * @param {[[RegExp, String]]} normalizations - Normalization Objects to perform the replace with
 * @return {Array} - array of objects => [{ token:"this", type:"word" },{ token:" ", type:"whitespace" }, Object { token:"is", type:"word" }, ... ]
**/
export const classifyTokens = (string, parsers, deftok,
  normalize, normalizations) => {
  string = (!string) ? '' : string; // if string is undefined, make it an empty string
  if (typeof string !== 'string') {
    throw new Error(`tokenizer.tokenize() string is not String: ${string}`);
  }
  let m;
  let r;
  let t;
  let tokens = [];
  while (string) {
    t = null;
    m = string.length;
    let key;
    for (key in parsers) {
      if (Object.prototype.hasOwnProperty.call(parsers, key)) {
        r = parsers[key].exec(string);
        // try to choose the best match if there are several
        // where "best" is the closest to the current starting point
        if (r && (r.index < m)) {
          let token = r[0];
          if (normalize) {
            token = normalizer(token, normalizations);
          }
          t = {
            token,
            type: key,
            matches: r.slice(1),
          };
          m = r.index;
        }
      }
    }
    if (m) {
      // there is text between last token and currently
      // matched token - push that out as default or "unknown"
      tokens.push({
        token: string.substr(0, m),
        type: deftok || 'unknown',
      });
    }
    if (t) {
      // push current token onto sequence
      tokens.push(t);
    }
    string = string.substr(m + (t ? t.token.length : 0));
  }
  return tokens;
};

/**
 *
 * @param {String} string - The string to normalize
 * @param {[[RegExp, String]]} normalizations - Normalization Objects to perform the replace with
 * @return {String} - The normalized string
 */
function normalizer(string, normalizations) {
  let _string = string.slice(0);
  normalizations.forEach(([regex, stringReplace]) => {
    _string = _string.replace(regex, stringReplace);
  });
  return _string;
}
