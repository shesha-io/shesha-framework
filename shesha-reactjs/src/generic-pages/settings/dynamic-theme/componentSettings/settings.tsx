import { ConfigurableForm } from "../../../../components/configurableForm";
import { FormMarkupWithSettings } from "@/providers";
import React, { FC } from "react";
import { useStyles } from "../styles/styles";
import { Card, Form } from "antd";
import { useDefaultModelActionsOrUndefined } from "@/designer-components/_settings/defaultModelProvider/defaultModelProvider";
import { ISetFormDataPayload } from "@/providers/form/contexts";
import { deepMergeValues } from "@/utils/object";

export interface IComponentDefaultsSettingsProps {
  componentType: string | undefined;
  componentTitle: string | undefined;
  markup: FormMarkupWithSettings | undefined;
  initialModel: object;
  readonly: boolean;
  onChange: (changedValues: unknown, values: unknown) => void;
}

export const ComponentDefaultsSettings: FC<IComponentDefaultsSettingsProps> = ({ componentTitle, componentType, markup, initialModel, readonly, onChange }) => {
  const [form] = Form.useForm();
  const { styles } = useStyles();
  const defaultModel = useDefaultModelActionsOrUndefined();

  const getMergedOrValue = (payload: ISetFormDataPayload): unknown => {
    const { values, mergeValues } = payload;
    const data = defaultModel?.getModel();
    return mergeValues && data
      ? deepMergeValues(data, values)
      : values;
  };

  return (
    <Card
      title={(
        <div>
          <h4 style={{ marginBottom: 4 }}>{componentTitle || 'Select a Component'}</h4>
          <span style={{ color: '#999', fontSize: '12px' }}>
            Configure default appearance for {componentTitle?.toLowerCase() || 'components'}
          </span>
        </div>
      )}
      size="small"
      style={{ height: '450px', overflowY: 'auto' }}
      className={styles.themeCardSettings}
    >
      {markup && componentType ? (
        <ConfigurableForm
          key={componentType}
          form={form}
          mode={readonly ? 'readonly' : 'edit'}
          markup={markup}
          initialValues={initialModel ?? {}}
          onValuesChange={onChange}
          cacheKey={`theme-component-style:${componentType}`}
          className={styles.appearanceForm}
          dataSource={{ dataGetter: defaultModel?.getMergedModel, dataSetter: defaultModel?.setModel, getMergedOrValue }}
        />
      ) : (
        <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>
          {componentType
            ? 'This component does not have appearance settings or they cannot be loaded'
            : 'Select a component from the tree to configure its default appearance'}
        </div>
      )}
    </Card>
  );
};
