import React, { useMemo } from 'react';
import { FolderOutlined } from '@ant-design/icons';
import { getActualModelWithParent, useAvailableConstantsData } from '@/providers/form/utils';
import { IFormComponentContainer } from '@/providers/form/models';
import { ITabsComponentProps } from './models';
import { IToolboxComponent } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import { TabSettingsForm } from './settings';
import SearchableTabs from './searchableTabsComponent';
import { useSheshaApplication } from '@/providers';


const SettingsTabs: IToolboxComponent<ITabsComponentProps> = {
  type: 'searchableTabs',
  isInput: false,
  name: 'Tabs',
  icon: <FolderOutlined />,
  Factory: ({ model }) => {

    console.log('model', model);
    console.log('model.tabs', model.tabs);
    return model.hidden ? null : (
      <SearchableTabs model={model} />
    );
  },
  initModel: (model) => {
    const tabsModel: ITabsComponentProps = {
      ...model,
      propertyName: 'custom Name',
      tabs: [{ id: nanoid(), label: 'Tab 1', title: 'Tab 1', key: 'tab1', components: [] }],
    };
    return tabsModel;
  },
  settingsFormFactory: (props) => <TabSettingsForm {...props} />,
  customContainerNames: ['tabs'],
  getContainers: (model) => {
    return model.tabs.map<IFormComponentContainer>((t) => ({ id: t.id }));
  },
};

export default SettingsTabs;
