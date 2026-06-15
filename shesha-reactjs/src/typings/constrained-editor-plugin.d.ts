declare module 'constrained-editor-plugin' {
  import { Monaco } from "@monaco-editor/react";
  import { editor } from "monaco-editor";

  export interface CodeRestriction {
    label: string;
    // startLine, startColumn, endLine, endColumn
    range: [number, number, number, number];
    allowMultiline?: boolean;
  }


  export interface ConstrainedInstance {
    initializeIn(editor: editor.IStandaloneCodeEditor): void;
    addRestrictionsTo(model: editor.ITextModel, restrictions: CodeRestriction[]): void;
    removeRestrictionsIn(model: editor.ITextModel): void;
  }

  const constrainedEditor: (editor: Monaco) => ConstrainedInstance;

  export default constrainedEditor;
}
