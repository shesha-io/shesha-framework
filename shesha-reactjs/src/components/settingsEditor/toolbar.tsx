import { CloseOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, App } from 'antd';
import React, { ReactNode, FC } from 'react';

import { useSettingsEditor } from './provider';

interface MenuItem {
  isVisible: boolean;
  content: () => ReactNode;
}

export const SettingsEditorToolbar: FC = () => {
  const { settingSelection: selectedSetting, editorMode, saveSetting, cancelEditSetting, startEditSetting } = useSettingsEditor();
  const { message } = App.useApp();

  const onEditClick = (): void => {
    startEditSetting();
  };
  const onSaveClick = (): void => {
    // saveSetting();
    saveSetting().then(() => {
      message.success('Setting saved successfully');
    });
  };
  const onCancelEditClick = (): void => {
    cancelEditSetting();
  };
  const onEditSettingConfigurationClick = (): void => {
    /* nop*/
  };

  const canEdit = Boolean(selectedSetting) && editorMode === 'readonly';
  const canSave = Boolean(selectedSetting) && editorMode === 'edit';
  const canCancelEdit = Boolean(selectedSetting) && editorMode === 'edit';
  const canEditConfigurations = false;

  const items: MenuItem[] = [
    {
      isVisible: canEdit,
      content: () => (
        <Button onClick={onEditClick} type="link">
          <EditOutlined /> Edit
        </Button>
      ),
    },
    {
      isVisible: canSave,
      content: () => (
        <Button onClick={onSaveClick} type="link">
          <SaveOutlined /> Save
        </Button>
      ),
    },
    {
      isVisible: canCancelEdit,
      content: () => (
        <Button onClick={onCancelEditClick} type="link">
          <CloseOutlined /> Cancel changes
        </Button>
      ),
    },
    {
      isVisible: canEditConfigurations,
      content: () => (
        <Button onClick={onEditSettingConfigurationClick} type="link">
          <EditOutlined /> Edit Setting Configuration
        </Button>
      ),
    },
  ];

  const visibleItems = items.filter((i) => i.isVisible);

  return visibleItems.length === 0
    ? null
    : (
      <div className="sha-components-container horizontal sha-index-toolbar">
        <div className="sha-components-container-inner">
          { visibleItems.map((item, index) => <React.Fragment key={index}>{item.content()}</React.Fragment>) }
        </div>
      </div>
    );
};

export default SettingsEditorToolbar;
