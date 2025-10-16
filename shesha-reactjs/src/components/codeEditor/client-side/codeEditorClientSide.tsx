import React, { FC, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Monaco, loader } from '@monaco-editor/react';
import { IDisposable, IPosition, IRange, Uri, UriComponents, editor, languages } from 'monaco-editor';
import { DataTypes, IObjectMetadata } from "@/interfaces";
import { ModelTypeIdentifier, asPropertiesArray } from "@/interfaces/metadata";
import { CodeEditorMayHaveTemplate } from "./codeEditorMayHaveTemplate";
import { nanoid } from "@/utils/uuid";
import _ from 'lodash';
import { isPosition, isRange } from "./utils";
import { useMetadataDispatcher } from "@/providers";
import { CODE_TEMPLATE_DEFAULTS, ICodeEditorProps } from "../models";
import { useStyles } from './styles';
import { Button } from "antd";
import { FileOutlined } from "@ant-design/icons";
import { SizableColumns } from "@/components/sizableColumns";
import { FileTree } from "./fileTree/fileTree";
import { buildCodeEditorEnvironmentAsync } from "./codeFiles";
import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { CodeEditorLoadingProgressor } from "../loadingProgressor";
import { Environment } from "@/publicJsApis/metadataBuilder";
import { useIsDevMode } from "@/hooks/useIsDevMode";

// you can change the source of the monaco files
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs' } });

interface EditorFileNamesState {
  modelFilePath: string;
  modelDir: string;
}

interface IEmbeddedCodeEditorWidget extends editor.ICodeEditor {
  getParentEditor: () => editor.ICodeEditor;
}
const isChildEditor = (editor: editor.ICodeEditor): editor is IEmbeddedCodeEditorWidget => {
  const typed = editor as IEmbeddedCodeEditorWidget;
  return typed && typeof (typed.getParentEditor) === 'function';
};

interface CodeWrapperProps extends PropsWithChildren {
  leftPane?: React.ReactElement;
}
const CodeWrapper: FC<CodeWrapperProps> = ({ children, leftPane }) => {
  const { styles } = useStyles();
  return (
    <SizableColumns
      sizes={leftPane ? [25, 75] : [0, 100]}
      minSize={leftPane ? 100 : 0}
      expandToMin={false}
      gutterSize={leftPane ? 8 : 0}
      gutterAlign="center"
      snapOffset={30}
      dragInterval={1}
      direction="horizontal"
      cursor="col-resize"
      className={styles.workspaceSplit}
    >
      <div className={leftPane ? styles.tree : undefined}>
        {leftPane}
      </div>
      <div className={styles.code}>
        {children}
      </div>
    </SizableColumns>
  );
};

//#region local utils

const prefixPath = (path: string, prefix: string): string => {
  if (!prefix)
    return path;

  return path.startsWith(prefix)
    ? path
    : prefix + "/" + _.trimStart(path, '/');
};

const prefixFilePath = (path: string): string => path;
const prefixLibPath = (path: string): string => path.indexOf("node_modules") === -1 ? prefixPath(path, "node_modules") : path;

//#endregion

/**
 * Client-side code editor. It may use `window` or `document` objects and should be wrapped in `React.Suspense` to prevent rendering on server side
 *
 * @param {ICodeEditorProps} props - the properties for the code editor
 * @return {ReactNode} the code editor component
 */
