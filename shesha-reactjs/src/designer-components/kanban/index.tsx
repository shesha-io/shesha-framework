import { FormOutlined } from '@ant-design/icons';
import React from 'react';
import { ConfigurableFormItem } from '@/components';
import { IToolboxComponent, useForm } from '@/index';
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
    const form = useForm();

    if (form.formMode === 'designer' && !model.entityType) {
      return (
        <Alert
          showIcon
          message="Kanban not configured properly"
          description="Please make sure that you've specified 'entityType' property."
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
