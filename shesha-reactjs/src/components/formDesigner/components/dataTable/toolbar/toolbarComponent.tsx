import React, { FC } from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { DashOutlined } from '@ant-design/icons';
import ToolbarSettings from './toolbarSettingsPanel';
import { IToolbarProps } from './models';
import { Alert, Menu, Dropdown } from 'antd';
import { IButtonGroup, IToolbarButton, ToolbarItemProps } from '../../../../../providers/toolbarConfigurator/models';
import { useForm, isInDesignerMode } from '../../../../../providers/form';
import { getVisibilityFunc2 } from '../../../../../providers/form/utils';
import { useDataTableSelection } from '../../../../../providers/dataTableSelection';
import { ToolbarButton } from './toolbarButton';
import { ShaIcon } from '../../../..';
import { IconType } from '../../../../shaIcon';
import { useSheshaApplication } from '../../../../../providers';
import { nanoid } from 'nanoid/non-secure';
import { migrateV0toV1, IToolbarPropsV0 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';

const ToolbarComponent: IToolboxComponent<IToolbarProps> = {
  type: 'toolbar',
  name: 'Toolbar',
  icon: <DashOutlined />,
  factory: (model: IToolbarProps) => {
    return <Toolbar {...model} />;
  },
  initModel: (model: IToolbarProps) => {
    return {
      ...model,
      items: [],
    };
  },
  migrator: m =>
    m
      .add<IToolbarPropsV0>(0, prev => {
        const items = prev['items'] && Array.isArray(prev['items']) ? prev['items'] : [];
        return { ...prev, items: items };
      })
      .add<IToolbarProps>(1, migrateV0toV1)
      .add<IToolbarProps>(2, migrateV1toV2),
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

export const Toolbar: FC<IToolbarProps> = ({ items, id }) => {
  const { formMode } = useForm();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { selectedRow } = useDataTableSelection(false) ?? {};
  const isDesignMode = formMode === 'designer';

  const renderItem = (item: ToolbarItemProps, uuid: string) => {
    if (!isInDesignerMode()) {
      const visibilityFunc = getVisibilityFunc2(item.customVisibility, item.name);

      const isVisible = visibilityFunc({}, { selectedRow }, formMode);

      if (!isVisible) return null;
    }

    switch (item.itemType) {
      case 'item':
        const itemProps = item as IToolbarButton;

        switch (itemProps.itemSubType) {
          case 'button':
            return <ToolbarButton formComponentId={id} key={uuid} selectedRow={selectedRow} {...itemProps} />;

          case 'separator':
            return <div key={uuid} className="sha-toolbar-separator" />;

          default:
            return null;
        }
      case 'group':
        const group = item as IButtonGroup;
        const menu = (
          <Menu>
            {group.childItems.map(childItem => (
              <Menu.Item
                key={childItem?.id}
                title={childItem.tooltip}
                danger={childItem.danger}
                icon={childItem.icon ? <ShaIcon iconName={childItem.icon as IconType} /> : undefined}
              >
                {childItem.name}
              </Menu.Item>
            ))}
          </Menu>
        );
        return (
          <Dropdown.Button
            key={uuid}
            overlay={menu}
            icon={item.icon ? <ShaIcon iconName={item.icon as IconType} /> : undefined}
          >
            {item.name}
          </Dropdown.Button>
        );
    }
    return null;
  };

  if (items.length === 0 && isDesignMode)
    return (
      <Alert
        className="sha-designer-warning"
        message="Toolbar is empty. Press 'Customise Toolbar' button to add items"
        type="warning"
      />
    );

  return (
    <div style={{ minHeight: '30px' }}>
      {items
        ?.filter(({ permissions }) => anyOfPermissionsGranted(permissions || []))
        .map(item => renderItem(item, nanoid()))}
    </div>
  );
};

export default ToolbarComponent;
