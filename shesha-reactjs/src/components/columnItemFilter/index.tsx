import React, { FC, ChangeEvent, useState, Fragment, useEffect, useMemo } from 'react';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { Input, DatePicker, TimePicker, InputNumber, Checkbox, Menu, Dropdown, Select, Spin } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { Moment } from 'moment';
import { ColumnFilter, IndexColumnDataType, IndexColumnFilterOption } from '../../providers/dataTable/interfaces';
import { humanizeString } from '../../utils/string';
import {
  ADVANCEDFILTER_DATE_FORMAT,
  ADVANCEDFILTER_DATETIME_FORMAT,
  getMoment,
  ADVANCEDFILTER_TIME_FORMAT,
} from '../../providers/dataTable/utils';
import { useReferenceList } from '../../providers/referenceListDispatcher';
import { useEntityAutocomplete } from '../../utils/autocomplete';
import { EntityData } from '../../interfaces/gql';

const { RangePicker: DateRangePicker } = DatePicker;
const { RangePicker: TimeRangePicker } = TimePicker;

const allOptions = {
  date: ['equals', 'between', 'before', 'after'],
  datetime: ['equals', 'between', 'before', 'after'],
  time: ['equals', 'between', 'before', 'after'],
  number: ['lessThan', 'greaterThan', 'equals', 'between'],
  string: ['contains', 'startsWith', 'endsWith', 'equals'],
};

export const getFilterOptions = (dataType: string): IndexColumnFilterOption[] => {
  return allOptions[dataType] || [];
};

export interface IColumnItemFilterProps {
  id: string;
  filterName: string;
  accessor: string;
  referenceListName: string;
  referenceListModule: string;
  entityReferenceTypeShortAlias: string;
  autocompleteUrl?: string;
  dataType: IndexColumnDataType;
  filter: ColumnFilter;
  filterOption: IndexColumnFilterOption;
  onRemoveFilter?: (id: string) => void;
  onChangeFilterOption?: (filterId: string, filterOption: IndexColumnFilterOption) => void;
  onChangeFilter?: (filterId: string, filter: ColumnFilter) => void;
  applyFilters?: () => void;
}

