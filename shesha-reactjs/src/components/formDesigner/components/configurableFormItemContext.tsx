import React, { FC, useCallback } from "react";
import { Form, FormItemProps } from "antd";
import { IConfigurableFormItemChildFunc } from "./model";
import { DataBinder } from "@/hocs/dataBinder";
import { useDataContextManager } from "@/providers/dataContextManager/hooks";
import { InputComponentApi } from "@/componentsApi/componentApi";
import { useComponentApi } from "@/providers/componentApi/provider";

import apiCode from "../../../componentsApi/componentApi.ts?raw";
import { useEffectOnce } from "@/hooks/useEffectOnce";

interface IConfigurableFormItem_ContextProps {
  componentId: string;
  formItemProps: FormItemProps;
  valuePropName?: string;
  componentName: string;
  propertyName: string;
  contextName: string;
  readonly children?: IConfigurableFormItemChildFunc;
}

export const ConfigurableFormItemContext: FC<IConfigurableFormItem_ContextProps> = (props) => {
  const { componentId, formItemProps, valuePropName, componentName, propertyName, contextName, children } = props;
  const componentApi = useComponentApi();
  const { getDataContext } = useDataContextManager();
  const { getFieldValue, setFieldValue } = getDataContext(contextName) ?? {};

  const value = getFieldValue?.(propertyName);

  const onChange = useCallback((val: any): void => {
    const newValue = val?.target ? val?.target[valuePropName || 'value'] : val;
    setFieldValue?.(propertyName as "", newValue as never);
  }, [valuePropName, setFieldValue, propertyName]);

  useEffectOnce(() => {
    componentApi?.updateApi<InputComponentApi>(
      {
        id: componentId,
        componentName: componentName,
        typeDefinition: { typeName: 'InputComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
      },
      [{ name: 'value', getter: () => getFieldValue?.(propertyName), setter: onChange }],
    );
    return () => componentApi?.removeApi(componentId);
  });

  return (
    <Form.Item {...formItemProps}>
      <DataBinder
        onChange={onChange}
        value={value}
      >
        {children}
      </DataBinder>
    </Form.Item>
  );
};
