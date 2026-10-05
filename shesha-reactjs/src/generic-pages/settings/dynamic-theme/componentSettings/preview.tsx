import { ConfigurableForm } from "../../../../components/configurableForm";
import { FormMarkup, IConfigurableFormComponent, IConfigurableTheme } from "@/providers";
import { FC, useEffect, useMemo, useRef } from "react";
import { useStyles } from "../styles/styles";
import { Card } from "antd";
import { IFormValidationErrors, IToolboxComponent } from "../../../../interfaces/formDesigner";
import { IShaFormInstance } from "@/interfaces";
import { getPreviewComponentModel, getPreviewValue, getPreviewVariants, IPreviewVariant } from "./previewModel";
import { ComponentPreviewContext } from "@/providers/componentPreview";
import { isDefined, isNotNullOrWhiteSpace } from "@/utils";

export interface IComponentDefaultsPreviewProps {
  componentDefinition: IToolboxComponent;
  theme: IConfigurableTheme;
}

/** A component that previews as a single unlabelled instance. */
const SINGLE_VARIANT: IPreviewVariant[] = [{ label: '', model: {} }];

interface IPreviewFormProps {
  markup: FormMarkup;
  theme: IConfigurableTheme;
  className: string;
  formErrors: IFormValidationErrors | undefined;
  /** Sample value for the component's field, set under `propertyName`. */
  previewValue: unknown;
  propertyName: string | undefined;
}

/** One variant's form. Each is its own form so their values - and validation errors - stay independent. */
const PreviewForm: FC<IPreviewFormProps> = ({ markup, theme, className, formErrors, previewValue, propertyName }) => {
  const shaFormRef = useRef<IShaFormInstance | undefined>(undefined);

  const initialValues = useMemo(
    (): object => isDefined(previewValue) && isNotNullOrWhiteSpace(propertyName) ? { ...theme, [propertyName]: previewValue } : theme,
    [theme, previewValue, propertyName],
  );

  // The form assigns the ref in its own effect, which runs before this one.
  useEffect(() => {
    if (isDefined(formErrors))
      shaFormRef.current?.setValidationErrors(formErrors);
  }, [formErrors]);

  return (
    <ConfigurableForm
      mode="edit"
      markup={markup}
      initialValues={initialValues}
      className={className}
      shaFormRef={shaFormRef}
    />
  );
};

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
    (): { key: string; label: string; markup: FormMarkup; formErrors: IFormValidationErrors | undefined; propertyName: string | undefined }[] => variants.map((variant, index) => {
      const model: IConfigurableFormComponent = getPreviewComponentModel(
        componentDefinition,
        variant.label === '' ? undefined : variant,
      );
      return {
        propertyName: model.propertyName,
        key: `${model.id}-${index}`,
        label: variant.label,
        // Only multi-variant components (dropdown's modes, file list's thumbnail sizes, ...) get the
        // caption as their label — it names the state being previewed. A single-variant component has
        // no caption ('') and keeps its own label/text untouched, otherwise components whose `label`
        // is user-facing text rather than a form-item label (e.g. a button's own text) would render
        // blank.
        markup: { components: [variant.label === '' ? model : { ...model, label: variant.label }], formSettings } as FormMarkup,
        formErrors: variant.formErrors,
      };
    }),
    [componentDefinition, variants, formSettings],
  );

  // Components that display their value (e.g. a reference list status) get a sample one.
  const previewValue = getPreviewValue(componentDefinition.type);

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
      <ComponentPreviewContext.Provider value={true}>
        {markups.map(({ key, markup, formErrors, propertyName }) => (
          <PreviewForm
            key={key}
            markup={markup}
            theme={theme}
            className={styles.appearanceForm}
            formErrors={formErrors}
            previewValue={previewValue}
            propertyName={propertyName}
          />
        ))}
      </ComponentPreviewContext.Provider>
    </Card>
  );
};
