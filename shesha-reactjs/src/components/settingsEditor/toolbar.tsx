import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import React from 'react';
import { FC } from 'react';
import { useSettingsEditor } from './provider';

export interface ISettingsEditorToolbarProps {

}

export const SettingsEditorToolbar: FC<ISettingsEditorToolbarProps> = () => {

    const { settingSelection: selectedSetting, editorMode, saveSetting, cancelEditSetting, startEditSetting } = useSettingsEditor();

    const onNewClick = () => {

    }
    const onDeleteClick = () => {

    }
    const onEditClick = () => {
        startEditSetting();
    }
    const onSaveClick = () => {
        //saveSetting();
        saveSetting().then(() => {
            message.success('Setting saved successfully');
        });
    }
    const onCancelEditClick = () => {
        cancelEditSetting();
    }
    const onEditSettingConfigurationClick = () => {

    }

    const canEdit = Boolean(selectedSetting) && editorMode === 'readonly';
    const canSave = Boolean(selectedSetting) && editorMode === 'edit';
    const canCancelEdit = Boolean(selectedSetting) && editorMode === 'edit';
    const canEditConfigurations = false;
    
    return (
        <div className="sha-components-container horizontal sha-index-toolbar">
            <div className="sha-components-container-inner">
                {false && (
                    <Button onClick={onNewClick} type="link">
                        <PlusOutlined /> New
                    </Button>)}
                {
                    false && (
                        <Button onClick={onDeleteClick} type="link">
                            <DeleteOutlined /> Delete
                        </Button>)
                }
                {
                    canEdit && (
                        <Button onClick={onEditClick} type="link">
                            <EditOutlined /> Edit
                        </Button>
                    )
                }
                {
                    canSave && (
                        <Button onClick={onSaveClick} type="link">
                            <SaveOutlined /> Save
                        </Button>
                    )
                }
                {
                    canCancelEdit && (
                        <Button onClick={onCancelEditClick} type="link">
                            <CloseOutlined /> Cancel Edit
                        </Button>
                    )
                }

                {canEditConfigurations && (
                    <Button onClick={onEditSettingConfigurationClick} type="link">
                        <EditOutlined /> Edit Setting Configuration
                    </Button>
                )}
            </div>
        </div>
    );
}

export default SettingsEditorToolbar;