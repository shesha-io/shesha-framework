import { Card, Form } from 'antd';
import { FC, useMemo } from 'react';
import { ConfigurableForm } from '@/components/configurableForm';
import { DEFAULT_FORM_SETTINGS, FormMarkupWithSettings, IStyleValue } from '@/providers/form/models';
import { GROUP_HEADER_STYLES_KEY, IConfigurableTheme, ThemeComponentGroup } from '@/providers/theme/contexts';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import DefaultModelProvider, { useDefaultModelActionsOrUndefined } from '@/designer-components/_settings/defaultModelProvider/defaultModelProvider';
import { getHeaderStyleFromBody } from '@/designer-components/_common/styles/headerStyles';
import { ISetFormDataPayload } from '@/providers/form/contexts';
import { deepCopyViaJson, deepMergeValues } from '@/utils/object';
import { useStyles } from './styles/styles';
import { CardTitle } from './cardTitle';

interface IHeaderStylesFormProps {
  group: ThemeComponentGroup;
  markup: FormMarkupWithSettings;
  overrides: IStyleValue;
  readOnly: boolean;
  onChange: (overrides: IStyleValue) => void;
}

/**
 * The header style form, bound to the default model so every value shows as inherited from the body
 * until it is overridden, and can be reset back to it.
 */
const HeaderStylesForm: FC<IHeaderStylesFormProps> = ({ group, markup, overrides, readOnly, onChange }) => {
  const [form] = Form.useForm();
  const { styles } = useStyles();
  const defaultModel = useDefaultModelActionsOrUndefined<IStyleValue>();

  const getMergedOrValue = (payload: ISetFormDataPayload<IStyleValue>): IStyleValue => {
    const { values, mergeValues } = payload;
    const data = defaultModel?.getModel();
    return mergeValues && data ? deepMergeValues(data, values) : values;
  };

  // Saves only the overrides: the form's data has the values inherited from the body merged in, and
  // storing those would turn them into overrides. JSON copy drops values reset back to the body's.
  const handleChange = (): void => {
    onChange(deepCopyViaJson(defaultModel?.getModel() ?? {}));
  };

  return (
    <ConfigurableForm<IStyleValue>
      key={group}
      form={form}
      mode={readOnly ? 'readonly' : 'edit'}
      markup={markup}
      initialValues={overrides}
      onValuesChange={handleChange}
      cacheKey={`theme-group-header-style:${group}`}
      className={styles.appearanceForm}
      isSettingsForm
      layout="vertical"
      dataSource={{ dataGetter: defaultModel?.getMergedModel, dataSetter: defaultModel?.setModel, getMergedOrValue }}
    />
  );
};

export interface IGroupHeaderSettingsPanelProps {
  group: ThemeComponentGroup;
  value: IConfigurableTheme;
  onChange: (theme: IConfigurableTheme) => void;
  readOnly: boolean;
}

/**
 * Header defaults of a style group (Layout Components > Header Defaults): the heading bar of a card, a
 * panel's header and a tab strip. Each value follows the group's body style (border, background,
 * padding) until it is overridden here; only the overrides are saved, in
 * `theme.componentGroups[group].headerStyles` (see `getHeaderGroupStyle`).
 */
export const GroupHeaderSettingsPanel: FC<IGroupHeaderSettingsPanelProps> = ({ group, value: theme, onChange, readOnly }) => {
  const fbf = useFormBuilderFactory();

  const markup = useMemo((): FormMarkupWithSettings => ({
    components: fbf()
      .stdFontPanel(false, 'font', ['align'])
      .stdBorderPanel(false)
      .stdBackgroundPanel(false)
      // Padding only: a header sits inside its component, so a margin would just offset it.
      .stdCollapsiblePanel('Padding', (f) => f.addStyleBox({ label: 'Padding', hideLabel: true, propertyName: 'stylingBoxJson', format: 'json', jsSetting: false, noMargin: true }))
      .toJson(),
    formSettings: { ...DEFAULT_FORM_SETTINGS, isSettingsForm: true },
  }), [fbf]);

  const groupStyle = theme.componentGroups?.[group];
  const overrides = useMemo(() => groupStyle?.[GROUP_HEADER_STYLES_KEY] ?? {}, [groupStyle]);
  // What the header shows where it is not overridden: the body's style.
  const fromBody = useMemo(() => getHeaderStyleFromBody(groupStyle ?? {}), [groupStyle]);

  const handleChange = (headerStyles: IStyleValue): void => {
    onChange({
      ...theme,
      componentGroups: {
        ...theme.componentGroups,
        [group]: { ...groupStyle, [GROUP_HEADER_STYLES_KEY]: headerStyles },
      },
    });
  };

  return (
    <Card
      title={(
        <CardTitle
          title="Header Defaults"
          description="Header of cards, panels and tabs. Each value follows the body defaults above unless it is overridden here."
        />
      )}
    >
      <DefaultModelProvider<IStyleValue> name="Body defaults" model={overrides} defaultModel={fromBody} updateModelIfChanged>
        <HeaderStylesForm group={group} markup={markup} overrides={overrides} readOnly={readOnly} onChange={handleChange} />
      </DefaultModelProvider>
    </Card>
  );
};
