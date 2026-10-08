import { Col, Tabs } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import ThemeParameters, { setUndefinedForEmptyProperties, ThemeSettingsSection } from './parameters';
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

  // Every tab edits this one draft, so a change made on one tab is visible to the next edit on any
  // other tab even before the debounced save below has reached the parent.
  const [draft, setDraft] = useState<IConfigurableTheme>(value);
  useEffect(() => {
    setDraft(value);
  }, [value]);

  // it is necessary to use debounce save because it changes the theme and it results in re-rendering of all components.
  // One debounce for all tabs: per-tab debounces could each save a stale snapshot over the other's change.
  const debouncedSave = useDebouncedCallback(
    (theme: IConfigurableTheme) => onChange(setUndefinedForEmptyProperties(theme as Record<string, unknown | undefined>)),
    // delay in ms
    200,
  );

  const handleChange = useCallback((theme: IConfigurableTheme): void => {
    setDraft(theme);
    debouncedSave(theme);
  }, [debouncedSave]);

  return (
    <Col span={24} className={styles.contentColumn}>
      <Tabs
        defaultActiveKey="theme"
        items={SECTION_TABS.map(({ key, label }) => ({
          key,
          label,
          children: <ThemeParameters value={draft} onChange={handleChange} readOnly={readOnly} section={key} />,
        }))}
        size="small"
        className={styles.themeParameters}
      />
    </Col>
  );
};
