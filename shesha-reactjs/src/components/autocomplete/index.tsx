import React, { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import { DataTableProvider, evaluateString, getUrlKeyParam, useAvailableConstantsData, useDataTableStore, useDeepCompareMemo } from '@/index';
import { Select, Typography } from 'antd';
import { useDebouncedCallback } from 'use-debounce';
import { AutocompleteDataSourceType, DisplayValueFunc, FilterSelectedFunc, IAutocompleteBaseProps, IAutocompleteProps, ISelectOption, KayValueFunc, OutcomeValueFunc, getColumns } from './models';
import { useActualContextData } from '@/hooks/useActualContextData';
import QueryString from 'qs';
import { isPropertySettings } from '@/designer-components/_settings/utils';
import ReadOnlyDisplayFormItem from '../readOnlyDisplayFormItem';
import { getValueByPropertyName } from '@/utils/object';
import { isDataColumn } from '@/providers/dataTable/interfaces';
import { ValueRenderer } from '../valueRenderer';
import { isEqual, uniqWith } from 'lodash';

const AutocompleteInner: FC<IAutocompleteBaseProps> = (props: IAutocompleteBaseProps) => {

  // sources
  const source = useDataTableStore(false);
  const allData = {};//useAvailableConstantsData();
  const selectRef = useRef(null);

  // init props
  // --- For backward compatibility
  const keyPropName = props.keyPropName || (props.dataSourceType === 'entitiesList' ? 'id' : 'value');
  const displayPropName = props.displayPropName || (props.dataSourceType === 'entitiesList' ? '_displayName' : 'displayText');
  // ---
  const keyValueFunc: KayValueFunc = props.keyValueFunc ?? ((value: any) => (getValueByPropertyName(value, keyPropName) ?? value)?.toString()?.toLowerCase());
  const filterKeysFunc: FilterSelectedFunc = props.filterKeysFunc ?? ((value: any) => 
    ({in: [{var: `${keyPropName}`}, Array.isArray(value) ? value.map(x => keyValueFunc(x, allData)) : [keyValueFunc(value, allData)]]}));
  const filterNotKeysFunc: FilterSelectedFunc = ((value: any) => ({"!": {and: [filterKeysFunc(value)]}}));
  const displayValueFunc: DisplayValueFunc = props.displayValueFunc ?? ((value: any) => (Boolean(value) ? getValueByPropertyName(value, displayPropName) ?? value?.toString() : ''));
  const outcomeValueFunc: OutcomeValueFunc = props.outcomeValueFunc ?? ((value: any) => getValueByPropertyName(value, keyPropName) ?? value);

  // register columns
  useEffect(() => source?.registerConfigurableColumns(props.uid, getColumns(props.fields)), [props.fields]);

  // init state
  const [loadingValues, setLoadingValues] = useState<boolean>(false);
  const selected = useRef<Array<any>>([]);
  const lastSearchText = useRef<string>('');

  const keys = useMemo(() => {
    const res = props.value
      ? Array.isArray(props.value)
        ? props.value.map((x) => keyValueFunc(x, allData))
        : [keyValueFunc(props.value, allData)]
      : [];
    return res;
  }, [props.value]);

  // update local store of values details
  useEffect(() => {
    if (props.dataSourceType === 'entitiesList' && props.entityType
      || props.dataSourceType === 'url' && props.dataSourceUrl
    ) {
      props.disableRefresh.current = false;
      if (selected.current?.length === 0 && keys.length) {
        if (!loadingValues) {
          setLoadingValues(true);
          const selectedFilter = filterKeysFunc(props.value);
          source?.setPredefinedFilters([{id: 'selectedFilter', name: 'selectedFilter', expression: selectedFilter}]);
          source?.refreshTable();
        }
        if (loadingValues && source?.tableData?.length) {
          setLoadingValues(false);
          selected.current = keys.map((x) => source?.tableData.find((y) => keyValueFunc(outcomeValueFunc(y, allData), allData) === x));
          const selectedFilter = filterNotKeysFunc(props.value);
          source?.setPredefinedFilters([{id: 'selectedFilter', name: 'selectedFilter', expression: selectedFilter}]);
        }
      }
    }
  }, [props.value, source?.tableData, props.dataSourceType, props.entityType, props.dataSourceUrl]);

  const debouncedSearch = useDebouncedCallback<(searchText: string, force?: boolean) => void>(
    (searchText, force = false) => {
      if (!force && lastSearchText.current === searchText) return;
      source?.performQuickSearch(searchText);
      lastSearchText.current = searchText;
    }, 200);

  const handleSearch = (searchText: string) => {
    debouncedSearch(searchText);
    if (props.onSearch)
      props.onSearch(searchText);
  };

  const onDropdownVisibleChange = (open: boolean) => {
    if (!open)
      debouncedSearch('');
  };

  const handleSelect = () => {
    selectRef.current.blur();
  };

  const handleChange = (_value, option: any) => {
    selected.current = Boolean(option)
      ? Array.isArray(option)
        ? (option as ISelectOption[]).map((o) => o.data)
        : [(option as ISelectOption).data]
      : [];

    const selectedValue = Boolean(option)
      ? Array.isArray(option)
        ? (option as ISelectOption[]).map((o) => outcomeValueFunc(o.data, allData))
        : outcomeValueFunc((option as ISelectOption).data, allData)
      : undefined;

    const keys = selectedValue
      ?Array.isArray(selectedValue)
        ? selectedValue.map((x) => keyValueFunc(x, allData))
        : [keyValueFunc(selectedValue, allData)]
      : [];

    const selectedFilter = keys?.length ? filterNotKeysFunc(selectedValue) : null;
    source?.setPredefinedFilters([{id: 'selectedFilter', name: 'selectedFilter', expression: selectedFilter}]);
    //debouncedSearch('', true);

    if (!Boolean(props.onChange))
      return;
    if (props.mode === 'multiple') {
      props.onChange(Array.isArray(selectedValue) ? selectedValue : [selectedValue]);
    } else 
      props.onChange(selectedValue);
  };

  const renderOption = (row, index) => {
    const value = outcomeValueFunc(row, allData);
    const key = keyValueFunc(value, allData);
    const label = displayValueFunc(row, allData);
    return <Select.Option value={key} key={JSON.stringify(key || index)} data={row}><span dangerouslySetInnerHTML={{ __html: label }} /></Select.Option>;
  };

  const renderGroupTitle = (value: any, propertyName: string) => {
    if (value === null || value === undefined)
      return <Typography.Text type="secondary">(empty)</Typography.Text>;
    const column = source?.groupingColumns.find((c) => isDataColumn(c) && c.propertyName === propertyName);
    const propertyMeta = isDataColumn(column) ? column.metadata : null;
    return <ValueRenderer value={value} meta={propertyMeta} />;
  };

  const selectedValuesList = useMemo(() => {
    return <>{selected.current?.map((row, index) => renderOption(row, index))}</>;
  }, [selected.current]);

  const list = useMemo(() => {
    const list = source?.tableData
      // filter already selected items to avoid duplicate keys in options
      ?.filter((x) => !keys.find((y) => isEqual(y, keyValueFunc(outcomeValueFunc(x, allData), allData))))
      ?? [];

    // render grouped data
    if (props.grouping && source?.tableData?.length) {
      const groupProp = props.grouping.propertyName;
      const groups = uniqWith(source?.tableData.map(row => getValueByPropertyName(row, groupProp)), (a, b) => isEqual(a, b));
      const res =  <>
        {groups.map((group, index) => {
          const groupTitle = renderGroupTitle(group, groupProp) ?? 'empty';
          return <Select.OptGroup key={index} label={groupTitle}>
            {list.filter((x) => isEqual(getValueByPropertyName(x, groupProp), group)).map((row, index) => renderOption(row, index))}
          </Select.OptGroup>;
        })}
        </>;
      return res;
    }

    return <>
      {list.map((row, index) => renderOption(row, index))}
      {props.dataSourceType === 'entitiesList' && source?.totalRows > 7 
        && <Select.Option value='total' key='total' disabled={true}>{`Total found: ${source?.totalRows} ...`}</Select.Option>}
    </>;
  }, [selected.current, source?.tableData, props.grouping]);

  if (props.readOnly) {
    const readonlyValue = props.mode === 'multiple' 
      ? selected.current?.map((x) => ({label: displayValueFunc(x, allData), value: keyValueFunc(outcomeValueFunc(x, allData), allData)}))
      : props.value;
    return (
      <ReadOnlyDisplayFormItem
        value={readonlyValue}
        type={props.mode === 'multiple' ? 'dropdownMultiple' : 'dropdown'}
        disabled={props.readOnly}
        quickviewEnabled={props.quickviewEnabled}
        quickviewFormPath={props.quickviewFormPath}
        quickviewDisplayPropertyName={props.quickviewDisplayPropertyName || props.displayPropName}
        quickviewGetEntityUrl={props.quickviewGetEntityUrl}
        quickviewWidth={props.quickviewWidth ? Number(props.quickviewWidth) : null} // quick fix string value of quickviewWidth (from configurator)
      />
    );
  }

  return (
    <>
    <Select
      onDropdownVisibleChange={onDropdownVisibleChange}
      value={keys}
      className="sha-dropdown"
      dropdownStyle={{...props.style, height: 'auto'}}
      showSearch={!props.disableSearch}
      notFoundContent={props.notFoundContent}
      defaultActiveFirstOption={false}
      filterOption={false}
      onSearch={handleSearch}
      //defaultValue={wrapValue(defaultValue, options)}
      onChange={handleChange}
      allowClear={true}
      loading={source?.isInProgress?.fetchTableData}
      placeholder={props.placeholder}
      disabled={props.readOnly}
      variant={props.hideBorder ? 'borderless' : undefined}
      onSelect={handleSelect}
      style={props.style}
      size={props.size}
      ref={selectRef}
      mode={props.value && props.mode === 'multiple' ? props.mode : undefined} // When mode is multiple and value is null, the control shows an empty tag
    >
      {list}
      {selectedValuesList /* will be hidden by select component as already selected */}
    </Select>
    </>
  );
};

const Autocomplete: FC<IAutocompleteProps> = (props: IAutocompleteProps) => {
  const allData = useAvailableConstantsData();
  const disableRefresh = useRef<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const uid = useId();

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
  if (props.grouping && fields.findIndex((x) => x === props.grouping.propertyName) === -1)
    fields.push(props.grouping.propertyName);

  const q = { q: isPropertySettings(props.queryParams) ? {...props.queryParams} : props.queryParams };
  const queryParams = useActualContextData(q, null, {searchText, value: props.value})?.q;

  const queryParamsObj = useDeepCompareMemo(() => {
    const queryParamObj = {};
    if (props.dataSourceType === 'url') {
      if (queryParams && queryParams !== null && typeof (queryParams) === 'object') {
        if (Array.isArray(queryParams)) {
          queryParams.forEach(({ param, value }) => {
            const valueAsString = value as string;
            if (param?.length && valueAsString.length) {
              queryParamObj[param] = /{.*}/i.test(valueAsString) ? evaluateString(valueAsString, { data: allData.data }) : value;
            }
          });
        } else
          Object.assign(queryParamObj, queryParams);
      }
      // add autocomplete standart query params if not exists
      if (queryParamObj['term'] === undefined)
        queryParamObj['term'] = searchText;
      if (queryParamObj['selectedValue'] === undefined)
        queryParamObj['selectedValue'] = props.value;
    }
    return queryParamObj;
  }, [props.dataSourceType, queryParams, allData.data, searchText]);


  const key = getUrlKeyParam(props.dataSourceUrl);

  const url = props.dataSourceUrl
    ? `${props.dataSourceUrl}${key}${QueryString.stringify(queryParamsObj)}`
    : null
  ;

  const handleSearch = (searchText: string) => {
    setSearchText(searchText);
  };

  return (
    <DataTableProvider
      userConfigId={uid}
      entityType={props.entityType || props.typeShortAlias}
      getDataPath={url}
      propertyName={''}
      actionOwnerId={uid}
      actionOwnerName={''}
      sourceType={props.dataSourceType === 'entitiesList' ? 'Entity' : 'Url'}
      initialPageSize={7}
      dataFetchingMode={'paging'}
      grouping={props.grouping ? [props.grouping] : []}
      sortMode='standard'
      standardSorting={props.sorting}
      allowReordering={false}
      permanentFilter={props.filter}
      disableRefresh={disableRefresh.current}
    >
      <AutocompleteInner 
        {...props}
        uid={uid}
        disableRefresh={disableRefresh}
        fields={fields}
        onSearch={handleSearch}
      />
    </DataTableProvider>
  );
};

/** 
 * @deprecated The method should not be used
 */
export const EntityDtoAutocomplete = (props: IAutocompleteProps) => {
  return (
    <Autocomplete {...props} />
  );
};

/** 
 * @deprecated The method should not be used
 */
export const RawAutocomplete = (props: IAutocompleteProps) => {
  return (
    <Autocomplete {...props} displayPropName={props.displayPropName || 'displayText'} keyPropName={props.keyPropName || 'value'} mode='single'/>
  );
};

type InternalAutocompleteType = typeof Autocomplete;
interface IInternalAutocompleteInterface extends InternalAutocompleteType {
  Raw: typeof RawAutocomplete;
  EntityDto: typeof EntityDtoAutocomplete;
}


const AutocompleteInterface = Autocomplete as IInternalAutocompleteInterface;
AutocompleteInterface.Raw = RawAutocomplete;
AutocompleteInterface.EntityDto = EntityDtoAutocomplete;

export {
  AutocompleteInterface as Autocomplete,
  type IAutocompleteProps,
  type ISelectOption,
  type AutocompleteDataSourceType,
  //type CustomLabeledValue
};