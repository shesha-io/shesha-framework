import { EditorProps } from "@monaco-editor/react";
import { TemplateEvaluator } from "./utils";
import { CodeLanguages } from "../formDesigner/components/codeEditor/types";
import { IObjectMetadata } from "@/interfaces";

export interface IHasCodeTemplate {
    template: TemplateEvaluator;
}

export interface IMonacoEditorProps extends Omit<EditorProps, "onChange"> {
    onChange?: (newValue: string) => void;
}

export interface IGenericCodeEditorProps extends IMonacoEditorProps, Partial<IHasCodeTemplate> {
}

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