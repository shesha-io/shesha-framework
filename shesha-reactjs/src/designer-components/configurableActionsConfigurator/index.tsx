/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import { ConfigurableActionConfigurator } from './configurator';
import { getSettings } from './settings';
import { Form } from 'antd';
import { ConfigurableActionConfiguratorComponentDefinition, IConfigurableActionConfiguratorComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { ThunderboltOutlined } from '@ant-design/icons';

import { isNullOrWhiteSpace } from '@/utils/nullables';

const ConfigurableActionConfiguratorComponent: ConfigurableActionConfiguratorComponentDefinition = {
  type: 'configurableActionConfigurator',
  name: 'Configurable Action Configurator',
  icon: <ThunderboltOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    const { propertyName, hidden = false } = model;
    if (hidden) return null;

    if (isNullOrWhiteSpace(propertyName)) {
      console.error('Property name is required for configurableActionConfigurator. Component id: ', model.id);
      return undefined;
    }
    return (
      <Form.Item name={propertyName} labelCol={{ span: 0 }} wrapperCol={{ span: 24 }} noStyle>
        <ConfigurableActionConfigurator
          allowedActions={model.allowedActions}
          editorConfig={model}
          level={1}
          readOnly={model.readOnly}
          label={model.label}
          description={model.description}
          hideLabel={model.hideLabel}
        />
      </Form.Item>
    );
  },
  settingsFormMarkup: getSettings,

  migrator: (m) => m
    .add<IConfigurableActionConfiguratorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IConfigurableActionConfiguratorComponentProps>(1, (prev) => migrateVisibility(prev)),
};

export default ConfigurableActionConfiguratorComponent;
