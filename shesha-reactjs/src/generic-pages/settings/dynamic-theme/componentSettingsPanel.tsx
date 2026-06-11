import { Card, Col, Menu, Row } from 'antd';
import React, { FC, useMemo, useState } from 'react';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { useStyles } from './styles/styles';
import { findComponentNode, getMenuItems, IMenuItem } from './toolboxComponents';
import { ConfigurableForm } from '@/components/configurableForm';
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
import { deepCopyViaJson, deepMergeValues } from '@/utils/object';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

/** Markup node that wraps designer settings tabs (e.g. Appearance). */
export interface SearchableTabsMarkup extends IConfigurableFormComponent {
  type: 'propertiesTabs' | 'searchableTabs';
  tabs: ITabPaneProps[];
}

function isSearchableTabsMarkup(c: unknown): c is SearchableTabsMarkup {
  if (!isConfigurableFormComponent(c)) return false;
  if (c.type !== 'propertiesTabs' && c.type !== 'searchableTabs') return false;
  return Array.isArray((c as { tabs?: unknown }).tabs);
}

export interface IComponentDefaultsPanelProps {
  value: IConfigurableTheme;
  onChange: (theme: IConfigurableTheme) => void;
  readOnly: boolean;
}

/**
 * Component Defaults Panel - Shows menu of components on left, appearance settings on right
 */
export const ComponentDefaultsPanel: FC<IComponentDefaultsPanelProps> = ({ value: theme, onChange, readOnly }) => {
  const { styles } = useStyles();
  const [selectedKey, setSelectedKey] = useState<string>('button');

  const selectedNode = useMemo(() => findComponentNode(selectedKey), [selectedKey]);
  const componentType = selectedNode?.type;

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

  // Get component definition and extract appearance tab components
  const appearanceMarkup = useMemo<FormMarkupWithSettings | null>(() => {
    if (!componentType) return null;

    const componentDefinitions = getComponentDefinitions();
    const componentDef = componentDefinitions.get(componentType);

    if (!componentDef?.settingsFormMarkup) return null;

    // Get the settings form markup (could be a function or object)
    let settingsFormMarkup = componentDef.settingsFormMarkup;

    // If it's a function (SettingsFormMarkupFactory), execute it to get the markup
    if (typeof settingsFormMarkup === 'function') {
      const formBuilderFactory = makeFormBuliderFactory();
      settingsFormMarkup = settingsFormMarkup({ fbf: formBuilderFactory });
    }

    // Handle both FormRawMarkup (array) and FormMarkupWithSettings (object with components)
    const components: IConfigurableFormComponent[] | undefined = Array.isArray(settingsFormMarkup)
      ? settingsFormMarkup
      : settingsFormMarkup?.components;
    const formSettings = Array.isArray(settingsFormMarkup) ? undefined : settingsFormMarkup?.formSettings;

    if (!components) return null;

    const searchableTabs = components.find(isSearchableTabsMarkup);
    if (!searchableTabs) return null;

    const appearanceTab = searchableTabs.tabs.find(
      (tab) => tab.key === 'appearance' || tab.title?.toLowerCase() === 'appearance',
    );

    const tabComponents: unknown = appearanceTab?.components;
    const appearanceMarkupComponents: IConfigurableFormComponent[] | undefined = Array.isArray(tabComponents)
      ? tabComponents
      : isRawComponentsContainer(tabComponents)
        ? tabComponents.components
        : undefined;

    if (!appearanceMarkupComponents) return null;

    return {
      components: appearanceMarkupComponents,
      formSettings: formSettings ?? DEFAULT_FORM_SETTINGS,
    } satisfies FormMarkupWithSettings;
  }, [componentType]);

  // Handle form data change — deep-merge so nested keys (e.g. application) are not replaced wholesale
  const handleFormDataChange = (changedValues: Partial<IConfigurableTheme>): void => {
    const base = deepCopyViaJson(theme) as IConfigurableTheme;
    const merged = deepMergeValues(base, (changedValues ?? {}) as object) as IConfigurableTheme;
    onChange(merged);
  };

  return (
    <Row gutter={16}>
      {/* Left: Component Menu */}
      <Col xs={24} sm={24} md={6} lg={6} xl={6} xxl={6}>
        <Card
          title="Components"
          size="small"
          style={{ height: '600px', overflowY: 'auto' }}
          className={styles.themeCardMenu}
        >
          <Menu
            items={menuData}
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={(item) => {
              const node = findComponentNode(item.key);
              if (node?.type) {
                setSelectedKey(item.key);
              }
            }}
          />
        </Card>
      </Col>

      {/* Right: Component Appearance Settings */}
      <Col xs={24} sm={24} md={18} lg={18} xl={18} xxl={18}>
        {/* Edit Card: allows editing the component's appearance/theme values */}
        <Card
          title={(
            <div>
              <h4 style={{ marginBottom: 4 }}>{selectedNode?.title || 'Select a Component'}</h4>
              <span style={{ color: '#999', fontSize: '12px' }}>
                Configure default appearance for {selectedNode?.title?.toLowerCase() || 'components'}
              </span>
            </div>
          )}
          size="small"
          style={{ height: '450px', overflowY: 'auto' }}
          className={styles.themeCardSettings}
        >
          {appearanceMarkup && componentType ? (
            <ConfigurableForm
              mode={readOnly ? 'readonly' : 'edit'}
              markup={appearanceMarkup}
              initialValues={theme}
              onValuesChange={handleFormDataChange}
              className={styles.appearanceForm}
            />
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>
              {componentType
                ? 'This component does not have appearance settings or they cannot be loaded'
                : 'Select a component from the tree to configure its default appearance'}
            </div>
          )}
        </Card>
        {/* Preview Card: renders the component with the current theme to show a live preview */}
        <Card>
          {isDefined(selectedNode) && !isNullOrWhiteSpace(selectedNode.type) && (
            <div>
              <h4 style={{ marginBottom: 4 }}>{selectedNode.title || 'Select a Component'}</h4>
              <span style={{ color: '#999', fontSize: '12px' }}>
                Configure default appearance for {selectedNode.title?.toLowerCase() || 'components'}
              </span>
              <ConfigurableForm
                mode="edit"
                markup={{
                  components: [
                    {
                      type: selectedNode.type,
                      id: selectedNode.key,
                      propertyName: `${selectedNode.type}Appearance`,
                      label: `${selectedNode.title}`,
                      parentId: 'root',
                      hidden: false,
                    },
                  ],
                  formSettings: {
                    colon: theme.colon ?? false, // TODO: use theme value
                    layout: theme.layout ?? "horizontal",
                    labelCol: theme.labelSpan ? { span: theme.labelSpan } : {},
                    wrapperCol: theme.componentSpan ? { span: theme.componentSpan } : {},
                  },
                }}
                initialValues={theme}
                className={styles.appearanceForm}
              />
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};
