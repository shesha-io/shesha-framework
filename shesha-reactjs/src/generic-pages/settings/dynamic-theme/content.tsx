import { Col, Tabs } from 'antd';
import React, { FC } from 'react';
import ThemeParameters, { ThemeSettingsSection } from './parameters';
import { useStyles } from './styles/styles';
import { IConfigurableTheme } from '@/providers/theme';

export interface IConfigurableThemePageProps {
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readonly?: boolean;
}

/**
 * Theme settings sections, per the configuration groups of the enhanced theming model:
 * theme-wide settings, the four component-group tiers (input / in-line / standard / layout),
 * and per-component settings.
 */
const SECTION_TABS: Array<{ key: ThemeSettingsSection; label: string }> = [
  { key: 'theme', label: 'Theme' },
  { key: 'input', label: 'Input Components' },
  { key: 'inline', label: 'Inline Components' },
  { key: 'standard', label: 'Standard Components' },
  { key: 'layout', label: 'Layout Components' },
  { key: 'components', label: 'Components' },
];

export const ConfigurableThemeContent: FC<IConfigurableThemePageProps> = ({ value, onChange, readonly }) => {
  const { styles } = useStyles();

  return (
    <Col span={24} className={styles.contentColumn}>
      <Tabs
        defaultActiveKey="theme"
        items={SECTION_TABS.map(({ key, label }) => ({
          key,
          label,
          children: <ThemeParameters value={value} onChange={onChange} readonly={readonly} section={key} />,
        }))}
        size="small"
        className={styles.themeParameters}
      />
    </Col>
  );
};
