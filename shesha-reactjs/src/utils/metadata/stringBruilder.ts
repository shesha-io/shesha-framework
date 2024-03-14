/**
 * String Builder
 */
export class StringBruilder {
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
     * Build the entire content by joining with '\r\n'.
     *
     * @return {string} the joined content
     */
    build() {
        return this.content.join('\r\n');
    }
}