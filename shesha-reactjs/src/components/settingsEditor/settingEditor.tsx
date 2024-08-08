import React, { useEffect, useState } from 'react';
import { CustomFormSettingEditor } from './customFormSettingEditor';
import { Empty } from 'antd';
import { FC } from 'react';
import { GenericSettingEditor } from './genericSettingEditor';
import { SettingValue } from './provider/models';
import { useSettingsEditor } from './provider';

export interface ISettingEditorProps {

}

interface ISettingEditorState {
    isLoading: boolean;
    loadingError?: any;
    value?: SettingValue;
    initialValue?: SettingValue;
}

export const SettingEditor: FC<ISettingEditorProps> = () => {
    const { settingSelection, fetchSettingValue } = useSettingsEditor();
    const [state, setState] = useState<ISettingEditorState>({ isLoading: false });

    useEffect(() => {
        if (settingSelection) {
            setState(prev => ({ ...prev, isLoading: true, value: null }));
            fetchSettingValue({
                name: settingSelection.setting.name,
                module: settingSelection.setting.module,
                appKey: settingSelection.app?.appKey
            }).then(response => {
                setSatate(prev => ({ ...prev, isLoading: false, value: response, initialValue: response }));
            });
        } else
            setState(prev => ({ ...prev, isLoading: false, value: null, loadingError: null }));
    }, [settingSelection]);

    return settingSelection
        ? (
            settingSelection.setting.editorForm
                ? <CustomFormSettingEditor selection={settingSelection} value={state.value} key={settingSelection.setting.name}/>
                : <GenericSettingEditor selection={settingSelection} value={state.value} key={settingSelection.setting.name}/>
        )
        : (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    'Please select a setting to begin editing'
                }
            />
        );
};

export default SettingEditor;
