import { ReactNode, useEffect, useRef, useState } from "react";
import { HandleEvent, IConfigurableFormItemChildFunc } from "./model";
import { useComponentApi } from "@/providers/componentApi/provider";
import { InputComponentApi } from "@/componentsApi/componentApi";
import { useEffectOnce } from "@/hooks/useEffectOnce";
import { IComponentApiInputRef } from "@/providers/componentApi/model";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { executeScriptSync, useAvailableConstantsDataNoRefresh } from "@/providers/form/utils";
import { addContextData } from "./utils";

interface IEventsAndApiValueProcessorProps<TValue = unknown> {
  componentId: string;
  componentName: string;
  value: TValue | undefined | null;
  onChange: (newValue: TValue | undefined | null) => void;
  propertyName?: string | undefined;
  readonly children: IConfigurableFormItemChildFunc<TValue>;
}

/** The component is intended for registering Value handlers for Input components
 * The component intercepts onChange and keeps the requested Value up to date, regardless of the data source.
 */
export const EventsAndApiValueProcessor = <TValue = unknown>({ value, onChange, children, componentId, componentName, propertyName }: IEventsAndApiValueProcessorProps<TValue>): ReactNode => {
  const allData = useAvailableConstantsDataNoRefresh();
  const componentApi = useComponentApi();
  // set isInput once because componentName should not be changed
  const [isInput] = useState(() => isDefined(componentApi) && componentApi.getApi(componentName)?.isInput);

  const apiRef = useRef<IComponentApiInputRef<TValue>>(undefined);
  apiRef.current = { value, onChange };

  const onChangeHandler = (val: TValue | undefined | null): void => {
    if (apiRef.current) {
      apiRef.current.onChange(val);
      apiRef.current.value = val;
    }
  };

  const handleEvent: HandleEvent<TValue> = (event, value, code, eventName) => {
    if (isNullOrWhiteSpace(code)) return;
    try {
      executeScriptSync(code, addContextData(allData, { ...value, event }));
    } catch (error) {
      console.error(`${componentName}: ${isDefined(eventName) ? `'${eventName}'` : ''} event script execution failed`, error);
    }
  };

  useEffect(() => {
    if (isInput ?? false) {
      componentApi?.updateApi<InputComponentApi>({
        id: componentId,
        componentName: componentName,
        level: 2,
        properties: [{ name: 'value', getter: () => apiRef.current?.value, setter: (val: unknown) => apiRef.current?.onChange(val as TValue) }],
      });
    }
  }, [componentApi, componentId, componentName, isInput]);
  useEffectOnce(() => () => componentApi?.removeApi(componentId));


  return children(value, onChangeHandler, propertyName, { handleEvent });
};
