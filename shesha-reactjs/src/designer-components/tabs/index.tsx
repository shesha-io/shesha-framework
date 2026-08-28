import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { useState, useEffect } from 'react';
import { ShaIcon } from '@/components/shaIcon';
import { FolderOutlined } from '@ant-design/icons';
import { IFormComponentContainer } from '@/providers/form/models';
import { ITabPaneProps, ITabsComponentProps, ITabsComponentPropsV0, TabsComponentDefinition } from './models';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateReadOnly, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { nanoid } from '@/utils/uuid';
import { Tabs, TabsProps } from 'antd';
import { useActualContextExecution, useDeepCompareMemo } from '@/hooks';
import { useShaFormInstance, useSheshaApplication } from '@/providers';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getSettings } from './settingsForm';
import { defaultCardStyles, defaultStyles, tabPosition2TabPlacement } from './utils';
import { useStyles } from './styles';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { isNonEmptyArray } from '@/utils/array';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { getFullSizeWrapperDesignerStyle } from '@/components/formDesigner/utils/stylingUtils';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { useComponentApiProvider } from '@/providers/componentApi/provider';
import { TabsApiTab, TabsApi } from '@/componentsApi/componentApi';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { unwrapModel } from '@/hooks/formComponentHooks';
import { TypedProxy } from '@/providers/form/observableProxy';
import { IApplicationContext, standardActualModelPropertyFilter } from '@/providers/form/utils';
import { isConfigurableFormComponent } from '@/providers/form/models';

import apiCode from "../../componentsApi/componentApi.ts?raw";
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';

type TabItem = Required<TabsProps>['items'][number];

