import React, { FC } from 'react';
import { useAppConfigurator } from '@/providers';
import { Space, Switch, App, SwitchProps } from 'antd';
import { CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useStyles } from './styles/styles';

type SwitchOnChange = SwitchProps['onChange'];

export const AppEditModeToggler: FC = () => {
  const { toggleShowInfoBlock, formInfoBlockVisible, softToggleInfoBlock } = useAppConfigurator();
  const { styles } = useStyles();
  const { message } = App.useApp();

  const toggleMode: SwitchOnChange = (checked, event) => {
    event.preventDefault();

    if (checked) {
      message.destroy('editModeMessage');
      message.destroy('liveModeMessage');
      message.open({
        type: 'warning',
        key: 'editModeMessage',
        content: `You are now in Edit Mode`,
        duration: 1,
        icon: <EditOutlined />,
        className: styles.shaConfigurableModeSwitcherMessageEdit,
      });
    } else {
      message.destroy('liveModeMessage');
      message.destroy('editModeMessage');
      message.open({
        type: 'success',
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
      <span className={styles.shaConfigurableModeSwitcherLabel}>{Boolean(formInfoBlockVisible) ? 'Edit Mode' : 'Live Mode'}</span>
      <Switch
        className={styles.shaConfigurableModeSwitcherSwitcher}
        title={Boolean(formInfoBlockVisible) ? 'Switch to Live mode' : 'Switch to Edit mode'}
        checked={formInfoBlockVisible}
        onChange={(checked, event) => {
          toggleShowInfoBlock(checked);
          toggleMode(checked, event);
          if (checked) {
            softToggleInfoBlock(true);
            setTimeout(() => {
              softToggleInfoBlock(false);
            }, 3000);
          } else {
            softToggleInfoBlock(false);
          }
        }}
      />
    </Space>
  );
};

export default AppEditModeToggler;
