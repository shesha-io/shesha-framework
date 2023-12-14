import { LockOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import React, { Fragment } from 'react';
import { useForm } from '@/components/..';
import { IToolboxComponent } from '../../../../interfaces';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { FormMarkup } from '@/providers/form/models';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
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
  ,
};

export default PasswordComboComponent;
