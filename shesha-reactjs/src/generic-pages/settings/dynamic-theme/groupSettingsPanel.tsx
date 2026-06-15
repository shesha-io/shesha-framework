import React, { FC, useMemo } from 'react';
import { Typography } from 'antd';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { useStyles } from './styles/styles';
import { ConfigurableForm } from '@/components/configurableForm';
import { FormMarkup } from '@/providers/form/models';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { deepCopyViaJson, deepMergeValues } from '@/utils/object';
import { getSettings as getInputSettings } from './componentGroups/inputComponentSettings';
import { getSettings as getLayoutSettings } from './componentGroups/layoutComponentSettings';
import { getSettings as getStandardSettings } from './componentGroups/standardComponentSettings';
import { getSettings as getInlineSettings } from './componentGroups/inlineComponentSettings';

export type ComponentGroupKey = 'input' | 'layout' | 'standard' | 'inline';

const GROUP_SETTINGS_FACTORIES: Record<ComponentGroupKey, (args: { fbf: any }) => { components: any[]; formSettings?: any }> = {
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
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readonly?: boolean;
}

export const ComponentGroupSettings: FC<IComponentGroupSettingsProps> = ({ group, value: theme, onChange, readonly }) => {
  const { styles } = useStyles();
  const { title, description } = GROUP_TITLES[group];
  const fbf = useFormBuilderFactory();

  const markup = useMemo(() => {
    const factory = GROUP_SETTINGS_FACTORIES[group];
    return factory({ fbf });
  }, [group, fbf]);

  const handleValuesChange = (changedValues: any): void => {
    if (!onChange) return;
    const base = deepCopyViaJson(theme ?? {}) as IConfigurableTheme;
    const groupBase = deepCopyViaJson(base.componentGroups?.[group] ?? {}) as any;
    const mergedGroup = deepMergeValues(groupBase, changedValues) as any;
    const merged = {
      ...base,
      componentGroups: {
        ...base.componentGroups,
        [group]: mergedGroup,
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
          mode={readonly ? 'readonly' : 'edit'}
          markup={markup as FormMarkup}
          initialValues={theme?.componentGroups?.[group] ?? {}}
          onValuesChange={handleValuesChange}
          className={styles.appearanceForm}
        />
      </div>
    </div>
  );
};

export default ComponentGroupSettings;
