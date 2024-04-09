import { EditorProps } from "@monaco-editor/react";
import { TemplateEvaluator } from "./client-side/utils";
import { CodeLanguages } from "../formDesigner/components/codeEditor/types";
import { IObjectMetadata } from "@/interfaces";
import { CSSProperties } from "react";

export interface IHasCodeTemplate {
    template: TemplateEvaluator;
}

export interface IMonacoEditorProps extends Omit<EditorProps, "onChange"> {
    onChange?: (newValue: string) => void;
}

export interface IGenericCodeEditorProps extends IMonacoEditorProps, Partial<IHasCodeTemplate> {
}

export interface CodeTemplateSettings {
    useAsyncDeclaration?: boolean;
    functionName?: string;
}

export interface ICodeEditorProps {
    value?: string;
    onChange?: (newValue: string) => void;
    readOnly?: boolean;
    placeholder?: string;
    language: CodeLanguages;
    style?: CSSProperties;

    path?: string;
    fileName?: string;
    wrapInTemplate?: boolean;
    templateSettings?: CodeTemplateSettings;
    availableConstants?: IObjectMetadata;
}

export const CODE_TEMPLATE_DEFAULTS: CodeTemplateSettings = {
    functionName: "handler",
    useAsyncDeclaration: false,
};