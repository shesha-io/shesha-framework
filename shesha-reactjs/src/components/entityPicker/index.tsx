import { EllipsisOutlined } from '@ant-design/icons';
import { Button, type GetRef, Select, SelectProps, Skeleton } from 'antd';
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
import { useAvailableConstantsData } from '@/providers/form/utils';
import { IEntityReferenceDto } from '@/interfaces';
import { isDefined } from '@/utils/nullables';

type SelectRef = GetRef<typeof Select>; // Resolves to BaseSelectRef
type OnSelectChange<TValue> = SelectProps<TValue>["onChange"];

const isPropertyLoaded = (value: string | IEntityReferenceDto, displayEntityKey: string): boolean => {
  return typeof (value) === "object" && typeof (getValueByPropertyName(value, displayEntityKey as keyof IEntityReferenceDto)) !== 'undefined';
};

const EntityPickerReadOnly = (props: IEntityPickerProps): React.JSX.Element => {
  const { entityType, displayEntityKey, value } = props;

  // Check if all data for displaying is loaded
  // TODO: review this logic. It works with complex objects only
  const isLoaded = value
    ? Array.isArray(value)
      ? !value.find((x) => isPropertyLoaded(x, displayEntityKey))
      : isPropertyLoaded(value, displayEntityKey)
    : false;

  const { incomeValueFunc } = props;
  const valueId = useMemo(() => {
    return Array.isArray(value)
      ? value.map((x) => incomeValueFunc(x, {}) ?? "")
      : incomeValueFunc(value, {}) ?? "";
  }, [value, incomeValueFunc]);

  const selection = useEntitySelectionData({
    entityType: entityType,
    propertyName: displayEntityKey,
    selection: !isLoaded ? valueId : undefined,
  });

  const selectionRows = selection.rows;
  const selectedItems = useMemo(() => {
    return isLoaded
      ? Array.isArray(value) ? value : [value]
      : selectionRows;
  }, [isLoaded, value, selectionRows]);

  const displayText = useMemo(() => {
    return selectedItems?.map((ent) => typeof (ent) === "object" ? getValueByPropertyName(ent, displayEntityKey as keyof IEntityReferenceDto) : "").join(', ');
  }, [selectedItems, displayEntityKey]);

  return selection.loading ? <Skeleton paragraph={false} active /> : <ReadOnlyDisplayFormItem value={displayText} style={props.style} />;
};

