import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup } from '../../../../providers/form/models';
import { OneToOneOutlined } from '@ant-design/icons';
import { LabelValueEditor } from './labelValueEditor';
import ConfigurableFormItem from '../formItem';
import { ILabelValueEditorComponentProps } from './interfaces';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { migrateCustomFunctions, migratePropertyName } from '../../../../designer-components/_common-migrations/migrateSettings';

const settingsForm = settingsFormJson as FormMarkup;

const LabelValueEditorComponent: IToolboxComponent<ILabelValueEditorComponentProps> = {
  type: 'labelValueEditor',
  name: 'Label Value editor',
  icon: <OneToOneOutlined />,
  canBeJsSetting: true,
  factory: model => {
    const customProps = model as ILabelValueEditorComponentProps;

    if (model.hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => <LabelValueEditor {...customProps} value={value} onChange={onChange}/>}
      </ConfigurableFormItem>
    );
  },
  initModel: model => {
    const customModel: ILabelValueEditorComponentProps = {
      ...model,
      label: 'Items',
      labelTitle: 'Label',
      labelName: 'label',
      valueTitle: 'Value',
      valueName: 'value',
    };

    return customModel;
  },
  migrator: (m) => m
    .add<ILabelValueEditorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev) as ILabelValueEditorComponentProps))
  ,
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default LabelValueEditorComponent;
