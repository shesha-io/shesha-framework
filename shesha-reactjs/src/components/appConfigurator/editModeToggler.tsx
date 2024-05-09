import React, { FC } from 'react';
import { useAppConfigurator } from '@/providers';
import { message, Space, Switch } from 'antd';
import { RebaseEditOutlined } from '@/icons/rebaseEditOutlined';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useStyles } from './styles/styles';

export interface IAppEditModeTogglerProps { }

export const AppEditModeToggler: FC<IAppEditModeTogglerProps> = () => {
  const { mode, switchApplicationMode } = useAppConfigurator();
  const { styles } = useStyles();

  const [messageApi, contextHolder] = message.useMessage();

  const toggleMode = (checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    switchApplicationMode(checked ? 'edit' : 'live');
    if (checked) {
      messageApi.destroy('editModeMessage');
      messageApi.destroy('liveModeMessage');
      messageApi.open({
        key: 'editModeMessage',
        content: `You are now in Edit Mode!`,
        duration: 1,
        icon: <RebaseEditOutlined />,
        className: styles.shaConfigurableModeSwitcherMessageEdit,
      });
    } else {
      messageApi.destroy('liveModeMessage');
      messageApi.destroy('editModeMessage');
      messageApi.open({
        key: 'liveModeMessage',
        content: 'You are now in Live Mode!',
        duration: 1,
        icon: <CheckCircleOutlined />,
        className: styles.shaConfigurableModeSwitcherMessageLive,
      });
    }
  };

  return (
    <Space>
      {contextHolder}
      <span className={styles.shaConfigurableModeSwitcherLabel}>{mode === 'edit' ? 'Edit Mode' : 'Live Mode'}</span>
      <Switch className={styles.shaConfigurableModeSwitcherSwitcher}
        title={mode === 'edit' ? 'Switch to Live mode' : 'Switch to Edit mode'}
        checked={mode === 'edit'}
        onChange={toggleMode}
      />
    </Space>
  );
};

export default AppEditModeToggler;
