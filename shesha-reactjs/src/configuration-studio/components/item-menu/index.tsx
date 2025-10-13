import { CustomErrorBoundary } from '@/components';
import { useConfigurationStudio } from '@/configuration-studio/cs/contexts';
import { useActiveDoc } from '@/configuration-studio/cs/hooks';
import { buildConfiguraitonItemMenu } from '@/configuration-studio/menu-utils';
import { TreeNodeType } from '@/configuration-studio/models';
import { getIcon } from '@/configuration-studio/tree-utils';
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Space } from 'antd';
import React, { FC, useMemo } from 'react';

type MenuItems = MenuProps["items"];

export const ConfigurationItemMenu: FC = () => {
  const cs = useConfigurationStudio();
  const activeDoc = useActiveDoc();

  // TODO: add current tree selection to the dependencies list
  const menuItems = useMemo<MenuItems>(() => {
    return activeDoc
      ? buildConfiguraitonItemMenu({
        configurationStudio: cs,
        node: {
          id: activeDoc.itemId,
          key: activeDoc.itemId,
          nodeType: TreeNodeType.ConfigurationItem,
          itemType: activeDoc.itemType,
          name: activeDoc.label,
          label: activeDoc.label,
          moduleId: activeDoc.moduleId,
          moduleName: activeDoc.moduleName,
          flags: activeDoc.flags,
        },
      })
      : [];
  }, [cs, activeDoc]);

  if (!activeDoc)
    return undefined;
  const icon = getIcon(TreeNodeType.ConfigurationItem, activeDoc.itemType);

  return (
    <CustomErrorBoundary key={activeDoc.itemId}>
      <Dropdown menu={{ items: menuItems }}>
        <Button title={`${activeDoc.moduleName}/${activeDoc.label}`}>
          <Space>
            {activeDoc.label}
            {icon}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
    </CustomErrorBoundary>
  );
};
