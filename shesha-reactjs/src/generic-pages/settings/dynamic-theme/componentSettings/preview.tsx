import { ConfigurableForm } from "../../../../components/configurableForm";
import { FormMarkup, IConfigurableFormComponent, IConfigurableTheme } from "@/providers";
import { FC, useMemo } from "react";
import { useStyles } from "../styles/styles";
import { Card } from "antd";
import { IToolboxComponent } from "../../../../interfaces/formDesigner";
import { getPreviewComponentModel, getPreviewVariants, IPreviewVariant } from "./previewModel";
import { isNotNullOrWhiteSpace } from "@/utils";

export interface IComponentDefaultsPreviewProps {
  componentDefinition: IToolboxComponent;
  theme: IConfigurableTheme;
}

/** A component that previews as a single unlabelled instance. */
const SINGLE_VARIANT: IPreviewVariant[] = [{ label: '', model: {} }];

export const ComponentDefaultsPreview: FC<IComponentDefaultsPreviewProps> = ({ componentDefinition, theme }) => {
  // The preview section paints the theme being edited's Page colour, so pass that theme in.
  const { styles } = useStyles(theme);

  const componentTitle = componentDefinition.name;

  // Components with several appearances (a dropdown's tag/text modes, a file list's thumbnail
  // sizes) render one instance per mode, so a style that only applies to one of them can still
  // be judged. Everything else keeps the single rendering it had before.
  const variants = useMemo(
    (): IPreviewVariant[] => getPreviewVariants(componentDefinition.type) ?? SINGLE_VARIANT,
    [componentDefinition.type],
  );

  const formSettings = useMemo(() => ({
    colon: theme.colon,
    layout: theme.layout,
    labelCol: { span: theme.labelSpan },
    wrapperCol: { span: theme.componentSpan },
  }), [theme.colon, theme.layout, theme.labelSpan, theme.componentSpan]);

  const markups = useMemo(
    (): { key: string; label: string; markup: FormMarkup }[] => variants.map((variant, index) => {
      const model: IConfigurableFormComponent = getPreviewComponentModel(
        componentDefinition,
        variant.label === '' ? undefined : variant,
      );
      return {
        key: `${model.id}-${index}`,
        label: variant.label,
        // Only multi-variant components (dropdown's modes, file list's thumbnail sizes, ...) get the
        // caption as their label — it names the state being previewed. A single-variant component has
        // no caption ('') and keeps its own label/text untouched, otherwise components whose `label`
        // is user-facing text rather than a form-item label (e.g. a button's own text) would render
        // blank.
        markup: { components: [variant.label === '' ? model : { ...model, label: variant.label }], formSettings } as FormMarkup,
      };
    }),
    [componentDefinition, variants, formSettings],
  );

  return (
    <Card
      className={styles.previewSection}
      title={(
        <div>
          <h4 style={{ marginBottom: 4 }}>{isNotNullOrWhiteSpace(componentTitle) ? componentTitle : 'Component'} Preview</h4>
          <span style={{ color: '#999', fontSize: '12px' }}>
            Preview the default appearance for {isNotNullOrWhiteSpace(componentTitle) ? componentTitle : 'component'}
          </span>
        </div>
      )}
    >
      {markups.map(({ key, markup }) => (
        <ConfigurableForm
          key={key}
          mode="edit"
          markup={markup}
          initialValues={theme}
          className={styles.appearanceForm}
        />
      ))}
    </Card>
  );
};
