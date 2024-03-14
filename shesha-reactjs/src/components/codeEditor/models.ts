import { EditorProps } from "@monaco-editor/react";
import { TemplateEvaluator } from "./utils";

export interface IHasCodeTemplate {
    template: TemplateEvaluator;
}

export interface ICodeEditorProps extends Omit<EditorProps, "onChange">  {
    onChange?: (newValue: string) => void;
}

export interface IGenericCodeEditorProps extends ICodeEditorProps, Partial<IHasCodeTemplate>  {
}