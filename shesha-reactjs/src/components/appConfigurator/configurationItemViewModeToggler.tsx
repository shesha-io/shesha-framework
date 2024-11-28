import { BlockOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Tag, Typography } from 'antd';
import React, { FC, ReactNode, useMemo } from 'react';
import { useAppConfigurator } from '@/providers';
import { ConfigurationItemsViewMode } from '@/providers/appConfigurator/models';
import { useStyles } from './styles/styles';

const { Text } = Typography;

export interface IAppEditModeTogglerProps {}

interface IConfigurationItemModeSummary {
  mode: ConfigurationItemsViewMode;
  label: string;
  description?: ReactNode | string;
  color: string;
}
const ConfigurationItemModes: IConfigurationItemModeSummary[] = [
  {
    mode: 'live',
    label: 'Live',
    description: (
      <Text type="secondary">
        <>
          Display only published versions of configuration items.
          <br />
          It's a default view for regular users.
        </>
      </Text>
    ),
    color: '#87d068',
  },
  {
    mode: 'ready',
    label: 'Ready',
    description: 'Display ready versions where available with fallback to live',
    color: '#4DA6FF',
  },
  {
    mode: 'latest',
    label: 'Latest',
    description: 'Display latest versions of configuration items irrespectively of their status',
    color: '#b4b4b4',
  },
];

export const ConfigurationItemViewModeToggler: FC<IAppEditModeTogglerProps> = () => {
  const {
    configurationItemMode,
    switchConfigurationItemMode,
  } = useAppConfigurator();
  const { styles } = useStyles();

  const menuItems = useMemo<MenuProps['items']>(() => {
    return ConfigurationItemModes.map(item => ({
      key: item.mode,
      label: (
        <div>
          <Tag color={item.color} style={{ cursor: 'pointer' }}>
            {item.label}
          </Tag>
          {item.description && (
            <>
              <br />
              <Text type="secondary">{item.description}</Text>
            </>
          )}
        </div>
      ),
      onClick: () => switchConfigurationItemMode(item.mode),
    }));
  }, [configurationItemMode]);

  const currentMode = useMemo(() => {
    return ConfigurationItemModes.find(m => m.mode === configurationItemMode);
  }, [configurationItemMode]);

  return (
    <Dropdown
      menu={{ items: menuItems, selectable: true, selectedKeys: [configurationItemMode] }}
      className={styles.shaConfigItemModeToggler}
      trigger={['click']}
      dropdownRender={menu => (
        <div className={styles.appModesDropdown}>
          {menu}
        </div>
      )}
    >
      <Tag
        className="hidden-sm-scr"
        color={currentMode?.color}
        icon={<BlockOutlined />}
        style={{ cursor: 'pointer', margin: 0 }}
        title="Click to change view mode"
      >
        {currentMode?.label ?? 'unknown'}
      </Tag>
    </Dropdown>
  );
};

export default ConfigurationItemViewModeToggler;
