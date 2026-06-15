import { Card, Col, Menu, Row } from 'antd';
import React, { FC, useMemo, useState } from 'react';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { useStyles } from './styles/styles';
import { findComponentNode, getMenuItems, IMenuItem } from './toolboxComponents';
import { ConfigurableForm } from '@/components/configurableForm';
import { FormMarkup } from '@/providers/form/models';
import { ItemType } from 'antd/es/menu/interface';
import { deepCopyViaJson, deepMergeValues } from '@/utils/object';
import { buildPreviewComponents, getPreviewFormData, previewNeedsDesignerMode } from './previewData';
import { getAppearanceMarkup } from './appearanceMarkup';

export interface IComponentDefaultsPanelProps {
  value?: IConfigurableTheme | undefined;
  onChange?: ((theme: IConfigurableTheme) => void) | undefined;
  readonly?: boolean | undefined;
}

/**
 * Component Defaults Panel - Shows menu of components on left, appearance settings on right
 */
export const ComponentDefaultsPanel: FC<IComponentDefaultsPanelProps> = ({ value: theme, onChange, readonly }) => {
  const { styles } = useStyles();

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

  // Default to the first styleable component in the (filtered) menu so the panel never starts on a
  // component that was filtered out.
  const defaultKey = useMemo(() => {
    const firstLeaf = (items: IMenuItem[]): IMenuItem | undefined => {
      for (const item of items) {
        if (item.type) return item;
        const found = item.children && firstLeaf(item.children);
        if (found) return found;
      }
      return undefined;
    };
    return firstLeaf(getMenuItems())?.key ?? 'button';
  }, []);

  const [selectedKey, setSelectedKey] = useState<string>(defaultKey);

  const selectedNode = useMemo(() => findComponentNode(selectedKey), [selectedKey]);
  const componentType = selectedNode?.type;

  // Extract the appearance tab components for the selected component (shared with the menu filter).
  const appearanceMarkup = useMemo(() => getAppearanceMarkup(componentType), [componentType]);

  // Build the preview markup + data once per selected component. Dummy content/children/values are
  // injected so the component renders something visible (see ./previewData). Data-bound components
  // (table / datalist) are wrapped in a Data Context bound to the seeded `Shesha.Core.DummyTable`,
  // exactly as the designer does, so they render the same sample rows. Memoised because the dummy
  // children use generated ids that should stay stable across re-renders.
  const previewConfig = useMemo(() => {
    if (!selectedNode?.type) return null;

    const type = selectedNode.type;

    const markup = {
      components: buildPreviewComponents(type, selectedNode.key, selectedNode.title),
      formSettings: {
        colon: theme?.colon,
        layout: theme?.layout,
        labelCol: { span: theme?.labelSpan },
        wrapperCol: { span: theme?.componentSpan },
      },
    };

    // Some components (e.g. DataList) only render their sample rows in designer mode — see
    // previewNeedsDesignerMode. Others preview correctly in plain edit mode.
    const mode: 'designer' | 'edit' = previewNeedsDesignerMode(type) ? 'designer' : 'edit';

    return { markup, data: getPreviewFormData(type, theme ?? {}), mode };
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
              markup={appearanceMarkup as FormMarkup}
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
              {/* The preview markup itself carries any required context (e.g. a Data Context bound to
                  Shesha.Core.DummyTable for tables/datalists — see buildPreviewComponents), so the
                  component renders exactly as it does on the designer canvas. */}
              <ConfigurableForm
                mode={previewConfig.mode}
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
