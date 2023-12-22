import ComponentsContainer from '../../containers/componentsContainer';
import React, { Fragment } from 'react';
import ShaIcon from '@/components/shaIcon';
import { FolderOutlined } from '@ant-design/icons';
import { getActualModel, getLayoutStyle, useApplicationContext } from '@/providers/form/utils';
import { IFormComponentContainer } from '@/providers/form/models';
import { ITabsComponentProps } from './models';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { nanoid } from 'nanoid/non-secure';
import { Tabs, TabsProps } from 'antd';
import { TabSettingsForm } from './settings';
import { useDeepCompareMemo } from '@/hooks';
import { useFormData, useGlobalState, useSheshaApplication } from '@/providers';

type TabItem = TabsProps['items'][number];

const TabsComponent: IToolboxComponent<ITabsComponentProps> = {
  type: 'tabs',
  name: 'Tabs',
  icon: <FolderOutlined />,
  Factory: ({ model }) => {
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const allData = useApplicationContext();
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    const { tabs, defaultActiveKey, tabType = 'card', size, position = 'top' } = model;

    const actionKey = defaultActiveKey || (tabs?.length && tabs[0]?.key);

    const items = useDeepCompareMemo(() => {
      const tabItems: TabItem[] = [];

      (tabs ?? [])?.forEach((item) => {
        const tabModel = getActualModel(item, allData);
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
          disabled,
          components,
        } = tabModel;

        const granted = anyOfPermissionsGranted(permissions || []);
        if ((!granted || hidden) && allData.formMode !== 'designer') return;

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
          disabled: disabled,
          style: getLayoutStyle(model, { data, globalState }),
          children: (
            <ComponentsContainer
              containerId={id}
              dynamicComponents={model?.isDynamic ? components?.map((c) => ({ ...c, readOnly: model?.readOnly })) : []}
            />
          ),
        };
        tabItems.push(tab);
      });

      return tabItems;
    }, [tabs, allData.contexts.lastUpdate, allData.data, allData.formMode, allData.globalState, allData.selectedRow]);

    return model.hidden ? null : (
      <Tabs defaultActiveKey={actionKey} size={size} type={tabType} tabPosition={position} items={items} />
    );
  },
  initModel: (model) => {
    const tabsModel: ITabsComponentProps = {
      ...model,
      propertyName: 'custom Name',
      tabs: [{ id: nanoid(), label: 'Tab 1', title: 'Tab 1', key: 'tab1', components: [], itemType: 'item' }],
    };
    return tabsModel;
  },
  migrator: (m) =>
    m.add<ITabsComponentProps>(0, (prev) => {
      const newModel = { ...prev };
      newModel['tabs'] = prev['tabs']?.map((item) => migrateCustomFunctions(item as any));
      return migratePropertyName(migrateCustomFunctions(newModel)) as ITabsComponentProps;
    }),
  settingsFormFactory: (props) => <TabSettingsForm {...props} />,
  customContainerNames: ['tabs'],
  getContainers: (model) => {
    const { tabs } = model as ITabsComponentProps;
    return tabs.map<IFormComponentContainer>((t) => ({ id: t.id }));
  },
};

export default TabsComponent;
