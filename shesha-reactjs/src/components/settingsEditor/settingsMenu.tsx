import { Menu, Collapse, Empty, Spin, Checkbox, Divider } from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '@/hooks';
import SearchBox from './searchBox';
import { useSettingsEditor } from './provider/index';
import { IFrontEndApplication, ISettingConfiguration } from './provider/models';
import type { MenuProps } from 'antd';
import { useDevMode } from '@/hooks/useIsDevMode';

const { Panel } = Collapse;
type MenuItem = Required<MenuProps>['items'][number];

interface ISettingItem {
  config: ISettingConfiguration;
  app?: IFrontEndApplication;
}

export interface ISettingApplication {
  name: string;
  visible?: boolean;
  settings: ISettingGroup[];
}

export interface ISettingGroup {
  name: string;
  visible?: boolean;
  settings: ISettingItem[];
}

type SettingsDictionary = { [key: string]: ISettingItem };
interface SettingMenuState {
  groups: ISettingGroup[];
  allSettings: SettingsDictionary;
}

const getSettingKey = (config: ISettingConfiguration, app?: IFrontEndApplication): string => {
  return `${config.module}|${config.name}|${app?.appKey}`;
};

export const SettingsMenu: FC = () => {
  const [isDevmode, setDevMode] = useDevMode();

  const [openedKeys, setOpenedKeys] = useLocalStorage('settings-editor.openedKeys', {});// ['']);
  const [searchText, setSearchText] = useLocalStorage('settings-editor.search', '');
  const [menuState, setMenuState] = useState<SettingMenuState>({ groups: [], allSettings: {} });

  const {
    selectedApplication,
    settingConfigurations,
    applicationsLoadingState,
    selectSetting,
    settingSelection,
    configsLoadingState,
  } = useSettingsEditor();

  useEffect(() => {
    if (applicationsLoadingState === 'success' && configsLoadingState === 'success') {
      const groups: ISettingGroup[] = [];
      const allSettings: SettingsDictionary = {};

      const addSetting = (groupName: string, config: ISettingConfiguration, app: IFrontEndApplication): void => {
        let group = groups.find((g) => g.name === groupName);
        if (!group) {
          group = { name: groupName, settings: [] };
          groups.push(group);
        }

        const key = getSettingKey(config, app);
        const item: ISettingItem = { config, app };
        allSettings[key] = item;
        group.settings.push(item);
      };

      settingConfigurations.forEach((s) => {
        // const moduleName = s.configuration.module?.name ?? 'no module';
        const category = s.category ?? '';

        if (s.isClientSpecific && selectedApplication) {
          addSetting(category, s, selectedApplication);
        };
        if (!s.isClientSpecific && !selectedApplication) {
          addSetting(category, s, null);
        }
      });

      const sortedGroups = groups.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

      setMenuState({ groups: sortedGroups, allSettings: allSettings });
    }
  }, [applicationsLoadingState, configsLoadingState, selectedApplication]);

  const onCollapseChange = (key: string | string[]): void => {
    setOpenedKeys({ ...openedKeys, [selectedApplication?.appKey ?? 'general']: Array.isArray(key) ? key : [key] });
  };

  const filteredGroups = useMemo<ISettingGroup[]>(() => {
    const groups = menuState.groups ?? [];
    if (!Boolean(searchText)) return [...groups];

    const result: ISettingGroup[] = [];

    groups.forEach((setting) => {
      const filteredSettings = setting.settings.filter((c) =>
        c.config.name?.toLowerCase().includes(searchText?.toLowerCase()),
      );
      if (filteredSettings.length > 0) result.push({ ...setting, settings: filteredSettings });
    });

    return result;
  }, [menuState.groups, searchText]);

  const onSelect: MenuProps['onSelect'] = (info) => {
    const selectedItem = info.key
      ? menuState.allSettings[info.key]
      : null;

    if (selectedItem)
      selectSetting(selectedItem.config, selectedItem.app);
  };

  return (
    <div className="sha-settings-editor-toolbox">
      <Spin spinning={configsLoadingState === 'loading'}>
        <SearchBox value={searchText} onChange={setSearchText} placeholder="Search setting" />
        {filteredGroups.length > 0 && (
          <Collapse activeKey={openedKeys[selectedApplication?.appKey ?? 'general']} onChange={onCollapseChange} accordion>
            {filteredGroups
              // .filter(({ visible }) => visible)
              .map((group, groupIndex) => {
                const visibleSettings = group.settings;

                const menuItems = visibleSettings.map<MenuItem>((item) => ({
                  key: getSettingKey(item.config, item.app),
                  label: item.config.label,
                }));

                return visibleSettings.length === 0 ? null : (
                  <Panel header={group.name} key={groupIndex.toString()}>
                    <Menu
                      items={menuItems}
                      selectedKeys={settingSelection ? [getSettingKey(settingSelection.setting, settingSelection.app)] : []}
                      onSelect={onSelect}
                    />
                  </Panel>
                );
              })}
          </Collapse>
        )}
        {filteredGroups.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Settings not found" />}
        <Divider />
        <Checkbox checked={isDevmode} onChange={(e) => setDevMode(e.target.checked)}>Developer mode</Checkbox>
      </Spin>
    </div>
  );
};

export default SettingsMenu;
