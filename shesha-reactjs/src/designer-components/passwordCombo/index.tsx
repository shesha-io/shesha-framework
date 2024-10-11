import React, { Fragment } from 'react';
import settingsFormJson from './settingsForm.json';
import {
  confirmModel,
  getDefaultModel,
  getFormItemProps,
  getInputProps,
  IPasswordComponentProps
  } from './utils';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { FormMarkup } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import { LockOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { PasswordCombo } from './passwordCombo';
import { useForm } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { IInputStyles } from '../textField/interfaces';

const settingsForm = settingsFormJson as FormMarkup;

const PasswordComboComponent: IToolboxComponent<IPasswordComponentProps> = {
  type: 'passwordCombo',
  isInput: true,
  name: 'Password combo',
  icon: <LockOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && dataFormat === StringFormats.password,
  Factory: ({ model }) => {
    const defaultModel = getDefaultModel(model);
    const { placeholder, confirmPlaceholder, message, minLength } = defaultModel || {};
    const { formData } = useForm();

    const options = { hidden: model.hidden, formData };

    return (
      <Fragment>
        <PasswordCombo
          inputProps={{...getInputProps(defaultModel, formData), disabled: defaultModel.readOnly}}
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
  migrator: (m) => m
    .add<IPasswordComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IPasswordComponentProps>(1, (prev) => migrateReadOnly(prev))
    .add<IPasswordComponentProps>(2, (prev) => ({...migrateFormApi.eventsAndProperties(prev)}))
    .add<IPasswordComponentProps>(6, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        hideBorder: prev.hideBorder,
        style: prev.style
      };

      return { ...prev, desktop: {...styles}, tablet: {...styles}, mobile: {...styles} };
    })
  ,
};

export default PasswordComboComponent;
