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
  incIndent(): void {
    this._indent++;
  }

  /**
   * Decreases the current indentation level.
   */
  decIndent(): void {
    this._indent--;
  }

  #formatLine(line: string): string {
    return `${' '.repeat(this._indent * 4)}${line}`;
  }

  /**
   * Appends a line to the content.
   *
   * @param {string} line - the line to be appended
   * @return {void}
   */
  append(line: string): void {
    this.content.push(this.#formatLine(line));
  }

  /**
   * Append multiple lines to the current context.
   *
   * @param {string[]} lines - array of lines to be appended
   * @return {void}
   */
  appendLines(lines: string[]): void {
    lines.forEach((line) => this.append(line));
  };

  /**
   * Build the entire content by joining with '\r\n'.
   *
   * @return {string} the joined content
   */
  build(): string {
    return this.content.join(EOL);
  }
}
