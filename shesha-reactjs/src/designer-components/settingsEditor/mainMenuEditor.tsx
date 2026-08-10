import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { EditOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { IHasVersion, Migrator } from '@/utils/fluentMigrator/migrator';
import { mainMenuMigration } from '@/providers/mainMenu/migrations/migration';
import { useSettingsEditorOrUndefined } from '@/components/settingsEditor/provider';
import { IConfigurableMainMenu, useMainMenu } from '@/providers/mainMenu';
import { deepCopyViaJson } from '@/utils/object';
import { FRONTEND_DEFAULT_APP_KEY } from '@/components/settingsEditor/provider/models';
import { getSettings } from './settingsForm';
import { App, Button, Modal } from 'antd';
import { useMedia } from 'react-use';
import { SidebarConfigurator } from '@/components/configurableSidebarMenu/configurator';
import { useForm } from '@/providers/form';
import { useSheshaApplication } from '@/providers/sheshaApplication';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { isDefined } from '@/utils/nullables';
import { ISidebarMenuItem } from '@/interfaces/sidebar';

export interface IMainMenuEditorComponentProps extends IConfigurableFormComponent {
  height?: string;
}

const EMPTY_ITEMS: ISidebarMenuItem[] = [];
const EMPTY_MENU: IConfigurableMainMenu = { items: EMPTY_ITEMS };

const MainMenuEditorComponent: IToolboxComponent<IMainMenuEditorComponentProps> = {
  type: 'mainMenuEditor',
  name: 'Main menu editor',
  icon: <EditOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isSmall = useMedia('(max-width: 480px)');
    const { message } = App.useApp();

    const [menuProps, setMenuProps] = useState<IConfigurableMainMenu | undefined>(undefined);

    const { applicationKey = null } = useSheshaApplication();
    const { selectedApplication = null, saveStatus, editorMode, saveSetting } = useSettingsEditorOrUndefined() ?? {};
    const { changeMainMenu, saveMainMenu } = useMainMenu();
    const form = useForm<IConfigurableMainMenu>();
    const initialValues = useRef<IConfigurableMainMenu>(undefined);

    const updateMenu = (value: IConfigurableMainMenu): void => {
      const migratorInstance = new Migrator<IConfigurableMainMenu, IConfigurableMainMenu>();
      const fluent = mainMenuMigration(migratorInstance);
      const versionedValue = { ...value } as IHasVersion;
      if (versionedValue.version === undefined) versionedValue.version = -1;
      const model = fluent.migrator.upgrade(versionedValue, {});
      setMenuProps(model);
      initialValues.current = deepCopyViaJson(model);
    };

    useEffect(() => {
      if (saveStatus === 'success' && applicationKey === (selectedApplication?.appKey ?? FRONTEND_DEFAULT_APP_KEY) && isDefined(form.formData)) {
        changeMainMenu(form.formData);
        initialValues.current = deepCopyViaJson(form.formData);
      }
      if (saveStatus === 'canceled') setMenuProps(initialValues.current);
      // TODO: V1: review
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    useEffect(() => {
      if (form.formData && menuProps === undefined) {
        updateMenu(form.formData);
      }
      // TODO: V1: review
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.formData]);

    const onChange = (newValue: ISidebarMenuItem[]): void => {
      const newData = { ...menuProps, items: newValue };
      setMenuProps(newData);
      form.setFormData({ values: newData, mergeValues: false });
    };

    if (!isModalOpen) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Button type="primary" onClick={() => setIsModalOpen(true)} size="large">
            <EditOutlined /> Configure Menu
          </Button>
        </div>
      );
    }

    const onCancel = (): void => {
      setIsModalOpen(false);
      setMenuProps(initialValues.current);
      form.setFormData({ values: initialValues.current ?? EMPTY_MENU, mergeValues: false });
      message.info('Menu configuration not changed!');
      setIsModalOpen(false);
    };

    const onOk = (): void => {
      const data = form.formData;
      if (data === undefined) {
        message.error('Menu configuration is empty!');
        return;
      }
      setMenuProps(data);
      saveMainMenu(data)
        .then(() => {
          changeMainMenu(data);
        })
        .then(async () => {
          if (saveSetting) {
            await saveSetting();
          }
        })
        .then(() => {
          message.success('Menu saved successfully!');
        })
        .catch((error) => {
          console.error(error);
          message.error('Failed to save menu changes!');
        })
        .finally(() => {
          setIsModalOpen(false);
        });
    };

    return (
      <div style={{ height: model.height }}>
        <Modal
          title="Sidebar Menu Configuration"
          width={isSmall ? '90%' : '60%'}
          styles={{ body: { height: '80vh' } }}
          open={isModalOpen}
          onCancel={onCancel}
          onOk={onOk}
        >
          <SidebarConfigurator value={menuProps?.items ?? EMPTY_ITEMS} onChange={onChange} readOnly={editorMode === 'readonly'} />
        </Modal>
      </div>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default MainMenuEditorComponent;
