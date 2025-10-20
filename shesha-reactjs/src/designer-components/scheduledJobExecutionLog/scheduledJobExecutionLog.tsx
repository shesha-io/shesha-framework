import { SmallDashOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { ScheduledJobExecutionProvider, useShaRouting } from '@/providers';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import ScheduledJobExecution from './scheduledJobExecution';
import settingsFormJson from './settingsForm.json';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';

export type IScheduledJobExecutionLogProps = IConfigurableFormComponent;

const settingsForm = settingsFormJson as FormMarkup;

/**
 * @deprecated
 */
const ScheduledJobExecutionLog: IToolboxComponent<IScheduledJobExecutionLogProps> = {
  type: 'scheduledJobExecutionLog',
  isInput: false,
  name: 'ScheduledJobExecutionLog',
  icon: <SmallDashOutlined />,
  Factory: ({ model }) => {
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
  initModel: (model) => {
    return {
      ...model,
      label: 'ScheduledJobExecutionLog',
    };
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) => m
    .add<IConfigurableFormComponent>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IConfigurableFormComponent>(1, (prev) => migrateReadOnly(prev)),
};

export default ScheduledJobExecutionLog;
