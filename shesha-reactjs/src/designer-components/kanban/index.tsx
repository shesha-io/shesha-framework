import { FormOutlined } from '@ant-design/icons';
import React from 'react';
import { ConfigurableFormItem } from '@/components';
import { IToolboxComponent, useDataTableStore } from '@/index';
import { Alert } from 'antd';
import KanbanReactComponent from '@/components/kanban';
import { IKanbanProps } from '@/components/kanban/model';
import { KanbanSettingsForm } from './settings';
import { RefListItemGroupConfiguratorProvider } from '@/providers/refList/provider';

const KanbanComponent: IToolboxComponent<IKanbanProps> = {
  type: 'kanban',
  isInput: false,
  name: 'Kanban',
  icon: <FormOutlined />,

  Factory: ({ model }) => {
    const store = useDataTableStore(false);

    if (!store) {
      return (
        <Alert
          showIcon
          message="Kanban not configured properly"
          description="Kanban must be placed inside a Data Table Context."
          type="warning"
        />
      );
    }

    const kanbanEntityType = model.entityType?.id;
    if (kanbanEntityType && store.modelType && kanbanEntityType !== store.modelType) {
      return (
        <Alert
          showIcon
          message="Kanban not configured properly"
          description={`Kanban entity type '${kanbanEntityType}' does not match the Data Table Context entity type '${store.modelType}'.`}
          type="warning"
        />
      );
    }
    return (
      <div>
        <ConfigurableFormItem model={model}>
          {(value) => {
            return (
              <RefListItemGroupConfiguratorProvider
                value={value}
                items={model.items}
                referenceList={model.referenceList}
                readOnly={model.readOnly}
              >
                <KanbanReactComponent
                  {...model}
                />
              </RefListItemGroupConfiguratorProvider>
            );
          }}
        </ConfigurableFormItem>
      </div>
    );
  },
  initModel: (model) => ({
    ...model,
    hideLabel: true,
  }),
  settingsFormFactory: (props) => {
    return <KanbanSettingsForm {...props} />;
  },
};

export default KanbanComponent;
