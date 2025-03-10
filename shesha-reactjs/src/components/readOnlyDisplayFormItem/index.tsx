import { Switch, Tag } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import { ValueRenderer } from '@/components/valueRenderer/index';
import React, { FC, useMemo } from 'react';
import { getMoment } from '@/utils/date';
import { ISelectOption } from '@/components/autocomplete';
import QuickView, { GenericQuickView } from '@/components/quickView';
import { IReadOnlyDisplayFormItemProps } from './models';
import { useStyles } from './styles/styles';

type AutocompleteType = ISelectOption;

export const ReadOnlyDisplayFormItem: FC<IReadOnlyDisplayFormItemProps> = (props) => {
  const {
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
  } = props;

  const { styles } = useStyles();
  const renderValue = useMemo(() => {
    if (render) {
      return typeof render === 'function' ? render() : render;
    }

    if ((typeof value === 'undefined' || value === null) && (type === 'dropdown' || type === 'dropdownMultiple')) {
      return '';

      //eliminating null values
    } else if ((typeof value === 'undefined' || value === null) && type === 'string') {
      return '';
    }

    const entityId = typeof value === 'object' ? value?.id ?? value?.data?.id ?? value?.data : value;
    const className = value?._className ?? value?.data?._className;
    const displayName = value?.label || value?._displayName || value?.data?._displayName;

    switch (type) {
      case 'dropdown':
        if (!Array.isArray(value)) {
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
            return displayName;
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
  }, [value,
    type,
    dateFormat,
    timeFormat,
    dropdownDisplayMode,
    render,
    checked,
    defaultChecked,
    quickviewEnabled,
    quickviewFormPath,
    quickviewDisplayPropertyName,
    quickviewGetEntityUrl,
    quickviewWidth
  ]);

  return (
    <span className={styles.readOnlyDisplayFormItem}>
      {renderValue}
    </span>
  );
};

export default ReadOnlyDisplayFormItem;
