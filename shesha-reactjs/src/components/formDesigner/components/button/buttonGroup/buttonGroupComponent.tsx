import { GroupOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { useSheshaApplication } from '../../../../../providers';
import { useForm } from '../../../../../providers/form';
import ButtonGroup from './buttonGroup';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { IButtonGroupProps } from './models';
import ToolbarSettings from './settings';
import { getButtonGroupItems } from './utils';

const ButtonGroupComponent: IToolboxComponent<IButtonGroupProps> = {
  type: 'buttonGroup',
  name: 'Button Group',
  icon: <GroupOutlined />,
  factory: (props: IButtonGroupProps) => {
    const model = { ...props, items: getButtonGroupItems(props) } as IButtonGroupProps;
    const { isComponentHidden, formMode } = useForm();
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const hidden = isComponentHidden({ id: model?.id, isDynamic: model?.isDynamic, hidden: model?.hidden });
    const granted = anyOfPermissionsGranted(model?.permissions || []);

    if ((hidden || !granted) && formMode !== 'designer') return null;

    // TODO: Wrap this component within ConfigurableFormItem so that it will be the one handling the hidden state. Currently, it's failing. Always hide the component
    return <ButtonGroup {...model} />;
  },
  migrator: (m) =>
    m
      .add<IButtonGroupProps>(0, (prev) => {
        return {
          ...prev,
          items: prev['items'] ?? [],
        };
      })
      .add<IButtonGroupProps>(1, migrateV0toV1)
      .add<IButtonGroupProps>(2, migrateV1toV2)
      .add<IButtonGroupProps>(
        3,
        (prev) => ({
          ...prev,
          isInline: prev['isInline'] ?? true,
        }) /* default isInline to true if not specified */
      ),
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <ToolbarSettings
        readOnly={readOnly}
        model={model}
        onSave={onSave}
        onCancel={onCancel}
        onValuesChange={onValuesChange}
      />
    );
  },
};

export default ButtonGroupComponent;
