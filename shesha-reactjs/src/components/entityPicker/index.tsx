import { EllipsisOutlined } from '@ant-design/icons';
import { Button, Select, Skeleton } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import React, { useMemo, useRef, useState } from 'react';
import { useEntitySelectionData } from '@/utils/entity';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { IEntityPickerProps } from './models';
import { useDeepCompareMemo } from '@/hooks';
import { useStyles } from './styles/styles';
import { EntityPickerModal } from './modal';
import { getValueByPropertyName } from '@/utils/object';
import { SheshaError } from '@/utils/errors';
import { addPx } from '@/utils/style';
const EntityPickerReadOnly = (props: IEntityPickerProps) => {
  const { entityType, displayEntityKey, value } = props;

  // Check if all data for displaying is loaded
  const isLoaded = value
    ? Array.isArray(value)
      ? !value.find(x => typeof (getValueByPropertyName(x, displayEntityKey)) === 'undefined')
      : typeof (getValueByPropertyName(value, displayEntityKey)) !== 'undefined'
    : false;

  const valueId = Array.isArray(value)
    ? value.map(x => props.incomeValueFunc(x, {}))
    : props.incomeValueFunc(value, {});

  const selection = useEntitySelectionData({
    entityType: entityType,
    propertyName: displayEntityKey,
    selection: !isLoaded ? valueId : null,
  });

  const selectionRows = selection?.rows;
  const selectedItems = useMemo(() => {
    return isLoaded
      ? Array.isArray(value) ? value : [value]
      : selectionRows;
  }, [isLoaded, value, selectionRows]);

  const displayText = useMemo(() => {
    return selectedItems?.map(ent => getValueByPropertyName(ent, displayEntityKey)).join(', ');
  }, [selectedItems, displayEntityKey]);

  return selection.loading ? <Skeleton paragraph={false} active /> : <ReadOnlyDisplayFormItem value={displayText} />;
};

