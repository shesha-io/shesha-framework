
import { isNonEmptyArray } from "@/utils/array";
import { IFormValidationRulesOptions, ValidatorFunc } from "../..";
import { getPropertySettingsFromValue } from "../_settings/utils/utils";
import { editorRegistry } from "../inputComponent/wrappers";
import { ISettingsInputProps, isSettingsInputProps } from "../settingsInput/interfaces";
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { ComponentValidationError } from "@/utils/validation";

export const getSettingsInputValidator = <TValues = unknown>(model: ISettingsInputProps, context?: IFormValidationRulesOptions<TValues>): ValidatorFunc => {
  const { jsSetting } = model;
  const isRequired = model.validate?.required === true;
  const path = context?.path ?? [];

  const validator: ValidatorFunc = async (_rule, value, callback): Promise<void> => {
    const propertySetting = getPropertySettingsFromValue(value);

    const canBeSetViaCode = jsSetting === true || jsSetting === 'lazy';
    const setViaCode = canBeSetViaCode && propertySetting._mode === 'code';

    const allErrors: Error[] = [];
    if (setViaCode) {
      // validate code
      if (isRequired && isNullOrWhiteSpace(propertySetting._code))
        allErrors.push(new ComponentValidationError('Code is required.', path, model.propertyName, model.label));
    } else {
      // validate static value
      const isEmpty = typeof (propertySetting._value) === 'string'
        ? isNullOrWhiteSpace(propertySetting._value)
        : !isDefined(propertySetting._value);
      if (isRequired && isEmpty) {
        allErrors.push(new ComponentValidationError('Value is required.', path, model.propertyName, model.label));
      }
      if (!isNullOrWhiteSpace(model.type)) {
        const settingsComponent = isDefined(context?.validator.settingComponentGetter)
          ? context.validator.settingComponentGetter(model.type)
          : undefined;
        if (isDefined(settingsComponent)) {
          // TODO: implement validation of custom settings components
        } else {
          const unwrappedType = isSettingsInputProps(model) ? model.inputType : model.type;
          const editor = editorRegistry[unwrappedType];
          if (isDefined(editor.validate) && isDefined(context)) {
            try {
              const errors = await editor.validate(model, value, context, callback);
              allErrors.push(...errors);
            } catch (error) {
              console.error("Validation failed", error);
            }
          }
        }
      }
    }
    if (isNonEmptyArray(allErrors)) {
      throw allErrors;
    }
  };
  return validator;
};
