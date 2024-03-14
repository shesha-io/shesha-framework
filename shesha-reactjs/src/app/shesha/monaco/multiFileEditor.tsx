import React, { useEffect, useRef, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { editor, Uri } from 'monaco-editor';

const indexCSS = `body {
  background-color: black;
}`;

const indexMD = `# hi there`;

export const MultiFileEditor = () => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const monacoRef = useRef<Monaco>();
  //const monacoInst = useRef<Monaco>();

  const [isEditorReady, setIsEditorReady] = useState(false);
  const [currentModel, setCurrentModel] = useState(Uri.parse("urn:index.md"));

  const onMount = (_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = _editor;

    // monaco.init().then((monacoInstance) => {
    // });
    monacoRef.current = monaco;

    monaco.editor.createModel(indexMD, "markdown", Uri.parse("urn:index.md"));
    monaco.editor.createModel(indexCSS, "css", Uri.parse("urn:index.css"));

    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(
      true
    );
    setIsEditorReady(true);

  };

  function setMD() {
    setCurrentModel(Uri.parse("urn:index.md"));
  }

  function setCSS() {
    setCurrentModel(Uri.parse("urn:index.css"));
  }

  useEffect(() => {
    if (isEditorReady && editorRef.current) {
      editorRef.current.setModel(
        monacoRef.current.editor.getModel(currentModel)
      );
    }
  }, [isEditorReady, currentModel]);

  return (
    <div>
      <div>
        <div onClick={setMD}>index.md</div>
        <div onClick={setCSS}>index.css</div>
      </div>
      <Editor
        height="80vh"
        theme="vs-dark"
        onMount={onMount}
      />
    </div>
  );
};