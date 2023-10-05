import React, { FC } from 'react';
import { IToolboxComponent } from '../../../interfaces';
import { DashOutlined, DownOutlined } from '@ant-design/icons';
import ToolbarSettings from './toolbarSettingsPanel';
import { IToolbarProps } from './models';
import { Alert, Menu, Dropdown, Button, Divider } from 'antd';
import { IButtonGroup, IToolbarButton, ToolbarItemProps } from '../../../providers/toolbarConfigurator/models';
import { isInDesignerMode } from '../../../providers/form';
import { getActualModel, getVisibilityFunc2, useApplicationContext } from '../../../providers/form/utils';
import { ToolbarButton } from './toolbarButton';
import { ShaIcon } from '../../../components';
import { IconType } from '../../../components/shaIcon';
import { useDataTableState, useSheshaApplication } from '../../../providers';
import { nanoid } from 'nanoid/non-secure';
import { migrateV0toV1, IToolbarPropsV0 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
//import { ButtonGroup } from 'components/formDesigner/components/button/buttonGroup/buttonGroupComponent';

const ToolbarComponent: IToolboxComponent<IToolbarProps> = {
  type: 'toolbar',
  isInput: false,
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
      .add<IToolbarProps>(2, migrateV1toV2)
      .add<IToolbarProps>(3, (prev) => migratePropertyName(prev))
  ,
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

/* for Alex: uncomment this part to check the difference
export const Toolbar: FC<IToolbarProps> = ({ items, id }) => {
  console.log('LOG: toolbar', items);
  return (
    <ButtonGroup 
      items={items}
      id={id}
      isInline
    />
  );
};
*/

export const Toolbar: FC<IToolbarProps> = ({ items, id }) => {
  const allData = useApplicationContext();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { selectedRow } = useDataTableState(false) ?? {};
  const isDesignMode = allData.formMode === 'designer';

  const actualItems = items?.map((item) => getActualModel(item, allData));

  const renderItem = (item: ToolbarItemProps, uuid: string) => {
    if (!isInDesignerMode()) {
      const visibilityFunc = getVisibilityFunc2(item.customVisibility, item.name);

      const isVisible = visibilityFunc(
        allData.data,
        { selectedRow: selectedRow?.row }, // ToDo: Need to review for contexts use
        allData.formMode
      );

      if (!isVisible) return null;
    }

    switch (item.itemType) {
      case 'item':
        const itemProps = item as IToolbarButton;

        switch (itemProps.itemSubType) {
          case 'button':
            return <ToolbarButton formComponentId={id} key={uuid} selectedRow={selectedRow} {...itemProps} />;

          case 'separator':
            return <Divider type='vertical' key={uuid}/>;
            
          default:
            return null;
        }
      case 'group':
        const group = item as IButtonGroup;
        const actualGroupItems = group.childItems?.map((item) => getActualModel(item, allData));
        const menu = (
          <Menu>
            {actualGroupItems.map(childItem => (
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
          <Dropdown
            key={uuid}
            overlay={menu}
          >
            <Button
              icon={item.icon ? <ShaIcon iconName={item.icon as IconType} /> : undefined}
              type={group.buttonType}
            >
              {item.name}
              <DownOutlined />
            </Button>
          </Dropdown>
        );
    }
    return null;
  };

  if (actualItems.length === 0 && isDesignMode)
    return (
      <Alert
        className="sha-designer-warning"
        message="Toolbar is empty. Press 'Customise Toolbar' button to add items"
        type="warning"
      />
    );

  return (
    <div style={{ minHeight: '30px' }} className="sha-responsive-button-group-inline-container">
      {actualItems?.filter(({ permissions }) => anyOfPermissionsGranted(permissions || [])).map(item => renderItem(item, nanoid()))}
    </div>
  );
};

export default ToolbarComponent;