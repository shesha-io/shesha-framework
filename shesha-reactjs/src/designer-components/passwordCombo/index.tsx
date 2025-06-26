import React from 'react';
import {
  confirmModel,
  defaultStyles,
  getDefaultModel,
  getFormItemProps,
  getInputProps,
  IPasswordComponentProps
} from './utils';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { IToolboxComponent } from '@/interfaces';
import { LockOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { PasswordCombo } from './passwordCombo';
import { IInputStyles, useForm } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { ValidationErrors } from '@/components';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getSettings } from './settingsForm';
import { useStyles } from './styles';

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

    const { styles } = useStyles({ fontFamily: model?.font?.type, fontWeight: model?.font?.weight, textAlign: model?.font?.align });


    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    return (

      <PasswordCombo
        inputProps={{ ...getInputProps(defaultModel, formData), disabled: defaultModel.readOnly, className: styles.passwordCombo }}
        placeholder={placeholder}
        confirmPlaceholder={confirmPlaceholder}
        formItemProps={getFormItemProps(defaultModel, options)}
        formItemConfirmProps={getFormItemProps(confirmModel(defaultModel), options)}
        passwordLength={minLength}
        errorMessage={message}
        style={model.allStyles.fullStyle}
        className={styles.passwordCombo}
      />
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IPasswordComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IPasswordComponentProps>(1, (prev) => migrateReadOnly(prev))
    .add<IPasswordComponentProps>(2, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IPasswordComponentProps>(6, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        hideBorder: prev.hideBorder,
        style: prev.style
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IPasswordComponentProps>(7, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()), editMode: 'inherited' })),
};

export default PasswordComboComponent;
