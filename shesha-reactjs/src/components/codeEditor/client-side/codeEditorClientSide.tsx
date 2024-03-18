import React, { FC, useMemo, useRef } from "react";
import { Monaco } from '@monaco-editor/react';
import { editor, languages } from 'monaco-editor';
import { DataTypes, IObjectMetadata } from "@/interfaces";
import { ModelTypeIdentifier, NestedProperties, PropertiesPromise, asPropertiesArray, isPropertiesArray, isPropertiesLoader } from "@/interfaces/metadata";
import { TypesBuilder } from "@/utils/metadata/typesBuilder";
import { CodeEditorMayHaveTemplate } from "./codeEditorMayHaveTemplate";
import { nanoid } from "@/utils/uuid";
import _ from 'lodash';
import { makeCodeTemplate } from "../utils";
import { useMetadataDispatcher } from "@/providers";
import { ICodeEditorProps } from "../models";

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

/**
 * Client-side code editor. It may use `window` or `document` objects and should be wrapped in `React.Suspense` to prevent rendering on server side
 *
 * @param {ICodeEditorProps} props - the properties for the code editor
 * @return {ReactNode} the code editor component
 */
const CodeEditorClientSide: FC<ICodeEditorProps> = (props) => {
    const { value, onChange, availableConstants, fileName, path, wrapInTemplate, readOnly = false, style } = props;
    const monacoInst = useRef<Monaco>();
    const editorRef = useRef<editor.IStandaloneCodeEditor>();

    const { getMetadata } = useMetadataDispatcher();

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
        const uri = monaco.Uri.parse(filePath);
        const existingModel = monaco.editor.getModel(uri);
        if (!existingModel) {
            console.log('LOG: create model with URI: ', uri.toString());

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
                const uri = monaco.Uri.parse(prefixLibPath(fileName));
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
            });
        });
    };

    const onEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor;
        monacoInst.current = monaco;

        const allModels = monaco.editor.getModels();
        console.log('LOG: onEditorMount', allModels.length);

        initDiagnosticsOptions(monaco);

        initEditor(editor, monaco);

        monaco.editor.onDidCreateEditor(newEditor => {
            newEditor.onDidChangeModel(() => {
                newEditor.updateOptions({
                    readOnly: true
                });
            });
        });

        if (template && availableConstants && asPropertiesArray(availableConstants.properties, []).length > 0)
            editor.trigger(null, 'editor.fold', { selectionLines: [1] });
    };

    const beforeMount = (monaco: Monaco) => {
        const allModels = monaco.editor.getModels();
        console.log('LOG: beforeMount', allModels.length);
    };

    return (
        <div style={{ minHeight: "300px", height: "300px", width: "100%", ...style }}>
            <CodeEditorMayHaveTemplate
                path={fileNamesState.modelPath}
                language={props.language}
                theme="vs-dark"
                value={value}
                onChange={onChange}
                options={{
                    automaticLayout: true,
                    readOnly: readOnly,
                }}
                beforeMount={beforeMount}
                onMount={onEditorMount}
                template={template}

                keepCurrentModel={false}
            />
        </div>
    );
};

export default CodeEditorClientSide;