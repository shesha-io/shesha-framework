import { IToolboxComponent } from '@/interfaces';
import { EditOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  IConfigurableFormComponent,
  SidebarConfigurator,
  useForm,
  useSheshaApplication,
  validateConfigurableComponentSettings,
} from '@/index';
import { IHasVersion, Migrator } from '@/utils/fluentMigrator/migrator';
import { mainMenuMigration } from '@/providers/mainMenu/migrations/migration';
import { useSettingsEditor } from '@/components/settingsEditor/provider';
import { IConfigurableMainMenu, useMainMenu } from '@/providers/mainMenu';
import { deepCopyViaJson } from '@/utils/object';
import { FRONTEND_DEFAULT_APP_KEY } from '@/components/settingsEditor/provider/models';
import { getSettings } from './settingsForm';
import { Button, Modal } from 'antd';
import { useMedia } from 'react-use';

export interface IMainMenuEditorComponentProps extends IConfigurableFormComponent {
  height?: string;
}

const MainMenuEditorComponent: IToolboxComponent<IMainMenuEditorComponentProps> = {
  type: 'mainMenuEditor',
  name: 'Main menu editor',
  icon: <EditOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const isSmall = useMedia('(max-width: 480px)');

    const [menuProps, setMenuProps] = useState<IConfigurableMainMenu>(undefined);

    const { applicationKey = null } = useSheshaApplication();
    const { selectedApplication = null, saveStatus, editorMode } = useSettingsEditor(false) ?? {};
    const { changeMainMenu } = useMainMenu();
    const form = useForm();
    const initialValues = useRef<IConfigurableMainMenu>();

    const updateMenu = (value: IConfigurableMainMenu) => {
      const migratorInstance = new Migrator<IConfigurableMainMenu, IConfigurableMainMenu>();
      const fluent = mainMenuMigration(migratorInstance);
      const versionedValue = { ...value } as IHasVersion;
      if (versionedValue.version === undefined) versionedValue.version = -1;
      const model = fluent.migrator.upgrade(versionedValue, {});
      setMenuProps(model);
      initialValues.current = deepCopyViaJson(model);
    };

    useEffect(() => {
      if (saveStatus === 'success' && applicationKey === (selectedApplication?.appKey ?? FRONTEND_DEFAULT_APP_KEY)) {
        changeMainMenu(form.formData);
        initialValues.current = deepCopyViaJson(form.formData);
      }
      if (saveStatus === 'canceled') setMenuProps(initialValues.current);
    }, [saveStatus]);

    useEffect(() => {
      if (form.formData && menuProps === undefined) {
        updateMenu(form.formData);
      }
    }, [form.formData]);

    const onChange = (changedValue: any) => {
      const newData = { ...menuProps, items: changedValue };
      setMenuProps(newData);
      form.setFormData({ values: newData, mergeValues: false });
    };

    if (!isModalOpen) {
      return (
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Open Main Menu Editor
        </Button>
      );
    }

    return (
      <div style={{ height: model.height }}>
        <Modal
          title="Main Menu Editor"
          width={isSmall ? '90%' : '60%'}
          styles={{ body: { height: '80vh' } }}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => {
            setMenuProps(form.formData);
            setIsModalOpen(false);
          }}
        >
          <SidebarConfigurator value={menuProps?.items} onChange={onChange} readOnly={editorMode === 'readonly'} />
        </Modal>
      </div>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default MainMenuEditorComponent;
