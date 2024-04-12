import React, { FC, PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { Monaco } from '@monaco-editor/react';
import { IDisposable, IPosition, IRange, Uri, UriComponents, editor, languages } from 'monaco-editor';
import { DataTypes, IObjectMetadata } from "@/interfaces";
import { ModelTypeIdentifier, NestedProperties, PropertiesPromise, asPropertiesArray, isPropertiesArray, isPropertiesLoader } from "@/interfaces/metadata";
import { TypesBuilder } from "@/utils/metadata/typesBuilder";
import { CodeEditorMayHaveTemplate } from "./codeEditorMayHaveTemplate";
import { nanoid } from "@/utils/uuid";
import _ from 'lodash';
import { makeCodeTemplate } from "./utils";
import { useMetadataDispatcher } from "@/providers";
import { CODE_TEMPLATE_DEFAULTS, ICodeEditorProps } from "../models";
import { useStyles } from './styles';
import { Button } from "antd";
import { FileOutlined } from "@ant-design/icons";
import { SizableColumns } from "@/components/sizableColumns";
import { FileTree } from "./fileTree/fileTree";
import { useLocalStorage } from "@/hooks";

interface EditorFileNamesState {
    modelPath: string;
    exposedVarsPath?: string;
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

const getImportBlock = (constantsMetadata: IObjectMetadata, fileName: string): string => {
    const constants = asPropertiesArray(constantsMetadata?.properties, []);
    if (constants.length > 0) {
        const constantsNames = constants.map(p => p.path).sort().join(",\r\n    ");
        return `//#region Exposed variables
import {
    ${constantsNames}
} from './${fileName}.variables';
//#endregion\r\n\r\n`;
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
        fileName,
        path,
        wrapInTemplate,
        readOnly = false,
        style,
        templateSettings = CODE_TEMPLATE_DEFAULTS,
    } = props;
    const monacoInst = useRef<Monaco>();
    const editorRef = useRef<editor.IStandaloneCodeEditor>();
    const { styles } = useStyles();
    const [activePane, setActivePane] = useState(null);
    const [ isDevmode ] = useLocalStorage('application.isDevMode', false);

    const { getMetadata } = useMetadataDispatcher();

    const subscriptions = useRef<IDisposable[]>([]);
    const addSubscription = (subscription: IDisposable) => {
        subscriptions.current.push(subscription);
        //console.log('LOG: addSubscription', { subscriptions: subscriptions.current.length });
    };
    useEffect(() => {
        return () => {
            //console.log('LOG: clearing subscriptions: ' + subscriptions.current.length);
            const subsCopy = [...subscriptions.current];
            subsCopy.forEach(s => s.dispose());
        };
    }, []);

    /*
    const addExtralibIfMissing = (language: languages.typescript.LanguageServiceDefaults, content: string, filePath?: string) => {
        const extraLibs = language.getExtraLibs();
        if (!extraLibs[filePath]) {
            language.addExtraLib(content, filePath);
        }
    };
    */

    const template = useMemo(() => {
        if (wrapInTemplate !== true)
            return undefined;

        const { useAsyncDeclaration, functionName } = templateSettings;

        const importBlock = getImportBlock(availableConstants, fileName);

        const result = (code) => makeCodeTemplate`${importBlock}const ${functionName} = ${useAsyncDeclaration ? "async " : ""}() => {
${(c) => c.editable(code)}
};`;
        return result;
    }, [wrapInTemplate, fileName, availableConstants, templateSettings]);

    const addExtraLib = (monaco: Monaco, content: string, filePath?: string): IDisposable => {
        const uri = monaco.Uri.parse(filePath);
        let model = monaco.editor.getModel(uri);
        if (!model) {
            try {
                model = monaco.editor.createModel(content, "typescript", uri);
            } catch (error) {
                console.error('Failed to create model', { error, uri, content });
            }
        }

        // addExtralibIfMissing(monaco.languages.typescript.javascriptDefaults, content, filePath);
        // addExtralibIfMissing(monaco.languages.typescript.typescriptDefaults, content, filePath);
        return model;
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

    const navigateToModel = (fileUri?: UriComponents) => {
        if (!monacoInst.current || !editorRef.current || !fileUri)
            return;

        const model = monacoInst.current.Uri.isUri(fileUri)
            ? monacoInst.current.editor.getModel(fileUri)
            : undefined;
        editorRef.current.setModel(model);
    };

    const initEditor = (_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        const localProperties = fetchProperties(availableConstants?.properties ?? []);

        monaco.editor.registerEditorOpener({
            async openCodeEditor(_source: editor.ICodeEditor, resource: Uri, _selectionOrPosition?: IRange | IPosition) {
                if (isDevmode)
                    return false;
                
                navigateToModel(resource);
                return true;
            }
        });

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
                if (builderResult.content) {
                    const varsModel = addExtraLib(monaco, builderResult.content, fileNamesState.exposedVarsPath);
                    // dispose variables model
                    addSubscription(varsModel);
                }
            }).catch(error => {
                console.error("Failed to build exposed variables", error);
            });
        });
    };

    const onEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor;
        monacoInst.current = monaco;

        initDiagnosticsOptions(monaco);

        initEditor(editor, monaco);

        const createEditorSubscription = monaco.editor.onDidCreateEditor(newEditor => {
            if (isChildEditor(newEditor)) {
                const changeModelSubscription = newEditor.onDidChangeModel(() => {
                    const parent = newEditor.getParentEditor();
                    if (parent === editorRef.current) {
                        newEditor.updateOptions({
                            readOnly: true
                        });
                    }
                });
                addSubscription(changeModelSubscription);
            }
        });
        addSubscription(createEditorSubscription);

        if (template && availableConstants && asPropertiesArray(availableConstants.properties, []).length > 0)
            editor.trigger(null, 'editor.fold', { selectionLines: [1] });
    };

    const onExplorerClick = () => {
        setActivePane(activePane === "explorer" ? null : "explorer");
    };

    const onFileSelect = (fileUri?: UriComponents) => {
        navigateToModel(fileUri);
    };

    const getCurrentUri = (): UriComponents => {
        return editorRef.current?.getModel()?.uri;
    };

    const showTree = isDevmode && (!props.language || props.language === 'typescript' || props.language === 'javascript');
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
                        className={activePane === "explorer" ? "active" : "inactive"} />
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
                            onMount={onEditorMount}
                            template={template}
                        />
                    </CodeWrapper>
                </div>
            </div>
        )
        : (
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
                    onMount={onEditorMount}
                    template={template}
                />
            </div>
        );
};

export default CodeEditorClientSide;