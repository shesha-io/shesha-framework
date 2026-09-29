import { useFormBuilderFactory } from '@/form-factory/hooks';
import { ComplexValidationRules, IConfigurableFormComponent } from "@/interfaces";
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { IFormValidationRulesOptions } from "@/providers/form/models";
import { useShaFormInstance } from "@/providers/form/providers/shaFormProvider";
import { getValidationRules, useAvailableConstantsDataNoRefresh } from "@/providers/form/utils";
import { useSettingsComponents } from '@/providers/sheshaApplication/hooks/useSettingsComponents';
import { isDefined } from "@/utils";
import { FormRule } from "antd";
import { useMemo } from "react";
import { FormValidator, IFormValidator } from "../formDesigner/formValidator";

export const getComponentValidationRules = (model: IConfigurableFormComponent, options: IFormValidationRulesOptions): FormRule[] => {
  const { componentGetter } = options.validator;
  const toolboxComponent = componentGetter(model.type);
  if (toolboxComponent === undefined)
    return [];
  const { useStandardValidation = true } = toolboxComponent;

  const standardValidation = useStandardValidation
    ? getValidationRules(model, options) as FormRule[]
    : [];
  if (!isDefined(toolboxComponent.getExtraValidationRules))
    return standardValidation;

  const extraValidation = toolboxComponent.getExtraValidationRules(model, options);
  const localValidation = Array.isArray(extraValidation) ? extraValidation : [];
  return [...standardValidation, ...localValidation];
};

export const getComponentComplexValidationRules = (model: IConfigurableFormComponent, options: IFormValidationRulesOptions): ComplexValidationRules | undefined => {
  const { componentGetter } = options.validator;
  const toolboxComponent = componentGetter(model.type);
  if (toolboxComponent === undefined || !isDefined(toolboxComponent.getExtraValidationRules))
    return undefined;

  const extraValidation = toolboxComponent.getExtraValidationRules(model, options);
  return !Array.isArray(extraValidation)
    ? extraValidation
    : undefined;
};

export const useFormValidator = (): IFormValidator => {
  const toolboxComponents = useFormDesignerComponents();
  const settingsComponents = useSettingsComponents();
  const { getConfigurableActionOrNull } = useConfigurableActionDispatcher();
  const fbf = useFormBuilderFactory();
  const allData = useAvailableConstantsDataNoRefresh();

  const validator = useMemo<IFormValidator>(() => {
    return new FormValidator({
      // componentGetter: componentGetter,
      toolboxComponents: toolboxComponents,
      settingsComponentGetter: (type) => settingsComponents.find((c) => c.type === type),
      formBuilderFactory: fbf,
      getConfigurableActionOrNull: getConfigurableActionOrNull,
      appContext: allData,
    });
  }, [allData, fbf, getConfigurableActionOrNull, settingsComponents, toolboxComponents]);
  return validator;
};


export const useComponentValidationRules = (model: IConfigurableFormComponent): FormRule[] => {
  const shaForm = useShaFormInstance<IConfigurableFormComponent>();
  const getFormData = shaForm.getPublicFormApi().getFormData;
  const allData = useAvailableConstantsDataNoRefresh();

  const validator = useFormValidator();

  const rules = useMemo<FormRule[]>(() => {
    return getComponentValidationRules(model, {
      getFormData,
      validator,
      contextConfigurableActionGetter: () => null,
      componentId: model.id,
      appContext: allData,
      path: [],
    });
  }, [model, getFormData, validator, allData]);

  return rules;
};
