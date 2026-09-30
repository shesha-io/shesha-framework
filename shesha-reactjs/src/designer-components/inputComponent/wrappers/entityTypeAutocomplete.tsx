import { IEntityTypeAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import EntityTypeAutocomplete from '@/components/configurableItemAutocomplete/entityTypeAutocomplete';
import { ValidatableComponentUnwrapped } from './models';
import { validateEntityReference } from '@/designer-components/configurableItemAutocomplete/utils';
import { isDefined } from '@/utils';

export const EntityTypeAutocompleteWrapper: ValidatableComponentUnwrapped<IEntityTypeAutocompleteSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size, entityAutocompleteType } = props;
  return (
    <EntityTypeAutocomplete
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      type={entityAutocompleteType}
      size={size}
    />
  );
};

EntityTypeAutocompleteWrapper.validate = async (_model, value, context): Promise<Error[]> => {
  const typedValue = value as IEntityTypeAutocompleteSettingsInputProps["value"];
  return isDefined(typedValue)
    ? await validateEntityReference(typedValue, context)
    : [];
};
