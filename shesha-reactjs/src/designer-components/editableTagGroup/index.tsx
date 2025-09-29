import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { HomeOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import { EditableTagGroup } from '@/components';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { DataTypes } from '@/interfaces/dataTypes';
import { IEditableTagGroupComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

const settingsForm = settingsFormJson as FormMarkup;

const EditableTagGroupComponent: IToolboxComponent<IEditableTagGroupComponentProps> = {
  type: 'editableTagGroup',
  name: 'Tags Outlined',
  icon: <HomeOutlined />,
  isInput: true,
  isOutput: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => (<EditableTagGroup value={value} defaultValue={model?.defaultValue} onChange={onChange} readOnly={model.readOnly} />)}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  migrator: (m) => m
    .add<IEditableTagGroupComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IEditableTagGroupComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IEditableTagGroupComponentProps>(2, (prev) => migrateReadOnly(prev))
    .add<IEditableTagGroupComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default EditableTagGroupComponent;
