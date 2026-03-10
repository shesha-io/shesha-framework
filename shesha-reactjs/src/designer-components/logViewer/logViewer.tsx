import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { SmallDashOutlined } from '@ant-design/icons';
import React from 'react';
import { ILogViewerProps } from './interfaces';
import { LogViewerRenderer } from './logViewerRenderer';
import settingsFormJson from './settingsForm.json';

const settingsForm = settingsFormJson as FormMarkup;

const LogViewer: IToolboxComponent<ILogViewerProps> = {
  type: 'logViewer',
  isInput: false,
  name: 'Log Viewer',
  icon: <SmallDashOutlined />,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        <LogViewerRenderer />
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => {
    return {
      ...model,
      hideLabel: true,
      label: "Log Viewer",
    };
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default LogViewer;
