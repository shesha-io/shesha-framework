import React, { FC } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { HomeOutlined } from '@ant-design/icons';
import { InputProps } from 'antd/lib/input';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { AutoCompletePlaces } from '../../../';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm } from '../../../..';
import ReadOnlyDisplayFormItem from '../../../readOnlyDisplayFormItem';

export interface IAddressCompomentProps extends IConfigurableFormComponent {
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  hideBorder?: boolean;
}

const settingsForm = settingsFormJson as FormMarkup;

const AddressCompoment: IToolboxComponent<IAddressCompomentProps> = {
  type: 'address',
  name: 'Address',
  icon: <HomeOutlined />,
  factory: (model: IAddressCompomentProps) => {
    const { formMode } = useForm();

    const readOnly = model?.readOnly || formMode === 'readonly';

    return (
      <ConfigurableFormItem model={model}>
        {readOnly ? <ReadOnlyDisplayFormItem disabled={model?.disabled} /> : <AutoCompletePlacesField {...model} />}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

interface IAutoCompletePlacesFieldProps extends IAddressCompomentProps {
  value?: any;
  onChange?: any;
}

const AutoCompletePlacesField: FC<IAutoCompletePlacesFieldProps> = props => {
  const { formMode, formData } = useForm();

  const completeModel = { ...(props || {}) };

  if (typeof completeModel === 'object') {
    completeModel.readOnly = props?.readOnly || formMode === 'readonly';
  }

  const inputProps: InputProps = {
    placeholder: props?.placeholder,
    prefix: props?.prefix,
    suffix: props?.suffix,
    disabled: props?.disabled,
    bordered: !props?.hideBorder,
    readOnly: props?.readOnly,
    style: getStyle(props?.style, formData),
    size: props?.size,
  };

  return (
    <AutoCompletePlaces
      className="search-input text-center"
      value={props.value}
      onChange={props.onChange}
      {...inputProps}
    />
  );
};

export default AddressCompoment;
