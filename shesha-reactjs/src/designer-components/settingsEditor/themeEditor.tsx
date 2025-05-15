import { IToolboxComponent } from '@/interfaces';
import { EditOutlined } from '@ant-design/icons';
import React, { useEffect, useRef } from 'react';
import { ConfigurableThemeContent } from '@/generic-pages/settings/dynamic-theme/content';
import { FormMarkup, IConfigurableTheme, useShaFormInstance, useSheshaApplication, useTheme, validateConfigurableComponentSettings } from '@/index';
import settingsFormJson from './settingsForm.json';
import { useSettingsEditor } from '@/components/settingsEditor/provider';
import { FRONTEND_DEFAULT_APP_KEY, ISettingIdentifier } from '@/components/settingsEditor/provider/models';
import { useShaFormUpdateDate } from '@/providers/form/providers/shaFormProvider';

const settingsForm = settingsFormJson as FormMarkup;

const ThemeEditorComponent: IToolboxComponent<any> = {
  type: 'themeEditor',
  name: 'Theme editor',
  icon: <EditOutlined />,
  isInput: true,
  isOutput: true,
  Factory: () => {

    useShaFormUpdateDate();

    const {applicationKey = null} = useSheshaApplication();
    const {selectedApplication = null, settingSelection, editorMode, setEditor, saveSettingValue} = useSettingsEditor(false) ?? {};
    const { theme, changeTheme, resetToApplicationTheme } = useTheme();
    const form = useShaFormInstance();
    const initialValues = useRef(theme);
    const localTheme = useRef<IConfigurableTheme>();

    useEffect(() => {
      setEditor({
        save: () => {
          changeTheme(localTheme.current, applicationKey === (selectedApplication?.appKey ?? FRONTEND_DEFAULT_APP_KEY));
          const settingId: ISettingIdentifier = {
            name: settingSelection.setting.name,
            module: settingSelection.setting.module,
            appKey: selectedApplication?.appKey,
        };

        return saveSettingValue(settingId, localTheme.current)
          .then(() => {
            initialValues.current = localTheme.current;
          })
          .catch((error) => {
            throw error;
          });
        },
        cancel() {
          changeTheme(initialValues.current);
        },
      });
      initialValues.current = form.formData;
      // when form is closing restore the latest form initial values
      return () => {
        resetToApplicationTheme();
      };
    }, []);
  
    useEffect(() => {
      if (form.formData) {
        changeTheme(form.formData);
        localTheme.current = form.formData;
      }
    }, [form.formData]);
  
    const onChangeInternal = (changedValue: IConfigurableTheme) => {
      form.setFormData({values: changedValue, mergeValues: true});
    };
  
    return (
      <ConfigurableThemeContent value={form.formData} onChange={onChangeInternal} readonly={editorMode === 'readonly'}/>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default ThemeEditorComponent;
