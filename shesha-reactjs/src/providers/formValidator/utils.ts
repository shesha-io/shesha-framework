import { FormRule } from "antd";
import { getValidationRules, IConfigurableFormComponent, IFormValidationRulesOptions, isDefined, useShaFormInstance } from "../..";
import { FormDesignerComponentGetter, useFormDesignerComponentGetter } from "../form/hooks";
import { useMemo } from "react";

export const getComponentValidationRules = (model: IConfigurableFormComponent, componentGetter: FormDesignerComponentGetter, options?: IFormValidationRulesOptions): FormRule[] => {
  const toolboxComponent = componentGetter(model.type);
  if (toolboxComponent === undefined)
    return [];

  const standardValidation = getValidationRules(model, options) as FormRule[];
  if (!isDefined(toolboxComponent.getExtraValidationRules))
    return standardValidation;

  const extraValidation = toolboxComponent.getExtraValidationRules(model);
  return [...standardValidation, ...extraValidation];
};

export const useComponentValidationRules = (model: IConfigurableFormComponent): FormRule[] => {
  const shaForm = useShaFormInstance();
  const getFormData = shaForm.getPublicFormApi().getFormData;
  const componentGetter = useFormDesignerComponentGetter();

  const rules = useMemo<FormRule[]>(() => {
    return getComponentValidationRules(model, componentGetter, { getFormData });
  }, [getFormData, model, componentGetter]);

  return rules;
};
