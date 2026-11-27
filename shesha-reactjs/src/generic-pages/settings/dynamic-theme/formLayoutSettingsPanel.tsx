import { Form } from 'antd';
import { FC, useMemo } from 'react';
import { ConfigurableForm } from '@/components/configurableForm';
import { DEFAULT_FORM_SETTINGS, FormMarkupWithSettings } from '@/providers/form/models';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { useStyles } from './styles/styles';

const DEFAULT_LABEL_SPAN = 6;
const GRID_COLUMNS = 24;

const hiddenUnlessHorizontal = { _code: 'return getSettingValue(data?.layout) !== "horizontal";', _mode: 'code' as const, _value: false };

/** The panel's values; `labelFont` is the Input Components group's label font (`componentGroups.input.labelFont`). */
type FormLayoutModel = Pick<IConfigurableTheme, 'layout' | 'labelSpan' | 'labelAlign' | 'colon'> & { labelFont?: IFontValue | undefined };

/**
 * The theme with the Form Span settings form's values applied. The form reports all of its current values
 * on every change, not only the edited one, so every field it reports is applied - handling one of them and
 * stopping would drop the others (the label font's fields are always present, so stopping after them lost
 * every Layout/Span/Align/Colon edit).
 */
export const applyFormLayoutChange = (theme: IConfigurableTheme, values: Partial<FormLayoutModel>): IConfigurableTheme => {
  const { labelFont, labelSpan, ...rest } = values;
  const next: IConfigurableTheme = { ...theme, ...rest };
  if ('labelFont' in values) {
    // The label font belongs to the Input Components group. Merge so a change to one font part never drops the others.
    const inputGroup = theme.componentGroups?.input ?? {};
    next.componentGroups = { ...theme.componentGroups, input: { ...inputGroup, labelFont: { ...inputGroup.labelFont, ...labelFont } } };
  }
  if ('labelSpan' in values) {
    // Keep the control's span in step with the label's so the two always fill the grid.
    const span = typeof labelSpan === 'number' ? labelSpan : undefined;
    next.labelSpan = span;
    next.componentSpan = span !== undefined ? GRID_COLUMNS - span : undefined;
  }
  return next;
};

export interface IFormLayoutSettingsPanelProps {
  value: IConfigurableTheme;
  onChange: (theme: IConfigurableTheme) => void;
  readOnly: boolean;
}

/**
 * Theme-wide form layout (layout, label span/alignment, colon, label font). Rendered as a settings form - the same
 * settings inputs, vertical layout and colon-less labels as Form Settings > Appearance - so it matches
 * every other settings panel. A form's own settings take precedence over these.
 */
export const FormLayoutSettingsPanel: FC<IFormLayoutSettingsPanelProps> = ({ value: theme, onChange, readOnly }) => {
  const [form] = Form.useForm();
  const { styles } = useStyles();
  const fbf = useFormBuilderFactory();

  const markup = useMemo((): FormMarkupWithSettings => ({
    components: fbf()
      .addSettingsInput({
        propertyName: 'layout',
        label: 'Layout',
        inputType: 'radio',
        jsSetting: false,
        buttonGroupOptions: [
          { value: 'vertical', title: 'Vertical' },
          { value: 'horizontal', title: 'Horizontal' },
        ],
      })
      .addSettingsInput({
        propertyName: 'labelSpan',
        label: 'Label Span',
        inputType: 'slider',
        jsSetting: false,
        min: 0,
        max: GRID_COLUMNS,
        step: 1,
        tooltip: `Grid columns (out of ${GRID_COLUMNS}) taken by the label; the control takes the rest.`,
        hidden: hiddenUnlessHorizontal,
      })
      .addSettingsInput({
        propertyName: 'labelAlign',
        label: 'Label Align',
        inputType: 'radio',
        width: 100,
        jsSetting: false,
        buttonGroupOptions: [
          { value: 'left', title: 'Left' },
          { value: 'right', title: 'Right' },
        ],
        hidden: hiddenUnlessHorizontal,
      })
      .addSettingsInput({
        propertyName: 'colon',
        label: 'Colon',
        inputType: 'switch',
        jsSetting: false,
        tooltip: 'Whether a colon is displayed after labels (only effective when layout is horizontal). Used by forms that don\'t set their own Colon in Form Settings.',
      })
      // Lets labels be matched to the font given to the input components; unset parts follow the application font.
      .stdFontControls('labelFont', ['align'], 'Label Font')
      .toJson(),
    formSettings: {
      ...DEFAULT_FORM_SETTINGS,
      isSettingsForm: true,
      layout: 'vertical',
      colon: false,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
  }), [fbf]);

  const initialModel = useMemo((): FormLayoutModel => ({
    // An unset theme layout is what forms fall back to (see resolveFormLayout), so show that rather than nothing.
    layout: theme.layout ?? 'horizontal',
    labelSpan: theme.labelSpan ?? DEFAULT_LABEL_SPAN,
    labelAlign: theme.labelAlign,
    colon: theme.colon ?? true,
    labelFont: theme.componentGroups?.input?.labelFont,
  }), [theme.layout, theme.labelSpan, theme.labelAlign, theme.colon, theme.componentGroups?.input?.labelFont]);

  const handleChange = (changedValues: Partial<FormLayoutModel>): void => {
    onChange(applyFormLayoutChange(theme, changedValues));
  };

  return (
    <ConfigurableForm<FormLayoutModel>
      form={form}
      mode={readOnly ? 'readonly' : 'edit'}
      markup={markup}
      initialValues={initialModel}
      onValuesChange={handleChange}
      cacheKey="theme-form-layout"
      className={styles.appearanceForm}
      isSettingsForm
      layout="vertical"
    />
  );
};


