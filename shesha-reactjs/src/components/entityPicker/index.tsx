import { EllipsisOutlined } from '@ant-design/icons';
import { Button, Space, Select, Skeleton } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import _ from 'lodash';
import React, { useMemo, useRef, useState } from 'react';
import { useEntitySelectionData } from '@/utils/entity';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { IEntityPickerProps } from './models';
import { useDeepCompareMemo } from '@/hooks';
import { useStyles } from './styles/styles';
import { EntityPickerModal } from './modal';
import { getValueByPropertyName } from '@/utils/object';
import { SheshaError } from '@/utils/errors';

const EntityPickerReadOnly = (props: IEntityPickerProps) => {
  const { entityType, displayEntityKey, value } = props;

  // Check if all data for displaying is loaded
  const isLoaded = value 
    ? Array.isArray(value)
      ? !value.find(x => typeof(getValueByPropertyName(x, displayEntityKey)) === 'undefined')
      : typeof(getValueByPropertyName(value, displayEntityKey)) !== 'undefined'
    : false;

  const valueId = Array.isArray(value)
    ? value.map(x => props.incomeValueFunc(x, {}))
    : props.incomeValueFunc(value, {});

  const selection = useEntitySelectionData({
    entityType: entityType,
    propertyName: displayEntityKey,
    selection: !isLoaded ? valueId : null,
  });

  const selectedItems = isLoaded
    ? Array.isArray(value) ? value : [value]
    : selection?.rows;

  const displayText = useMemo(() => {
    return selectedItems?.map(ent => getValueByPropertyName(ent, displayEntityKey)).join(', ');
  }, [selectedItems]);

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
    placeholder
  } = props;

  const { styles } = useStyles();
  const selectRef = useRef(undefined);

  const [showModal, setShowModal] = useState(false);

  // Check if all data for displaying is loaded
  const isLoaded = value 
    ? Array.isArray(value)
      ? !value.find(x => typeof(getValueByPropertyName(x, displayEntityKey)) === 'undefined')
      : typeof(getValueByPropertyName(value, displayEntityKey)) !== 'undefined'
    : false;

  const valueId = Array.isArray(value)
    ? value.map(x => props.incomeValueFunc(x, {}))
    : props.incomeValueFunc(value, {});

  const selection = useEntitySelectionData({
    entityType: entityType,
    propertyName: displayEntityKey,
    selection: !isLoaded ? valueId : null,
  });

  const selectedItems = isLoaded
    ? Array.isArray(value) ? value : [value]
    : selection?.rows;

  const selectedMode = mode === 'single' ? undefined : mode;

  if (!entityType) 
    throw SheshaError.throwPropertyError('entityType');

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

  const options = useDeepCompareMemo<DefaultOptionType[]>(() => {
    let result: DefaultOptionType[] = null;
    if (selection.loading) {
      const items = valueId ? (Array.isArray(valueId) ? valueId : [valueId]) : [];
      result = items.map(item => ({ label: 'loading...', value: item, key: item }));
    } else {
      result = (selectedItems ?? []).map(ent => {
        const key = incomeValueFunc(outcomeValueFunc(ent, {}), {});
        return { label: getValueByPropertyName(ent, displayEntityKey), value: key, key };
      });
    }

    return result;
  }, [selectedItems]);

  return (
    <div className={styles.entityPickerContainer}>
      <div>
        {useButtonPicker ? (
          <Button onClick={handleButtonPickerClick} size={size} {...(pickerButtonProps || {})}>
            {title}
          </Button>
        ) : (
          <Space.Compact style={{ width: '100%' }}>
            <Select
              size={size}
              onDropdownVisibleChange={(_e) =>{
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
              suffixIcon={null} // hide arrow              
              onChange={handleMultiChange}
              style={{ ...style, width: `calc(100% - ${size === 'large'? '40px' : '32px'})` }}
              loading={selection.loading}
            >
              {''}
            </Select>
            <Button
              onClick={showPickerDialog}
              className={styles.pickerInputGroupEllipsis}
              disabled={disabled}
              loading={loading ?? false}
              size={size}
              icon={<EllipsisOutlined />}
            />
          </Space.Compact>
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
