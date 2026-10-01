import { ValidationNodeRef } from "@/interfaces";
import { IFormValidationRulesOptions } from "../models";

export const appendValidationPath = <TValues = unknown>(context: IFormValidationRulesOptions<TValues>, nextRef: ValidationNodeRef): IFormValidationRulesOptions<TValues> => {
  return {
    ...context,
    path: [...context.path, nextRef],
  };
};
