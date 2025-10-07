import { ITableViewProps } from '@/providers/dataTable/filters/models';
import { QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import React, { FC, useState } from 'react';
import { FilterItemSettingsModal } from './filterItemSettingsModal';
import { useStyles } from '@/components/listEditor/styles/styles';
import { useStyles as useItemStyles } from './styles';
import { ItemChangeDetails } from '@/components/listEditor';

export interface IFilterItemProps {
  value?: ITableViewProps;
  onChange?: (newValue: ITableViewProps, changeDetails: ItemChangeDetails) => void;
  readOnly: boolean;
}

export const FilterItem: FC<IFilterItemProps> = ({ value, onChange, readOnly }) => {
  const { styles } = useStyles();
  const { styles: itemStyles } = useItemStyles();

  const { name, tooltip } = value;
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);

  const onEditBtnClick = (): void => {
    setSettingsVisible(true);
  };

  const onSaveSettings = (newValue: ITableViewProps): void => {
    onChange(newValue, undefined);
    setSettingsVisible(false);
  };

  const onCancelSettings = (): void => {
    setSettingsVisible(false);
  };

  return (
    <>
      <div className={itemStyles.filterItem}>
        <Space>
          {name}

          {tooltip && (
            <Tooltip title={tooltip} className={styles.helpIcon}>
              <QuestionCircleOutlined />
            </Tooltip>
          )}
        </Space>
        <div className={itemStyles.controls}>
          <Button type="link" icon={<SettingOutlined />} onClick={onEditBtnClick} size="small" />
        </div>
      </div>
      {settingsVisible && <FilterItemSettingsModal value={value} onSave={onSaveSettings} onCancel={onCancelSettings} readOnly={readOnly} />}
    </>
  );
};
