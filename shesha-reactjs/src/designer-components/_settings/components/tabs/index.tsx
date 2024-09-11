import React from 'react';
import { FolderOutlined } from '@ant-design/icons';
import { IFormComponentContainer } from '@/providers/form/models';
import { ITabsComponentProps } from './models';
import { IToolboxComponent } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import { TabSettingsForm } from './settings';
import SearchableTabs from './searchableTabsComponent';
import { ConfigurableFormItem } from '@/components';


const SettingsTabs: IToolboxComponent<ITabsComponentProps> = {
  type: 'searchableTabs',
  isInput: true,
  isOutput: true,
  name: 'Tabs',
  icon: <FolderOutlined />,
  Factory: ({ model }) => {

    const formSettings = {
      layout: "vertical",
      colon: false,
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 16
      },
      displayName: "DEFAULT_FORM_SETTINGS",
      __docgenInfo: {
        description: "Default form settings",
        displayName: "DEFAULT_FORM_SETTINGS",
        props: {}
      }
    }

    return model.hidden ? null : (
      <ConfigurableFormItem model={model} className='sha-js-label'>
        {(onChange, value) => {
          console.log('onChange tabs factory', onChange, value)
          return <SearchableTabs model={{ ...model, formSettings }} />
        }}
      </ConfigurableFormItem>
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
