import React, { useEffect, useState, FC } from 'react';
import { CustomFormSettingEditor } from './customFormSettingEditor';
import { Empty } from 'antd';

import { GenericSettingEditor } from './genericSettingEditor';
import { SettingValue } from './provider/models';
import { useSettingsEditor } from './provider';
import { isDefined } from '@/utils/nullables';
import { IErrorInfo } from '@/interfaces';
import { isSelectionWithSetting } from './models';

interface ISettingEditorState {
  isLoading: boolean;
  loadingError?: IErrorInfo | undefined;
  value?: SettingValue;
  initialValue?: SettingValue | undefined;
  editor?: React.ReactElement | undefined;
}

export const SettingEditor: FC = () => {
  const { settingSelection, fetchSettingValue } = useSettingsEditor();
  const [state, setState] = useState<ISettingEditorState>({ isLoading: false });

  useEffect(() => {
    const { setting } = settingSelection || {};
    if (isDefined(settingSelection) && isSelectionWithSetting(settingSelection) && isDefined(setting)) {
      setState((prev) => ({ ...prev, isLoading: true }));
      fetchSettingValue({
        name: setting.name,
        module: setting.module,
        appKey: settingSelection.app?.appKey,
      }).then((response) => {
        const editor = setting.editorForm
          ? <CustomFormSettingEditor selection={settingSelection} value={response} key={setting.name} />
          : <GenericSettingEditor selection={settingSelection} value={response} key={setting.name} />;
        setState((prev) => ({ ...prev, isLoading: false, value: response, initialValue: response, editor }));
      }).catch((error) => {
        console.error('Failed to fetch setting', error);
        throw error;
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false, value: null, loadingError: undefined, editor: undefined }));
    }
  }, [fetchSettingValue, settingSelection]);

  return state.editor
    ? state.editor
    : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a setting to begin editing" />;
};

export default SettingEditor;
