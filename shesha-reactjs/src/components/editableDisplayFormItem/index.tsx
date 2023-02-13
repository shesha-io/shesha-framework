import React, { FC, Fragment } from 'react';
import FormItem from 'antd/lib/form/FormItem';
import { InputNumber, Input, Checkbox, Tooltip, DatePicker } from 'antd';
import { InputNumberProps } from 'antd/lib/input-number';
import { PickerProps } from 'antd/lib/date-picker/generatePicker';
import { CheckboxProps, CheckboxChangeEvent } from 'antd/lib/checkbox';
import { InfoCircleTwoTone, EditOutlined, LockOutlined } from '@ant-design/icons';
import { ColProps } from 'antd/lib/col';
import moment, { Moment } from 'moment';

const LAYOUT = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

type EditableDisplayLabelType = number | string | boolean;

const NA = 'N/A';

export interface IEditableDisplayLabelProps {
  value?: EditableDisplayLabelType;
  dateFormat?: string;
  dataType?: 'string' | 'number' | 'boolean' | 'date';
  onChange?: (value: EditableDisplayLabelType) => void;
  onStartEdit?: () => void;
  isEditing?: boolean;
  className?: string;
  label?: string;
  readOnly?: boolean;
  infoText?: string;
  inputNumberProps?: InputNumberProps;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  checkboxProps?: CheckboxProps;
  datePickerPropsProps?: PickerProps<Moment>;
  labelIconPlacement?: 'default' | 'right';
}

export const EditableDisplayFormItem: FC<IEditableDisplayLabelProps> = ({
  value,
  dataType = 'string',
  onChange,
  onStartEdit,
  isEditing,
  readOnly = false,
  infoText,
  className,
  inputNumberProps,
  datePickerPropsProps,
  checkboxProps,
  label,
  labelCol = LAYOUT.labelCol,
  wrapperCol = LAYOUT.wrapperCol,
  dateFormat = 'DD/MM/YYYY',
  labelIconPlacement = 'default',
}) => {
  const handleDateChange = (_: any, dateString: string) => {
    onChange(dateString);
  };

  const handleCheckboxChange = (event: CheckboxChangeEvent) => {
    onChange(event.target.checked);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const renderInput = () => {
    if (dataType === 'string') {
      return <Input value={value as string} onChange={handleTextChange} />;
    } else if (dataType === 'date') {
      const date = Date.parse(value as string) ? moment(value as string) : null;
      return <DatePicker onChange={handleDateChange} {...datePickerPropsProps} value={date} />;
    } else if (dataType === 'number') {
      return <InputNumber onChange={onChange} {...inputNumberProps} value={value as number} />;
    }

    return <Checkbox checked={!!value} {...checkboxProps} onChange={handleCheckboxChange} />;
  };

  const renderDisplay = () => {
    if (dataType === 'string' || dataType === 'number') {
      return <Fragment>{value || NA}</Fragment>;
    } else if (dataType === 'date') {
      return Date.parse(`${value}`) ? moment(`${value}`).format(dateFormat) : 'NA';
    }

    return <>{Boolean(value) ? 'Yes' : 'No'}</>;
  };

  const renderFormItemProperComponent = () => {
    if (isEditing) {
      return renderInput();
    }

    const iconClass = `sha-label-icon ${labelIconPlacement}`;

    const displayIcon = () =>
      readOnly ? (
        <LockOutlined className={iconClass} />
      ) : (
        <EditOutlined className={iconClass} onClick={onStartEdit} />
      );

    return (
      <Fragment>
        {renderDisplay()} {displayIcon()}
      </Fragment>
    );
  };

  const displayLabel = infoText ? (
    <Tooltip title={<span>{infoText}</span>} placement="right">
      <span>
        {label}{' '}
        <span>
          <InfoCircleTwoTone className="sha-editable-display-form-item-info" />
        </span>
      </span>
    </Tooltip>
  ) : (
    <Fragment>{label}</Fragment>
  );

  return (
    <FormItem
      className={`sha-editable-display-form-item${className ? ` ${className}` : ''}`}
      label={displayLabel}
      {...{ labelCol, wrapperCol }}
    >
      {renderFormItemProperComponent()}
    </FormItem>
  );
};

export default EditableDisplayFormItem;
