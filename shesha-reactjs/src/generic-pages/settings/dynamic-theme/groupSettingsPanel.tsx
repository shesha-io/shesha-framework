import React, { FC, useMemo } from 'react';
import { Typography } from 'antd';
import { IConfigurableTheme, IThemeDeviceStyles } from '@/providers/theme/contexts';
import { useStyles } from './styles/styles';
import { ConfigurableForm } from '@/components/configurableForm';
import { FormMarkup } from '@/providers/form/models';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { deepCopyViaJson, deepMergeSkipUndefinedFunc, deepMergeValues } from '@/utils/object';
import { getSettings as getInputSettings } from './componentGroups/inputComponentSettings';
import { getSettings as getLayoutSettings } from './componentGroups/layoutComponentSettings';
import { getSettings as getStandardSettings } from './componentGroups/standardComponentSettings';
import { getSettings as getInlineSettings } from './componentGroups/inlineComponentSettings';
import { ComponentGroupPreview } from './componentGroups/groupPreview';
import { isDefined } from '@/utils/nullables';
import { useCanvas } from '@/providers';
import { DeviceTypes } from '@/providers/canvas/contexts';

export type ComponentGroupKey = 'input' | 'layout' | 'standard' | 'inline';

const GROUP_SETTINGS_FACTORIES: Record<ComponentGroupKey, (args: { fbf: any }) => FormMarkup> = {
  input: getInputSettings,
  layout: getLayoutSettings,
  standard: getStandardSettings,
  inline: getInlineSettings,
};

const GROUP_TITLES: Record<ComponentGroupKey, { title: string; description: string }> = {
  input: {
    title: 'Input Component Settings',
    description: 'Default label behaviour and spacing for input components (text fields, dropdowns, checkboxes, ...).',
  },
  layout: {
    title: 'Layout Component Settings',
    description: 'Default spacing, background, borders and shadow for layout components (containers, panels, columns, tabs, ...).',
  },
  standard: {
    title: 'Standard Component Settings',
    description: 'Default spacing for standard display components (text, alerts, links, ...).',
  },
  inline: {
    title: 'In-line Component Settings',
    description: 'Default spacing and button styling for in-line components.',
  },
};

export interface IComponentGroupSettingsProps {
  group: ComponentGroupKey;
  value?: IConfigurableTheme | undefined;
  onChange?: ((theme: IConfigurableTheme) => void) | undefined;
  readonly?: boolean | undefined;
}

export const ComponentGroupSettings: FC<IComponentGroupSettingsProps> = ({ group, value: theme, onChange, readonly }) => {
  const { styles } = useStyles();
  const { title, description } = GROUP_TITLES[group];
  const fbf = useFormBuilderFactory();

  const markup = useMemo(() => {
    const factory = GROUP_SETTINGS_FACTORIES[group];
    return factory({ fbf });
  }, [group, fbf]);

  // The group appearance markup uses a device-keyed property router, so the form reads/writes style
  // props under a `<device>.*` path (the theme page has no device switcher yet, so that device is
  // 'desktop'). Group theme styles are stored under theme[device].componentGroups[group], so the form's
  // device layer aligns with the theme device bucket: we feed the form { [device]: stored } and, on
  // save, unwrap that device key back into theme[device].componentGroups[group].
  const device: DeviceTypes = useCanvas().designerDevice ?? 'desktop';

  const initialValues = useMemo(() => {
    const merge = (target: object, source: object): object =>
      deepMergeValues(target, source, deepMergeSkipUndefinedFunc);

    // Desktop is the base tier and the active device overlays it; legacy themes stored groups at the
    // theme root — the same fallback chain the theme provider's getComponentGroupStyle applies.
    const base = theme?.desktop?.componentGroups?.[group] ?? theme?.componentGroups?.[group] ?? {};
    const overlay = (device !== 'desktop' ? theme?.[device]?.componentGroups?.[group] : undefined) ?? {};
    const stored = merge(deepCopyViaJson(base) as object, overlay);

    // Theme-level settings are the tier above the group tier. Seed the input group's label settings
    // from them so the form opens showing what the group currently inherits. Display-only: only user
    // edits are persisted (handleValuesChange merges changed values over the stored group styles).
    const inherited: Record<string, unknown> = group === 'input'
      ? { labelAlign: theme?.labelAlign, colon: theme?.colon, labelSpan: theme?.labelSpan }
      : {};

    return { [device]: deepCopyViaJson(merge(inherited, stored)) };
  }, [theme, group, device]);

  const handleValuesChange = (changedValues: Record<string, unknown>): void => {
    if (!onChange) return;
    const incoming = (changedValues[device] as Record<string, unknown> | undefined) ?? {};
    const base = deepCopyViaJson(theme ?? {}) as IConfigurableTheme;
    const deviceStyles: IThemeDeviceStyles = base[device] ?? {};
    const legacyGroupBase = device === 'desktop' ? base.componentGroups?.[group] : undefined;
    const groupBase = deepCopyViaJson(deviceStyles.componentGroups?.[group] ?? legacyGroupBase ?? {});
    const mergedGroup = deepMergeValues(groupBase, incoming);
    const merged: IConfigurableTheme = {
      ...base,
      [device]: {
        ...deviceStyles,
        componentGroups: {
          ...(deviceStyles.componentGroups ?? {}),
          [group]: mergedGroup,
        },
      },
    };
    onChange(merged);
  };

  return (
    <div style={{ padding: '0 0 24px' }}>
      <Typography.Title level={4} style={{ marginBottom: 4 }}>{title}</Typography.Title>
      <Typography.Text type="secondary">{description}</Typography.Text>

      <div style={{ marginTop: 16 }}>
        <ConfigurableForm
          // Remount on device change so initialValues (applied on mount only) re-seed for the device.
          key={`${group}-${device}`}
          mode={readonly ? 'readonly' : 'edit'}
          markup={markup as FormMarkup}
          initialValues={initialValues}
          onValuesChange={handleValuesChange}
          className={styles.appearanceForm}
        />
      </div>

      {isDefined(theme) && <ComponentGroupPreview group={group} theme={theme} />}
    </div>
  );
};

export default ComponentGroupSettings;
