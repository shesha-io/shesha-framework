import React, { FC, ReactNode } from 'react';
import { EditOutlined, LockOutlined } from '@ant-design/icons';
import { Show } from '../show';
import { useForm } from '../../providers';
import { IDtoType, ISelectOption } from '../autocomplete';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import { Switch, Tag } from 'antd';
import { getMoment } from '../../utils/date';
import moment from 'moment';
import classNames from 'classnames';
import QuickView, { GenericQuickView } from '../quickView';
import { FormIdentifier } from '../../providers/form/models';

type AutocompleteType = ISelectOption<IDtoType>;

export interface IReadOnlyDisplayFormItemProps {
  value?: any;
  render?: () => ReactNode | ReactNode;
  type?:
    | 'string'
    | 'number'
    | 'dropdown'
    | 'dropdownMultiple'
    | 'time'
    | 'datetime'
    | 'checkbox'
    | 'switch'
    | 'radiogroup';
  dropdownDisplayMode?: 'raw' | 'tags';
  dateFormat?: string;
  timeFormat?: string;
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  quickviewEnabled?: boolean;
  quickviewFormPath?: FormIdentifier;
  quickviewDisplayPropertyName?: string;
  quickviewGetEntityUrl?: string;
  quickviewWidth?: number;
}

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
    setFormMode: () => {},
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
      case 'time':
      case 'datetime': {
        if (typeof value === 'string') {
          return moment(value).format(type === 'datetime' ? dateFormat : timeFormat);
        }

        return getMoment(value, type === 'datetime' ? dateFormat : timeFormat)?.toISOString() || '';

        // throw new Error(`Invalid data type passed. Expected string but found: ${typeof value}`);
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
    return typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
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
