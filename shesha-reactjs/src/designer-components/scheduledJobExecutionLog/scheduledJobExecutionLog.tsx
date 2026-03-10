import { SmallDashOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';

interface IProcessMonitorProps extends IConfigurableFormComponent {
  processId: string;
  components: IConfigurableFormComponent[]; // Only important for fluent API
}

/**
 * @deprecated
 */
const ScheduledJobExecutionLog: IToolboxComponent<IConfigurableFormComponent> = {
  type: 'scheduledJobExecutionLog',
  isInput: false,
  name: 'ScheduledJobExecutionLog',
  icon: <SmallDashOutlined />,
  Factory: () => {
    throw new Error('ScheduledJobExecutionLog component is deprecated');
  },
  migrator: (m) => m
    .add<IConfigurableFormComponent>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IConfigurableFormComponent>(1, (prev) => migrateReadOnly(prev))
    .add<IProcessMonitorProps>(2, (prev) => {
      return {
        ...prev,
        type: 'processMonitor',
        processId: prev['processId'] ?? '',
        components: [
          { id: `${prev.id}log`, type: 'logViewer', propertyName: 'logViewer' },
        ],
        version: undefined,
      };
    }),
};

export default ScheduledJobExecutionLog;
