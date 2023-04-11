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

const settingsForm = settingsFormJson as FormMarkup;

const EditableTagGroupComponent: IToolboxComponent<IEditableTagGroupComponentProps> = {
  type: 'editableTagGroup',
  name: 'TagsOutlined',
  icon: <HomeOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.array,
  factory: (model: IEditableTagGroupComponentProps) => {
    const { formMode } = useForm();
    return (
      <ConfigurableFormItem model={model}>
        <EditableTagGroup
          value={model?.value}
          defaultValue={model?.defaultValue}
          onChange={model?.onChange}
          readOnly={formMode === 'readonly'}
        />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default EditableTagGroupComponent;