export const ColumnItemFilter: FC<IColumnItemFilterProps> = ({
  id,
  filterName,
  dataType = 'string',
  filterOption,
  onRemoveFilter,
  onChangeFilterOption,
  onChangeFilter,
  filter,
  applyFilters,
  referenceListName,
  referenceListModule,
  entityReferenceTypeShortAlias,
  autocompleteUrl,
}) => {
  const options = allOptions[dataType] || [];

  const [showDeleteIcon, setShowIconVisibility] = useState<boolean>(true);

  const toggleShowIconVisibility = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    setShowIconVisibility(!showDeleteIcon);
  };

  // This key is supposed to be of type MenuClickEventHandler but I'm not getting it
  const handleFilterOptionChange = ({ key }: { key: React.Key }) => {
    // setFilterOption(option);
    onChangeFilterOption(id, key as IndexColumnFilterOption);
  };

  // Make sue that you initialize the `IndexColumnFilterOption` once when the component gets rendered
  useEffect(() => {
    if (!filter) {
      onChangeFilterOption(id, options[0]);
    }
  }, []);

  const handleStringFilter = (changeValue: ChangeEvent<HTMLInputElement>) => {
    const value = (changeValue as ChangeEvent<HTMLInputElement>).target.value;
    onChangeFilter(id, value);
  };

  const handleRawFilter = (changeValue: ColumnFilter) => {
    onChangeFilter(id, changeValue);
  };

  const handlePressEnter = () => {
    if (applyFilters) applyFilters();
  };

  const handleDeleteFilter = () => {
    onRemoveFilter(id);
  };

  const renderDateTimePicker = (format: string, showTime: boolean) => {
    const onChange = (_dateEvent: any, dateString: string | string[]) => {
      onChangeFilter(id, dateString);
    };

    // memoize moment to prevent re-rendeing of the DatePicker. On re-rendering it reset current view to current month
    const memoizedMoment = useMemo(() => {
      return filter instanceof Array ? null : getMoment(filter, format);
    }, [filter]);

    const memoizedRange = useMemo(() => {
      if (filter instanceof Array) {
        const range: [Moment, Moment] = [undefined, undefined];
        range[0] = getMoment(filter[0], format);
        range[1] = getMoment(filter[1], format);
        return range;
      } else return null;
    }, [filter]);

    return filterOption === 'between' ? (
      <DateRangePicker size="small" onChange={onChange} value={memoizedRange} format={format} showTime={showTime} />
    ) : (
      <DatePicker
        size="small"
        onChange={onChange}
        value={memoizedMoment as Moment}
        format={format}
        showTime={showTime}
      />
    );
  };

  const renderTimeInput = (format: string) => {
    const onChange = (_dateEvent: any, dateString: string | string[]) => {
      onChangeFilter(id, dateString);
    };

    // memoize moment to prevent re-rendeing of the DatePicker. On re-rendering it reset current view to current month
    const memoizedMoment = useMemo(() => {
      return filter instanceof Array ? null : getMoment(filter, format);
    }, [filter]);

    const memoizedRange = useMemo(() => {
      if (filter instanceof Array) {
        const range: [Moment, Moment] = [undefined, undefined];
        range[0] = getMoment(filter[0], format);
        range[1] = getMoment(filter[1], format);
        return range;
      } else return null;
    }, [filter]);

    return filterOption === 'between' ? (
      <TimeRangePicker size="small" onChange={onChange} value={memoizedRange} format={ADVANCEDFILTER_TIME_FORMAT} />
    ) : (
      <TimePicker size="small" onChange={onChange} value={memoizedMoment} format={ADVANCEDFILTER_TIME_FORMAT} />
    );
  };

  const renderBooleanInput = () => {
    const onChange = (e: CheckboxChangeEvent) => {
      onChangeFilter(id, e.target.checked);
    };
    return (
      <Checkbox checked={typeof filter === 'boolean' ? filter : false} onChange={onChange}>
        Yes
      </Checkbox>
    );
  };

  const hideFilterOptions = () => ['boolean', 'reference-list-item', 'multiValueRefList', 'entity'].includes(dataType);

  return (
    <div
      className="sha-column-item-filter"
      onMouseOver={toggleShowIconVisibility}
      onMouseLeave={toggleShowIconVisibility}
    >
      <div className="filter-heading">
        <div className="filter-heading-left">
          <span className="label">{filterName || 'Something'}</span>
          {!hideFilterOptions() && (
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu onClick={handleFilterOptionChange}>
                  {options
                    .filter((o: any) => o !== filterOption)
                    .map((opt: any) => (
                      <Menu.Item key={opt}>{humanizeString(opt)}</Menu.Item>
                    ))}
                </Menu>
              }
            >
              <a className="ant-dropdown-link" href="#">
                {humanizeString(filterOption || '')} <DownOutlined />
              </a>
            </Dropdown>
          )}
        </div>
        <div className="filter-heading-right" onMouseOver={e => e.stopPropagation()}>
          <DeleteOutlined onClick={handleDeleteFilter} />
        </div>
      </div>
      <div className="filter-input">
        {dataType === 'string' && (
          <StringFilter
            onChange={handleStringFilter}
            onPressEnter={handlePressEnter}
            placeholder={`Filter ${filterName}`}
            value={filter as string}
          />
        )}

        {dataType === 'number' && filterOption === 'between' && (
          <NumberRangeFilter
            onChange={handleRawFilter}
            onPressEnter={handlePressEnter}
            placeholder={`Filter ${filterName}`}
            value={filter instanceof Array && filter.length === 2 ? (filter as number[]) : [null, null]}
          />
        )}

        {dataType === 'number' && filterOption !== 'between' && (
          <NumberFilter
            onChange={handleRawFilter}
            onPressEnter={handlePressEnter}
            placeholder={`Filter ${filterName}`}
            value={filter as number}
          />
        )}

        {dataType === 'date' && renderDateTimePicker(ADVANCEDFILTER_DATE_FORMAT, false)}

        {dataType === 'date-time' && renderDateTimePicker(ADVANCEDFILTER_DATETIME_FORMAT, true)}

        {dataType === 'time' && renderTimeInput(ADVANCEDFILTER_TIME_FORMAT)}

        {dataType === 'boolean' && renderBooleanInput()}

        {dataType === 'entity' && (
          <EntityFilter
            onChange={handleRawFilter}
            onPressEnter={handlePressEnter}
            value={filter as string}
            entityType={entityReferenceTypeShortAlias}
            autocompleteUrl={autocompleteUrl}
          />
        )}

        {['reference-list-item', 'multiValueRefList'].includes(dataType) && (
          <RefListFilter
            onChange={handleRawFilter}
            onPressEnter={handlePressEnter}
            placeholder={`Filter ${filterName}`}
            value={(filter as number[]) || []}
            referenceListName={referenceListName}
            referenceListModule={referenceListModule}
          />
        )}
      </div>
    </div>
  );
};

