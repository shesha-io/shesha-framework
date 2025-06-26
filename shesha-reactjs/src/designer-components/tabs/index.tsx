import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import React, { Fragment, useState, useEffect } from 'react';
import ShaIcon from '@/components/shaIcon';
import { FolderOutlined } from '@ant-design/icons';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { IFormComponentContainer } from '@/providers/form/models';
import { ITabsComponentProps } from './models';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { nanoid } from '@/utils/uuid';
import { Tabs, TabsProps } from 'antd';
import { useDeepCompareMemo } from '@/hooks';
import { useSheshaApplication } from '@/providers';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getSettings } from './settingsForm';
import { defaultCardStyles, defaultStyles } from './utils';
import { useStyles } from './styles';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { useFormComponentStyles } from '@/hooks/formComponentHooks';

type TabItem = TabsProps['items'][number];

const TabsComponent: IToolboxComponent<ITabsComponentProps> = {
  type: 'tabs',
  isInput: false,
  name: 'Tabs',
  icon: <FolderOutlined />,
  Factory: ({ model }) => {
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const allData = useAvailableConstantsData();
    const [activeKey, setActiveKey] = useState<string>(model.defaultActiveKey || (model.tabs?.length && model.tabs[0]?.key));

    const { tabs, defaultActiveKey, tabType = 'card', size, tabPosition = 'top', tabLineColor } = model;

    useEffect(() => {
      if (defaultActiveKey) {
        setActiveKey(defaultActiveKey);
      }
    }, [defaultActiveKey]);

    const cardStyles = useFormComponentStyles({ ...model.card });

    const { styles } = useStyles({ styles: model.allStyles.fullStyle, cardStyles: tabType === 'line' ? { ...cardStyles.fontStyles, ...cardStyles.dimensionsStyles, } : cardStyles.fullStyle, position: tabPosition, tabType, tabLineColor, overflow: model.allStyles.overflowStyles });

    const items = useDeepCompareMemo(() => {
      const tabItems: TabItem[] = [];

      (tabs ?? [])?.forEach((item) => {
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
        } = item;

        const granted = anyOfPermissionsGranted(permissions || []);
        if ((!granted || hidden) && allData.form?.formMode !== 'designer') return;

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
          children: (
            <ParentProvider model={item}>
              <ComponentsContainer
                containerId={id} dynamicComponents={model?.isDynamic ? components : []} />
            </ParentProvider>
          ),
        };
        tabItems.push(tab);
      });
      return tabItems;
    }, [tabs]);

    return model.hidden || !items.length ? null : (
      <Tabs
        animated={false}
        activeKey={activeKey}
        onChange={setActiveKey}
        size={size}
        type={tabType}
        tabPosition={tabPosition}
        items={items}
        className={styles.content}
      />
    );
  },
  initModel: (model) => {
    const id = nanoid();
    const tabsModel: ITabsComponentProps = {
      ...model,
      propertyName: 'custom Name',
      tabPosition: "top",
      tabs: [{
        id: id,
        name: 'Tab 1',
        key: id,
        title: 'Tab 1',
        editMode: 'inherited',
        selectMode: 'editable',
        components: []
      }],
    };
    return tabsModel;
  },
  migrator: (m) => m
    .add<ITabsComponentProps>(0, (prev) => {
      const newModel = { ...prev };
      newModel['tabs'] = prev['tabs']?.map((item) => migrateCustomFunctions(item as any));
      return migratePropertyName(migrateCustomFunctions(newModel)) as ITabsComponentProps;
    })
    .add<ITabsComponentProps>(1, (prev) => {
      const newModel = { ...prev };
      newModel.tabs = newModel.tabs.map(x => migrateReadOnly(x, 'inherited'));
      return newModel;
    })
    .add<ITabsComponentProps>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<ITabsComponentProps>(3, (prev) => removeComponents(prev))
    .add<ITabsComponentProps>(4, (prev) => {
      const newModel = migratePrevStyles(prev, defaultStyles);
      const initialCardStyle = { ...defaultCardStyles, font: { ...defaultCardStyles.font, color: '#000000' } };
      return {
        ...newModel,
        overflow: true,
        card: { ...initialCardStyle },
        desktop: { ...newModel.desktop, card: { ...initialCardStyle } },
        tablet: { ...newModel.tablet, card: { ...initialCardStyle } },
        mobile: { ...newModel.mobile, card: { ...initialCardStyle } }
      };
    }),
  settingsFormMarkup: () => getSettings(),
  customContainerNames: ['tabs'],
  getContainers: (model) => {
    return model.tabs.map<IFormComponentContainer>((t) => ({ id: t.id }));
  },
};

export default TabsComponent;
