import React, {
  ChangeEvent,
  FC,
  Fragment,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Checkbox,
  Dropdown,
  Input,
  InputNumber,
  MenuProps,
  Select,
  Spin,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ColumnFilter, IndexColumnFilterOption } from '@/providers/dataTable/interfaces';
import { DatePicker, TimePicker, TimeRangePicker } from '@/components/antd';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { EntityData } from '@/interfaces/gql';
import { humanizeString } from '@/utils/string';
import { IDictionary } from '@/interfaces';
import { Moment } from 'moment';
import { ProperyDataType } from '@/interfaces/metadata';
import { useEntityAutocomplete } from '@/utils/autocomplete';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { useStyles } from './styles/styles';
import {
  ADVANCEDFILTER_DATE_FORMAT,
  ADVANCEDFILTER_DATETIME_FORMAT,
  getMoment,
  ADVANCEDFILTER_TIME_FORMAT,
} from '@/providers/dataTable/utils';

type MenuItem = MenuProps['items'][number];

const allOptions: IDictionary<IndexColumnFilterOption[]> = {
  "date": ['equals', 'between', 'before', 'after'],
  'date-time': ['equals', 'between', 'before', 'after'],
  "time": ['equals', 'between', 'before', 'after'],
  "number": ['lessThan', 'greaterThan', 'equals', 'between'],
  "string": ['contains', 'startsWith', 'endsWith', 'equals'],
};

export const getFilterOptions = (dataType: string): IndexColumnFilterOption[] => {
  return allOptions[dataType] || [];
};

interface IFilterBaseProps {
  placeholder?: string;
  onPressEnter: () => void;
}

type ISingleValueFilterProps = IFilterBaseProps;

