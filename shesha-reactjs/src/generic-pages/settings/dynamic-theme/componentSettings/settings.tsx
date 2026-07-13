import { ConfigurableForm } from "../../../../components/configurableForm";
import { FormMarkupWithSettings } from "@/providers";
import React, { FC, useEffect } from "react";
import { useStyles } from "../styles/styles";
import { Card, Form } from "antd";
import { useDefaultModelActionsOrUndefined } from "@/designer-components/_settings/defaultModelProvider/defaultModelProvider";
import { ISetFormDataPayload } from "@/providers/form/contexts";
import { deepMergeValues } from "@/utils/object";
import { isNotNullOrWhiteSpace } from "@/utils/nullables";

export interface IComponentDefaultsSettingsProps {
  componentType: string | undefined;
  componentTitle: string | undefined;
  markup: FormMarkupWithSettings | undefined;
  initialModel: object;
  readonly: boolean;
  onChange: (changedValues: Record<string, unknown>, values: Record<string, unknown>) => void;
}

export const ComponentDefaultsSettings: FC<IComponentDefaultsSettingsProps> = ({ componentTitle, componentType, markup, initialModel, readonly, onChange }) => {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const defaultModel = useDefaultModelActionsOrUndefined<Record<string, unknown>>();

  const getMergedOrValue = (payload: ISetFormDataPayload<Record<string, unknown>>): Record<string, unknown> | undefined => {
    const { values, mergeValues } = payload;
    const data = defaultModel?.getModel();
    return mergeValues && data
      ? deepMergeValues(data, values)
      : values;
  };

  // ConfigurableForm remounts on componentType changes via key={componentType} and uses mount-only initialValues,
  // so manual form synchronization is not needed

  return (
    <Card
      title={(
        <div>
          <h4 style={{ marginBottom: 4 }}>{isNotNullOrWhiteSpace(componentTitle) ? componentTitle : 'Select a Component'}</h4>
          <span style={{ color: '#999', fontSize: '12px' }}>
            Configure default appearance for {isNotNullOrWhiteSpace(componentTitle) ? componentTitle : 'component'}
          </span>
        </div>
      )}
      size="small"
      style={{ height: '450px', overflowY: 'auto' }}
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
          dataSource={{ dataGetter: defaultModel?.getMergedModel, dataSetter: defaultModel?.setModel, getMergedOrValue }}
        />
      ) : (
        <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>
          {Boolean(componentType)
            ? 'This component does not have appearance settings or they cannot be loaded'
            : 'Select a component from the tree to configure its default appearance'}
        </div>
      )}
    </Card>
  );
};
