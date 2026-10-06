import { ConfigurableForm } from "../../../../components/configurableForm";
import { FormMarkupWithSettings } from "@/providers";
import { FC } from "react";
import { useStyles } from "../styles/styles";
import { Card, Form } from "antd";
import { useDefaultModelActionsOrUndefined } from "@/designer-components/_settings/defaultModelProvider/defaultModelProvider";
import { ISetFormDataPayload } from "@/providers/form/contexts";
import { deepMergeValues } from "@/utils/object";
import { isNotNullOrWhiteSpace } from "@/utils/nullables";
import { CardTitle } from "../cardTitle";

export interface IComponentDefaultsSettingsProps {
  componentType: string | undefined;
  componentTitle: string | undefined;
  markup: FormMarkupWithSettings | undefined;
  initialModel: object;
  readonly: boolean;
  onChange: (changedValues: Record<string, unknown>, values: Record<string, unknown>) => void;
}

export const ComponentDefaultsSettings: FC<IComponentDefaultsSettingsProps> = ({ componentTitle, componentType, markup, initialModel, readonly, onChange }) => {
  const [form] = Form.useForm();
  const { styles } = useStyles();
  const defaultModel = useDefaultModelActionsOrUndefined<Record<string, unknown>>();

  const getMergedOrValue = (payload: ISetFormDataPayload<Record<string, unknown>>): Record<string, unknown> | undefined => {
    const { values, mergeValues } = payload;
    const data = defaultModel?.getModel();
    return mergeValues && data
      ? deepMergeValues(data, values)
      : values;
  };

  return (
    <Card
      title={(
        <CardTitle
          title={isNotNullOrWhiteSpace(componentTitle) ? componentTitle : 'Select a Component'}
          description={`Configure default appearance for ${isNotNullOrWhiteSpace(componentTitle) ? componentTitle : 'component'}`}
        />
      )}
      size="small"
      className={styles.themeCardSettings}
    >
      {markup && Boolean(componentType) ? (
        <ConfigurableForm
          key={componentType}
          form={form}
          mode={readonly ? 'readonly' : 'edit'}
          markup={markup}
          initialValues={initialModel}
          onValuesChange={onChange}
          cacheKey={`theme-component-style:${componentType}`}
          className={styles.appearanceForm}
          isSettingsForm
          dataSource={{ dataGetter: defaultModel?.getMergedModel, dataSetter: defaultModel?.setModel, getMergedOrValue }}
        />
      ) : (
        <div className={styles.emptyState}>
          {Boolean(componentType)
            ? 'This component does not have appearance settings or they cannot be loaded'
            : 'Select a component from the tree to configure its default appearance'}
        </div>
      )}
    </Card>
  );
};
