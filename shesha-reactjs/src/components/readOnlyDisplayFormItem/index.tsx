import { Space, Switch } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import { ValueRenderer } from '@/components/valueRenderer/index';
import React, { FC, useMemo } from 'react';
import { getMoment } from '@/utils/date';
import { ISelectOption } from '@/components/autocomplete';
import QuickView, { GenericQuickView } from '@/components/quickView';
import { IReadOnlyDisplayFormItemProps } from './models';
import { useStyles } from './styles/styles';
import ReflistTag from '../refListDropDown/reflistTag';

type AutocompleteType = ISelectOption;

export const Icon = ({ type, ...rest }) => {
  const icons = require(`@ant-design/icons`);
  const Component = icons[type];
  return <Component {...rest} />;
};

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
    style,
    showIcon,
    solidColor,
    showItemName
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
            return quickviewFormPath && quickviewGetEntityUrl 
              ? <QuickView
                entityId={entityId}
                formIdentifier={quickviewFormPath}
                getEntityUrl={quickviewGetEntityUrl}
                displayProperty={quickviewDisplayPropertyName}
                width={quickviewWidth}
              />
              : <GenericQuickView
                entityId={entityId}
                className={className}
                displayName={displayName}
                displayProperty={quickviewDisplayPropertyName}
                width={quickviewWidth}
              />;
          } else {
            return dropdownDisplayMode === 'tags' 
              ? <ReflistTag
                value={value}
                color={value?.color}
                icon={value?.icon}
                showIcon={showIcon}
                tagStyle={style}
                description={value?.description}
                solidColor={solidColor}
                showItemName={showItemName}
                label={displayName}
              /> 
              : displayName ?? (typeof value === 'object' ? null : value);
          }
        }

        return null;

      case 'dropdownMultiple': {
        if (Array.isArray(value)) {
          const values = (value as AutocompleteType[])?.map(({ label }) => label);

          return dropdownDisplayMode === 'raw'
            ? values?.join(', ')
            : <Space size={8}>
              {value?.map(({ label, color, icon, value, description }) => {
                return <ReflistTag
                  key={value}
                  value={value}
                  color={color}
                  icon={icon}
                  description={description}
                  showIcon={showIcon}
                  tagStyle={style}
                  solidColor={solidColor}
                  showItemName={showItemName}
                  label={label}
                />;
              })}
            </Space>;
        }

        throw new Error(
          `Invalid data type passed. Expected IGuidNullableEntityReferenceDto[] but found ${typeof value}`
        );
      }
      case 'time': {
        return <ValueRenderer value={value} meta={{ dataType: 'time', dataFormat: timeFormat }} />;
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
