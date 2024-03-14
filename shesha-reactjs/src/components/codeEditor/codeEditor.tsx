import React, { FC, useMemo, useRef, useState } from "react";
import { Monaco } from '@monaco-editor/react';
import { editor, languages, Uri } from 'monaco-editor';
import { DataTypes, IObjectMetadata } from "@/interfaces";
import { ModelTypeIdentifier, NestedProperties, PropertiesPromise, asPropertiesArray, isPropertiesArray, isPropertiesLoader } from "@/interfaces/metadata";
import { TypesBuilder } from "@/utils/metadata/typesBuilder";
import { JavascriptEditor } from "./javascriptEditor";
import { nanoid } from "@/utils/uuid";
import { SourcesList } from "./sourcesList";
import _ from 'lodash';
import { CodeLanguages } from "../formDesigner/components/codeEditor/types";
import { makeCodeTemplate } from "./utils";
import { useMetadataDispatcher } from "@/providers";

export interface ICodeEditorProps {
    value?: string;
    onChange?: (newValue: string) => void;
    readOnly?: boolean;
    placeholder?: string;
    language: CodeLanguages;

    path?: string;
    fileName?: string;
    wrapInTemplate?: boolean;
    availableConstants?: IObjectMetadata;
}

interface EditorFileNamesState {
    modelPath: string;
    exposedVarsPath?: string;
}

//#region local utils

const getImportBlock = (constantsMetadata: IObjectMetadata, fileName: string): string => {
    const constants = asPropertiesArray(constantsMetadata?.properties, []);
    if (constants.length > 0) {
        const constantsNames = constants.map(p => p.path).sort().join(",\r\n    ");
        return `//#region Exposed variables
import { 
    ${constantsNames} } from './${fileName}.variables';
//#endregion\r\n`;
    }
    return undefined;
};

const prefixPath = (path: string, prefix: string): string => {
    if (!prefix)
        return path;

    return path.startsWith(prefix)
        ? path
        : prefix + "/" + _.trimStart(path, '/');
};

const prefixFilePath = (path: string): string => prefixPath(path, "ts:filename");
const prefixLibPath = (path: string): string => path.indexOf("node_modules") === -1 ? prefixPath(path, "node_modules") : path;

//#endregion

export const CodeEditor: FC<ICodeEditorProps> = (props) => {
    const { value, onChange, availableConstants, fileName, path, wrapInTemplate } = props;
    const monacoInst = useRef<Monaco>();
    const editorRef = useRef<editor.IStandaloneCodeEditor>();
    const { getMetadata } = useMetadataDispatcher();
    const [selectorIsReady, setSelectorIsReady] = useState(false);

    const addExtralibIfMissing = (language: languages.typescript.LanguageServiceDefaults, content: string, filePath?: string) => {
        const extraLibs = language.getExtraLibs();
        if (!extraLibs[filePath]) {
            language.addExtraLib(content, filePath);
        }
    };

    const template = useMemo(() => {
        if (wrapInTemplate !== true)
            return undefined;

        const importBlock = getImportBlock(availableConstants, fileName);

        const result = (code) => makeCodeTemplate`${importBlock}
const evaluator = async () => {
${(c) => c.editable(code)}
};`;
        return result;
    }, [wrapInTemplate, fileName, availableConstants]);

    const addExtraLib = (monaco: Monaco, content: string, filePath?: string) => {
        const uri = Uri.parse(filePath);
        const existingModel = monaco.editor.getModel(uri);
        if (!existingModel) {
            monaco.editor.createModel(content, "typescript", uri);
        }

        addExtralibIfMissing(monaco.languages.typescript.javascriptDefaults, content, filePath);
        addExtralibIfMissing(monaco.languages.typescript.typescriptDefaults, content, filePath);
    };

    const setDiagnosticsOptions = (monaco: Monaco, options: languages.typescript.DiagnosticsOptions) => {
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(options);
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(options);
    };

    const setCompilerOptions = (monaco: Monaco, options: languages.typescript.CompilerOptions) => {
        const jsOptions = monaco.languages.typescript.javascriptDefaults.getCompilerOptions();
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ ...jsOptions, ...options });

        const tsOptions = monaco.languages.typescript.typescriptDefaults.getCompilerOptions();
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({ ...tsOptions, ...options });
    };


    const initDiagnosticsOptions = (monaco: Monaco) => {
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

    const fetchProperties = (properties: NestedProperties): PropertiesPromise => {
        return isPropertiesArray(properties)
            ? Promise.resolve(properties)
            : isPropertiesLoader(properties)
                ? properties()
                : Promise.resolve([]);
    };

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
            modelPath: prefixFilePath(`${effectiveFolder}/${effectiveFileName}.ts`),
            exposedVarsPath: prefixFilePath(`${effectiveFolder}/${effectiveFileName}.variables.d.ts`),
        };

        return result;
    }, [path, fileName]);

    const initEditor = (_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        const localProperties = fetchProperties(availableConstants?.properties ?? []);

        localProperties.then(properties => {
            if (properties.length === 0)
                return;

            const isFileExists = (fileName: string): boolean => {
                const uri = Uri.parse(prefixLibPath(fileName));
                const existingModel = monaco.editor.getModel(uri);
                return Boolean(existingModel);
            };
            const registerFile = (fileName: string, content: string) => {
                addExtraLib(monaco, content, prefixLibPath(fileName));
            };

            const metadataFetcher = (typeId: ModelTypeIdentifier): Promise<IObjectMetadata> => getMetadata({ dataType: DataTypes.entityReference, modelType: typeId.name });

            const builder = new TypesBuilder(metadataFetcher, isFileExists, registerFile);
            builder.build(properties).then(builderResult => {
                if (builderResult.content)
                    addExtraLib(monaco, builderResult.content, fileNamesState.exposedVarsPath);

                setSelectorIsReady(true);
            });
        });
    };

    const onEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor;
        monacoInst.current = monaco;

        initDiagnosticsOptions(monaco);

        initEditor(editor, monaco);

        if (template && availableConstants && asPropertiesArray(availableConstants.properties, []).length > 0)
            editor.trigger(null, 'editor.fold', { selectionLines: [1] });
    };

    return (
        <>
            {selectorIsReady && (
                <SourcesList
                    editor={editorRef.current}
                    monaco={monacoInst.current}
                />)}
            <div>
                <strong>modelPath:</strong> {fileNamesState.modelPath}
            </div>
            <div>
                <strong>exposedVarsPath:</strong> {fileNamesState.exposedVarsPath}
            </div>
            <div style={{ minHeight: "300px", height: "300px", width: "100%" }}>
                <JavascriptEditor
                    path={fileNamesState.modelPath}
                    language={props.language}
                    theme="vs-dark"
                    value={value}
                    onChange={onChange}
                    options={{
                        automaticLayout: true,
                    }}
                    onMount={onEditorMount}
                    template={template}
                />
            </div>
        </>
    );
};