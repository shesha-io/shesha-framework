import React, { FC } from 'react';
import { useAppConfigurator } from '@/providers';
import { message, Space, Switch } from 'antd';
import { CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useStyles } from './styles/styles';

export interface IAppEditModeTogglerProps { }

export const AppEditModeToggler: FC<IAppEditModeTogglerProps> = () => {
  const { toggleShowInfoBlock, formInfoBlockVisible } = useAppConfigurator();
  const { styles } = useStyles();

  const [messageApi, contextHolder] = message.useMessage();

  const toggleMode = (checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    
    if (checked) {
      messageApi.destroy('editModeMessage');
      messageApi.destroy('liveModeMessage');
      messageApi.open({
        key: 'editModeMessage',
        content: `You are now in Edit Mode`,
        duration: 1,
        icon: <EditOutlined />,
        className: styles.shaConfigurableModeSwitcherMessageEdit,
      });
    } else {
      messageApi.destroy('liveModeMessage');
      messageApi.destroy('editModeMessage');
      messageApi.open({
        key: 'liveModeMessage',
        content: 'You are now in Live Mode',
        duration: 1,
        icon: <CheckCircleOutlined />,
        className: styles.shaConfigurableModeSwitcherMessageLive,
      });
    }
  };

  return (
    <Space className={styles.shaConfigItemModeToggler}>
      {contextHolder}
      <span className={styles.shaConfigurableModeSwitcherLabel}>{Boolean(formInfoBlockVisible) ? 'Edit Mode' : 'Live Mode'}</span>
      <Switch className={styles.shaConfigurableModeSwitcherSwitcher}
        title={Boolean(formInfoBlockVisible) ? 'Switch to Live mode' : 'Switch to Edit mode'}
        checked={formInfoBlockVisible}
        onChange={(checked, event) => {
toggleShowInfoBlock(checked); toggleMode(checked,event);
}}
      />
    </Space>
  );
};

export default AppEditModeToggler;
