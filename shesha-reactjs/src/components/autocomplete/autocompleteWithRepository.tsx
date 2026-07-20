import { IColumnSorting, IGetListDataPayload, ITableColumn, ITableDataColumn, ITableRowData } from '@/providers/dataTable/interfaces';
import { isNonEmptyArray } from '@/utils/array';
import { getClassNameOrUndefined } from '@/utils/entity';
import { isDefined, isNullOrWhiteSpace, undefinedIfNullOrWhiteSpace } from '@/utils/nullables';
import { getValueByPropertyName, jsonSafeParse } from '@/utils/object';
import { Select, Spin, type GetRef, SelectProps } from 'antd';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import ReadOnlyDisplayFormItem from '../readOnlyDisplayFormItem';
import { DisplayValueFunc, FilterSelectedFunc, getColumns, IAutocompleteBaseProps, ISelectOption, KayValueFunc, OutcomeValueFunc } from './models';
import { useStyles } from './style';
import { createOutcomeValueFunc } from './utils';
import { IRepository } from '@/providers/dataTable/repository/interfaces';
import { prepareTableColumn } from '@/providers/dataTable/utils';
import { isEqual } from 'lodash';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { useLiveRef } from '@/hooks/useLiveRef';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { combineExpressionsWithAnd } from '@/utils/jsonLogic';
import { rowToOption } from './renderUtils';

type SelectRef = GetRef<typeof Select>; // Resolves to BaseSelectRef

export type AutocompleteWithRepositoryProps<TValue = unknown> = IAutocompleteBaseProps<TValue> & {
  repository: IRepository;
  onSearch?: (searchText: string) => void;
  itemsToOptions?: (items: ITableRowData[], outcomeValueFunc: OutcomeValueFunc, keyValueFunc: KayValueFunc, displayValueFunc: DisplayValueFunc) => ISelectOption[];
  permanentFilter?: string | undefined;
};

type LoadingState = 'waiting' | 'loading' | 'success' | 'failed';

const isEmptyValue = <TValue = unknown>(value: TValue): boolean => {
  return !isDefined(value) || (Array.isArray(value) && !isNonEmptyArray(value)) || (typeof (value) === 'string' && isNullOrWhiteSpace(value));
};

const getKeys = <TValue = unknown>(value: TValue, keyValueFunc: KayValueFunc): string[] => {
  if (!isDefined(value))
    return [];
  const res = Array.isArray(value)
    ? value.map((x) => keyValueFunc(x))
    : [keyValueFunc(value)];
  return res.filter((x) => isDefined(x));
};

type OnChangeHandler = Required<SelectProps<string[], ISelectOption>>['onChange'];
type OnOpenChangeHandler = Required<SelectProps<string[], ISelectOption>>['onOpenChange'];

