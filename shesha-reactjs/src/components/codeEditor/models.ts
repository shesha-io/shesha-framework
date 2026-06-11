import { EditorProps } from "@monaco-editor/react";
import { TemplateEvaluator } from "./client-side/utils";
import { CodeLanguages } from "@/designer-components/codeEditor/types";
import { IObjectMetadata } from "@/interfaces";
import { CSSProperties } from "react";
import { IArrayMetadata, IEntityMetadata, IMetadata } from "@/interfaces/metadata";
import { Environment } from "@/publicJsApis/metadataBuilder";
import { isDefined } from "@/utils/nullables";

export interface IHasCodeTemplate {
  template: TemplateEvaluator | undefined;
}

export interface IMonacoEditorProps extends Omit<EditorProps, "onChange"> {
  onChange: ((newValue: string | null) => void) | undefined;
}

export interface IGenericCodeEditorProps extends IMonacoEditorProps, Partial<IHasCodeTemplate> {
}

export interface CodeTemplateSettings {
  useAsyncDeclaration?: boolean | undefined;
  functionName?: string | undefined;
}

export type ResultType = IMetadata | IObjectMetadata;

export const isObjectType = (value: ResultType | undefined): value is IObjectMetadata => {
  return isDefined(value) && value.dataType === "object";
};

export const isArrayType = (value: ResultType | undefined): value is IArrayMetadata => {
  return isDefined(value) && value.dataType === "array";
};

export const isEntityType = (value: ResultType | undefined): value is IEntityMetadata => {
  return isDefined(value) && value.dataType === "entity";
};

export interface ICodeEditorProps {
  value?: string | null;
  onChange?: (newValue: string | null) => void;
  readOnly?: boolean | undefined;
  placeholder?: string | undefined;
  language: CodeLanguages;
  style?: CSSProperties | undefined;

  path?: string | undefined;
  fileName?: string | undefined;
  wrapInTemplate?: boolean | undefined;
  templateSettings?: CodeTemplateSettings | undefined;
  availableConstants?: IObjectMetadata | (() => Promise<IObjectMetadata>) | undefined;
  resultType?: ResultType | undefined;
  environment?: Environment | undefined;
}

export const CODE_TEMPLATE_DEFAULTS: CodeTemplateSettings = {
  functionName: "handler",
  useAsyncDeclaration: false,
};
