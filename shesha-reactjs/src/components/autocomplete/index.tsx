import { isPropertySettings } from '@/designer-components/_settings/utils/utils';
import { useActualContextData, useDeepCompareMemo } from '@/hooks';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { DataTableProvider, useDataTableStore, useNestedPropertyMetadatAccessor, useShaFormInstanceOrUndefined } from '@/providers';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { isDataColumn } from '@/providers/dataTable/interfaces';
import { evaluateString } from '@/providers/form/utils';
import { getUrlKeyParam } from '@/utils';
import { getDisplayNameOrUndefined, getStringPropertyOrUndefined, getValueByPropertyName, unsafeGetValueByPropertyName } from '@/utils/object';
import { Select, Spin, Typography, type GetRef } from 'antd';
import { isEqual, uniqWith } from 'lodash';
import QueryString from 'qs';
import React, { ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import ReadOnlyDisplayFormItem from '../readOnlyDisplayFormItem';
import { ValueRenderer } from '../valueRenderer';
import { AutocompleteDataSourceType, DisplayValueFunc, FilterSelectedFunc, IAutocompleteBaseProps, IAutocompleteProps, ISelectOption, KayValueFunc, OutcomeValueFunc, getColumns } from './models';
import { useStyles } from './style';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';
import { createOutcomeValueFunc } from './utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';
import { getClassNameOrUndefined } from '@/utils/entity';
import { IAnyObject } from '@/interfaces';

type SelectRef = GetRef<typeof Select>; // Resolves to BaseSelectRef

const getNormalizedValues = (value: unknown): unknown[] => {
  const values = Array.isArray(value) ? value : [value];
  return values.filter((v) => v != null);
};

const AutocompleteInner = <TValue = unknown>(props: IAutocompleteBaseProps<TValue>): ReactNode => {
  const { allowClear = true, style = {} } = props;

  const { styles } = useStyles({ style });

  // sources
  const source = useDataTableStore();
  const selectRef = useRef<SelectRef>(null);

  // init props
  // --- For backward compatibility
  const keyPropName = props.keyPropName || (props.dataSourceType === 'entitiesList' ? 'id' : 'value');
  const displayPropName = props.displayPropName || (props.dataSourceType === 'entitiesList' ? '_displayName' : 'displayText');
  // ---
  const keyValueFunc: KayValueFunc = useMemo(() => props.keyValueFunc ??
    ((value: unknown) => String(getValueByPropertyName(value as Record<string, unknown>, keyPropName) ?? value)), [props.keyValueFunc, keyPropName]);

  const filterKeysFunc: FilterSelectedFunc = useMemo(() => props.filterKeysFunc ??
    ((value: unknown) => (
      { in: [
        { var: `${keyPropName}` },
        Array.isArray(value)
          ? value.map((x) => keyValueFunc(x))
          : [keyValueFunc(value)],
      ],
      })),
  [props.filterKeysFunc, keyPropName, keyValueFunc]);

  const filterNotKeysFunc: FilterSelectedFunc = useMemo(() => (value) => {
    const filter = filterKeysFunc(value);
    return { "!": filter };
  }, [filterKeysFunc]);

  const displayValueFunc: DisplayValueFunc = useMemo(() => props.displayValueFunc ??
    ((value: unknown) => (Boolean(value) ? String(getValueByPropertyName(value as Record<string, unknown>, displayPropName) ?? value?.toString()) : '')), [props.displayValueFunc, displayPropName]);
  const outcomeValueFunc: OutcomeValueFunc = useMemo(() => createOutcomeValueFunc({
    providedFunc: props.outcomeValueFunc,
    dataSourceType: props.dataSourceType,
    rawKeyPropName: props.keyPropName,
    displayPropName,
    keyPropName,
  }), [props.outcomeValueFunc, props.dataSourceType, props.keyPropName, displayPropName, keyPropName]);

  // register columns
  useDeepCompareEffect(() => {
    source.registerConfigurableColumns(props.uid, getColumns(props.fields));
  }, [props.fields]);

  // init state
  const [open, setOpen] = useState<boolean>(false);
  const [loadingValues, setLoadingValues] = useState<boolean>(false);
  const [loadingIndicator, setLoadingIndicator] = useState<boolean>(false);
  const selected = useRef<Array<unknown>>([]);
  const lastSearchText = useRef<string>('');
  const [autocompleteText, setAutocompleteText] = useState<string>("");

  const setSelected = (value: unknown): void => {
    // Bring the value to Array form and create a copy of elements if they are objects to avoid side effects
    // Changes Value may affect to Selected, as they may refer to the same object.
    selected.current = getNormalizedValues(value).map((x) => typeof x === 'object' ? { ...x } : x);
  };

  const keys = useMemo(() => {
    const res = props.value
      ? Array.isArray(props.value)
        ? props.value.map((x) => keyValueFunc(x))
        : [keyValueFunc(props.value)]
      : [];
    return res;
  }, [keyValueFunc, props.value]);

  // reset loading state on error
  useEffect(() => {
    if (source.hasFetchTableDataError)
      setLoadingValues(false);
  }, [source.hasFetchTableDataError]);

  // Complete loading when data source finishes loading (success or failure)
  useEffect(() => {
    if (loadingValues && !source.isFetchingTableData) {
      setLoadingValues(false);
      setLoadingIndicator(false);

      // Use loaded data or fallback to original values
      if (isDefined(source.tableData) && isNonEmptyArray(source.tableData)) {
        const foundValues = keys.map((x) => source.tableData.find((y) => keyValueFunc(outcomeValueFunc(y)) === x))
          .filter((v) => v != null);
        if (foundValues.length > 0) {
          setSelected(foundValues);
        } else {
          // Use original values as fallback
          setSelected(props.value);
        }
      } else {
        // Use original values as fallback
        setSelected(props.value);
      }
    }
  }, [source.isFetchingTableData, keys, props.value, loadingValues, source.tableData, keyValueFunc, outcomeValueFunc]);

  // update local store of values details
  useDeepCompareEffect(() => {
    if ((props.dataSourceType === 'entitiesList' && !isEntityTypeIdEmpty(props.entityType)) ||
      (props.dataSourceType === 'url' && props.dataSourceUrl)
    ) {
      if (keys.length) {
        const normalizedValue: unknown = isDefined(props.value) && Array.isArray(props.value)
          ? props.value[0]
          : props.value;
        const displayNameValue = normalizedValue != null && typeof normalizedValue === 'object'
          ? (normalizedValue as Record<string, unknown>)[displayPropName]
          : undefined;
        const hasDisplayName = displayNameValue !== undefined && displayNameValue !== null;

        props.disableRefresh?.(false);
        const allExist = keys.every((x) => selected.current?.find((y) => keyValueFunc(outcomeValueFunc(y), {}) === x));

        // Attempt to load if we don't have all the values resolved from the data source
        if (!loadingValues && !allExist) {
          setLoadingValues(true);
          const selectedFilter = filterKeysFunc(props.value);

          // Check if the source is ready for filtering
          if (isDefined(source.setPredefinedFilters)) {
            try {
              source.setPredefinedFilters([{
                id: 'selectedFilter',
                name: 'selectedFilter',
                expression: selectedFilter,
                sortOrder: 0,
              }]);
            } catch (error) {
              console.error('Failed to set predefined filters:', error);
              setLoadingValues(false);
              setLoadingIndicator(false);
              // Fallback to using existing values
              if (props.value) {
                setSelected(props.value);
              }
            }
          } else {
            // Data source not ready - reset loading and use existing values
            setLoadingValues(false);
            setLoadingIndicator(false);
            if (props.value) {
              setSelected(props.value);
            }
          }
        }
        if (props.dataSourceType === 'entitiesList' && hasDisplayName && !loadingValues && !selected.current?.length) {
          setLoadingIndicator(false);
          const values = getNormalizedValues(props.value);
          setSelected(keys.map((x) => values.find((y) => keyValueFunc(outcomeValueFunc(y)) === x)));
        }
      } else {
        setLoadingIndicator(false);
        setLoadingValues(false);
      }
    }
  }, [props.value, props.dataSourceType, props.entityType, props.dataSourceUrl, props.readOnly]);

  useEffect(() => {
    if (open) {
      const selectedValue = isNonEmptyArray(selected.current)
        ? selected.current.map((s) => outcomeValueFunc(s))
        : undefined;
      const selectedFilter = selectedValue ? filterNotKeysFunc(selectedValue) : undefined;
      source.setPredefinedFilters([{
        id: 'selectedFilter',
        name: 'selectedFilter',
        expression: selectedFilter,
        sortOrder: 0,
      }]);
      source.performQuickSearch('');
    }
  }, [filterNotKeysFunc, open, outcomeValueFunc, source]);

  const onDropdownVisibleChange = (isOpen: boolean): void => {
    setOpen(isOpen);
    props.disableRefresh?.(false);
  };

  const debouncedSearch = useDebouncedCallback<(searchText: string, force?: boolean) => void>(
    (searchText, force = false) => {
      if (props.readOnly || (!force && lastSearchText.current === searchText))
        return;
      source.performQuickSearch(searchText);
      lastSearchText.current = searchText;
    }, 200);

  const handleSearch = (searchText: string): void => {
    if (props.allowFreeText)
      setAutocompleteText(searchText);
    debouncedSearch(searchText);
    if (props.onSearch)
      props.onSearch(searchText);
  };

  const handleSelect = (): void => {
    if (selectRef.current)
      selectRef.current.blur();
  };

  const handleChange = (_value: unknown, option: unknown): void => {
    setSelected(Boolean(option)
      ? Array.isArray(option)
        ? (option as ISelectOption[]).map((o) => o.data)
        : [(option as ISelectOption).data]
      : []);

    const selectedValue: TValue | TValue[] | null = Boolean(option)
      ? Array.isArray(option)
        ? (option as ISelectOption[]).map<TValue>((o) => outcomeValueFunc(o.data) as TValue)
        : outcomeValueFunc((option as ISelectOption).data) as TValue
      : null;

    const selectedFilter = selectedValue && (!Array.isArray(selectedValue) || selectedValue.length)
      ? filterNotKeysFunc(selectedValue)
      : undefined;
    source.setPredefinedFilters([{
      id: 'selectedFilter',
      name: 'selectedFilter',
      expression: selectedFilter,
      sortOrder: 0,
    }]);
    debouncedSearch('');

    if (!Boolean(props.onChange))
      return;
    if (props.mode === 'multiple')
      props.onChange?.(Array.isArray(selectedValue) ? selectedValue : selectedValue ? [selectedValue] : []);
    else
      props.onChange?.(selectedValue as TValue);
  };

  const renderOption = (row: unknown, index: React.Key): React.JSX.Element => {
    const value = outcomeValueFunc(row);
    const key = keyValueFunc(value);
    const rawLabel = displayValueFunc(row);
    const label = isNullOrWhiteSpace(rawLabel) || typeof rawLabel === 'object' ? '' : String(rawLabel);
    return (
      <Select.Option value={key} key={index} data={row} title={label}>
        <span dangerouslySetInnerHTML={{ __html: label }} />
      </Select.Option>
    );
  };

  const renderGroupTitle = (value: unknown, propertyName: string): React.JSX.Element => {
    if (value === null || value === undefined)
      return <Typography.Text type="secondary">(empty)</Typography.Text>;
    const column = source.groupingColumns.find((c) => isDataColumn(c) && c.propertyName === propertyName);
    const propertyMeta = isDataColumn(column) ? column.metadata : undefined;
    return <ValueRenderer value={value} meta={propertyMeta} />;
  };

  const selectedValuesList = useMemo(() => {
    return selected.current?.map((row, index) => renderOption(row, 10 + index));
    // TODO V1: review dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.current]);

  const freeTextValuesList = useMemo(() => {
    return props.allowFreeText && autocompleteText && source.tableData.findIndex((x) => getStringPropertyOrUndefined(x, displayPropName)?.toLowerCase() === autocompleteText.toLowerCase()) === -1
      ? renderOption({ [keyPropName]: autocompleteText, [displayPropName]: autocompleteText }, 'freeText')
      : null;
  // TODO V1: review dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autocompleteText, source.tableData]);

  const list = useMemo(() => {
    const list = source.tableData
      // filter already selected items to avoid duplicate keys in options
      .filter((x) => !keys.find((y) => isEqual(y, keyValueFunc(outcomeValueFunc(x)))));

    // render grouped data
    if (props.grouping && source.tableData.length) {
      const groupProp = props.grouping.propertyName;
      const groups = uniqWith(source.tableData.map((row) => unsafeGetValueByPropertyName(row, groupProp)), (a, b) => isEqual(a, b));
      const res = (
        <>
          {groups.map((group, gindex) => {
            const groupTitle = renderGroupTitle(group, groupProp);
            return (
              <Select.OptGroup key={gindex} label={groupTitle} title={groupTitle}>
                {list.filter((x) => isEqual(unsafeGetValueByPropertyName(x, groupProp), group)).map((row, index) => renderOption(row, gindex * 1000000 + index))}
              </Select.OptGroup>
            );
          })}
        </>
      );
      return res;
    }

    return (
      <>
        {list.map((row, index) => renderOption(row, index))}
        {props.dataSourceType === 'entitiesList' && isDefined(source.totalRows) && source.totalRows > 7 &&
          <Select.Option value="total" key="total" disabled={true}>{`Total found: ${source.totalRows} ...`}</Select.Option>}
      </>
    );
    // TODO V1: review dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.current, source.tableData, props.grouping]);

  // Show loading when actively fetching data
  const shouldShowLoading = (loadingIndicator || (!props.readOnly && loadingValues));

  if (shouldShowLoading) {
    return (
      <div className={styles.loadingSpinner}>
        <Spin size="small" />
        <span className={styles.loadingText}>Loading...</span>
      </div>
    );
  }

  if (props.readOnly) {
    if (!isNonEmptyArray(selected.current))
      return null;
    const readonlyValue = props.mode === 'multiple'
      ? selected.current.map((x) => ({
        label: loadingValues ? getDisplayNameOrUndefined(x) : displayValueFunc(x),
        value: keyValueFunc(outcomeValueFunc(x)),
      }))
      : {
        id: keyValueFunc(outcomeValueFunc(selected.current[0])),
        _displayName: loadingValues ? getDisplayNameOrUndefined(selected.current[0]) : displayValueFunc(selected.current[0]),
        _className: getClassNameOrUndefined(selected.current[0]),
      };

    return (
      <ReadOnlyDisplayFormItem
        value={readonlyValue}
        type={props.mode === 'multiple' ? 'dropdownMultiple' : 'dropdown'}
        style={style}
        quickviewEnabled={props.quickviewEnabled}
        quickviewFormPath={props.quickviewFormPath}
        quickviewDisplayPropertyName={props.quickviewDisplayPropertyName || props.displayPropName}
        quickviewGetEntityUrl={props.quickviewGetEntityUrl}
        quickviewWidth={props.quickviewWidth ?? undefined} // quick fix string value of quickviewWidth (from configurator)
      />
    );
  }


  const { width, ...restOfDropdownStyles } = style;

  const selectTitle = displayValueFunc(selected.current.length === 1 ? displayValueFunc(selected.current[0]) : null);

  return (
    <Select
      title={selectTitle}
      onOpenChange={onDropdownVisibleChange}
      value={keys}
      className={styles.autocomplete}
      styles={{ popup: { root: restOfDropdownStyles } }}
      showSearch={props.disableSearch ? false : { filterOption: false, onSearch: handleSearch }}
      notFoundContent={props.notFoundContent}
      defaultActiveFirstOption={false}
      onChange={handleChange}
      allowClear={allowClear}
      loading={source.isFetchingTableData || loadingValues}
      placeholder={props.placeholder}
      disabled={props.readOnly ?? false}
      onSelect={handleSelect}
      style={style}
      size={props.size}
      ref={selectRef}
      {...(style.hasOwnProperty("border") || style.hasOwnProperty("borderWidth") ? { variant: 'borderless' } : {})}
      {...(props.value && props.mode === 'multiple' ? { mode: props.mode } : {})}
    >
      {freeTextValuesList}
      {list}
      {!open && selectedValuesList}
    </Select>
  );
};

const Autocomplete = <TValue = unknown>(props: IAutocompleteProps<TValue>): ReactNode => {
  const { grouping } = props;
  const { formData } = useShaFormInstanceOrUndefined() ?? {};
  const [disableRefresh, setDisableRefresh] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const uid = useId();

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(props.entityType);
  const permanentFilter = useFormEvaluatedFilter({ filter: props.filter, metadataAccessor: propertyMetadataAccessor });

  const fields = [...(props.fields ?? [])];
  if (props.displayPropName && fields.findIndex((x) => x === props.displayPropName) === -1)
    fields.push(props.displayPropName);
  if (props.keyPropName && fields.findIndex((x) => x === props.keyPropName) === -1)
    fields.push(props.keyPropName);
  if (props.dataSourceType === 'entitiesList') {
    if (fields.findIndex((x) => x === 'id') === -1)
      fields.push('id');
    if (fields.findIndex((x) => x === '_className') === -1)
      fields.push('_className');
    if (fields.findIndex((x) => x === '_displayName') === -1)
      fields.push('_displayName');
  }
  if (isDefined(grouping) && fields.findIndex((x) => x === grouping.propertyName) === -1)
    fields.push(grouping.propertyName);

  const q = { q: isPropertySettings(props.queryParams) ? { ...props.queryParams } : props.queryParams };
  const queryParams = useActualContextData(q, undefined, { searchText, value: props.value }).q;

  const queryParamsObj = useDeepCompareMemo(() => {
    const queryParamObj: IAnyObject = {};
    if (props.dataSourceType === 'url') {
      if (queryParams && typeof (queryParams) === 'object') {
        if (Array.isArray(queryParams)) {
          queryParams.forEach(({ param, value }) => {
            const valueAsString = value as string;
            if (param?.length && valueAsString.length) {
              queryParamObj[param] = /{.*}/i.test(valueAsString) ? evaluateString(valueAsString, { data: formData }) : value;
            }
          });
        } else
          Object.assign(queryParamObj, queryParams);
      }
      // add autocomplete standard query params if not exists
      if (queryParamObj['term'] === undefined)
        queryParamObj['term'] = searchText;
      if (queryParamObj['selectedValue'] === undefined)
        queryParamObj['selectedValue'] = props.value;
    }
    return queryParamObj;
  }, [props.dataSourceType, queryParams, formData, searchText]);


  const key = getUrlKeyParam(props.dataSourceUrl);

  const url = useDeepCompareMemo(() => {
    return props.dataSourceUrl
      ? `${props.dataSourceUrl}${key}${QueryString.stringify(queryParamsObj)}`
      : undefined;
  }, [props.dataSourceUrl, queryParamsObj]);

  const handleSearch = (searchText: string): void => {
    setSearchText(searchText);
  };

  return (
    <DataTableProvider
      userConfigId={uid}
      entityType={props.entityType ?? props.typeShortAlias ?? ""}
      getDataPath={url}
      propertyName=""
      actionOwnerId={uid}
      actionOwnerName=""
      sourceType={props.dataSourceType === 'entitiesList' ? 'Entity' : 'Url'}
      initialPageSize={7}
      dataFetchingMode="paging"
      grouping={props.grouping ? [props.grouping] : []}
      sortMode="standard"
      standardSorting={props.sorting}
      allowReordering={false}
      permanentFilter={permanentFilter}
      disableRefresh={disableRefresh}
      needToRegisterContext={false}
    >
      <AutocompleteInner<TValue>
        {...props}
        uid={uid}
        disableRefresh={setDisableRefresh}
        fields={fields}
        onSearch={handleSearch}
      />
    </DataTableProvider>
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
      displayPropName={props.displayPropName || (props.dataSourceType === 'url' ? 'displayText' : '_displayName')}
      keyPropName={props.keyPropName || (props.dataSourceType === 'url' ? 'value' : 'id')}
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

