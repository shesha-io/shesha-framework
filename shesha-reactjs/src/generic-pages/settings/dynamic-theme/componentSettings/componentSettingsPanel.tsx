import { Card, Col, Menu, Row } from 'antd';
import React, { CSSProperties, FC, useCallback, useMemo, useState } from 'react';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { useStyles } from '../styles/styles';
import { findComponentNode, getMenuItems, IMenuItem } from '../toolboxComponents';
import { getComponentDefinitions } from '@/providers/form/defaults/toolboxComponents';
import {
  DEFAULT_FORM_SETTINGS,
  FormMarkupWithSettings,
  IConfigurableFormComponent,
  isConfigurableFormComponent,
  isRawComponentsContainer,
} from '@/providers/form/models';
import { ITabPaneProps } from '@/designer-components/propertiesTabs/models';
import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { ItemType } from 'antd/es/menu/interface';
import { ComponentDefaultsPreview } from './preview';
import { ComponentDefaultsSettings } from './settings';
import DefaultModelProvider from '@/designer-components/_settings/defaultModelProvider/defaultModelProvider';
import { IToolboxComponent } from '../../../../interfaces/formDesigner';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';

/** Markup node that wraps designer settings tabs (e.g. Appearance). */
export interface SearchableTabsMarkup extends IConfigurableFormComponent {
  type: 'propertiesTabs' | 'searchableTabs';
  tabs: ITabPaneProps[];
}

export interface MenuInfo {
  key: string;
  keyPath: string[];
  /** @deprecated This will not support in future. You should avoid to use this */
  item: React.ReactInstance;
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}

function isSearchableTabsMarkup(c: unknown): c is SearchableTabsMarkup {
  if (!isConfigurableFormComponent(c)) return false;
  if (c.type !== 'propertiesTabs' && c.type !== 'searchableTabs') return false;
  return Array.isArray((c as { tabs?: unknown }).tabs);
}

export interface IComponentDefaultsPanelProps {
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readOnly?: boolean;
}

const componentMenuCardStyle = { height: '600px', overflowY: 'auto' } as CSSProperties;

/**
 * Component Defaults Panel - Shows menu of components on left, appearance settings on right
 */
export const ComponentDefaultsPanel: FC<IComponentDefaultsPanelProps> = ({ value: theme, onChange, readOnly: readonly }) => {
  const { styles } = useStyles();
  const [selectedKey, setSelectedKey] = useState<string>('button');

  const selectedNode = useMemo(() => findComponentNode(selectedKey), [selectedKey]);
  const componentType = selectedNode?.type;
  const componentTitle = selectedNode?.title;

  // Convert tree data to Ant Design Menu format with groups
  const menuData = useMemo(() => {
    const convertComponent = (component: IMenuItem): ItemType => ({
      key: component.key,
      label: component.title,
      icon: component.icon,
      children: component.children?.map(convertComponent),
    });
    return getMenuItems().map(convertComponent);
  }, []);

  const componentDef = useMemo((): IToolboxComponent | undefined => {
    if (isNullOrWhiteSpace(componentType)) return undefined;
    const componentDefinitions = getComponentDefinitions();
    return componentDefinitions.get(componentType);
  }, [componentType]);

  const defaultStyles = useMemo(() => {
    return typeof componentDef?.getDefaultStyles === 'function' ? componentDef.getDefaultStyles() : {};
  }, [componentDef]);

  // Get the settings form markup (could be a function or object)
  const settingsFormMarkup = componentDef?.settingsFormMarkup;

  // Get component definition and extract appearance tab components
  const appearanceMarkup = useMemo((): FormMarkupWithSettings | undefined => {
    if (!isDefined(settingsFormMarkup)) return undefined;

    // If it's a function (SettingsFormMarkupFactory), execute it to get the markup
    const markup = typeof settingsFormMarkup === 'function'
      ? settingsFormMarkup({ fbf: makeFormBuliderFactory(), removeStyleRouter: true })
      : settingsFormMarkup;

    // Handle both FormRawMarkup (array) and FormMarkupWithSettings (object with components)
    const components: IConfigurableFormComponent[] | undefined = Array.isArray(markup)
      ? markup
      : markup.components;
    const formSettings = Array.isArray(markup) ? undefined : markup.formSettings;

    if (!isDefined(components)) return undefined;

    const searchableTabs = components.find(isSearchableTabsMarkup);
    if (!searchableTabs) return undefined;

    const appearanceTab = searchableTabs.tabs.find(
      (tab) => tab.key === 'appearance' || tab.title.toLowerCase() === 'appearance',
    );

    const tabComponents: unknown = appearanceTab?.components;
    const appearanceMarkupComponents: IConfigurableFormComponent[] | undefined = Array.isArray(tabComponents)
      ? tabComponents
      : isRawComponentsContainer(tabComponents)
        ? tabComponents.components
        : undefined;

    if (!appearanceMarkupComponents) return undefined;

    return {
      components: appearanceMarkupComponents,
      formSettings: formSettings ?? DEFAULT_FORM_SETTINGS,
    };
  }, [settingsFormMarkup]);

  const initialModel = useMemo(() => theme?.components?.[componentType ?? ''] as object | undefined ?? {}, [componentType, theme?.components]);
  const selectedKeys = useMemo(() => [selectedKey], [selectedKey]);
  const menuOnClick = useCallback((item: MenuInfo) => {
    const node = findComponentNode(item.key);
    if (Boolean(node?.type)) {
      setSelectedKey(item.key);
    }
  }, [setSelectedKey]);

  // Handle form data change — deep-merge so nested keys (e.g. application) are not replaced wholesale
  const handleFormDataChange = (changedValues: Record<string, unknown>): void => {
    if (!onChange) return;
    onChange({ ...theme, components: { ...(theme?.components ?? {}), ...(isNotNullOrWhiteSpace(componentType) ? { [componentType]: { ...changedValues } } : {}) } });
  };

  return (
    <Row gutter={16}>
      {/* Left: Component Menu */}
      <Col xs={24} sm={24} md={6} lg={6} xl={6} xxl={6}>
        <Card
          title="Components"
          size="small"
          style={componentMenuCardStyle}
          className={styles.themeCardMenu}
        >
          <Menu items={menuData} mode="inline" selectedKeys={selectedKeys} onClick={menuOnClick} />
        </Card>
      </Col>

      {/* Right: Component Appearance Settings */}
      <Col xs={24} sm={24} md={18} lg={18} xl={18} xxl={18}>
        {/* Edit Card: allows editing the component's appearance/theme values */}
        <DefaultModelProvider name="Component Default Styles" model={initialModel} defaultModel={defaultStyles}>
          <ComponentDefaultsSettings componentTitle={componentTitle} componentType={componentType} markup={appearanceMarkup} initialModel={initialModel} readonly={readonly ?? false} onChange={handleFormDataChange} />
        </DefaultModelProvider>
        {/* Preview Card: renders the component with the current theme to show a live preview */}
        {isDefined(componentDef) && isDefined(theme) && <ComponentDefaultsPreview componentDefinition={componentDef} theme={theme} />}
      </Col>
    </Row>
  );
};
