import { IToolboxComponent } from '@/interfaces/index';
import { FormMarkup } from '@/providers/form/models';
import { OneToOneOutlined } from '@ant-design/icons';
import { LabelValueEditor } from '@/components/labelValueEditor/labelValueEditor';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { ILabelValueEditorComponentProps } from './interfaces';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

const settingsForm = settingsFormJson as FormMarkup;

const LabelValueEditorComponent: IToolboxComponent<ILabelValueEditorComponentProps> = {
  type: 'labelValueEditor',
  name: 'Label Value editor',
  icon: <OneToOneOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  Factory: ({ model }) => {
    if (model.hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => <LabelValueEditor {...model} value={value} onChange={onChange} />}
      </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    .add<ILabelValueEditorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev) as ILabelValueEditorComponentProps))
    .add<ILabelValueEditorComponentProps>(1, (prev) => {
      return {
        ...prev,
        mode: prev.mode || 'dialog',
        // re-implemented initModel
        label: prev.label ?? 'Items',
        labelTitle: prev.labelTitle ?? 'Label',
        labelName: prev.labelName ?? 'label',
        valueTitle: prev.valueTitle ?? 'Value',
        valueName: prev.valueName ?? 'value',
      };
    })
    .add<ILabelValueEditorComponentProps>(2, (prev) => migrateReadOnly(prev))
    .add<ILabelValueEditorComponentProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export { LabelValueEditorComponent };
