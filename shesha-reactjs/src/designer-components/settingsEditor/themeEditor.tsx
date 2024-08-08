import { IToolboxComponent } from '@/interfaces';
import { EditOutlined } from '@ant-design/icons';
import React, { useEffect, useRef } from 'react';
import { ConfigurableThemeContent } from '@/generic-pages/settings/dynamic-theme/content';
import { FormMarkup, IConfigurableTheme, useForm, useSheshaApplication, useTheme, validateConfigurableComponentSettings } from '@/index';
import settingsFormJson from './settingsForm.json';
import { useSettingsEditor } from '@/components/settingsEditor/provider';
import { FRONTEND_DEFAULT_APP_KEY } from '@/components/settingsEditor/provider/models';

const settingsForm = settingsFormJson as FormMarkup;

const ThemeEditorComponent: IToolboxComponent<any> = {
  type: 'themeEditor',
  name: 'Theme editor',
  icon: <EditOutlined />,
  isInput: true,
  isOutput: true,
  Factory: () => {

    const {applicationKey = null} = useSheshaApplication();
    const {selectedApplication = null, editorMode} = useSettingsEditor(false) ?? {};
    const { theme, changeTheme } = useTheme();
    const form = useForm();
    const initialValues = useRef();
    const localTheme = useRef<IConfigurableTheme>();
  
    initialValues.current = form.initialValues;
  
    useEffect(() => {
      localTheme.current = theme;
      // when form is closing restore the latest form initial values
      return () => {
        if (applicationKey === (selectedApplication?.appKey ?? FRONTEND_DEFAULT_APP_KEY))
          changeTheme(initialValues.current);
        else
          changeTheme(localTheme.current);
      };
    },[])
  
    useEffect(() => {
      if (form.formData)
        changeTheme(form.formData);
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
