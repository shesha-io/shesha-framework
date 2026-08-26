import { EllipsisOutlined } from '@ant-design/icons';
import { Button, type GetRef, Select, SelectProps, Skeleton } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import React, { useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useEntitySelectionData } from '@/utils/entity';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { EntityPickerRef, IEntityPickerProps } from './models';
import { useDeepCompareMemo } from '@/hooks';
import { useStyles } from './styles/styles';
import { EntityPickerModal } from './modal';
import { getValueByPropertyName } from '@/utils/object';
import { ValidationErrors } from '@/components/validationErrors';
import { IEntityReferenceDto } from '@/interfaces';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';

type SelectRef = GetRef<typeof Select>; // Resolves to BaseSelectRef
type OnSelectChange<TValue> = SelectProps<TValue>["onChange"];

const isPropertyLoaded = (value: string | IEntityReferenceDto, displayEntityKey: string): boolean => {
  return typeof (value) === "object" && typeof (getValueByPropertyName(value, displayEntityKey as keyof IEntityReferenceDto)) !== 'undefined';
};

const EntityPickerReadOnly = (props: IEntityPickerProps): React.JSX.Element => {
  const { entityType, displayEntityKey, value, readOnlyPlaceholder, events } = props;

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
    const text = selectedItems?.map((ent) => typeof (ent) === "object" ? getValueByPropertyName(ent, displayEntityKey as keyof IEntityReferenceDto) : "").join(', ');
    return isNotNullOrWhiteSpace(text) ? text : readOnlyPlaceholder;
  }, [selectedItems, displayEntityKey, readOnlyPlaceholder]);

  return selection.loading
    ? <Skeleton paragraph={false} active />
    : (
      // `ReadOnlyDisplayFormItem` takes no event props, so the configured handlers go on a
      // wrapper. Without this the component's onClick (and the other pointer events) never fire
      // in read-only mode.
      <div {...events}>
        <ReadOnlyDisplayFormItem
          value={displayText}
          styleValue={props.styleValue}
          enableFullStyle={props.enableFullStyle}
        />
      </div>
    );
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
    className,
    useButtonPicker,
    pickerButtonProps,
    title = 'Select Item',
    outcomeValueFunc,
    incomeValueFunc,
    placeholder,
    events,
    pickerRef,
  } = props;

  const { styles } = useStyles(props.styleValue);
  const selectRef = useRef<SelectRef>(null);
  // Button-picker mode returns early without rendering the Select, so `selectRef` is never
  // attached there and `focus()` would be a no-op. The button gets its own ref.
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [showModal, setShowModal] = useState(false);

  const entityTypeId = typeof entityType === 'string' ? entityType : entityType?.name;

  const showPickerDialog = (): void => {
    setShowModal(true);
  };

  // Check if all data for displaying is loaded
  // TODO: review this logic. It works with complex objects only
  const isLoaded = value
    ? Array.isArray(value)
      ? !value.find((x) => isPropertyLoaded(x, displayEntityKey))
      : isPropertyLoaded(value, displayEntityKey)
    : false;

  const valueId = useMemo(() => {
    if (Array.isArray(value)) return value.map((x) => incomeValueFunc(x, {}) ?? "");
    const id = incomeValueFunc(value, {});
    return id || undefined;
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

  // Backs the component API's `focus`, `showPicker`, `hidePicker` and `selectedItems`. Declared
  // after `selectedItems` so the getter closes over the resolved selection.
  useImperativeHandle(pickerRef, () => ({
    focus: () => {
      if (useButtonPicker === true) buttonRef.current?.focus();
      else selectRef.current?.focus();
    },
    showPicker: () => setShowModal(true),
    hidePicker: () => setShowModal(false), getSelectedItems: () => (selectedItems ?? [])
      .filter(isDefined)
      .map((item) => {
        if (typeof item !== 'object') return { id: String(item), displayName: String(item) };
        const record: Record<string, unknown> = { ...item };
        return {
          id: String(record['id'] ?? ''),
          displayName: String(record[displayEntityKey] ?? ''),
        };
      }),
  }), [selectedItems, displayEntityKey, useButtonPicker]);

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

  const onClear = (): void => {
    if (onChange) onChange(null, null);
  };


  if (isNullOrWhiteSpace(entityTypeId)) {
    return <ValidationErrors error="Please select `Entity Type` on the settings panel" />;
  }

  if (useButtonPicker) {
    const buttonClassName = [pickerButtonProps?.className, className]
      .filter(isNotNullOrWhiteSpace)
      .join(' ');

    // The configured `onClick` lives in `events` and is spread on the wrapper below. Calling it
    // here as well would fire it twice for one click, so the button only opens the dialog and
    // lets the click bubble to the wrapper for the configured handler.
    const handleButtonPickerClick = (): void => {
      showPickerDialog();
    };

    return (
      <div className={styles.entityPickerContainer} {...events}>
        <Button
          {...(pickerButtonProps ?? {})}
          ref={buttonRef}
          onClick={handleButtonPickerClick}
          size={size}
          disabled={disabled}
          {...(isNotNullOrWhiteSpace(buttonClassName) ? { className: buttonClassName } : {})}
        >
          {title}
        </Button>
        {showModal && <EntityPickerModal {...props} onCloseModal={() => setShowModal(false)} />}
      </div>
    );
  }

  // rc-select calls `preventDefault()` on mousedown for any click that is not on its inner input
  // (@rc-component/select SelectInput), which suppresses the native click entirely — so a handler
  // on this wrapper never runs. Mousedown still fires, so the configured `onClick` is invoked from
  // there instead.
  const { onClick: configuredOnClick, ...remainingEvents } = events ?? {};
  const selectEvents = {
    ...remainingEvents,
    ...(isDefined(configuredOnClick) ? { onMouseDown: configuredOnClick } : {}),
  };

  return (
    <div className={styles.entityPickerContainer}>
      <div className={className} {...selectEvents}>
        <Select<string | string[]>
          size={size}
          onOpenChange={(_e) => {
            selectRef.current?.blur();
            showPickerDialog();
          }}
          onClear={onClear}
          value={selection.loading ? null : (valueId ?? null)}
          placeholder={selection.loading ? 'Loading...' : placeholder}
          notFoundContent=""
          disabled={disabled || selection.loading}
          ref={selectRef}
          allowClear={!disabled}
          {...(selectedMode ? { mode: selectedMode } : {})}
          options={options}
          open={false}
          variant="borderless"
          suffix={<span />}
          onChange={handleMultiChange}
          className={styles.entitySelect}
          loading={selection.loading}
        />
        <Button
          onClick={showPickerDialog}
          className={styles.pickerInputGroupEllipsis}
          disabled={disabled}
          loading={loading ?? false}
          icon={<EllipsisOutlined />}
          type="text"
        />
      </div>

      {showModal && <EntityPickerModal {...props} onCloseModal={() => setShowModal(false)} />}
    </div>
  );
};

export const EntityPicker = ({ displayEntityKey = '_displayName', ...restProps }: IEntityPickerProps): React.JSX.Element => {
  return restProps.readOnly === true ? (
    <EntityPickerReadOnly {...restProps} displayEntityKey={displayEntityKey} />
  ) : (
    <EntityPickerEditable {...restProps} displayEntityKey={displayEntityKey} />
  );
};

export type { EntityPickerRef };

export default EntityPicker;
