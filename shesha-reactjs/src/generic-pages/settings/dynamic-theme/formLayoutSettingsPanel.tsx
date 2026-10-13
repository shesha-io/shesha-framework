import { Form } from 'antd';
import { FC, useMemo } from 'react';
import { ConfigurableForm } from '@/components/configurableForm';
import { DEFAULT_FORM_SETTINGS, FormMarkupWithSettings } from '@/providers/form/models';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { useStyles } from './styles/styles';

const DEFAULT_LABEL_SPAN = 6;
const GRID_COLUMNS = 24;

const hiddenUnlessHorizontal = { _code: 'return getSettingValue(data?.layout) !== "horizontal";', _mode: 'code' as const, _value: false };

type FormLayoutModel = Pick<IConfigurableTheme, 'layout' | 'labelSpan' | 'labelAlign' | 'colon'>;

export interface IFormLayoutSettingsPanelProps {
  value: IConfigurableTheme;
  onChange: (theme: IConfigurableTheme) => void;
  readOnly: boolean;
}

/**
 * Theme-wide form layout (layout, label span/alignment, colon). Rendered as a settings form - the same
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
        inputType: 'numberField',
        jsSetting: false,
        min: 0,
        max: GRID_COLUMNS,
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
    layout: theme.layout,
    labelSpan: theme.labelSpan ?? DEFAULT_LABEL_SPAN,
    labelAlign: theme.labelAlign,
    colon: theme.colon ?? true,
  }), [theme.layout, theme.labelSpan, theme.labelAlign, theme.colon]);

  const handleChange = (changedValues: FormLayoutModel): void => {
    if (!('labelSpan' in changedValues)) {
      onChange({ ...theme, ...changedValues });
      return;
    }
    // Keep the control's span in step with the label's so the two always fill the grid.
    const labelSpan = typeof changedValues.labelSpan === 'number' ? changedValues.labelSpan : undefined;
    onChange({
      ...theme,
      ...changedValues,
      labelSpan,
      componentSpan: labelSpan !== undefined ? GRID_COLUMNS - labelSpan : undefined,
    });
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

export default FormLayoutSettingsPanel;
