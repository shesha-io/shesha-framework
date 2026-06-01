import { Menu, Empty, Spin, Checkbox, Divider } from 'antd';
import React, { FC, useMemo } from 'react';
import { useLocalStorage } from '@/hooks';
import SearchBox from './searchBox';
import { useSettingsEditor } from './provider/index';
import { IFrontEndApplication, ISettingConfiguration } from './provider/models';
import type { MenuProps } from 'antd';
import { useDevMode } from '@/hooks/useIsDevMode';
import { useStyles } from './styles/styles';
import AppSelector from './appSelector';

type MenuItem = Required<MenuProps>['items'][number];

interface ISettingItem {
  config: ISettingConfiguration;
  app?: IFrontEndApplication;
}

export interface ISettingGroup {
  name: string;
  visible?: boolean;
  settings: ISettingItem[];
}

export interface ISettingApplication {
  key: string;
  name: string;
  app?: IFrontEndApplication;
  groups: ISettingGroup[];
}

type SettingsDictionary = { [key: string]: ISettingItem };
interface SettingMenuState {
  applications: ISettingApplication[];
  allSettings: SettingsDictionary;
}

const GENERAL_APP_KEY = 'general';

const getSettingKey = (config: ISettingConfiguration, app?: IFrontEndApplication): string => {
  return `${config.module}|${config.name}|${app?.appKey}`;
};

const sortByName = <T extends { name: string }>(items: T[]): T[] =>
  items.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

export const SettingsMenu: FC = () => {
  const { styles } = useStyles();
  const [isDevmode, setDevMode] = useDevMode();

  const [searchText, setSearchText] = useLocalStorage('settings-editor.search', '');

  const {
    applications,
    settingConfigurations,
    applicationsLoadingState,
    selectSetting,
    settingSelection,
    selectedApplication,
    configsLoadingState,
  } = useSettingsEditor();

  // key of the section selected via the dropdown (General when no app is selected)
  const selectedSectionKey = selectedApplication?.appKey ?? GENERAL_APP_KEY;

  const menuState = useMemo<SettingMenuState>(() => {
    if (applicationsLoadingState !== 'success' || configsLoadingState !== 'success') {
      return { applications: [], allSettings: {} };
    }

    const appSections: ISettingApplication[] = [];
    const allSettings: SettingsDictionary = {};

    const getOrAddApplication = (key: string, name: string, app?: IFrontEndApplication): ISettingApplication => {
      let section = appSections.find((s) => s.key === key);
      if (!section) {
        section = { key, name, app, groups: [] };
        appSections.push(section);
      }
      return section;
    };

    const addSetting = (section: ISettingApplication, config: ISettingConfiguration, app: IFrontEndApplication): void => {
      const groupName = config.category ?? '';
      let group = section.groups.find((g) => g.name === groupName);
      if (!group) {
        group = { name: groupName, settings: [] };
        section.groups.push(group);
      }

      const key = getSettingKey(config, app);
      const item: ISettingItem = { config, app };
      allSettings[key] = item;
      group.settings.push(item);
    };

    settingConfigurations.forEach((s) => {
      if (s.isClientSpecific) {
        // client-specific settings belong to every frontend application
        applications.forEach((app) => {
          addSetting(getOrAddApplication(app.appKey, app.name, app), s, app);
        });
      } else {
        // system-wide settings belong to the General section
        addSetting(getOrAddApplication(GENERAL_APP_KEY, 'General', null), s, null);
      }
    });

    // sort categories within each application
    appSections.forEach((section) => sortByName(section.groups));

    // General first, then applications alphabetically
    const generalSection = appSections.filter((s) => s.key === GENERAL_APP_KEY);
    const otherSections = sortByName(appSections.filter((s) => s.key !== GENERAL_APP_KEY));

    return { applications: [...generalSection, ...otherSections], allSettings };
  }, [applicationsLoadingState, configsLoadingState, applications, settingConfigurations]);

  const filteredApplications = useMemo<ISettingApplication[]>(() => {
    // show only the section for the application selected in the dropdown
    const sections = (menuState.applications ?? []).filter((s) => s.key === selectedSectionKey);
    if (!Boolean(searchText)) return sections;

    const search = searchText.toLowerCase();
    const result: ISettingApplication[] = [];

    sections.forEach((section) => {
      const groups: ISettingGroup[] = [];
      section.groups.forEach((group) => {
        const filteredSettings = group.settings.filter((c) => c.config.name?.toLowerCase().includes(search));
        if (filteredSettings.length > 0) groups.push({ ...group, settings: filteredSettings });
      });
      if (groups.length > 0) result.push({ ...section, groups });
    });

    return result;
  }, [menuState.applications, searchText, selectedSectionKey]);

  const onSelect: MenuProps['onSelect'] = (info) => {
    const selectedItem = info.key ? menuState.allSettings[info.key] : null;

    if (selectedItem) selectSetting(selectedItem.config, selectedItem.app);
  };

  const selectedKeys = settingSelection
    ? [getSettingKey(settingSelection.setting, settingSelection.app)]
    : [];

  return (
    <div className={styles.shaSettingsEditorToolbox}>
      <div className={styles.shaSettingsEditorToolboxHeader}>
        <AppSelector />
        <SearchBox value={searchText} onChange={setSearchText} placeholder="Search setting" />
      </div>
      <Spin spinning={configsLoadingState === 'loading'} rootClassName={styles.shaSettingsEditorToolboxList}>
        {filteredApplications.length > 0 &&
          filteredApplications.map((section) => (
            <div key={section.key} className={styles.shaSettingsAppSection}>
              {section.groups.map((group, groupIndex) =>
                group.settings.length === 0 ? null : (
                  <div key={groupIndex.toString()} className={styles.shaSettingsGroup}>
                    {Boolean(group.name) && <div className={styles.shaSettingsGroupHeader}>{group.name}</div>}
                    <Menu
                      mode="inline"
                      selectable
                      items={group.settings.map<MenuItem>((item) => ({
                        key: getSettingKey(item.config, item.app),
                        label: item.config.label,
                      }))}
                      selectedKeys={selectedKeys}
                      onSelect={onSelect}
                    />
                  </div>
                ),
              )}
            </div>
          ))}
        {filteredApplications.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Settings not found" />
        )}
      </Spin>
      <div className={styles.shaSettingsEditorToolboxFooter}>
        <Divider />
        <Checkbox checked={isDevmode} onChange={(e) => setDevMode(e.target.checked)}>
          Developer mode
        </Checkbox>
      </div>
    </div>
  );
};

export default SettingsMenu;
