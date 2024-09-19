import { Switch, Tag } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import { ValueRenderer } from '@/components/valueRenderer/index';
import React, { FC } from 'react';
import { getMoment } from '@/utils/date';
import { IDtoType, ISelectOption } from '@/components/autocomplete';
import QuickView, { GenericQuickView } from '@/components/quickView';
import { IReadOnlyDisplayFormItemProps } from './models';
import { useStyles } from './styles/styles';

type AutocompleteType = ISelectOption<IDtoType>;

export const ReadOnlyDisplayFormItem: FC<IReadOnlyDisplayFormItemProps> = ({
  value,
  type = 'string',
  dateFormat = 'DD-MM-YYYY',
  timeFormat = 'hh:mm',
  dropdownDisplayMode = 'raw',
  render,
  checked,
  defaultChecked,
  quickviewEnabled,
  quickviewFormPath,
  quickviewDisplayPropertyName,
  quickviewGetEntityUrl,
  quickviewWidth,
}) => {
  const { styles } = useStyles();
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
        return getMoment(value, dateFormat)?.format(dateFormat) || '';
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


  return (
    <span className={styles.readOnlyDisplayFormItem}>
      {renderValue()}
    </span>
  );
};

export default ReadOnlyDisplayFormItem;
