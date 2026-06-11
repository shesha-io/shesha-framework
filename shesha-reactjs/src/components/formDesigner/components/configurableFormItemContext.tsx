import React, { ReactNode, SyntheticEvent } from "react";
import { Form, FormItemProps } from "antd";
import { IConfigurableFormItemChildFunc } from "./model";
import { DataBinder } from "@/hocs/dataBinder";
import { useDataContextManager } from "@/providers/dataContextManager/hooks";
import { InputComponentApi } from "@/componentsApi/componentApi";
import { useComponentApi } from "@/providers/componentApi/provider";

import apiCode from "../../../componentsApi/componentApi.ts?raw";
import { useEffectOnce } from "@/hooks/useEffectOnce";
import { isDefined } from "@/utils/nullables";

interface IConfigurableFormItem_ContextProps<TValue = unknown> {
  componentId: string;
  formItemProps: FormItemProps;
  valuePropName?: string | undefined;
  componentName: string;
  propertyName: string;
  contextName: string;
  readonly children: IConfigurableFormItemChildFunc<TValue>;
}

/**
 * Type guard to check if an object is a React SyntheticEvent
 */
const isSyntheticEvent = (event: unknown): event is SyntheticEvent => {
  return (
    event !== null &&
    typeof event === 'object' &&
    'nativeEvent' in event && // Core React wrapper property
    "preventDefault" in event && typeof event.preventDefault === 'function' &&
    "stopPropagation" in event && typeof event.stopPropagation === 'function'
  );
};

export const ConfigurableFormItemContext = <TValue = unknown>(props: IConfigurableFormItem_ContextProps<TValue>): ReactNode => {
  const { componentId, formItemProps, valuePropName, componentName, propertyName, contextName, children } = props;
  const componentApi = useComponentApi();
  const { getDataContext } = useDataContextManager();
  const { getFieldValue, setFieldValue } = getDataContext(contextName) ?? {};

  const value = getFieldValue?.(propertyName) as TValue;

  const onChange = (val: unknown): void => {
    if (isSyntheticEvent(val)) {
      const { target } = val;
      const effectivePropName = valuePropName ?? 'value';
      const newValue = isDefined(target) && typeof (target) === "object" && effectivePropName in target
        ? target[effectivePropName as keyof typeof target] as TValue
        : undefined;
      setFieldValue?.(propertyName as "", newValue as never);
    } else {
      const newValue = val as TValue;
      setFieldValue?.(propertyName as "", newValue as never);
    }
  };

  componentApi?.updateApi<InputComponentApi>(
    {
      id: componentId,
      componentName: componentName,
      typeDefinition: { typeName: 'InputComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
    },
    [{ name: 'value', getter: () => value, setter: onChange }],
  );
  useEffectOnce(() => () => componentApi?.removeApi(componentId));

  return (
    <Form.Item {...formItemProps}>
      <DataBinder<TValue>
        onChange={onChange}
        value={value}
      >
        {children}
      </DataBinder>
    </Form.Item>
  );
};
