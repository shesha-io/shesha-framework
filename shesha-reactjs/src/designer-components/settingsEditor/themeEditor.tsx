import { useSettingsEditorOrUndefined } from '@/components/settingsEditor/provider';
import { FRONTEND_DEFAULT_APP_KEY, ISettingIdentifier } from '@/components/settingsEditor/provider/models';
import { ConfigurableThemeContent } from '@/generic-pages/settings/dynamic-theme/content';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { FormMarkup, IToolboxComponent } from '@/interfaces';
import { useShaFormDataUpdate, useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useSheshaApplication } from '@/providers/sheshaApplication';
import { IConfigurableTheme, useTheme } from '@/providers/theme';
import { EditOutlined } from '@ant-design/icons';
import React, { useEffect, useRef } from 'react';
import settingsFormJson from './settingsForm.json';

const settingsForm = settingsFormJson as FormMarkup;

const EMPTY_THEME: IConfigurableTheme = {};

const ThemeEditorComponent: IToolboxComponent = {
  type: 'themeEditor',
  name: 'Theme editor',
  icon: <EditOutlined />,
  isInput: true,
  isOutput: true,
  Factory: () => {
    useShaFormDataUpdate();

    const { applicationKey = null } = useSheshaApplication();
    const settingsEditor = useSettingsEditorOrUndefined();
    const { theme, changeTheme, resetToApplicationTheme } = useTheme();
    const form = useShaFormInstance();
    const initialValues = useRef<IConfigurableTheme | undefined>(theme);
    const localTheme = useRef<IConfigurableTheme | undefined>(undefined);

    useEffectOnce(() => {
      if (!settingsEditor)
        return;
      const { selectedApplication = null, settingSelection, setEditor, saveSettingValue } = settingsEditor;

      setEditor({
        save: () => {
          if (!localTheme.current)
            throw new Error('Theme is not defined');
          if (!settingSelection?.setting)
            throw new Error('Setting is not defined');

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
          if (initialValues.current)
            changeTheme(initialValues.current);
        },
      });
      initialValues.current = form.formData;
      // when form is closing restore the latest form initial values
      return () => {
        resetToApplicationTheme();
      };
    });

    useEffect(() => {
      if (form.formData) {
        changeTheme(form.formData);
        localTheme.current = form.formData;
      }
    }, [changeTheme, form.formData]);

    const onChangeInternal = (changedValue: IConfigurableTheme): void => {
      form.setFormData({ values: changedValue, mergeValues: true });
    };

    return (
      <ConfigurableThemeContent value={form.formData ?? EMPTY_THEME} onChange={onChangeInternal} readOnly={settingsEditor?.editorMode === 'readonly'} />
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default ThemeEditorComponent;
