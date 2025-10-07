import React, { FC, Fragment, ReactNode } from 'react';
import FormItem from 'antd/lib/form/FormItem';
import { InputNumber, Input, Checkbox, Tooltip } from 'antd';
import { DatePicker } from '@/components/antd';
import { InputNumberProps } from 'antd/lib/input-number';
import { PickerProps } from 'antd/lib/date-picker/generatePicker';
import { CheckboxProps, CheckboxChangeEvent } from 'antd/lib/checkbox';
import { InfoCircleTwoTone, EditOutlined, LockOutlined } from '@ant-design/icons';
import { ColProps } from 'antd/lib/col';
import moment, { Moment } from 'moment';
import { useStyles } from './styles/styles';
import classNames from 'classnames';

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
  const { styles } = useStyles();
  const handleDateChange = (_: any, dateString: string): void => {
    onChange(dateString);
  };

  const handleCheckboxChange = (event: CheckboxChangeEvent): void => {
    onChange(event.target.checked);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  const renderInput = (): JSX.Element => {
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

  const renderDisplay = (): ReactNode => {
    if (dataType === 'string' || dataType === 'number') {
      return <Fragment>{value || NA}</Fragment>;
    } else if (dataType === 'date') {
      return Date.parse(`${value}`) ? moment(`${value}`).format(dateFormat) : 'NA';
    }

    return <>{Boolean(value) ? 'Yes' : 'No'}</>;
  };

  const renderFormItemProperComponent = (): JSX.Element => {
    if (isEditing) {
      return renderInput();
    }

    const iconClass = `sha-label-icon ${labelIconPlacement}`;

    const displayIcon = (): JSX.Element =>
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
          <InfoCircleTwoTone className={styles.shaEditableDisplayFormItemInfo} />
        </span>
      </span>
    </Tooltip>
  ) : (
    <Fragment>{label}</Fragment>
  );

  return (
    <FormItem
      className={classNames(styles.shaEditableDisplayFormItem, className)}
      label={displayLabel}
      {...{ labelCol, wrapperCol }}
    >
      {renderFormItemProperComponent()}
    </FormItem>
  );
};

export default EditableDisplayFormItem;
