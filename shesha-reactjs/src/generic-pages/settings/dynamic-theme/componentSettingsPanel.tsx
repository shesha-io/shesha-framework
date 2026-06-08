import { Card, Col, Menu, Row } from 'antd';
import React, { FC, useMemo, useState } from 'react';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { useStyles } from './styles/styles';
import { findComponentNode, getMenuItems, IMenuItem } from './toolboxComponents';
import { ConfigurableForm } from '@/components/configurableForm';
import { getComponentDefinitions } from '@/providers/form/defaults/toolboxComponents';
import {
  IConfigurableFormComponent,
  isConfigurableFormComponent,
  isRawComponentsContainer,
} from '@/providers/form/models';
import { ITabPaneProps } from '@/designer-components/propertiesTabs/models';
import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { ItemType } from 'antd/es/menu/interface';
import { deepCopyViaJson, deepMergeValues } from '@/utils/object';
import {
  getPreviewComponentProps,
  getPreviewFormData,
  isInputComponent,
  PREVIEW_PROPERTY_NAME,
} from './previewData';
import { getExtraAppearanceComponents } from './appearanceAdapter';

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
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readonly?: boolean;
}

/**
 * Component Defaults Panel - Shows menu of components on left, appearance settings on right
 */
export const ComponentDefaultsPanel: FC<IComponentDefaultsPanelProps> = ({ value: theme, onChange, readonly }) => {
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
  const appearanceMarkup = useMemo(() => {
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

    // Surface configured properties that live on other tabs (e.g. fileUpload's `listType`) so they
    // can be themed/previewed from the appearance panel. See ./appearanceAdapter.
    const extraComponents = getExtraAppearanceComponents(componentType, components);

    return {
      components: [...extraComponents, ...appearanceMarkupComponents],
      formSettings: formSettings ?? undefined,
    };
  }, [componentType]);

  // Build the preview markup + data once per selected component. Dummy content/children/values are
  // injected so the component renders something visible (see ./previewData). Memoised because the
  // dummy children use generated ids that should stay stable across re-renders.
  const previewConfig = useMemo(() => {
    if (!selectedNode?.type) return null;

    const type = selectedNode.type;
    // Input components bind to a known property name so their dummy value is displayed.
    const propertyName = isInputComponent(type) ? PREVIEW_PROPERTY_NAME : `${type}Appearance`;

    const previewComponent: IConfigurableFormComponent = {
      type,
      id: selectedNode.key,
      propertyName,
      label: selectedNode.title,
      parentId: 'root',
      hidden: false,
      ...getPreviewComponentProps(type),
    } as IConfigurableFormComponent;

    const markup = {
      components: [previewComponent],
      formSettings: {
        colon: theme?.colon,
        layout: theme?.layout,
        labelCol: { span: theme?.labelSpan },
        wrapperCol: { span: theme?.componentSpan },
      },
    };

    return { markup, data: getPreviewFormData(type, theme ?? {}) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode?.key, selectedNode?.type, theme]);

  // Handle form data change — deep-merge so nested keys (e.g. application) are not replaced wholesale
  const handleFormDataChange = (changedValues: Partial<IConfigurableTheme>): void => {
    if (!onChange) return;
    const base = deepCopyViaJson(theme ?? {}) as IConfigurableTheme;
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
              mode={readonly ? 'readonly' : 'edit'}
              markup={appearanceMarkup}
              initialValues={theme ?? {}}
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
        {/* Preview Card: renders the component with the current theme to show a live preview.
            Dummy content/children/values are injected (see ./previewData) so every component
            shows how it looks by default instead of rendering empty. */}
        <Card>
          {componentType && previewConfig && (
            <div>
              <h4 style={{ marginBottom: 4 }}>{selectedNode?.title || 'Select a Component'}</h4>
              <span style={{ color: '#999', fontSize: '12px' }}>
                Preview of {selectedNode?.title?.toLowerCase() || 'the component'} with sample data
              </span>
              <ConfigurableForm
                mode="edit"
                markup={previewConfig.markup}
                initialValues={previewConfig.data}
                className={styles.appearanceForm}
              />
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};