export const AutocompleteWithRepository = <TValue = unknown>(props: AutocompleteWithRepositoryProps<TValue>): ReactNode => {
  const {
    allowClear = true,
    style = {},
    allowFreeText = false,
    readOnly = false,
    keyPropName = "", // required, change type
    displayPropName = "", // required, change type
    repository,
    value,
    itemsToOptions,
    permanentFilter,
    grouping,
    sorting,
  } = props;

  const { styles } = useStyles({ style });

  const selectRef = useRef<SelectRef>(null);

  // init props
  const keyValueFunc: KayValueFunc = useMemo(() => props.keyValueFunc ??
    ((value: unknown) => String(getValueByPropertyName(value as Record<string, unknown>, keyPropName) ?? value)), [props.keyValueFunc, keyPropName]);

  const filterKeysFunc: FilterSelectedFunc = useMemo(() => props.filterKeysFunc ??
    ((value: unknown) => !isEmptyValue(value)
      ? (
        { in: [
          { var: `${keyPropName}` },
          Array.isArray(value)
            ? value.map((x) => keyValueFunc(x))
            : [keyValueFunc(value)],
        ],
        })
      : undefined),
  [props.filterKeysFunc, keyPropName, keyValueFunc]);

  const filterNotKeysFunc: FilterSelectedFunc = useMemo(() => (value) => {
    const filter = filterKeysFunc(value);
    return isDefined(filter)
      ? { "!": filter }
      : undefined;
  }, [filterKeysFunc]);

  /** Function for get label from item (received from the backend)*/
  const displayValueFunc: DisplayValueFunc = useMemo(() => props.displayValueFunc ??
    ((value: unknown) => {
      return isDefined(value) && typeof (value) === "object"
        ? String(getValueByPropertyName(value as Record<string, unknown>, displayPropName) ?? value.toString())
        : '';
    }
    ), [props.displayValueFunc, displayPropName]);

  /** Function for get value (outcome value format) from item (received from the backend) */
  const outcomeValueFunc: OutcomeValueFunc = useMemo(() => createOutcomeValueFunc({
    providedFunc: props.outcomeValueFunc,
    dataSourceType: props.dataSourceType,
    rawKeyPropName: props.keyPropName,
    displayPropName,
    keyPropName,
  }), [props.outcomeValueFunc, props.dataSourceType, props.keyPropName, displayPropName, keyPropName]);

  // init state
  const [_autocompleteText, setAutocompleteText] = useState<string>("");

  const dataColumns = useAsyncMemo<ITableDataColumn[]>(async (): Promise<ITableDataColumn[]> => {
    if (!isNonEmptyArray(props.fields))
      return [];

    const columns = getColumns(props.fields ?? []);
    const overrides = await repository.prepareColumns(columns);

    const cols = columns
      .map<ITableColumn | undefined>((col) => prepareTableColumn(col, overrides, undefined))
      .filter((c): c is ITableColumn => isDefined(c));
    return cols;
  }, [props.fields, repository]);

  const getSortingExpression = (): IColumnSorting[] | undefined => {
    const result: IColumnSorting[] = [];
    if (isDefined(repository.supportsGrouping) && repository.supportsGrouping({ sortMode: "standard" }) && isDefined(grouping)) {
      result.push({ id: grouping.propertyName, desc: grouping.sorting === 'desc' });
    }
    if (isNonEmptyArray(sorting)) {
      sorting.forEach((item) => {
        if (result.every((existing) => existing.id !== item.propertyName))
          result.push({ id: item.propertyName, desc: item.sorting === 'desc' });
      });
    }

    return isNonEmptyArray(result) ? result : undefined;
  };

  const keys = useMemo(() => {
    return getKeys(props.value, keyValueFunc);
  }, [keyValueFunc, props.value]);

  const [selectionLoadingState, setSelectionLoadingState] = useState<LoadingState>('waiting');
  const [selection, setSelection] = useState<Array<ITableRowData>>([]);
  const [listLoadingState, setListLoadingState] = useState<LoadingState>('waiting');
  const [list, setList] = useState<Array<ITableRowData>>([]);
  const [totalFound, setTotalFound] = useState<number | undefined>(undefined);

  const listRef = useLiveRef(list);
  const selectionRef = useLiveRef(selection);

  useEffect(() => {
    if (!isEmptyValue(value) && isNonEmptyArray(dataColumns)) {
      const fetchSelectionAsync = async (): Promise<void> => {
        const selectedFilter = filterKeysFunc(value);

        const payload: IGetListDataPayload = {
          columns: dataColumns,
          pageSize: 10,
          currentPage: 1,
          sorting: undefined,
          quickSearch: "",
          filter: isDefined(selectedFilter) ? JSON.stringify(selectedFilter) : undefined,
        };
        try {
          setSelectionLoadingState("loading");
          const selectionData = await repository.fetch(payload);

          setSelection(selectionData.rows);

          setSelectionLoadingState("success");
        } catch {
          setSelectionLoadingState("failed");
        }
      };

      const getNewSelectionOrUndefined = (): Array<ITableRowData> | undefined => {
        const selectedKeys = getKeys(value, keyValueFunc);
        const result: Array<ITableRowData> = [];
        for (const key of selectedKeys) {
          const item = selectionRef.current.find((x) => keyValueFunc(outcomeValueFunc(x), {}) === key);
          if (isDefined(item))
            result.push(item);
          else {
            const itemFromList = listRef.current.find((x) => keyValueFunc(outcomeValueFunc(x), {}) === key);
            if (isDefined(itemFromList))
              result.push(itemFromList);
            else
              return undefined;
          }
        }

        return result;
      };
      const newSelection = getNewSelectionOrUndefined();
      if (isDefined(newSelection))
        setSelection(newSelection);
      else
        void fetchSelectionAsync();
    } else {
      setSelection([]);
      setSelectionLoadingState("waiting");
    }
  }, [dataColumns, filterKeysFunc, keyValueFunc, listRef, outcomeValueFunc, repository, selectionRef, sorting, value]);

  const getListFilter = (): string | undefined => {
    const filters: JsonLogicFilter[] = [];
    const permanentFilterParsed = !isNullOrWhiteSpace(permanentFilter)
      ? jsonSafeParse<JsonLogicFilter>(permanentFilter)
      : undefined;
    if (isDefined(permanentFilterParsed))
      filters.push(permanentFilterParsed);

    const valuesFilter = filterNotKeysFunc(value);
    if (isDefined(valuesFilter))
      filters.push(valuesFilter);

    const combinedFilter = combineExpressionsWithAnd(filters);
    return isDefined(combinedFilter)
      ? JSON.stringify(combinedFilter)
      : undefined;
  };

  const fetchListAsync = async (term: string): Promise<void> => {
    if (!isNonEmptyArray(dataColumns)) {
      setListLoadingState("failed");
      return;
    }

    const sortingExpression = getSortingExpression();

    const payload: IGetListDataPayload = {
      columns: dataColumns,
      pageSize: 10,
      currentPage: 1,
      sorting: sortingExpression,
      quickSearch: undefinedIfNullOrWhiteSpace(term),
      filter: getListFilter(),
    };
    try {
      setListLoadingState("loading");
      const response = await repository.fetch(payload);

      setList(response.rows);
      setTotalFound(response.totalRows);

      setListLoadingState("success");
    } catch {
      setListLoadingState("failed");
    }
  };

  const debouncedSearch = useDebouncedCallback<(searchText: string) => void>(
    (searchText) => {
      if (!readOnly)
        void fetchListAsync(searchText);
    }, 200);

  const handleSearch = (searchText: string): void => {
    if (allowFreeText)
      setAutocompleteText(searchText);
    debouncedSearch(searchText);
    if (props.onSearch)
      props.onSearch(searchText);
  };

  const handleSelect = (): void => {
    if (selectRef.current)
      selectRef.current.blur();
  };

  const handleChange: OnChangeHandler = (_value, option): void => {
    const selectedValue: TValue | TValue[] | null = isDefined(option)
      ? Array.isArray(option)
        ? option.map<TValue>((o) => outcomeValueFunc(o.data) as TValue)
        : outcomeValueFunc(option.data) as TValue
      : null;

    if (!isDefined(props.onChange))
      return;
    if (props.mode === 'multiple')
      props.onChange(Array.isArray(selectedValue)
        ? selectedValue
        : isDefined(selectedValue)
          ? [selectedValue]
          : []);
    else
      props.onChange(selectedValue as TValue);
  };

  const options = useMemo<ISelectOption[]>(() => {
    const missingSelection = selection.filter((x) => !list.some((y) => isEqual(outcomeValueFunc(y), outcomeValueFunc(x))));
    const fullList = [...list, ...missingSelection];

    return isDefined(itemsToOptions)
      ? itemsToOptions(fullList, outcomeValueFunc, keyValueFunc, displayValueFunc)
      : fullList.map<ISelectOption>((row, index) => rowToOption(row, outcomeValueFunc, keyValueFunc, displayValueFunc, index));
  }, [displayValueFunc, itemsToOptions, keyValueFunc, list, outcomeValueFunc, selection]);

  // Show loading when actively fetching data
  if (selectionLoadingState === 'loading') {
    return (
      <div className={styles.loadingSpinner}>
        <Spin size="small" />
        <span className={styles.loadingText}>Loading...</span>
      </div>
    );
  }

  const onDropdownOpenChange: OnOpenChangeHandler = (visible) => {
    if (visible) {
      if (listLoadingState !== "loading" && listLoadingState !== "success")
        debouncedSearch("");
    }
  };

  if (readOnly) {
    if (!isNonEmptyArray(selection))
      return null;
    const readonlyValue = props.mode === 'multiple'
      ? selection.map((x) => ({
        label: displayValueFunc(x),
        value: keyValueFunc(outcomeValueFunc(x)),
      }))
      : {
        id: keyValueFunc(outcomeValueFunc(selection[0])),
        _displayName: displayValueFunc(selection[0]),
        _className: getClassNameOrUndefined(selection[0]),
      };

    return (
      <ReadOnlyDisplayFormItem
        value={readonlyValue}
        type={props.mode === 'multiple' ? 'dropdownMultiple' : 'dropdown'}
        style={style}
        quickviewEnabled={props.quickviewEnabled}
        quickviewFormPath={props.quickviewFormPath}
        quickviewDisplayPropertyName={!isNullOrWhiteSpace(props.quickviewDisplayPropertyName) ? props.quickviewDisplayPropertyName : props.displayPropName}
        quickviewGetEntityUrl={props.quickviewGetEntityUrl}
        quickviewWidth={props.quickviewWidth ?? undefined} // quick fix string value of quickviewWidth (from configurator)
      />
    );
  }

  const { width, ...restOfDropdownStyles } = style;

  return (
    <Select<string[], ISelectOption>
      value={keys}
      className={styles.autocomplete}
      styles={{ popup: { root: restOfDropdownStyles } }}
      showSearch={{
        filterOption: false,
        onSearch: handleSearch,
      }}
      notFoundContent={props.notFoundContent}
      defaultActiveFirstOption={false}

      onChange={handleChange}
      onSelect={handleSelect}
      onOpenChange={onDropdownOpenChange}

      allowClear={allowClear}
      loading={listLoadingState === "loading"}
      placeholder={props.placeholder}
      disabled={props.readOnly ?? false}
      style={style}
      size={props.size}
      ref={selectRef}
      options={options}
      {...(style.hasOwnProperty("border") || style.hasOwnProperty("borderWidth") ? { variant: 'borderless' } : {})}
      {...(isDefined(props.value) && props.mode === 'multiple' ? { mode: props.mode } : {})}
      popupRender={(menu) => (
        <>
          {menu}
          {listLoadingState === 'success' && isDefined(totalFound) && totalFound > list.length && <div className="ant-select-item-empty">Total found: {totalFound} ...</div>}
        </>
      )}
    >
    </Select>
  );
};
