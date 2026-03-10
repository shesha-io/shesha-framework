import { IFormComponentContainer } from '@/providers/form/models';
import { nanoid } from '@/utils/uuid';
import { FolderOutlined } from '@ant-design/icons';
import React from 'react';
import { SearchableTabsDefinition } from './interfaces';
import { IPropertiesTabsComponentProps } from './models';
import SearchableTabsComponent from './searchableTabsComponent';
import { TabSettingsForm } from './settings';

const SearchableTabs: SearchableTabsDefinition = {
  type: 'searchableTabs',
  isInput: false,
  name: 'SearchableTabs',
  icon: <FolderOutlined />,
  Factory: ({ model }) => {
    return model.hidden ? null : (
      <SearchableTabsComponent model={model} />
    );
  },
  initModel: (model) => {
    const tabsModel: IPropertiesTabsComponentProps = {
      ...model,
      propertyName: 'custom Name',
      tabs: [{ id: nanoid(), label: 'Tab 1', title: 'Tab 1', key: 'tab1', components: [] }],
    };
    return tabsModel;
  },
  settingsFormFactory: (props) => <TabSettingsForm {...props} />,
  customContainerNames: ['tabs'],
  getContainers: (model) => {
    return model.tabs.map<IFormComponentContainer>((tab) => ({ id: tab.id }));
  },
};

export default SearchableTabs;