interface IStringFilterProps extends ISingleValueFilterProps {
  value: string;
  onChange: (changeValue: ChangeEvent<HTMLInputElement>) => void;
}
const StringFilter: FC<IStringFilterProps> = (props) => {
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
const NumberFilter: FC<INumberFilterProps> = (props) => {
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
const NumberRangeFilter: FC<INumberRangeFilterProps> = (props) => {
  const [min, max] = props.value instanceof Array && props.value.length === 2 ? props.value : [null, null];

  const [minNumber, setMinNumber] = useState<number>(0);
  const [maxNumber, setMaxNumber] = useState<number>(0);

  const handleMinNumberChange = (value: number | string | undefined): void => {
    if (typeof value === 'number') {
      setMinNumber(value);
      props.onChange([value, maxNumber]);
    }
  };

  const handleMaxNumberChange = (value: number | string | undefined): void => {
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

const RefListFilter: FC<IRefListFilterProps> = (props) => {
  const { data: refListItems, loading: refListLoading } = useReferenceList({
    name: props.referenceListName,
    module: props.referenceListModule,
  });

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
const EntityFilter: FC<IEntityFilterProps> = (props) => {
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

interface BaseFilterProps {
  id: string;
  filter: ColumnFilter;
  filterOption: IndexColumnFilterOption;
  onChangeFilter?: (filterId: string, filter: ColumnFilter) => void;
}
interface DateTimeFilterProps extends BaseFilterProps {
  format: string;
  showTime: boolean;
}
const DateTimeFilter: FC<DateTimeFilterProps> = ({ id, filter, filterOption, onChangeFilter, format, showTime }) => {
  const onChange = (_dateEvent: any, dateString: string | string[]): void => {
    onChangeFilter(id, dateString);
  };

  // memoize moment to prevent re-rendeing of the DatePicker. On re-rendering it reset current view to current month
  const memoizedMoment = useMemo(() => {
    return filter instanceof Array ? null : getMoment(filter, format);
  }, [filter, format]);

  const memoizedRange = useMemo(() => {
    if (filter instanceof Array) {
      const range: [Moment, Moment] = [undefined, undefined];
      range[0] = getMoment(filter[0], format);
      range[1] = getMoment(filter[1], format);
      return range;
    } else return null;
  }, [filter, format]);

  return filterOption === 'between' ? (
    <DatePicker.RangePicker size="small" onChange={onChange} value={memoizedRange} format={format} showTime={showTime} />
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

interface TimeFilterProps extends BaseFilterProps {
  format: string;
}
const TimeFilter: FC<TimeFilterProps> = ({ id, filter, filterOption, onChangeFilter, format }) => {
  const onChange = (_dateEvent: any, dateString: string | string[]): void => {
    onChangeFilter(id, dateString);
  };

  // memoize moment to prevent re-rendeing of the DatePicker. On re-rendering it reset current view to current month
  const memoizedMoment = useMemo(() => {
    return filter instanceof Array ? null : getMoment(filter, format);
  }, [filter, format]);

  const memoizedRange = useMemo(() => {
    if (filter instanceof Array) {
      const range: [Moment, Moment] = [undefined, undefined];
      range[0] = getMoment(filter[0], format);
      range[1] = getMoment(filter[1], format);
      return range;
    } else return null;
  }, [filter, format]);

  return filterOption === 'between' ? (
    <TimeRangePicker size="small" onChange={onChange} value={memoizedRange} format={ADVANCEDFILTER_TIME_FORMAT} />
  ) : (
    <TimePicker size="small" onChange={onChange} value={memoizedMoment} format={ADVANCEDFILTER_TIME_FORMAT} />
  );
};

export interface IColumnItemFilterProps {
  id: string;
  filterName: string;
  accessor: string;
  referenceListName: string;
  referenceListModule: string;
  entityReferenceTypeShortAlias: string;
  autocompleteUrl?: string;
  dataType: ProperyDataType;
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
  const { styles } = useStyles();
  const options = useMemo(() => {
    return allOptions[dataType] || [];
  }, [dataType]);

  const filterOptions = useMemo<MenuItem[]>(() => {
    return options
      .filter((opt) => opt !== filterOption)
      .map<MenuItem>((opt) => ({ label: humanizeString(opt), key: opt }));
  }, [options, filterOption]);

  const [showDeleteIcon, setShowIconVisibility] = useState<boolean>(true);

  const toggleShowIconVisibility = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    event.stopPropagation();
    setShowIconVisibility(!showDeleteIcon);
  };

  const handleFilterOptionChange: MenuProps['onClick'] = ({ key }) => {
    onChangeFilterOption(id, key as IndexColumnFilterOption);
  };

  // Make sue that you initialize the `IndexColumnFilterOption` once when the component gets rendered
  useEffect(() => {
    if (!filter) {
      onChangeFilterOption(id, options[0]);
    }
  }, []);

  const handleStringFilter = (changeValue: ChangeEvent<HTMLInputElement>): void => {
    const value = (changeValue as ChangeEvent<HTMLInputElement>).target.value;
    onChangeFilter(id, value);
  };

  const handleRawFilter = (changeValue: ColumnFilter): void => {
    onChangeFilter(id, changeValue);
  };

  const handlePressEnter = (): void => {
    if (applyFilters) applyFilters();
  };

  const handleDeleteFilter = (): void => {
    onRemoveFilter(id);
  };

  const renderBooleanInput = (): JSX.Element => {
    const onChange = (e: CheckboxChangeEvent): void => {
      onChangeFilter(id, e.target.checked);
    };
    return (
      <Checkbox checked={typeof filter === 'boolean' ? filter : false} onChange={onChange}>
        Yes
      </Checkbox>
    );
  };

  const hideFilterOptions = (): boolean => ['boolean', 'reference-list-item', 'multiValueRefList', 'entity'].includes(dataType);

  const baseProps: BaseFilterProps = {
    id,
    filter,
    filterOption,
    onChangeFilter,
  };

  return (
    <div
      className={styles.shaColumnItemFilter}
      onMouseOver={toggleShowIconVisibility}
      onMouseLeave={toggleShowIconVisibility}
    >
      <div className={styles.filterHeading}>
        <div className="filter-heading-left">
          <span className="label">{filterName || 'Something'}</span>
          {!hideFilterOptions() && (
            <Dropdown
              trigger={['click']}
              menu={{ items: filterOptions, onClick: handleFilterOptionChange }}
            >
              <a className="ant-dropdown-link" href="#">
                {humanizeString(filterOption || '')} <DownOutlined />
              </a>
            </Dropdown>
          )}
        </div>
        <div className="filter-heading-right" onMouseOver={(e) => e.stopPropagation()}>
          <DeleteOutlined onClick={handleDeleteFilter} />
        </div>
      </div>
      <div className={styles.filterInput}>
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

        {dataType === 'date' && (<DateTimeFilter {...baseProps} format={ADVANCEDFILTER_DATE_FORMAT} showTime={false} />)}

        {dataType === 'date-time' && (<DateTimeFilter {...baseProps} format={ADVANCEDFILTER_DATETIME_FORMAT} showTime={true} />)}

        {dataType === 'time' && (<TimeFilter {...baseProps} format={ADVANCEDFILTER_TIME_FORMAT} />)}

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

export default ColumnItemFilter;
