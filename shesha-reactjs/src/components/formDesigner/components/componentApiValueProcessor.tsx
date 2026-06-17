import { ReactNode, useEffect, useRef, useState } from "react";
import { IConfigurableFormItemChildFunc } from "./model";
import { useComponentApi } from "@/providers/componentApi/provider";
import { InputComponentApi } from "@/componentsApi/componentApi";
import { useEffectOnce } from "@/hooks/useEffectOnce";
import { IComponentApiInputRef } from "@/providers/componentApi/model";
import { isDefined } from "@/utils/nullables";

interface IComponentApiValueRegistratorProps<TValue = unknown> {
  componentId: string;
  componentName: string;
  value: TValue | null | undefined;
  onChange: (newValue: TValue | null) => void;
  propertyName?: string | undefined;
  readonly children: IConfigurableFormItemChildFunc<TValue>;
}

/** The component is intended for registering Value handlers for Input components
 * The component intercepts onChange and keeps the requested Value up to date, regardless of the data source.
 */
export const ComponentApiValueProcessor = <TValue = unknown>({ value, onChange, children, componentId, componentName, propertyName }: IComponentApiValueRegistratorProps<TValue>): ReactNode => {
  const componentApi = useComponentApi();
  // set isInput once because componentName should not be changed
  const [isInput] = useState(() => isDefined(componentApi) && componentApi.getApi(componentName)?.isInput);

  const apiRef = useRef<IComponentApiInputRef<TValue>>(null);
  apiRef.current = { value, onChange };

  const onChangeHandler = (val: TValue | null): void => {
    if (apiRef.current) {
      apiRef.current.onChange(val);
      apiRef.current.value = val;
    }
  };

  useEffect(() => {
    if (isInput) {
      componentApi?.updateApi<InputComponentApi>({
        id: componentId,
        componentName: componentName,
        level: 2,
        properties: [{ name: 'value', getter: () => apiRef.current?.value, setter: (val: unknown) => apiRef.current?.onChange(val as TValue) }],
      });
    }
  }, [componentApi, componentId, componentName, isInput]);
  useEffectOnce(() => () => componentApi?.removeApi(componentId));


  return children(value, onChangeHandler, propertyName);
};