const TabsComponent: TabsComponentDefinition = {
  allowInherit: true,
  type: 'tabs',
  isInput: false,
  name: 'Tabs',
  icon: <FolderOutlined />,
  getWrapperStyle: (model) => getFullSizeWrapperDesignerStyle(model),
  useCalculateModel: (model) => ({
    cardStyleCss: useActualContextExecution(model.card?.style, undefined, {}),
    activeCardStyleCss: useActualContextExecution(model.card?.activeStyle, undefined, {}),
  }),
  Factory: ({ model, calculatedModel, apiContext }) => {
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const { formMode } = useShaFormInstance();
    const [activeKey, setActiveKey] = useState<string | undefined>(() => {
      return !isNullOrWhiteSpace(model.defaultActiveKey)
        ? model.defaultActiveKey
        : isNonEmptyArray(model.tabs) ? model.tabs[0].key : undefined; // ToDo: review checking visibility of Tabs (it is dificult for now because some visibility calculated lster on the render stage)
    });
    const componentApi = useComponentApiProvider();
    useDeepCompareEffect(() => {
      componentApi?.updateApi<TabsApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'TabsApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [
          // ToDo: review checking visibility of Tabs (it is dificult for now because some visibility calculated lster on the render stage)
          { name: 'currentTab', getter: () => {
            const activeTab = model.tabs.find((t) => t.key === activeKey);
            return isDefined(activeTab) ? model.tabs.indexOf(activeTab) : undefined;
          }, setter: (value) => setActiveKey(isDefined(value) && isNonEmptyArray(model.tabs) && value > -1 && value < model.tabs.length ? model.tabs[value]?.key : undefined) },
          { name: 'tabs', getter: () => {
            const tabs: TabsApiTab[] = [];
            model.tabs.forEach((t) => {
              const tab: TabsApiTab = { visible: t.visible ?? true, key: t.key, select: () => setActiveKey(t.key) };
              componentApi.createOrUpdateApiProperty(tab, { name: 'visible', getter: () => t.visible ?? true,
                setter: (value) => apiContext?.updateApiModel({ tabs: model.tabs.map((tt) => ({ ...tt, visible: tt.key === tab.key ? value : tt.visible })) }),
              });
              componentApi.createOrUpdateApiProperty(tab, { name: 'key', getter: () => t.key });
              tabs.push(tab);
            });
            return tabs;
          } },
        ],
      });
    }, [componentApi, model.componentName, model.id, model.tabs, activeKey, apiContext]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    const { tabs, defaultActiveKey, tabType = 'card', size, tabPosition = 'top' } = model;

    const tabPlacement = tabPosition2TabPlacement(tabPosition);

    useEffect(() => {
      if (isDefined(defaultActiveKey)) setActiveKey(defaultActiveKey);
    }, [defaultActiveKey]);

    const { styles } = useStyles({ model, cardStyleCss: calculatedModel.cardStyleCss, activeCardStyleCss: calculatedModel.activeCardStyleCss });

    const items = useDeepCompareMemo(() => {
      const tabItems: TabItem[] = [];

      tabs.forEach((item) => {
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
          visiblePermissions,
          editModePermissions,
          visible = true,
          disabled = false,
          components,
        } = item;

        const granted = anyOfPermissionsGranted(visiblePermissions || []);
        const disableGranted = anyOfPermissionsGranted(editModePermissions || []);
        if ((!granted || visible !== true) && formMode !== 'designer') return;

        const tab: TabItem = {
          key: key,
          label: isNullOrWhiteSpace(icon) ? title : <><ShaIcon iconName={icon} />{title}</>,
          ...(closable === true ? { closable } : {}),
          ...(isNullOrWhiteSpace(className) ? {} : { className }),
          ...(forceRender === true ? { forceRender } : {}),
          ...(animated === true ? { animated } : {}),
          ...(destroyInactiveTabPane === true ? { destroyOnHidden: destroyInactiveTabPane } : {}),
          closeIcon: isDefined(closeIcon)
            ? typeof (closeIcon) === 'string' ? <ShaIcon iconName={closeIcon} /> : closeIcon
            : null,
          disabled: !disableGranted || disabled,
          children: (
            <ParentProvider name={`Tab-${key}`} model={item}>
              <ComponentsContainer containerId={id} dynamicComponents={model.isDynamic === true ? components : []} />
            </ParentProvider>
          ),
        };
        tabItems.push(tab);
      });
      return tabItems;
    }, [tabs, formMode, anyOfPermissionsGranted, model.isDynamic]);

    if (model.hidden === true || !items.length) return null;

    return (
      <Tabs
        animated={false}
        onChange={setActiveKey}
        size={size}
        type={tabType}
        {...(tabPlacement ? { tabPlacement } : {})}
        items={items}
        className={styles.shaTabContent}
        {...(isDefined(activeKey) ? { activeKey } : {})}
      />
    );
  },
  // handle items later to use buttonGroup's readOnly setting
  actualModelPropertyFilter: (name) => {
    return name !== 'tabs';
  },
  // handle items to use buttonGroup's readOnly setting
  actualModelFilteredPropertyProcessor: (model, propertyName, value, allData) => {
    if (propertyName === 'tabs') {
      if (isConfigurableFormComponent(model)) {
        const items: ITabPaneProps[] = Array.isArray(value) ? value as ITabPaneProps[] : [];
        return unwrapModel(items, allData as TypedProxy<IApplicationContext<object>>, standardActualModelPropertyFilter, undefined, { readOnly: model.readOnly, disabled: model.disabled });
      }
      return value;
    }
    return value;
  },
  initModel: (model) => {
    const id = nanoid();
    const tabsModel: ITabsComponentProps = {
      ...model,
      propertyName: 'custom Name',
      tabPosition: "top",
      tabs: [{ id: id, name: 'Tab 1', key: id, title: 'Tab 1', visible: true, editMode: 'inherited', components: [] }],
    };
    return tabsModel;
  },
  getDefaultStyles: () => ({ ...defaultStyles, card: { ...defaultCardStyles } }),
  migrator: (m) => m
    .add<ITabsComponentPropsV0>(0, (prev) => {
      const tabs: ITabsComponentPropsV0['tabs'] = (prev as Partial<ITabsComponentPropsV0>).tabs?.map((item) => migrateCustomFunctions(item)) ?? [];
      return migratePropertyName(migrateCustomFunctions({ ...prev, tabs })) as ITabsComponentPropsV0;
    })
    .add<ITabsComponentPropsV0>(1, (prev) => ({ ...prev, tabs: prev.tabs.map((x) => migrateReadOnly(x, 'inherited')) }))
    .add<ITabsComponentPropsV0>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<ITabsComponentPropsV0>(3, (prev) => removeComponents(prev))
    .add<ITabsComponentPropsV0>(4, (prev, ctx) => {
      if (ctx.isNew === true) return prev;
      const newModel = migratePrevStyles(prev, defaultStyles);
      const initialCardStyle = { ...defaultCardStyles, font: { ...defaultCardStyles.font, color: '#000000' } };
      return {
        ...newModel,
        overflow: true,
        card: { ...initialCardStyle },
        desktop: { ...newModel.desktop, card: { ...initialCardStyle } },
        tablet: { ...newModel.tablet, card: { ...initialCardStyle } },
        mobile: { ...newModel.mobile, card: { ...initialCardStyle } },
      };
    })
    .add<ITabsComponentProps>(11, (prev) => {
      const newModel: ITabsComponentProps = {
        ...prev,
        tabs: prev.tabs.map((tab) => {
          const newTab = { ...tab, editMode: tab.selectMode === 'readOnly' ? 'disabled' : tab.editMode };
          delete newTab.selectMode;
          return migratePermissionsToVisiblePermissions(migrateHiddenToVisible<ITabPaneProps>(newTab, true));
        }) };
      return migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(newModel)));
    }),
  settingsFormMarkup: getSettings,
  customContainerNames: ['tabs'],
  getContainers: (model) => {
    return model.tabs.map<IFormComponentContainer>((t) => ({ id: t.id }));
  },
};

export default TabsComponent;
