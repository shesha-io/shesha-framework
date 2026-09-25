import { Card, Form } from 'antd';
import { FC, useMemo } from 'react';
import { ConfigurableForm } from '@/components/configurableForm';
import { DEFAULT_FORM_SETTINGS, FormMarkupWithSettings } from '@/providers/form/models';
import { IConfigurableTheme, ThemeComponentGroup } from '@/providers/theme/contexts';
import { StandardAppearancePanelConfig } from '@/form-factory/interfaces';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { useStyles } from './styles/styles';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';

/**
 * The standard appearance panels shared by every component in a theme tab. 'dimensions' (width/
 * height) is deliberately left out - it is instance-specific sizing, not something that makes sense
 * as a shared group default.
 */
const GROUP_APPEARANCE_PANELS: Record<ThemeComponentGroup, StandardAppearancePanelConfig[]> = {
  input: ['font', 'border', 'background', 'shadow', 'marginPadding'],
  inline: ['font', 'border', 'background', 'shadow'],
  layout: ['border', 'background', 'shadow', 'marginPadding'],
  standard: ['font'],
};

const GROUP_LABELS: Record<ThemeComponentGroup, string> = {
  input: 'Input Components',
  inline: 'Inline Components',
  standard: 'Standard Components',
  layout: 'Layout Components',
};

export interface IGroupSettingsPanelProps {
  group: ThemeComponentGroup;
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readOnly?: boolean;
}

/**
 * One shared appearance form for every component in a style-group tab (Input/Inline/Standard/Layout
 * Components). Saved values live in `theme.componentGroups[group]` and are inherited by every
 * component whose `styleGroup` maps to that tab (see `getThemeGroupForStyleGroup`), between the
 * component's hardcoded defaults and its own per-type override.
 */
export const GroupSettingsPanel: FC<IGroupSettingsPanelProps> = ({ group, value: theme, onChange, readOnly }) => {
  const [form] = Form.useForm();
  const { styles } = useStyles();
  const fbf = useFormBuilderFactory();

  const markup = useMemo((): FormMarkupWithSettings => ({
    components: [...fbf().stdAppearancePanels(GROUP_APPEARANCE_PANELS[group], true).toJson()],
    formSettings: { ...DEFAULT_FORM_SETTINGS, isSettingsForm: true },
  }), [fbf, group]);

  const initialModel = useMemo(() => (theme?.componentGroups?.[group] as object | undefined) ?? {}, [theme?.componentGroups, group]);

  const handleChange = (changedValues: Record<string, unknown>): void => {
    if (!onChange) return;
    onChange({
      ...theme,
      componentGroups: {
        ...(theme?.componentGroups ?? {}),
        [group]: { ...initialModel, ...changedValues },
      },
    });
  };

  return (
    <Card
      title={(
        <div>
          <h4 style={{ marginBottom: 4 }}>{GROUP_LABELS[group]}</h4>
          <span style={{ color: '#999', fontSize: '12px' }}>
            Shared default appearance for every {isNotNullOrWhiteSpace(GROUP_LABELS[group]) ? GROUP_LABELS[group].toLowerCase() : 'component'} component. Individual components below can still override it.
          </span>
        </div>
      )}
      size="small"
      className={styles.themeCardSettings}
    >
      <ConfigurableForm
        key={group}
        form={form}
        mode={readOnly === true ? 'readonly' : 'edit'}
        markup={markup}
        initialValues={initialModel}
        onValuesChange={handleChange}
        cacheKey={`theme-group-style:${group}`}
        className={styles.appearanceForm}
        isSettingsForm
      />
    </Card>
  );
};

export default GroupSettingsPanel;
