import { Card, Col, Menu, Row } from 'antd';
import React, { FC, useMemo, useState } from 'react';
import { IConfigurableTheme, IThemeDeviceStyles } from '@/providers/theme/contexts';
import { useStyles } from './styles/styles';
import { findComponentNode, getMenuItems, IMenuItem } from './toolboxComponents';
import { ConfigurableForm } from '@/components/configurableForm';
import { DEFAULT_FORM_SETTINGS, FormMarkup } from '@/providers/form/models';
import { ItemType } from 'antd/es/menu/interface';
import { getComponentDefinitions } from '@/providers/form/defaults/toolboxComponents';
import { deepCopyViaJson, deepMergeSkipUndefinedFunc, deepMergeValues } from '@/utils/object';
import { buildPreviewComponents, getPreviewFormData, previewNeedsDesignerMode } from './previewData';
import { getAppearanceMarkup } from './appearanceMarkup';
import { useCanvas } from '@/providers';
import { DeviceTypes } from '@/providers/canvas/contexts';
import DefaultModelProvider from '@/designer-components/_settings/defaultModelProvider/defaultModelProvider';

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

  // The component appearance markup uses a device-keyed property router, so the form reads/writes style
  // props under a `<device>.*` path (the theme page has no device switcher yet, so that device is
  // 'desktop'). Component theme styles are stored under theme[device].components[componentType], so the form's
  // device layer aligns with the theme device bucket: we feed the form { [device]: stored } and, on
  // save, unwrap that device key back into theme[device].components[componentType].
  const device: DeviceTypes = useCanvas().designerDevice ?? 'desktop';

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
  const componentDef = useMemo(
    () => (componentType ? getComponentDefinitions().get(componentType) : undefined),
    [componentType],
  );

  // Baseline the form on the same inheritance chain the designer applies (see genericSettingsForm):
  // hardcoded defaults (getDefaultStyles) ← group-tier theme (themeGroup) ← per-type theme.
  //
  // The two tiers are kept separate so the form can show the same inheritance indicators as the
  // properties panel (green = inherited from the default model, tan = overridden by this theme). The
  // settings FormItem reads those states from a DefaultModelProvider by comparing its `model` (the
  // per-type theme values the user has actually set) against its `defaultModel` (everything the
  // component inherits: hardcoded defaults ← group-tier theme). We therefore expose:
  //   • defaultModel — defaults ← group-tier theme (the inherited baseline)
  //   • model        — stored per-type theme values (the overrides)
  //   • initialValues — the effective merge, so fields open pre-filled with what's in effect.
  //
  // handleFormDataChange still merges user edits over the *stored* per-type theme, so seeded defaults
  // never leak into the saved theme.
  //
  // All three are wrapped under the device key because the appearance markup routes every style prop
  // through a device propertyRouter (`<device>.*`) — the settings FormItem prefixes its lookup path
  // with that router's namePrefix, so the default/model paths must be keyed the same way.
  const merge = (target: object, source: object): object =>
    deepMergeValues(target, source, deepMergeSkipUndefinedFunc);

  const inheritedModel = useMemo(() => {
    if (!componentType) return {};

    // 1. Hardcoded component defaults.
    const defaults = deepCopyViaJson(componentDef?.getDefaultStyles?.() ?? {}) as object;

    // 2. Group-tier theme styles: desktop is the base, the active device overlays it (legacy themes
    //    stored groups at the theme root — same fallback the theme provider applies).
    const group = componentDef?.themeGroup;
    const groupBase = (group ? theme?.desktop?.componentGroups?.[group] ?? theme?.componentGroups?.[group] : undefined) ?? {};
    const groupOverlay = (group && device !== 'desktop' ? theme?.[device]?.componentGroups?.[group] : undefined) ?? {};
    const groupStyle = merge(deepCopyViaJson(groupBase) as object, groupOverlay);

    return { [device]: deepCopyViaJson(merge(defaults, groupStyle)) };
  }, [componentType, componentDef, theme, device]);

  const storedModel = useMemo(() => {
    if (!componentType) return {};

    const stored = device === 'desktop'
      ? theme?.desktop?.components?.[componentType] ?? theme?.components?.[componentType] ?? {}
      : theme?.[device]?.components?.[componentType] ?? {};
    return { [device]: deepCopyViaJson(stored) };
  }, [componentType, theme, device]);

  const initialValues = useMemo(
    // Deep-copy so the form never mutates objects still referenced by the theme.
    () => (componentType ? deepCopyViaJson(merge(inheritedModel, storedModel)) : {}),
    [componentType, inheritedModel, storedModel],
  );

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

    const markup: FormMarkup = {
      components: buildPreviewComponents(type, selectedNode.key, selectedNode.title),
      formSettings: {
        ...DEFAULT_FORM_SETTINGS,
        colon: theme?.colon ?? DEFAULT_FORM_SETTINGS.colon,
        layout: theme?.layout ?? DEFAULT_FORM_SETTINGS.layout,
        labelCol: { span: theme?.labelSpan ?? 6 },
        wrapperCol: { span: theme?.componentSpan ?? 18 },
      },
    };

    // Some components (e.g. DataList) only render their sample rows in designer mode — see
    // previewNeedsDesignerMode. Others preview correctly in plain edit mode.
    const mode: 'designer' | 'edit' = previewNeedsDesignerMode(type) ? 'designer' : 'edit';

    return { markup, data: getPreviewFormData(type, theme ?? {}), mode };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode?.key, selectedNode?.type, theme]);

  // Handle form data change — deep-merge so nested keys (e.g. application) are not replaced wholesale
  const handleFormDataChange = (changedValues: Record<string, unknown>): void => {
    if (!onChange) return;
    const incoming = (changedValues[device] as Record<string, unknown> | undefined) ?? {};
    const base = deepCopyViaJson(theme ?? {}) as IConfigurableTheme;
    const deviceStyles: IThemeDeviceStyles = base[device] ?? {};
    const componentBase = deepCopyViaJson(deviceStyles.components?.[componentType ?? ''] ?? {});
    const mergedComponent = deepMergeValues(componentBase, incoming);

    const merged: IConfigurableTheme = {
      ...base,
      [device]: {
        ...deviceStyles,
        components: {
          ...(deviceStyles.components ?? {}),
          [componentType ?? '']: mergedComponent,
        },
      },
    };

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
                Configure default appearance for {selectedNode?.title.toLowerCase() || 'components'}
              </span>
            </div>
          )}
          size="small"
          style={{ height: '450px', overflowY: 'auto' }}
          className={styles.themeCardSettings}
        >
          {appearanceMarkup && componentType ? (
            // The settings FormItem reads inheritance state (inherited vs. overridden) from this
            // provider — comparing the stored per-type theme values (model) against the inherited
            // baseline (defaultModel) — and paints the same green/tan indicators + hover tooltip the
            // properties panel shows. Keyed by componentType so each selection gets a fresh provider
            // seeded with its own slice, instead of the previous component's values bleeding through.
            <DefaultModelProvider
              key={componentType}
              name="Component Default Styles"
              model={storedModel}
              defaultModel={inheritedModel}
            >
              <ConfigurableForm
                // Remount when the selection or device changes so initialValues (applied on mount only)
                // re-seed with the newly selected component's inherited baseline.
                key={`${selectedKey}-${device}`}
                mode={readonly ? 'readonly' : 'edit'}
                markup={appearanceMarkup as FormMarkup}
                initialValues={initialValues}
                onValuesChange={handleFormDataChange}
                className={styles.appearanceForm}
              />
            </DefaultModelProvider>
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
              <h4 style={{ marginBottom: 4 }}>{selectedNode.title || 'Select a Component'}</h4>
              <span style={{ color: '#999', fontSize: '12px' }}>
                Preview of {selectedNode.title.toLowerCase() || 'the component'} with sample data
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
