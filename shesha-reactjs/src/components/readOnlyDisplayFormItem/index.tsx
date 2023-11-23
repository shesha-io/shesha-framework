import { EditOutlined, LockOutlined } from '@ant-design/icons';
import { Switch, Tag } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import classNames from 'classnames';
import { ValueRenderer } from 'components/valueRenderer/index';
import moment from 'moment';
import React, { FC } from 'react';
import { useForm } from '../../providers';
import { getMoment } from '../../utils/date';
import { IDtoType, ISelectOption } from '../autocomplete';
import QuickView, { GenericQuickView } from '../quickView';
import { Show } from '../show';
import { IReadOnlyDisplayFormItemProps } from './models';

type AutocompleteType = ISelectOption<IDtoType>;

export const ReadOnlyDisplayFormItem: FC<IReadOnlyDisplayFormItemProps> = ({
  value,
  type = 'string',
  dateFormat = 'DD-MM-YYYY',
  timeFormat = 'hh:mm',
  dropdownDisplayMode = 'raw',
  render,
  disabled,
  checked,
  defaultChecked,
  quickviewEnabled,
  quickviewFormPath,
  quickviewDisplayPropertyName,
  quickviewGetEntityUrl,
  quickviewWidth,
}) => {
  const { formSettings, setFormMode, formMode } = useForm(false) ?? {
    formSettings: null,
    setFormMode: () => {
      /*nop*/
    },
    formMode: 'readonly',
  };

  const setFormModeToEdit = () => setFormMode('edit');

  const renderValue = () => {
    if (render) {
      return typeof render === 'function' ? render() : render;
    }

    if (typeof value === 'undefined' && (type === 'dropdown' || type === 'dropdownMultiple')) {
      return '';

      //eliminating null values
    } else if (!value && type === 'string') {
      return '';
    }

    const entityId = value?.id ?? value?.data?.id ?? value?.data;
    const className = value?._className ?? value?.data?._className;
    const displayName = value?._displayName ?? value?.data?._displayName;

    switch (type) {
      case 'dropdown':
        if (!Array.isArray(value)) {
          const displayLabel = (value as AutocompleteType)?.label;
          if (quickviewEnabled && quickviewFormPath) {
            return quickviewFormPath && quickviewGetEntityUrl ? (
              <QuickView
                entityId={entityId}
                formIdentifier={quickviewFormPath}
                getEntityUrl={quickviewGetEntityUrl}
                displayProperty={quickviewDisplayPropertyName}
                width={quickviewWidth}
              />
            ) : (
              <GenericQuickView
                entityId={entityId}
                className={className}
                displayName={displayName}
                displayProperty={quickviewDisplayPropertyName}
                width={quickviewWidth}
              />
            );
          } else {
            return displayLabel;
          }
        }

        throw new Error(`Invalid data type passed. Expected IGuidNullableEntityReferenceDto but found ${typeof value}`);

      case 'dropdownMultiple': {
        if (Array.isArray(value)) {
          const values = (value as AutocompleteType[])?.map(({ label }) => label);

          return dropdownDisplayMode === 'raw'
            ? values?.join(', ')
            : values?.map((itemValue, index) => <Tag key={index}>{itemValue}</Tag>);
        }

        throw new Error(
          `Invalid data type passed. Expected IGuidNullableEntityReferenceDto[] but found ${typeof value}`
        );
      }
      case 'time': {
        return <ValueRenderer value={value} meta={{ dataType: 'time', dataFormat: timeFormat }}/>;
      }
      case 'datetime': {
        if (typeof value === 'string') {
          return moment(value).format(dateFormat);
        }

        return getMoment(value, dateFormat)?.toISOString() || '';
      }
      case 'checkbox': {
        return <Checkbox checked={checked} defaultChecked={defaultChecked} disabled />;
      }
      case 'switch': {
        return <Switch checked={checked} defaultChecked={defaultChecked} disabled />;
      }

      default:
        break;
    }
    return Boolean(value) && typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
  };

  const iconClass = 'read-only-mode-toggler';

  return (
    <span className="read-only-display-form-item">
      {renderValue()}

      <Show when={formSettings?.showModeToggler && formMode === 'readonly'}>
        {disabled ? (
          <LockOutlined className={classNames(iconClass, { disabled })} />
        ) : (
          <EditOutlined className={iconClass} onClick={setFormModeToEdit} />
        )}
      </Show>
    </span>
  );
};

export default ReadOnlyDisplayFormItem;
