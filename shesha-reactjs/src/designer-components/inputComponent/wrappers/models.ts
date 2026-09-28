import { IFormValidationRulesOptions, UnwrapCodeEvaluators } from "@/providers";
import { FC } from "react";
import { ValidationErrorCallback } from "../../..";
import { ISettingsInputProps } from "@/designer-components/settingsInput/interfaces";

export type ValidatableComponent<Props extends object = object> = FC<Props> & {
  validate?: <TValues = unknown>(model: ISettingsInputProps, value: unknown, context: IFormValidationRulesOptions<TValues>, callback: ValidationErrorCallback) => Promise<Error[]>;
};

export type ValidatableComponentUnwrapped<Props extends object = object> = ValidatableComponent<UnwrapCodeEvaluators<Props>>;
