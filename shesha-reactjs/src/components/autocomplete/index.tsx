import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import React, { ReactNode } from 'react';
import { AutocompleteDataSourceType, IAutocompleteProps, ISelectOption } from './models';
import { EntityAutocomplete } from './entityAutocomplete';
import { UrlAutocomplete } from './urlAutocomplete';

const buildFieldsToFetch = <TValue = unknown>({ fields, keyPropName, displayPropName, dataSourceType, grouping }: IAutocompleteProps<TValue>): string[] => {
  const fieldsSet = new Set<string | undefined>(fields ?? []);
  fieldsSet.add(displayPropName);
  fieldsSet.add(keyPropName);

  if (dataSourceType === 'entitiesList') {
    fieldsSet.add('id');
    fieldsSet.add('_className');
    fieldsSet.add('_displayName');
  }
  if (isDefined(grouping))
    fieldsSet.add(grouping.propertyName);

  const result = Array.from(fieldsSet).filter(isNotNullOrWhiteSpace);

  return result;
};

const Autocomplete = <TValue = unknown>(props: IAutocompleteProps<TValue>): ReactNode => {
  const fields = buildFieldsToFetch(props);

  return props.dataSourceType === 'entitiesList'
    ? (
      <EntityAutocomplete
        entityType={props.entityType ?? ""}
        fields={fields}
        dataSourceUrl={props.dataSourceUrl}
        sorting={props.sorting}
        grouping={props.grouping}
        filter={props.filter}

        displayPropName={props.displayPropName}
        onChange={props.onChange}
        value={props.value}
        mode={props.mode}
        readOnly={props.readOnly}
        outcomeValueFunc={props.outcomeValueFunc}
        allowClear={props.allowClear}
        allowFreeText={props.allowFreeText}
      />
    )
    : (
      <UrlAutocomplete
        dataSourceUrl={props.dataSourceUrl}
        queryParams={props.queryParams}

        fields={fields}

        displayPropName={props.displayPropName}
        keyPropName={props.keyPropName}
        onChange={props.onChange}
        value={props.value}
        mode={props.mode}
        readOnly={props.readOnly}
        outcomeValueFunc={props.outcomeValueFunc}
        allowClear={props.allowClear}
        allowFreeText={props.allowFreeText}
      />
    );
};

/**
 * @deprecated The method should not be used
 */
export const EntityDtoAutocomplete = (props: IAutocompleteProps): React.JSX.Element => {
  return (
    <Autocomplete {...props} />
  );
};

/**
 * @deprecated The method should not be used
 */
export const RawAutocomplete = (props: IAutocompleteProps<string>): React.JSX.Element => {
  return (
    <Autocomplete<string>
      {...props}
      displayPropName={!isNullOrWhiteSpace(props.displayPropName) ? props.displayPropName : (props.dataSourceType === 'url' ? 'displayText' : '_displayName')}
      keyPropName={!isNullOrWhiteSpace(props.keyPropName) ? props.keyPropName : (props.dataSourceType === 'url' ? 'value' : 'id')}
      mode="single"
    />
  );
};

type InternalAutocompleteType = typeof Autocomplete;
interface IInternalAutocompleteInterface extends InternalAutocompleteType {
  /**
   * @deprecated The method should not be used, please use Autocomplete
   */
  Raw: typeof RawAutocomplete;
  /**
   * @deprecated The method should not be used, please use Autocomplete
   */
  EntityDto: typeof EntityDtoAutocomplete;
}


const AutocompleteInterface = Autocomplete as IInternalAutocompleteInterface;
AutocompleteInterface.Raw = RawAutocomplete;
AutocompleteInterface.EntityDto = EntityDtoAutocomplete;

export {
  AutocompleteInterface as Autocomplete, type AutocompleteDataSourceType, type IAutocompleteProps,
  type ISelectOption,
};

