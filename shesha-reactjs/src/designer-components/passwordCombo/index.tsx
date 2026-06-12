import React from 'react';
import {
  defaultStyles,
  IPasswordComponentProps,
} from './utils';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { IToolboxComponent } from '@/interfaces';
import { LockOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { IInputStyles } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getSettings } from './settingsForm';
import { ITextFieldComponentProps } from '../textField/interfaces';
import { defaultStyles as textFieldDefaultStyles } from '../textField/utils';
import { SettingsMigrationContext } from '@/interfaces/formDesigner';
import { nanoid } from '@/utils/uuid';

const CONFIRM_MATCH_VALIDATOR = `
  try {
    const formValues = form?.getFieldsValue() ?? {};
    const confirmValue = formValues['__PROPERTY_NAME__Confirm'] ?? formValues['__PROPERTY_NAME__confirm'];
    if (value && confirmValue && value !== confirmValue) {
      return Promise.reject('Passwords do not match');
    } else {
      return Promise.resolve();
    }
  } catch (e) {
    return Promise.resolve();
  }
`;

export const migratePasswordComboToTextField = (
  prev: IPasswordComponentProps,
  context: SettingsMigrationContext,
): ITextFieldComponentProps => {
  const { flatStructure } = context;

  const confirmId = nanoid();
  const confirmComponent: ITextFieldComponentProps = {
    id: confirmId,
    type: 'textField',
    propertyName: prev.repeatPropertyName || `${prev.propertyName}Confirm`,
    label: prev.confirmLabel || 'Confirm Password',
    placeholder: prev.confirmPlaceholder || 'Confirm password',
    description: prev.confirmDescription,
    textType: 'password',
    hidden: prev.hidden,
    hideLabel: true,
    editMode: prev.editMode,
    readOnly: prev.readOnly,
    parentId: prev.parentId,
    validate: {
      required: prev.validate?.required,
      validator: CONFIRM_MATCH_VALIDATOR.replace('__PROPERTY_NAME__', prev.propertyName),
      message: prev.message || 'Passwords do not match',
    },
    version: 6,
    ...textFieldDefaultStyles(),
  };

  flatStructure.allComponents[confirmId] = confirmComponent;

  const parentId = prev.parentId || 'root';
  const siblings = flatStructure.componentRelations[parentId];
  if (siblings) {
    const originalIndex = siblings.indexOf(prev.id);
    if (originalIndex !== -1) {
      siblings.splice(originalIndex + 1, 0, confirmId);
    } else {
      siblings.push(confirmId);
    }
  }

  const converted: ITextFieldComponentProps = {
    id: prev.id,
    type: 'textField',
    propertyName: prev.propertyName,
    label: prev.label,
    placeholder: prev.placeholder,
    description: prev.description,
    textType: 'password',
    hidden: prev.hidden,
    editMode: prev.editMode,
    readOnly: prev.readOnly,
    parentId: prev.parentId,
    validate: {
      required: prev.validate?.required,
    },
    version: 6,
    ...textFieldDefaultStyles(),
    desktop: prev.desktop,
    tablet: prev.tablet,
    mobile: prev.mobile,
    font: prev.font,
    background: prev.background,
    border: prev.border,
    shadow: prev.shadow,
    dimensions: prev.dimensions,
    stylingBox: prev.stylingBox,
  };

  return converted;
};

/**
 * @deprecated Use the textField component with textType: 'password' instead.
 * This component is kept only for migration of existing forms.
 * All instances are automatically migrated to two separate textField components (password + confirm) via the migrator.
 */
const PasswordComboComponent: IToolboxComponent<IPasswordComponentProps> = {
  type: 'passwordCombo',
  isInput: true,
  isHidden: true,
  name: 'Password combo (Legacy)',
  preserveDimensionsInDesigner: true,
  icon: <LockOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && dataFormat === StringFormats.password,
  Factory: () => null,
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) => m
    .add<IPasswordComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IPasswordComponentProps>(1, (prev) => migrateReadOnly(prev))
    .add<IPasswordComponentProps>(2, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IPasswordComponentProps>(6, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        hideBorder: prev.hideBorder,
        style: prev.style,
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IPasswordComponentProps>(7, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()), editMode: 'inherited' }))
    .add<ITextFieldComponentProps>(8, (prev: IPasswordComponentProps, context) => migratePasswordComboToTextField(prev, context)),
};

export default PasswordComboComponent;
