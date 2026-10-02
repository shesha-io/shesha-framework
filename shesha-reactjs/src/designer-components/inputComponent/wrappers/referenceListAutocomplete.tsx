import { IReferenceListAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import ReferenceListAutocomplete from '@/components/referenceListAutocomplete';
import { isDefined } from '@/utils';
import { ValidatableComponentUnwrapped } from './models';
import { validateReferenceListReference } from '@/designer-components/configurableItemAutocomplete/utils';

export const ReferenceListAutocompleteWrapper: ValidatableComponentUnwrapped<IReferenceListAutocompleteSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size } = props;
  return (
    <ReferenceListAutocomplete
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      size={size}
    />
  );
};

ReferenceListAutocompleteWrapper.validate = async (_model, value, context): Promise<Error[]> => {
  const typedValue = value as IReferenceListAutocompleteSettingsInputProps["value"];
  return isDefined(typedValue)
    ? await validateReferenceListReference(typedValue, context)
    : [];
};
