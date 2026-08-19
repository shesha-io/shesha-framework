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
  const { entityType, displayEntityKey, value, readOnlyPlaceholder } = props;

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
      <ReadOnlyDisplayFormItem
        value={displayText}
        style={props.style}
        styleValue={props.styleValue}
        enableFullStyle={props.enableFullStyle}
      />
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
    style,
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

  const { styles } = useStyles({});
  const selectRef = useRef<SelectRef>(null);
  const [showModal, setShowModal] = useState(false);

  // `entityType` is either a plain class name or an identifier object; both forms count as unset
  // when they carry no name.
  const entityTypeId = typeof entityType === 'string' ? entityType : entityType?.name;

  const showPickerDialog = (): void => {
    setShowModal(true);
  };

  // Backs the component API's `focus`, `showPicker` and `hidePicker`.
  useImperativeHandle(pickerRef, () => ({
    focus: () => selectRef.current?.focus(),
    showPicker: () => setShowModal(true),
    hidePicker: () => setShowModal(false),
  }), []);

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

  const handleButtonPickerClick = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation();

    showPickerDialog();
  };

  const onClear = (): void => {
    if (onChange) onChange(null, null);
  };

  /* Checked after the hooks, never before: an early return above them changes the hook order
     between renders. A picker whose Entity Type is not set yet is a configuration state, not a
     crash — it happens while binding a property whose metadata carries no entity type — so it
     reports itself the way the other misconfigurations do rather than throwing past the boundary. */
  if (isNullOrWhiteSpace(entityTypeId)) {
    return <ValidationErrors error="Please select `Entity Type` on the settings panel" />;
  }

  if (useButtonPicker) {
    return (
      <div className={styles.entityPickerContainer}>
        <Button
          onClick={handleButtonPickerClick}
          size={size}
          disabled={disabled}
          {...(pickerButtonProps || {})}
          {...(isDefined(style) ? { style } : {})}
          {...(isNotNullOrWhiteSpace(className) ? { className } : {})}
        >
          {title}
        </Button>
        {showModal && <EntityPickerModal {...props} onCloseModal={() => setShowModal(false)} />}
      </div>
    );
  }

  return (
    <div className={styles.entityPickerContainer}>
      {/* The wrapper carries the configured appearance; the select and the button inside it are
          neutralised by the same class so the field reads as one box. */}
      <div className={className} style={style} {...events}>
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
          suffixIcon={<span />}
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
