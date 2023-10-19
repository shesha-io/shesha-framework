import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup } from '../../../../providers/form/models';
import { HomeOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { EditableTagGroup } from '../../..';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { DataTypes } from '../../../../interfaces/dataTypes';
import { useForm } from '../../../../providers';
import { IEditableTagGroupComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName } from '../../../../designer-components/_common-migrations/migrateSettings';

const settingsForm = settingsFormJson as FormMarkup;

const EditableTagGroupComponent: IToolboxComponent<IEditableTagGroupComponentProps> = {
  type: 'editableTagGroup',
  name: 'Tags Outlined',
  icon: <HomeOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  factory: (model: IEditableTagGroupComponentProps) => {
    const { formMode, isComponentDisabled } = useForm();

    const disabled = isComponentDisabled(model) || formMode === 'readonly';

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => (<EditableTagGroup value={value} defaultValue={model?.defaultValue} onChange={onChange} readOnly={disabled} />)}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  migrator: (m) => m
    .add<IEditableTagGroupComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default EditableTagGroupComponent;
