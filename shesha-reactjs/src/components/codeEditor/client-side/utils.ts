import { IPosition, IRange, editor } from "monaco-editor";

export interface ConstrainedInstance {
  initializeIn(editor: editor.IStandaloneCodeEditor): void;
  addRestrictionsTo(model: editor.ITextModel, restrictions: any[]): void;
  removeRestrictionsIn(model: editor.ITextModel): void;
}

export interface CodeRestriction {
  // startLine, startColumn, endLine, endColumn
  range: Array<number>[4];
  allowMultiline?: boolean;
}

interface TextPosition {
  line: number;
  column: number;
}

export interface TextRange {
  start: TextPosition;
  end: TextPosition;
}

export interface TextTemplate {
  content: string;
  editableRanges: TextRange[];
}

/**
 * Returns the position of the last character in the content.
 *
 * @param {string} content - the input string
 * @return {TextPosition} the position of the last character
 */
const getLastCharPosition = (content: string): TextPosition => {
  if (!content)
    return { line: 0, column: 0 };

  const lines = content.split('\n');
  const lastLine = lines[lines.length - 1];

  return { line: lines.length, column: lastLine.length + 1 };
};

export const getLeadingWhiteSpaces = (text: string): string => {
  if (!text)
    return '';

  const count = text.search(/\S|$/);
  return text.slice(0, count);
};


/**
 * The placeholder string
 *
 * @param {string} value - the placeholder value
 * @return {Placeholder} the placeholder
 */
export type Placeholder = {
  value: string;
  readOnly: boolean;
  toString: () => string;
};

/**
 * The placeholder evaluation context
 */
export type PlaceholderEvaluatorContext = {
  /**
   * Current text position in a template, can be used for formatting of multiline placeholders (e.g. comments)
   */
  position: TextPosition;
  /**
   * Utility function that returns editable placeholder
   */
  editable: (text: string) => Placeholder;
  /**
   * Utility function that returns read-only placeholder
   */
  readOnly: (text: string) => Placeholder;
};

/**
 * The placeholder evaluator function type
 *
 * @param {PlaceholderEvaluatorContext} ctx - placeholder evaluation context
 * @return {string | Placeholder} the placeholder string
 */
export type PlaceholderEvaluator = (ctx: PlaceholderEvaluatorContext) => string | Placeholder;
const isPlaceholderEvaluator = (value: string | PlaceholderEvaluator): value is PlaceholderEvaluator => {
  return typeof (value) === 'function';
};

/**
 * Generates a text template with editable regions based on the provided strings and expressions.
 * Note: all string values are interpreted as readonly. Use PlaceholderEvaluator for editable values.
 *
 * @param {TemplateStringsArray} strings - the template strings array
 * @param {(string | PlaceholderEvaluator)[]} expr - the expressions to be evaluated or replaced
 * @return {TextTemplate} the generated text template with editable ranges
 */
export const makeCodeTemplate = (strings: TemplateStringsArray, ...expr: (string | PlaceholderEvaluator)[]): TextTemplate => {
  let content = '';

  const ranges: TextRange[] = [];
  strings.forEach((line, i) => {
    const item = expr[i];

    content += line;
    const startPosition = getLastCharPosition(content);

    if (item) {
      const placeholderContent = isPlaceholderEvaluator(item)
        ? item({
          position: getLastCharPosition(content),
          editable: (text) => ({ value: text, readOnly: false, toString: () => text }),
          readOnly: (text) => ({ value: text, readOnly: true, toString: () => text }),
        })
        : item;
      // note: string values are always read-only
      const readonly = typeof (placeholderContent) === 'string' || placeholderContent.readOnly;

      const placeholderText = placeholderContent?.toString();
      if (placeholderText)
        content += placeholderContent?.toString();

      const endPosition = getLastCharPosition(content);

      if (!readonly)
        ranges.push({ start: startPosition, end: endPosition });
    }
  });

  const response: TextTemplate = {
    content: content,
    editableRanges: ranges,
  };

  return response;
};

export type TemplateEvaluator = (code: string) => TextTemplate;

export const isRange = (value: IRange | IPosition): value is IRange => {
  return value && (value as IRange).startColumn !== undefined;
};

export const isPosition = (value: IRange | IPosition): value is IPosition => {
  return value && (value as IPosition).column !== undefined;
};