const EntityPickerEditable = (props: IEntityPickerProps) => {
  const {
    entityType,
    displayEntityKey,
    onChange,
    disabled,
    loading,
    value,
    mode,
    size,
    style,
    useButtonPicker,
    pickerButtonProps,
    defaultValue,
    title = 'Select Item',
    outcomeValueFunc,
    incomeValueFunc,
    placeholder,
    dividerStyle
  } = props;

  if (!entityType)
    throw SheshaError.throwPropertyError('entityType');

  const { styles } = useStyles({ style });
  const selectRef = useRef(undefined);

  const [showModal, setShowModal] = useState(false);

  // Check if all data for displaying is loaded
  const isLoaded = value
    ? Array.isArray(value)
      ? !value.find(x => typeof (getValueByPropertyName(x, displayEntityKey)) === 'undefined')
      : typeof (getValueByPropertyName(value, displayEntityKey)) !== 'undefined'
    : false;

  const valueId = useMemo(() => {
    return Array.isArray(value)
      ? value.map(x => incomeValueFunc(x, {}))
      : incomeValueFunc(value, {});
  }, [value, incomeValueFunc]);

  const selection = useEntitySelectionData({
    entityType: entityType,
    propertyName: displayEntityKey,
    selection: !isLoaded ? valueId : null,
  });

  const selectionRows = selection?.rows;
  const selectedItems = useMemo(() => {
    return isLoaded
      ? Array.isArray(value) ? value : [value]
      : selectionRows;
  }, [isLoaded, value, selectionRows]);

  const options = useDeepCompareMemo<DefaultOptionType[]>(() => {
    let result: DefaultOptionType[] = null;
    if (selection.loading) {
      const items = valueId
        ? (Array.isArray(valueId)
          ? valueId
          : [valueId])
        : [];
      result = items.map(item => ({
        label: 'loading...',
        value: item,
        rawValue: item
      }));
    } else {
      result = (selectedItems ?? []).map(ent => {
        const itemValue = incomeValueFunc(outcomeValueFunc(ent, {}), {});
        return {
          label: getValueByPropertyName(ent, displayEntityKey),
          value: ent.id,
          rawValue: itemValue
        };
      });
    }
    return result;
  }, [selectedItems]);

  const selectedMode = mode === 'single' ? undefined : mode;

  const handleMultiChange = (selectedValues: string[]) => {
    const newValues = Array.isArray(value) ? value.filter(x => selectedValues.find(y => y === incomeValueFunc(x, {}))) : null;
    if (onChange) onChange(newValues, null);
  };

  const showPickerDialog = () => {
    setShowModal(true);
  };

  const handleButtonPickerClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event?.stopPropagation();

    showPickerDialog();
  };

  const onClear = () => {
    if (onChange) onChange(null, null);
  };

  const { borderBottomLeftRadius,
    borderTopLeftRadius, borderTopRightRadius,
    borderBottomRightRadius, width, minWidth,
    maxWidth, boxShadow, background, backgroundImage,
    marginTop, marginRight, marginBottom,
    height, minHeight, maxHeight,
    marginLeft, paddingTop, paddingRight, paddingBottom,
    backgroundSize, backgroundPosition, backgroundRepeat,
    paddingLeft, ...restStyle } = style;

  const borderRadii = style?.borderRadius?.toString().split(' ');

  return (
    <div className={styles.entityPickerContainer} style={{ width, minWidth, maxWidth, }}>
      <div>
        {useButtonPicker ? (
          <Button onClick={handleButtonPickerClick} size={size} {...(pickerButtonProps || {})} style={style}>
            {title}
          </Button>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'row', alignItems: 'stretch', position: 'relative', backgroundSize, backgroundPosition, backgroundRepeat,
            boxShadow, marginTop, marginRight, marginBottom, marginLeft, background, backgroundImage, borderTopLeftRadius, borderTopRightRadius, borderBottomLeftRadius, borderBottomRightRadius, height, minHeight, maxHeight
          }}>
            <Select
              size={size}
              onDropdownVisibleChange={(_e) => {
                selectRef.current.blur();
                showPickerDialog();
              }}
              onClear={onClear}
              value={selection.loading ? undefined : valueId}
              placeholder={selection.loading ? 'Loading...' : placeholder}
              notFoundContent={''}
              defaultValue={defaultValue}
              disabled={disabled || selection.loading}
              ref={selectRef}
              allowClear
              mode={selectedMode}
              options={options}
              variant='borderless'
              suffixIcon={null}
              onChange={handleMultiChange}
              className={styles.entitySelect}
              style={{
                ...restStyle,
                height: '100%',
                borderRightStyle: 'none',
                marginTop: 0,
                marginRight: 0, marginBottom: 0, marginLeft: 0, paddingTop, paddingRight, paddingBottom, paddingLeft,
                borderTopRightRadius: 0, borderBottomRightRadius: 0,
                borderTopLeftRadius,
                borderBottomLeftRadius
              }}
              loading={selection.loading}
            >
              {''}
            </Select>
            <Button
              onClick={showPickerDialog}
              className={styles.pickerInputGroupEllipsis}
              disabled={disabled}
              loading={loading ?? false}
              icon={<EllipsisOutlined />}
              style={{
                ...restStyle,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius,
                borderBottomRightRadius,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 0,
                paddingTop,
                paddingRight,
                paddingBottom,
                paddingLeft,
                borderLeftStyle: dividerStyle?.style ?? 'solid',
                borderLeftWidth: addPx(dividerStyle?.width) ?? '1px',
                borderLeftColor: dividerStyle?.color ?? '#d9d9d9',
                borderRadius: `0px ${borderRadii?.[1]} ${borderRadii?.[2]} 0px`,
                height: '100%',
                minHeight: '100%',
                maxHeight: '100%',
                position: 'absolute',
                left: 'calc(100% - 32px)',
              }}
              type='text'
            />
          </div>
        )}
      </div>

      {showModal && <EntityPickerModal {...props} onCloseModal={() => setShowModal(false)} />}
    </div>
  );
};

export const EntityPicker = ({ displayEntityKey = '_displayName', ...restProps }: IEntityPickerProps) => {
  return restProps.readOnly ? (
    <EntityPickerReadOnly {...restProps} displayEntityKey={displayEntityKey} />
  ) : (
    <EntityPickerEditable {...restProps} displayEntityKey={displayEntityKey} />
  );
};

export default EntityPicker;
