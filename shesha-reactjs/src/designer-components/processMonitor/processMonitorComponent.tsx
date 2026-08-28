import { MonitorOutlined } from '@ant-design/icons';
import { IToolboxComponent } from '@/interfaces';
import { FormMarkup } from '@/providers/form/models';

import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import settingsFormJson from './settingsForm.json';
import { ProcessMonitorProvider } from '@/providers/processMonitor/providers';
import { IProcessMonitorProps } from './interfaces';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';

const settingsForm = settingsFormJson as FormMarkup;

const ProcessMonitor: IToolboxComponent<IProcessMonitorProps> = {
  type: 'processMonitor',
  isInput: false,
  name: 'Process Monitor',
  icon: <MonitorOutlined />,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        {model.id && (
          <ProcessMonitorProvider processType={model.processType} processId={model.processId} componentName={model.componentName}>
            <ComponentsContainer containerId={model.id} />
          </ProcessMonitorProvider>
        )}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => {
    return {
      ...model,
      hideLabel: true,
      label: "Process Monitor",
    };
  },
  settingsFormMarkup: settingsForm,

};

export default ProcessMonitor;
