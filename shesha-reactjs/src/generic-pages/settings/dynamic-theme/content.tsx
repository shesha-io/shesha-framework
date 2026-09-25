import { Col, Tabs } from 'antd';
import { FC } from 'react';
import ThemeParameters, { ThemeSettingsSection } from './parameters';
import { useStyles } from './styles/styles';
import { IConfigurableTheme } from '@/providers/theme';

export interface IConfigurableThemePageProps {
  value: IConfigurableTheme;
  onChange: ((theme: IConfigurableTheme) => void);
  readOnly: boolean;
}

/**
 * Theme settings tabs: theme-wide settings, the full per-component tree, then the four component
 * groups by style (see `StyleGroups`) - each of those is a single shared config for its whole group,
 * with no per-component overrides (use the Components tab for that).
 */
const SECTION_TABS: Array<{ key: ThemeSettingsSection; label: string }> = [
  { key: 'theme', label: 'Theme' },
  { key: 'components', label: 'Components' },
  { key: 'input', label: 'Input Components' },
  { key: 'inline', label: 'Inline Components' },
  { key: 'standard', label: 'Standard Components' },
  { key: 'layout', label: 'Layout Components' },
];

export const ConfigurableThemeContent: FC<IConfigurableThemePageProps> = ({ value, onChange, readOnly }) => {
  const { styles } = useStyles();

  return (
    <Col span={24} className={styles.contentColumn}>
      <Tabs
        defaultActiveKey="theme"
        items={SECTION_TABS.map(({ key, label }) => ({
          key,
          label,
          children: <ThemeParameters value={value} onChange={onChange} readOnly={readOnly} section={key} />,
        }))}
        size="small"
        className={styles.themeParameters}
      />
    </Col>
  );
};
