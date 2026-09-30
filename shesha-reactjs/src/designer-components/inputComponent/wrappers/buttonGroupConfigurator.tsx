import { IButtonGroupConfiguratorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { ButtonGroupConfigurator } from '@/components/buttonGroupConfigurator';
import { ValidatableComponentUnwrapped } from './models';
import { isDefined } from '@/utils';
import { getItemSettings } from '@/components/buttonGroupConfigurator/itemSettings';
import { getGroupSettings } from '@/components/buttonGroupConfigurator/itemGroupSettings';
import { appendValidationPath } from '@/providers/form/utils/validation';
import { unwrapErrors } from '@/utils/validation';

export const ButtonGroupConfiguratorWrapper: ValidatableComponentUnwrapped<IButtonGroupConfiguratorSettingsInputProps> = (props) => {
  const { value, readOnly = false, size, onChange, buttonText, buttonTextReadOnly, title } = props;
  return (
    <ButtonGroupConfigurator
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      size={size}
      buttonText={buttonText}
      buttonTextReadOnly={buttonTextReadOnly}
      title={title}
    />
  );
};

ButtonGroupConfiguratorWrapper.validate = async (_model, value, context): Promise<Error[]> => {
  const typedValue = value as IButtonGroupConfiguratorSettingsInputProps["value"];
  if (isDefined(typedValue)) {
    const allErrors: Error[] = [];

    for (const [index, item] of typedValue.entries()) {
      const markup = item.itemType === 'item'
        ? getItemSettings({ fbf: context.validator.formBuilderFactory })
        : item.itemType === 'group'
          ? getGroupSettings({ fbf: context.validator.formBuilderFactory })
          : [];

      const itemContext = appendValidationPath(context, {
        kind: 'setting',
        id: item.id,
        label: typeof (item.label) === "string" ? item.label : "",
        name: item.name ?? "",
        index: index,
      });
      const errors = await context.validator.validateModelAsync(item, markup, {
        ...itemContext,
        formData: item,
        getFormData: () => item,
      });
      const unwrapped = unwrapErrors(errors, itemContext.path);

      allErrors.push(...unwrapped);
    }
    return allErrors;
  }

  return [];
};
