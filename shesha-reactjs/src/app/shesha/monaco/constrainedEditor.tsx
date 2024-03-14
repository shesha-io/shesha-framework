import React, { useRef, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { editor, languages } from 'monaco-editor';
import { constrainedEditor } from 'constrained-editor-plugin';

const exposedVarsCode = `
export declare const application = { 
  test: 1 
};

interface Data {
  firstName: string;
  [key: string]: any;
}

/**
 * Exposed vars
 */
export const data: Data = {
  /**
   * firstName
   */
  firstName: 'John',
};
`;

const initialCode = `
import { application, data } from './exposed-vars';

function onClick() {
  // Enter the content for the function here  
};
`.trim();

export const ConstrainedEditor = () => {
  const [code, setCode] = useState(initialCode);
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const monacoRef = useRef<Monaco>();

  const restrictions = useRef([]);
  //const monacoInst = useRef<Monaco>();

  const setDiagnosticsOptions = (monaco: Monaco, options: languages.typescript.DiagnosticsOptions) => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(options);
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(options);
  };

  const onMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    setDiagnosticsOptions(monaco, {
      // disable `A 'return' statement can only be used within a function body.(1108)`
      diagnosticCodesToIgnore: [1108, 1046, 1039, 1254],
    });


    const varsPath = "file:///components/exposed-vars.d.ts";
    monaco.editor.createModel(
      exposedVarsCode,
      "typescript",
      monaco.Uri.parse(varsPath)
    );
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      exposedVarsCode,
      varsPath
    );

    //monaco.editor.createModel(indexCSS, "css", Uri.parse("urn:index.css"));

    const constrainedInstance = constrainedEditor(monaco);
    const model = editor.getModel();
    constrainedInstance.initializeIn(editor);
    restrictions.current.push({
      range: [4, 1, 5, 1],
      allowMultiline: true
    });

    constrainedInstance.addRestrictionsTo(model, restrictions.current);
  };

  return (
    <div>
      <Editor
        path="file:///components/panel1.js"
        height="80vh"
        theme="vs-dark"
        value={code}
        onChange={setCode}
        onMount={onMount}
        language="javascript"
      />
    </div>
  );
};