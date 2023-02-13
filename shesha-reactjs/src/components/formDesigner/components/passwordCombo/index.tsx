import { LockOutlined } from '@ant-design/icons';
import React, { Fragment } from 'react';
import { useForm } from '../../../..';
import { IToolboxComponent } from '../../../../interfaces';
import { DataTypes, StringFormats } from '../../../../interfaces/dataTypes';
import { FormMarkup } from '../../../../providers/form/models';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { PasswordCombo } from './passwordCombo';
import settingsFormJson from './settingsForm.json';
import { confirmModel, getDefaultModel, getFormItemProps, getInputProps, IPasswordComponentProps } from './utils';

const settingsForm = settingsFormJson as FormMarkup;

const PasswordComboComponent: IToolboxComponent<IPasswordComponentProps> = {
  type: 'passwordCombo',
  name: 'Password combo',
  icon: <LockOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && dataFormat === StringFormats.password,
  factory: (model: IPasswordComponentProps) => {
    const defaultModel = getDefaultModel(model);
    const { placeholder, confirmPlaceholder, message, minLength } = defaultModel || {};
    const { formData, isComponentHidden } = useForm();

    const options = { isComponentHidden, formData };

    return (
      <Fragment>
        <PasswordCombo
          inputProps={getInputProps(defaultModel, formData)}
          placeholder={placeholder}
          confirmPlaceholder={confirmPlaceholder}
          formItemProps={getFormItemProps(defaultModel, options)}
          formItemConfirmProps={getFormItemProps(confirmModel(defaultModel), options)}
          passwordLength={minLength}
          errorMessage={message}
        />
      </Fragment>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default PasswordComboComponent;
