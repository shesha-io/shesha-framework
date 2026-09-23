import { ConfigurableForm } from "../../../../components/configurableForm";
import { FormMarkup, IConfigurableFormComponent, IConfigurableTheme } from "@/providers";
import { FC, useMemo } from "react";
import { useStyles } from "../styles/styles";
import { Card } from "antd";
import { IToolboxComponent } from "../../../../interfaces/formDesigner";
import { getPreviewComponentModel, getPreviewVariants, IPreviewVariant } from "./previewModel";

export interface IComponentDefaultsPreviewProps {
  componentDefinition: IToolboxComponent;
  theme: IConfigurableTheme;
}

/** A component that previews as a single unlabelled instance. */
const SINGLE_VARIANT: IPreviewVariant[] = [{ label: '', model: {} }];

export const ComponentDefaultsPreview: FC<IComponentDefaultsPreviewProps> = ({ componentDefinition, theme }) => {
  const { styles } = useStyles();

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
        markup: { components: [model], formSettings } as FormMarkup,
      };
    }),
    [componentDefinition, variants, formSettings],
  );

  return (
    <Card className={styles.previewSection}>
      <h4 style={{ marginBottom: 4 }}>{componentTitle} preview:</h4>
      {markups.map(({ key, label, markup }) => (
        <div key={key} className={styles.previewVariant}>
          {label !== '' && <div className={styles.previewVariantLabel}>{label}</div>}
          {/* Each variant is its own form so their values stay independent. */}
          <ConfigurableForm
            key={key}
            mode="edit"
            markup={markup}
            initialValues={theme}
            className={styles.appearanceForm}
          />
        </div>
      ))}
    </Card>
  );
};