interface IFilterBaseProps {
  placeholder?: string;
  onPressEnter: () => void;
}

interface ISingleValueFilterProps extends IFilterBaseProps { }

interface IStringFilterProps extends ISingleValueFilterProps {
  value: string;
  onChange: (changeValue: ChangeEvent<HTMLInputElement>) => void;
}
const StringFilter: FC<IStringFilterProps> = props => {
  return (
    <Input
      size="small"
      onChange={props.onChange}
      onPressEnter={props.onPressEnter}
      placeholder={props.placeholder}
      value={props.value}
    />
  );
};

interface INumberFilterProps extends ISingleValueFilterProps {
  onChange: (changeValue: number | number[] | string | undefined) => void;
  value: number;
}
const NumberFilter: FC<INumberFilterProps> = props => {
  return (
    <InputNumber
      className="ant-input-number-no-margin"
      size="small"
      onChange={props.onChange}
      onPressEnter={props.onPressEnter}
      placeholder={props.placeholder}
      type="number"
      value={props.value}
    />
  );
};

interface INumberRangeFilterProps extends IFilterBaseProps {
  value: number[];
  onChange: (changeValue: number | number[] | undefined) => void;
}
const NumberRangeFilter: FC<INumberRangeFilterProps> = props => {
  const [min, max] = props.value instanceof Array && props.value.length === 2 ? props.value : [null, null];

  const [minNumber, setMinNumber] = useState<number>(0);
  const [maxNumber, setMaxNumber] = useState<number>(0);

  const handleMinNumberChange = (value: number | string | undefined) => {
    if (typeof value === 'number') {
      setMinNumber(value);
      props.onChange([value, maxNumber]);
    }
  };

  const handleMaxNumberChange = (value: number | string | undefined) => {
    if (typeof value === 'number') {
      setMaxNumber(value);
      props.onChange([minNumber, value]);
    }
  };

  return (
    <Fragment>
      <InputNumber
        size="small"
        onChange={handleMinNumberChange}
        onPressEnter={props.onPressEnter}
        placeholder="Min"
        type="number"
        value={min as number}
      />

      <InputNumber
        size="small"
        onChange={handleMaxNumberChange}
        onPressEnter={props.onPressEnter}
        placeholder="Max"
        type="number"
        value={max as number}
      />
    </Fragment>
  );
};

interface IRefListFilterProps extends IFilterBaseProps {
  referenceListName: string;
  referenceListModule: string;
  value?: number[];
  onChange: (changeValue: number[] | undefined) => void;
}

const RefListFilter: FC<IRefListFilterProps> = props => {
  const { data: refListItems, loading: refListLoading } = useReferenceList(
    {
      name: props.referenceListName,
      module: props.referenceListModule,
    }
  );

  return (
    <Select
      size="small"
      allowClear
      mode="multiple"
      style={{ width: '100%' }}
      onChange={props.onChange}
      value={props.value}
      loading={refListLoading}
    >
      {refListItems &&
        refListItems.items.map(({ id: _id, itemValue, item }) => (
          <Select.Option key={_id} value={itemValue}>
            {item}
          </Select.Option>
        ))}
    </Select>
  );
};

interface IEntityFilterProps extends IFilterBaseProps {
  value: string;
  onChange: (changeValue: string | undefined) => void;
  autocompleteUrl?: string;
  entityType: string;
}
const EntityFilter: FC<IEntityFilterProps> = props => {
  const { data, loading, search } = useEntityAutocomplete({ entityType: props.entityType, value: props.value });

  const dataLoaded = data && data.length > 0;
  const selectValue = props.value && dataLoaded ? props.value : undefined;
  const selectPlaceholder = props.value && !dataLoaded ? 'Loading...' : 'Type to search';

  return (
    <Select
      size="small"
      style={{ width: '100%' }}
      onChange={props.onChange}
      showSearch
      defaultActiveFirstOption={false}
      filterOption={false}
      onSearch={search}
      onSelect={() => search('')}
      allowClear={true}
      placeholder={selectPlaceholder}
      loading={loading}
      value={selectValue}
      notFoundContent={loading ? <Spin size="small" /> : null}
    >
      {dataLoaded &&
        data.map((d: EntityData) => (
          <Select.Option value={d.id} key={d.id}>
            {d._displayName}
          </Select.Option>
        ))}
    </Select>
  );
};

export default ColumnItemFilter;
