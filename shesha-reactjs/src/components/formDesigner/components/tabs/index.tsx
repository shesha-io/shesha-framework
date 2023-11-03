import { IToolboxComponent } from '../../../../interfaces';
import { IFormComponentContainer } from '../../../../providers/form/models';
import { FolderOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import ComponentsContainer from '../../containers/componentsContainer';
import React, { Fragment } from 'react';
import { getActualModel, useApplicationContext } from '../../../../providers/form/utils';
import { useSheshaApplication } from '../../../../providers';
import { nanoid } from 'nanoid/non-secure';
import { TabSettingsForm } from './settings';
import { ITabsComponentProps } from './models';
import ShaIcon from '../../../shaIcon';
import { migrateCustomFunctions, migratePropertyName } from '../../../../designer-components/_common-migrations/migrateSettings';
import { useDeepCompareMemo } from 'hooks';

const { TabPane } = Tabs;

const TabsComponent: IToolboxComponent<ITabsComponentProps> = {
  type: 'tabs',
  name: 'Tabs',
  icon: <FolderOutlined />,
  factory: model => {
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const allData = useApplicationContext();

    const { tabs, defaultActiveKey, tabType = 'card', size, position = 'top' } = model as ITabsComponentProps;

    const actionKey = defaultActiveKey || (tabs?.length && tabs[0]?.key);

    const items = useDeepCompareMemo(() => tabs?.map((item) => getActualModel(item, allData)),
      [tabs, allData.contexts.lastUpdate, allData.data, allData.formMode, allData.globalState, allData.selectedRow]);

    return model.hidden
      ? null
      : (
        <Tabs defaultActiveKey={actionKey} size={size} type={tabType} tabPosition={position}>
          {items?.map(
            (item) => {
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
              } = item;

              const granted = anyOfPermissionsGranted(permissions || []);

              if ((!granted || hidden) && allData.formMode !== 'designer') return null;

              return (
                <TabPane
                  key={key}
                  closable={closable}
                  className={className}
                  forceRender={forceRender}
                  animated={animated}
                  destroyInactiveTabPane={destroyInactiveTabPane}
                  closeIcon={closeIcon ? <ShaIcon iconName={closeIcon as any} /> : null}
                  disabled={disabled}
                  tab={
                    icon ? (
                      <Fragment>
                        <ShaIcon iconName={icon as any} /> {title}
                      </Fragment>
                    ) : (
                      <Fragment>
                        {icon} {title}
                      </Fragment>
                    )
                  }
                >
                  <ComponentsContainer
                    containerId={id}
                    dynamicComponents={
                      model?.isDynamic ? components?.map(c => ({ ...c, readOnly: model?.readOnly })) : []
                    }
                  />
                </TabPane>
              );
            }
          )}
        </Tabs>
      );
  },
  initModel: model => {
    const tabsModel: ITabsComponentProps = {
      ...model,
      propertyName: 'custom Name',
      tabs: [{ id: nanoid(), label: 'Tab 1', title: 'Tab 1', key: 'tab1', components: [], itemType: 'item' }],
    };
    return tabsModel;
  },
  migrator: (m) => m
    .add<ITabsComponentProps>(0, (prev) => {
      const newModel = { ...prev };
      newModel['tabs'] = prev['tabs']?.map((item) => migrateCustomFunctions(item as any));
      return migratePropertyName(migrateCustomFunctions(newModel)) as ITabsComponentProps;
    })
  ,
  settingsFormFactory: (props) => <TabSettingsForm {...props} />,
  customContainerNames: ['tabs'],
  getContainers: model => {
    const { tabs } = model as ITabsComponentProps;
    return tabs.map<IFormComponentContainer>(t => ({ id: t.id }));
  },
};

export default TabsComponent;
