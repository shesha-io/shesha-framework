import { InfoCircleOutlined } from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { FC } from 'react';
import { Show } from '../..';
import { useSettingsEditor } from './provider';
import { ISettingConfiguration } from './provider/models';

export interface IProps {
  setting: ISettingConfiguration;
  index: number;
}

const SettingItem: FC<IProps> = ({ setting /*, index*/ }) => {
  const { selectSetting, settingSelection: selectedSetting } = useSettingsEditor();
  const ComponentContent = () => (
    <div>
      {/* {component.icon} */}
      <Space size="small">
        <span>{setting.label}</span>

        <Show when={Boolean(setting?.description)}>
          <Tooltip title={setting?.description}>
            <InfoCircleOutlined />
          </Tooltip>
        </Show>
      </Space>
    </div>
  );

  //selectedSetting

  const onClick = () => {
    console.log('LOG: select', { setting, selectedSetting });
    selectSetting(setting);
  }

  return (
    <div
      className={classNames('sha-toolbox-component', { selected: setting.id === selectedSetting?.id })}
      onClick={onClick}
    >
      <ComponentContent />
    </div>
  );
};

export default SettingItem;