const EntityPickerEditable = (props: IEntityPickerProps): React.JSX.Element => {
  const {
    entityType,
    displayEntityKey,
    onChange,
    disabled = false,
    loading,
    value,
    mode,
    size,
    style = {},
    useButtonPicker,
    pickerButtonProps,
    title = 'Select Item',
    outcomeValueFunc,
    incomeValueFunc,
    placeholder,
    dividerStyle,
  } = props;

  if (!entityType)
    throw SheshaError.throwPropertyError('entityType');

  const { styles } = useStyles({ style });
  const selectRef = useRef<SelectRef>(null);
  const allData = useAvailableConstantsData();

  const [showModal, setShowModal] = useState(false);

  // Check if all data for displaying is loaded
  // TODO: review this logic. It works with complex objects only
  const isLoaded = value
    ? Array.isArray(value)
      ? !value.find((x) => isPropertyLoaded(x, displayEntityKey))
      : isPropertyLoaded(value, displayEntityKey)
    : false;

  const valueId = useMemo(() => {
    return Array.isArray(value)
      ? value.map((x) => incomeValueFunc(x, {}) ?? "")
      : incomeValueFunc(value, {}) ?? "";
  }, [value, incomeValueFunc]);

  const selection = useEntitySelectionData({
    entityType: entityType,
    propertyName: displayEntityKey,
    selection: !isLoaded ? valueId : undefined,
  });

  const selectionRows = selection.rows;
  const selectedItems = useMemo(() => {
    return isLoaded
      ? Array.isArray(value) ? value : [value]
      : selectionRows;
  }, [isLoaded, value, selectionRows]);

  const options = useDeepCompareMemo<DefaultOptionType[]>(() => {
    if (selection.loading) {
      const items = valueId
        ? (Array.isArray(valueId)
          ? valueId
          : [valueId])
        : [];
      return items.map<DefaultOptionType>((item) => ({
        label: 'loading...',
        value: item,
        rawValue: item,
      }));
    } else {
      const result = (selectedItems ?? []).map<DefaultOptionType>((ent) => {
        if (!isDefined(ent) || typeof (ent) !== "object")
          return {
            label: 'unknown',
            value: '',
            rawValue: '',
          } satisfies DefaultOptionType;

        const itemValue = incomeValueFunc(outcomeValueFunc(ent, {}), {}) ?? "";
        const displayProperty = getValueByPropertyName(ent, displayEntityKey as keyof IEntityReferenceDto);
        return {
          label: String(displayProperty),
          value: String(ent.id),
          rawValue: itemValue,
        } satisfies DefaultOptionType;
      });
      return result;
    }
  }, [selectedItems]);

  const selectedMode = mode === 'single' ? undefined : mode;

  const handleMultiChange: OnSelectChange<string | string[]> = (selectedValues): void => {
    if (onChange) onChange(selectedValues, null);
    // TODO V1: review and fix. selectedValues was declared as array by mistake earlier
    /*
    const newValues = Array.isArray(value)
        ? value.filter((x) => selectedValues.find((y) => y === incomeValueFunc(x, {})))
        : null;
    */
  };

  const showPickerDialog = (): void => {
    setShowModal(true);
  };

  const handleButtonPickerClick = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation();

    showPickerDialog();
  };

  const onClear = (): void => {
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

  const borderRadii = style.borderRadius?.toString().split(' ');

  return (
    <div className={styles.entityPickerContainer} style={{ width, minWidth, maxWidth }}>
      <div>
        {useButtonPicker ? (
          <Button onClick={handleButtonPickerClick} size={size} {...(pickerButtonProps || {})} style={style}>
            {title}
          </Button>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'row', alignItems: 'stretch', position: 'relative', backgroundSize, backgroundPosition, backgroundRepeat,
            boxShadow, marginTop, marginRight, marginBottom, marginLeft, background, backgroundImage, borderTopLeftRadius, borderTopRightRadius, borderBottomLeftRadius, borderBottomRightRadius, height, minHeight, maxHeight,
          }}
          >
            <Select<string | string[]>
              size={size}
              onOpenChange={(_e) => {
                selectRef.current?.blur();
                showPickerDialog();
              }}
              onClear={onClear}
              value={selection.loading ? null : valueId}
              placeholder={selection.loading ? 'Loading...' : placeholder}
              notFoundContent=""
              disabled={disabled || selection.loading}
              ref={selectRef}
              allowClear
              {...(selectedMode ? { mode: selectedMode } : {})}
              options={options}
              variant="borderless"
              suffix={null}
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
                borderBottomLeftRadius,
              }}
              loading={selection.loading}
            >

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
                borderLeftWidth: addPx(dividerStyle?.width, allData) ?? '1px',
                borderLeftColor: dividerStyle?.color ?? '#d9d9d9',
                borderRadius: `0px ${borderRadii?.[1]} ${borderRadii?.[2]} 0px`,
                height: '100%',
                minHeight: '100%',
                maxHeight: '100%',
                position: 'absolute',
                left: 'calc(100% - 32px)',
              }}
              type="text"
            />
          </div>
        )}
      </div>

      {showModal && <EntityPickerModal {...props} onCloseModal={() => setShowModal(false)} />}
    </div>
  );
};

export const EntityPicker = ({ displayEntityKey = '_displayName', ...restProps }: IEntityPickerProps): React.JSX.Element => {
  return restProps.readOnly ? (
    <EntityPickerReadOnly {...restProps} displayEntityKey={displayEntityKey} style={restProps.style} />
  ) : (
    <EntityPickerEditable {...restProps} displayEntityKey={displayEntityKey} />
  );
};

export default EntityPicker;
