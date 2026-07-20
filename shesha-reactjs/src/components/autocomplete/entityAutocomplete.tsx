import { ReactNode, useCallback } from 'react';
import { IAutocompleteProps, ISelectOption } from './models';
import { useNestedPropertyMetadatAccessor } from '@/providers';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { AutocompleteWithRepository, AutocompleteWithRepositoryProps } from './autocompleteWithRepository';
import React from 'react';
import { useBackendRepository } from '@/providers/dataTable/repository/backendRepository';
import { rowToOption } from './renderUtils';
import { isNonEmptyArray } from '@/utils/array';
import { isDefined } from '@/utils/nullables';
import { unsafeGetValueByPropertyName } from '@/utils/object';
import { isEqual, uniqWith } from 'lodash';
import { Typography } from 'antd';
import { PropertyRenderer } from '../propertyRenderer';

export type EntityAutocompleteProps<TValue = unknown> = Omit<IAutocompleteProps<TValue>, 'dataSourceType'>;

export const EntityAutocomplete = <TValue = unknown>(props: EntityAutocompleteProps<TValue>): ReactNode => {
  const {
    fields,
    entityType = "",
    dataSourceUrl,
    grouping,
  } = props;
  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(props.entityType);
  const permanentFilter = useFormEvaluatedFilter({ filter: props.filter, metadataAccessor: propertyMetadataAccessor });

  // make repository
  const repository = useBackendRepository({ entityType, getListUrl: dataSourceUrl ?? "" });

  const renderGroupTitle = useCallback((value: unknown, propertyName: string): React.JSX.Element => {
    if (!isDefined(value))
      return <Typography.Text type="secondary">(empty)</Typography.Text>;

    return <PropertyRenderer value={value} entityType={props.entityType} propertyName={propertyName} />;
  }, [props.entityType]);

  const itemsToOptions: AutocompleteWithRepositoryProps<TValue>["itemsToOptions"] = (items, outcomeValueFunc, keyValueFunc, displayValueFunc): ISelectOption[] => {
    if (isDefined(grouping) && isNonEmptyArray(items)) {
      const groupProp = grouping.propertyName;
      const groups = uniqWith(items.map((row) => unsafeGetValueByPropertyName(row, groupProp)), (a, b) => isEqual(a, b));

      const res = groups.map<ISelectOption>((group, gindex) => {
        const groupTitle = renderGroupTitle(group, groupProp);
        const nestedRows = items.filter((x) => isEqual(unsafeGetValueByPropertyName(x, groupProp), group));

        return {
          key: gindex,
          label: groupTitle,
          type: 'group',
          options: nestedRows.map((row, index) => rowToOption(row, outcomeValueFunc, keyValueFunc, displayValueFunc, `${gindex}:${index}`)),
          value: null,
          data: null,
        } satisfies ISelectOption;
      });

      return res;
    } else
      return items.map<ISelectOption>((row, index) => rowToOption(row, outcomeValueFunc, keyValueFunc, displayValueFunc, index));
  };

  return (
    <AutocompleteWithRepository<TValue>
      dataSourceType="entitiesList"
      repository={repository}
      keyPropName={props.keyPropName ?? "id"}
      displayPropName={props.displayPropName ?? "_displayName"}
      fields={fields}

      value={props.value}
      onChange={props.onChange}
      mode={props.mode}
      readOnly={props.readOnly}

      permanentFilter={permanentFilter}
      grouping={props.grouping}
      sorting={props.sorting}
      itemsToOptions={itemsToOptions}

      outcomeValueFunc={props.outcomeValueFunc}
      filterKeysFunc={props.filterKeysFunc}
      displayValueFunc={props.displayValueFunc}
      keyValueFunc={props.keyValueFunc}

      quickviewEnabled={props.quickviewEnabled}
      quickviewFormPath={props.quickviewFormPath}
      quickviewDisplayPropertyName={props.quickviewDisplayPropertyName}
      quickviewGetEntityUrl={props.quickviewGetEntityUrl}
      quickviewWidth={props.quickviewWidth}

      placeholder={props.placeholder}
      size={props.size}
    />
  );
};
