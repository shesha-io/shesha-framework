import { Card, Col, Menu, Row } from 'antd';
import React, { CSSProperties, FC, useCallback, useMemo, useState } from 'react';
import { IConfigurableTheme, ThemeDevice } from '@/providers/theme/contexts';
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
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { deepMergeValues } from '@/utils/object';

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

  // Theme component styles are nested under a device key. The theme page has no device switcher yet, so
  // we read/write the desktop bucket; centralised here so wiring a switcher later is a one-line change.
  const device: ThemeDevice = 'desktop';

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

  const initialModel = useMemo(
    () => (theme?.[device]?.components?.[componentType ?? ''] as object | undefined) ?? {},
    [componentType, theme, device],
  );
  const selectedKeys = useMemo(() => [selectedKey], [selectedKey]);
  const menuOnClick = useCallback((item: MenuInfo) => {
    const node = findComponentNode(item.key);
    if (Boolean(node?.type)) {
      setSelectedKey(item.key);
    }
  }, [setSelectedKey]);

  // Persist appearance edits into theme[device].components[type], keyed by the selected component's type
  // and nested under the device bucket. The theme panel builds the appearance markup with
  // removeStyleRouter:true, so the form emits style props at the top level (no device layer in the form
  // values) — exactly the shape getDefaultStyles() returns and the runtime style merge reads.
  //
  // ConfigurableForm's onValuesChange passes (rawFormValues, defaultModelMergedValues). We persist the
  // raw form values so only what the user actually set lands in the theme — the runtime merge supplies
  // defaults, group and per-component tiers. Deep-merge into the existing stored value so editing one
  // property group doesn't wipe the others.
  const handleFormDataChange = (formValues: Record<string, unknown>): void => {
    if (!onChange || isNullOrWhiteSpace(componentType)) return;

    const deviceStyles = theme?.[device] ?? {};
    const existing = (deviceStyles.components?.[componentType] as Record<string, unknown> | undefined) ?? {};
    const mergedComponent = deepMergeValues(existing, formValues);

    onChange({
      ...theme,
      [device]: {
        ...deviceStyles,
        components: {
          ...(deviceStyles.components ?? {}),
          [componentType]: mergedComponent,
        },
      },
    });
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
        {/* key by componentType so each selected component gets a fresh DefaultModelProvider instance
            seeded with its own theme slice — otherwise the provider persists across selections and the
            previous component's values bleed into the next one. */}
        <DefaultModelProvider key={componentType} name="Component Default Styles" model={initialModel} defaultModel={defaultStyles}>
          <ComponentDefaultsSettings componentTitle={componentTitle} componentType={componentType} markup={appearanceMarkup} initialModel={initialModel} readonly={readonly ?? false} onChange={handleFormDataChange} />
        </DefaultModelProvider>
        {/* Preview Card: renders the component with the current theme to show a live preview */}
        {isDefined(componentDef) && isDefined(theme) && <ComponentDefaultsPreview componentDefinition={componentDef} theme={theme} />}
      </Col>
    </Row>
  );
};
