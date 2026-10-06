import { IFormAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { FormAutocomplete } from '@/components/configurableItemAutocomplete/formAutocomplete';
import { ValidatableComponentUnwrapped } from './models';
import { isDefined } from '@/utils';
import { validateFormReference } from '@/designer-components/configurableItemAutocomplete/utils';

export const FormAutocompleteWrapper: ValidatableComponentUnwrapped<IFormAutocompleteSettingsInputProps> = (props) => {
  const { value, onChange, readOnly = false, size } = props;
  return (
    <FormAutocomplete
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      size={size ?? 'small'}
      mode="single"
    />
  );
};

FormAutocompleteWrapper.validate = async (_model, value, context): Promise<Error[]> => {
  const typedValue = value as IFormAutocompleteSettingsInputProps["value"];
  return isDefined(typedValue)
    ? await validateFormReference(typedValue, context)
    : [];
};
