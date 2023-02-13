import { SmallDashOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { ScheduledJobExecutionProvider, useShaRouting } from '../../../../providers';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import ConfigurableFormItem from '../formItem';
import ScheduledJobExecution from './scheduledJobExecution';
import settingsFormJson from './settingsForm.json';

export interface ISwitchProps extends IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

const ScheduledJobExecutionLog: IToolboxComponent<ISwitchProps> = {
  type: 'scheduledJobExecutionLog',
  name: 'ScheduledJobExecutionLog',
  icon: <SmallDashOutlined />,
  factory: (model: IConfigurableFormComponent) => {
    const { router } = useShaRouting();

    const id = router?.query?.id?.toString();

    model.hideLabel = true;

    return (
      <ConfigurableFormItem model={model}>
        <Skeleton loading={!id}>
          <ScheduledJobExecutionProvider id={id}>
            <ScheduledJobExecution />
          </ScheduledJobExecutionProvider>
        </Skeleton>
      </ConfigurableFormItem>
    );
  },
  initModel: model => {
    return {
      ...model,
      label: 'ScheduledJobExecutionLog',
    };
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default ScheduledJobExecutionLog;
