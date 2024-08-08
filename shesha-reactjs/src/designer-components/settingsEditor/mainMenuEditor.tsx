import { IToolboxComponent } from '@/interfaces';
import { EditOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { FormMarkup, SidebarConfigurator, useForm, useSheshaApplication, validateConfigurableComponentSettings } from '@/index';
import settingsFormJson from './settingsForm.json';
import { IHasVersion, Migrator } from '@/utils/fluentMigrator/migrator';
import { mainMenuMigration } from '@/providers/mainMenu/migrations/migration';
import { useSettingsEditor } from '@/components/settingsEditor/provider';
import { IConfigurableMainMenu, useMainMenu } from '@/providers/mainMenu';
import { deepCopyViaJson } from '@/utils/object';
import { FRONTEND_DEFAULT_APP_KEY } from '@/components/settingsEditor/provider/models';

const settingsForm = settingsFormJson as FormMarkup;

const MainMenuEditorComponent: IToolboxComponent<any> = {
  type: 'mainMenuEditor',
  name: 'Main menu editor',
  icon: <EditOutlined />,
  isInput: true,
  isOutput: true,
  Factory: () => {

    const [menuProps, setMenuProps] = useState<IConfigurableMainMenu>(undefined);

    const {applicationKey = null} = useSheshaApplication();
    const {selectedApplication = null, saveStatus, editorMode} = useSettingsEditor(false) ?? {};
    const { changeMainMenu } = useMainMenu();
    const form = useForm();
    const initialValues = useRef<IConfigurableMainMenu>();
  
    const updateMenu = (value: IConfigurableMainMenu) => {
      const migratorInstance = new Migrator<IConfigurableMainMenu, IConfigurableMainMenu>();
      const fluent = mainMenuMigration(migratorInstance);
      const versionedValue = {...value} as IHasVersion;
      if (versionedValue.version === undefined) 
        versionedValue.version = -1;
      const model = fluent.migrator.upgrade(versionedValue, {});
      setMenuProps(model);
      initialValues.current = deepCopyViaJson(model);
    };

    useEffect(() => {
      if (saveStatus === 'success' && applicationKey === (selectedApplication?.appKey ?? FRONTEND_DEFAULT_APP_KEY)) {
        changeMainMenu(form.formData);
        initialValues.current = deepCopyViaJson(form.formData);
      }
      if (saveStatus === 'canceled')
        setMenuProps(initialValues.current);
    }, [saveStatus]);

    useEffect(() => {
      if (form.formData && menuProps === undefined) {
        updateMenu(form.formData);
      }
    }, [form.formData]);

    const onChange = (changedValue: any) => {
      const newData = {...menuProps, items: changedValue};
      setMenuProps(newData);
      form.setFormData({values: newData, mergeValues: true});
    }

    return <SidebarConfigurator value={menuProps?.items} onChange={onChange} readOnly={editorMode === 'readonly'} />;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default MainMenuEditorComponent;
