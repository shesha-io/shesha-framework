import { EditorProps } from "@monaco-editor/react";
import { TemplateEvaluator } from "./client-side/utils";
import { CodeLanguages } from "@/designer-components/codeEditor/types";
import { IObjectMetadata } from "@/interfaces";
import { CSSProperties } from "react";
import { IArrayMetadata, IEntityMetadata, IMetadata } from "@/interfaces/metadata";
import { Environment } from "@/publicJsApis/metadataBuilder";

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

export type ResultType = IMetadata | IObjectMetadata;

export const isObjectType = (value: ResultType): value is IObjectMetadata => {
  return value && value.dataType === "object";
};

export const isArrayType = (value: ResultType): value is IArrayMetadata => {
  return value && value.dataType === "array";
};

export const isEntityType = (value: ResultType): value is IEntityMetadata => {
  return value && value.dataType === "entity";
};

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
  resultType?: ResultType;
  environment?: Environment;
}

export const CODE_TEMPLATE_DEFAULTS: CodeTemplateSettings = {
  functionName: "handler",
  useAsyncDeclaration: false,
};
