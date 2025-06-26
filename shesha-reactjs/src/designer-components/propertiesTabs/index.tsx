import React from 'react';
import { FolderOutlined } from '@ant-design/icons';
import { IFormComponentContainer } from '@/providers/form/models';
import { ITabsComponentProps } from './models';
import { IToolboxComponent } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import { TabSettingsForm } from './settings';
import SearchableTabsComponent from './searchableTabsComponent';

const SearchableTabs: IToolboxComponent<ITabsComponentProps> = {
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
    return model.tabs.map<IFormComponentContainer>((tab) => ({ id: tab.id }));
  },
};

export default SearchableTabs;
