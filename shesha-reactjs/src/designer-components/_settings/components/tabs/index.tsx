import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import React, { Fragment, useState, useMemo } from 'react';
import ShaIcon from '@/components/shaIcon';
import { FolderOutlined } from '@ant-design/icons';
import { getActualModelWithParent, getLayoutStyle, useAvailableConstantsData } from '@/providers/form/utils';
import { IFormComponentContainer } from '@/providers/form/models';
import { ITabsComponentProps } from './models';
import { IToolboxComponent } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import { Tabs, TabsProps } from 'antd';
import { TabSettingsForm } from './settings';
import { useDeepCompareMemo } from '@/hooks';
import { useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import ParentProvider from '@/providers/parentProvider/index';
import { Input } from 'antd';

type TabItem = TabsProps['items'][number];

const SettingsTabs: IToolboxComponent<ITabsComponentProps> = {
  type: 'settingsTabs',
  isInput: false,
  name: 'Tabs',
  icon: <FolderOutlined />,
  Factory: ({ model }) => {
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const allData = useAvailableConstantsData();
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const { tabs, defaultActiveKey, tabType = 'card', size, position = 'top' } = model;

    const actionKey = defaultActiveKey || (tabs?.length && tabs[0]?.key);

    const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

    const filterComponents = (components: any[], query: string) => {
      return components.filter(component => {
        if (component.label?.toLowerCase().includes(query.toLowerCase())) {
          return {
            ...component,
            components: component.components ? filterComponents(component.components, query) : undefined,
          };
        }
        return null;
      }).filter(Boolean);
    };

    const items = useMemo(() => {
      const tabItems: TabItem[] = [];

      (tabs ?? [])?.forEach((item) => {
        const tabModel = getActualModelWithParent(item, allData, { model: { readOnly: model.readOnly } });
        const {
          id,
          key,
          title,
          icon,
          closable,
          className,
          forceRender,
          animated,
          destroyInactiveTabPane,
          closeIcon,
          permissions,
          hidden,
          readOnly,
          selectMode,
          components,
        } = tabModel;

        const granted = anyOfPermissionsGranted(permissions || []);
        if ((!granted || hidden) && allData.form?.formMode !== 'designer') return;

        const searchQuery = searchQueries[key] || '';
        const filteredComponents = filterComponents(components || [], searchQuery);

        const tab: TabItem = {
          key: key,
          label: icon ? (
            <Fragment>
              <ShaIcon iconName={icon as any} /> {title}
            </Fragment>
          ) : (
            <Fragment>
              {icon} {title}
            </Fragment>
          ),
          closable: closable,
          className: className,
          forceRender: forceRender,
          animated: animated,
          destroyInactiveTabPane: destroyInactiveTabPane,
          closeIcon: closeIcon ? <ShaIcon iconName={closeIcon as any} /> : null,
          disabled: selectMode === 'readOnly' || selectMode === 'inherited' && readOnly,
          style: getLayoutStyle(model, { data, globalState }),
          children: (
            <ParentProvider model={tabModel}>
              <Input
                placeholder="Search components"
                value={searchQuery}
                onChange={(e) => setSearchQueries(prev => ({ ...prev, [key]: e.target.value }))}
                style={{ marginBottom: 16 }}
              />
              <ComponentsContainer
                containerId={id}
                dynamicComponents={model?.isDynamic ? filteredComponents : []}
              />
            </ParentProvider>
          ),
        };
        tabItems.push(tab);
      });

      return tabItems;
    }, [tabs, model.readOnly, allData.contexts.lastUpdate, allData.data, allData.form?.formMode, allData.globalState, allData.selectedRow, searchQueries, model.isDynamic]);

    return model.hidden ? null : (
      <Tabs defaultActiveKey={actionKey} size={size} type={tabType} tabPosition={position} items={items} />
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
