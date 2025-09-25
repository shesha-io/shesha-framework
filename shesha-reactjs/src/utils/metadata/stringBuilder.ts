import { EOL } from "./models";

/**
 * String Builder
 */
export class StringBuilder {
  readonly content: string[] = [];

  _indent: number = 0;

  /**
   * Increment the current indentation level.
   */
  incIndent() {
    this._indent++;
  }

  /**
   * Decreases the current indentation level.
   */
  decIndent() {
    this._indent--;
  }

  #formatLine(line: string) {
    return `${' '.repeat(this._indent * 4)}${line}`;
  }

  /**
   * Appends a line to the content.
   *
   * @param {string} line - the line to be appended
   * @return {void}
   */
  append(line: string) {
    this.content.push(this.#formatLine(line));
  }

  /**
   * Append multiple lines to the current context.
   *
   * @param {string[]} lines - array of lines to be appended
   * @return {void}
   */
  appendLines(lines: string[]) {
    lines.forEach((line) => this.append(line));
  };

  /**
   * Build the entire content by joining with '\r\n'.
   *
   * @return {string} the joined content
   */
  build() {
    return this.content.join(EOL);
  }
}
