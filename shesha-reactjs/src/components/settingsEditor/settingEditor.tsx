import React, { useEffect, useState, FC } from 'react';
import { CustomFormSettingEditor } from './customFormSettingEditor';
import { Empty } from 'antd';

import { GenericSettingEditor } from './genericSettingEditor';
import { SettingValue } from './provider/models';
import { useSettingsEditor } from './provider';

interface ISettingEditorState {
  isLoading: boolean;
  loadingError?: any;
  value?: SettingValue;
  initialValue?: SettingValue;
  editor?: React.ReactElement;
}

export const SettingEditor: FC = () => {
  const { settingSelection, fetchSettingValue } = useSettingsEditor();
  const [state, setState] = useState<ISettingEditorState>({ isLoading: false });

  useEffect(() => {
    if (settingSelection) {
      setState((prev) => ({ ...prev, isLoading: true }));
      fetchSettingValue({
        name: settingSelection.setting.name,
        module: settingSelection.setting.module,
        appKey: settingSelection.app?.appKey,
      }).then((response) => {
        const editor = settingSelection.setting.editorForm
          ? <CustomFormSettingEditor selection={settingSelection} value={response} key={settingSelection.setting.name} />
          : <GenericSettingEditor selection={settingSelection} value={response} key={settingSelection.setting.name} />;
        setState((prev) => ({ ...prev, isLoading: false, value: response, initialValue: response, editor }));
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false, value: null, loadingError: null, editor: null }));
    }
  }, [settingSelection]);

  return state.editor
    ? state.editor
    : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a setting to begin editing" />;
};

export default SettingEditor;
