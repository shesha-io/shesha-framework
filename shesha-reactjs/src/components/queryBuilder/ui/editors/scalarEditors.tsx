import React from 'react';
import moment from 'moment';
import { Input, InputNumber, Select } from 'antd';
import { DatePicker, TimePicker } from '@/components/antd';
import { Autocomplete } from '@/components/autocomplete';
import GenericRefListDropDown from '@/components/refListDropDown/genericRefListDropDown';
import { getIdOrUndefined } from '@/utils/entity';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { ScalarValue } from '../../model/types';
import { getLabeledValue, getOptionFromFetchedItem } from '../../widgets/refListDropDown/simpleDropdown';
import { asList, asScalar, EditorProps } from './types';

const DATE_FORMAT = 'YYYY-MM-DD';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';
const TIME_FORMAT = 'HH:mm:ss';

export const TextEditor: React.FC<EditorProps> = ({ value, onChange, readOnly, placeholder }) => {
  const current = asScalar(value);
  return (
    <Input
      value={typeof current === 'string' ? current : ''}
      onChange={(event) => onChange(event.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      allowClear
    />
  );
};

export const NumberEditor: React.FC<EditorProps> = ({ value, onChange, readOnly, placeholder }) => {
  const current = asScalar(value);
  return (
    <InputNumber
      value={typeof current === 'number' ? current : null}
      onChange={(next) => onChange(typeof next === 'number' ? next : undefined)}
      readOnly={readOnly}
      placeholder={placeholder}
      style={{ width: '100%' }}
    />
  );
};

/** Dates are stored as ISO strings with the local offset, matching what the previous builder saved. */
export const DateEditor: React.FC<EditorProps> = ({ field, value, onChange, readOnly, placeholder }) => {
  const current = asScalar(value);
  const showTime = field?.kind === 'datetime';
  const parsed = typeof current === 'string' && !isNullOrWhiteSpace(current) ? moment(current) : undefined;
  return (
    <DatePicker
      value={parsed?.isValid() === true ? parsed : null}
      onChange={(next) => onChange(next ? next.format() : undefined)}
      disabled={readOnly}
      placeholder={placeholder}
      showTime={showTime}
      format={showTime ? DATETIME_FORMAT : DATE_FORMAT}
      style={{ width: '100%' }}
    />
  );
};

export const TimeEditor: React.FC<EditorProps> = ({ value, onChange, readOnly, placeholder }) => {
  const current = asScalar(value);
  const parsed = typeof current === 'string' && !isNullOrWhiteSpace(current) ? moment(current, TIME_FORMAT) : undefined;
  return (
    <TimePicker
      value={parsed?.isValid() === true ? parsed : null}
      onChange={(next) => onChange(next && !Array.isArray(next) ? next.format(TIME_FORMAT) : undefined)}
      disabled={readOnly}
      placeholder={placeholder}
      format={TIME_FORMAT}
      style={{ width: '100%' }}
    />
  );
};

/** Free-typed list for "is any of" on text and number fields. */
export const ListEditor: React.FC<EditorProps> = ({ field, value, onChange, readOnly, placeholder }) => {
  const isNumber = field?.kind === 'number';
  const items = asList(value).filter((item): item is string | number => typeof item === 'string' || typeof item === 'number');
  return (
    <Select<Array<string | number>>
      mode="tags"
      value={items}
      onChange={(next) => {
        const parsed: ScalarValue[] = next
          .map((item) => isNumber ? Number(item) : item)
          .filter((item) => !(typeof item === 'number' && Number.isNaN(item)));
        onChange(parsed);
      }}
      disabled={readOnly}
      placeholder={placeholder}
      tokenSeparators={[',']}
      style={{ width: '100%' }}
      open={false}
    />
  );
};

export const RefListEditor: React.FC<EditorProps> = ({ field, operator, value, onChange, readOnly }) => {
  const settings = field?.settings;
  if (settings === undefined || isNullOrWhiteSpace(settings.referenceListModule) || isNullOrWhiteSpace(settings.referenceListName))
    return <div className="sha-query-builder-value-placeholder" />;
  const isList = operator?.list === true;
  const scalar = asScalar(value);
  const current: number | number[] | undefined = isList
    ? asList(value).filter((item): item is number => typeof item === 'number')
    : (typeof scalar === 'number' ? scalar : undefined);
  return (
    <GenericRefListDropDown<number>
      referenceListId={{ module: settings.referenceListModule, name: settings.referenceListName }}
      value={current}
      onChange={(next) => onChange(Array.isArray(next) ? next : (typeof next === 'number' ? next : undefined))}
      {...(isList ? { mode: 'multiple' as const } : {})}
      readOnly={readOnly}
      style={{ minWidth: '150px', width: '100%' }}
      size="small"
      getLabeledValue={getLabeledValue}
      getOptionFromFetchedItem={getOptionFromFetchedItem}
    />
  );
};

export const EntityEditor: React.FC<EditorProps> = ({ field, value, onChange, readOnly }) => {
  const settings = field?.settings ?? {};
  const current = asScalar(value);
  return (
    <Autocomplete
      dataSourceType="entitiesList"
      entityType={settings.typeShortAlias ?? { module: settings.entityTypeModule ?? '', name: settings.entityTypeName ?? '' }}
      displayPropName="_displayName"
      keyPropName="id"
      mode="single"
      value={typeof current === 'string' ? current : undefined}
      onChange={(next) => onChange(typeof next === 'string' ? next : undefined)}
      readOnly={readOnly}
      style={{ minWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid #d9d9d9', paddingRight: '20px', borderRadius: '4px' }}
      size="small"
      outcomeValueFunc={(item) => typeof item === 'object' ? getIdOrUndefined(item) : item}
    />
  );
};