const CodeEditorClientSide: FC<ICodeEditorProps> = (props) => {
  const {
    value,
    onChange,
    availableConstants,
    resultType,
    fileName,
    path,
    wrapInTemplate,
    readOnly = false,
    style,
    templateSettings = CODE_TEMPLATE_DEFAULTS,
    environment = Environment.None,
  } = props;
  const monacoInst = useRef<Monaco>();
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const { styles } = useStyles();
  const [activePane, setActivePane] = useState(null);
  const [internalReadOnly, setInternalReadOnly] = useState(false);
  const isDevMode = useIsDevMode();

  const { getMetadata } = useMetadataDispatcher();

  const metadataFetcher = useCallback((typeId: ModelTypeIdentifier): Promise<IObjectMetadata> => getMetadata({ dataType: DataTypes.entityReference, modelType: typeId.name }), [getMetadata]);

  const subscriptions = useRef<IDisposable[]>([]);
  const addSubscription = (subscription: IDisposable): void => {
    subscriptions.current.push(subscription);
  };
  useEffect(() => {
    return () => {
      const subsCopy = [...subscriptions.current];
      subsCopy.forEach((s) => s.dispose());
    };
  }, []);

  const fileUid = useRef<string>(null);
  const fileNamesState = useMemo<EditorFileNamesState>(() => {
    const effectiveFileName = fileName || "index";
    let effectiveFolder = path;
    if (!effectiveFolder) {
      fileUid.current = fileUid.current ?? nanoid();
      effectiveFolder = fileUid.current;
    }
    effectiveFolder = _.trimStart(effectiveFolder, '/');

    const result: EditorFileNamesState = {
      modelFilePath: prefixFilePath(`${effectiveFolder}/${effectiveFileName}.ts`),
      modelDir: prefixFilePath(effectiveFolder),
    };

    return result;
  }, [path, fileName]);

  const codeEditorEnvironment = useAsyncMemo(async () => {
    return await buildCodeEditorEnvironmentAsync({
      wrapInTemplate,
      fileName,
      availableConstants,
      resultType,
      metadataFetcher,
      directory: fileNamesState.modelDir,
      environment,
      functionName: templateSettings?.functionName ?? "func",
      useAsyncDeclaration: templateSettings?.useAsyncDeclaration,
    });
  }, [wrapInTemplate,
    fileName,
    availableConstants,
    templateSettings?.functionName,
    templateSettings?.useAsyncDeclaration,
    resultType,
    metadataFetcher,
    environment]);

  const addExtraLib = (monaco: Monaco, content: string, filePath?: string): IDisposable => {
    const uri = monaco.Uri.parse(filePath);
    let model = monaco.editor.getModel(uri);
    if (!model) {
      try {
        model = monaco.editor.createModel(content, "typescript", uri);
      } catch (error) {
        console.error('Failed to create model', { error, uri, content });
      }
    } else {
      const currentValue = model.getValue();
      if (currentValue !== content) {
        // content has been modified - sync model
        model.setValue(content);
      }
    }

    return model;
  };

  const setDiagnosticsOptions = (monaco: Monaco, options: languages.typescript.DiagnosticsOptions): void => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(options);
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(options);
  };

  const setCompilerOptions = (monaco: Monaco, options: languages.typescript.CompilerOptions): void => {
    const jsOptions = monaco.languages.typescript.javascriptDefaults.getCompilerOptions();
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ ...jsOptions, ...options });

    const tsOptions = monaco.languages.typescript.typescriptDefaults.getCompilerOptions();
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({ ...tsOptions, ...options });
  };


  const initDiagnosticsOptions = (monaco: Monaco): void => {
    setDiagnosticsOptions(monaco, {
      // disable `A 'return' statement can only be used within a function body.(1108)`
      diagnosticCodesToIgnore: [1108, 1046],
    });
    setCompilerOptions(monaco, {
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      baseUrl: './',
      allowSyntheticDefaultImports: true,
    });
  };

  const isInitialPath = (path?: string): boolean => {
    if (!path)
      return false;

    const normalizedPath = _.trimStart(path, '/');
    return fileNamesState.modelFilePath === normalizedPath;
  };

  const navigateToModel = (fileUri?: UriComponents, selectionOrPosition?: IRange | IPosition): void => {
    if (!monacoInst.current || !editorRef.current || !fileUri)
      return;

    const model = monacoInst.current.Uri.isUri(fileUri)
      ? monacoInst.current.editor.getModel(fileUri)
      : undefined;
    editorRef.current.setModel(model);

    if (isRange(selectionOrPosition)) {
      editorRef.current.setSelection(selectionOrPosition, '');
      editorRef.current.revealLineInCenter(selectionOrPosition.startLineNumber);
    }
    if (isPosition(selectionOrPosition)) {
      editorRef.current.setPosition(selectionOrPosition, '');
      editorRef.current.revealLineInCenter(selectionOrPosition.lineNumber);
    }

    editorRef.current.focus();

    const newInternalReadOnly = !isInitialPath(fileUri?.path);
    if (newInternalReadOnly !== internalReadOnly)
      setInternalReadOnly(newInternalReadOnly);
  };

  const onEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco): void => {
    if (!codeEditorEnvironment)
      throw new Error('Code editor environment is not ready');

    editorRef.current = editor;
    monacoInst.current = monaco;

    initDiagnosticsOptions(monaco);

    monaco.editor.registerEditorOpener({
      openCodeEditor(_source: editor.ICodeEditor, resource: Uri, selectionOrPosition?: IRange | IPosition) {
        if (!isDevMode)
          return false;

        navigateToModel(resource, selectionOrPosition);
        return true;
      },
    });

    // init editor
    const registerFile = (fileName: string, content: string): void => {
      addExtraLib(monaco, content, fileName.startsWith('/') ? fileName : prefixLibPath(fileName));
    };
    const { sourceFiles } = codeEditorEnvironment;

    sourceFiles.forEach((sourceFile) => {
      registerFile(sourceFile.filePath, sourceFile.content);
    });

    const createEditorSubscription = monaco.editor.onDidCreateEditor((newEditor) => {
      if (isChildEditor(newEditor)) {
        const changeModelSubscription = newEditor.onDidChangeModel(() => {
          const parent = newEditor.getParentEditor();
          if (parent === editorRef.current) {
            newEditor.updateOptions({
              readOnly: true,
            });
          }
        });
        addSubscription(changeModelSubscription);
      }
    });
    addSubscription(createEditorSubscription);

    const { template } = codeEditorEnvironment;
    if (template && availableConstants && asPropertiesArray(availableConstants.properties, []).length > 0)
      editor.trigger(null, 'editor.fold', { selectionLines: [0] });
  };

  const onExplorerClick = (): void => {
    setActivePane(activePane === "explorer" ? null : "explorer");
  };

  const onFileSelect = (fileUri?: UriComponents): void => {
    navigateToModel(fileUri);
  };

  const getCurrentUri = (): UriComponents => {
    return editorRef.current?.getModel()?.uri;
  };

  const showTree = isDevMode && (!props.language || props.language === 'typescript' || props.language === 'javascript');
  const finalReadOnly = readOnly || internalReadOnly;

  const renderCodeEditor = (): JSX.Element => {
    return codeEditorEnvironment
      ? (
        <>
          <CodeEditorMayHaveTemplate
            path={fileNamesState.modelFilePath}
            language={props.language}
            theme="vs-dark"
            value={value}
            onChange={onChange}
            options={{
              automaticLayout: true,
              readOnly: finalReadOnly,
            }}
            onMount={onEditorMount}
            template={codeEditorEnvironment.template}
          />
        </>
      )
      : <CodeEditorLoadingProgressor message="Load environment..." />;
  };

  return showTree
    ? (
      <div className={styles.codeEditor} style={{ minHeight: "300px", height: "300px", width: "100%", ...style }}>
        <div className={styles.sider}>
          <Button
            block
            type="link"
            icon={<FileOutlined />}
            size="large"
            style={{ border: 'none' }}
            onClick={onExplorerClick}
            className={activePane === "explorer" ? "active" : "inactive"}
          />
        </div>
        <div className={styles.workspace}>
          <CodeWrapper
            leftPane={activePane === "explorer"
              ? (
                <FileTree
                  monaco={monacoInst.current}
                  onSelect={onFileSelect}
                  defaultSelection={getCurrentUri()}
                />
              )
              : undefined}
          >
            {renderCodeEditor()}
          </CodeWrapper>
        </div>
      </div>
    )
    : (
      <div style={{ minHeight: "300px", height: "300px", width: "100%", ...style }}>
        {renderCodeEditor()}
      </div>
    );
};

export default CodeEditorClientSide;
