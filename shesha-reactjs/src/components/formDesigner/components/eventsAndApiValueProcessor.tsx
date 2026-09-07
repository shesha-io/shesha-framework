import { ReactNode, useCallback, useEffect, useState } from "react";
import { HandleEvent, IConfigurableFormItemChildFunc } from "./model";
import { useComponentApiProvider } from "@/providers/componentApi/provider";
import { BaseInputComponentApi } from "@/componentsApi/componentApi";
import { IComponentApiInputRef } from "@/providers/componentApi/model";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { executeScriptSync, useAvailableConstantsDataNoRefresh } from "@/providers/form/utils";
import { addContextData } from "./utils";
import { useLiveRef } from "@/hooks/useLiveRef";

interface IEventsAndApiValueProcessorProps<TValue = unknown> {
  componentId: string;
  componentName: string;
  value: TValue | undefined | null;
  onChange: (newValue: TValue | undefined | null) => void;
  propertyName?: string | undefined;
  readonly children: IConfigurableFormItemChildFunc<TValue>;
}

export const useEvents = <TValue = unknown>(componentName: string = 'undefined'): HandleEvent<TValue> => {
  const allData = useAvailableConstantsDataNoRefresh();
  // allData is interactive and can be used with once initialization
  const [handleEvent] = useState((): HandleEvent<TValue> => (event, value, code, eventName) => {
    if (isNullOrWhiteSpace(code)) return;
    try {
      executeScriptSync(code, addContextData(allData, { event, ...value }));
    } catch (error) {
      console.error(`${componentName}: ${isDefined(eventName) ? `'${eventName}'` : ''} event script execution failed`, error);
    }
  });

  return handleEvent;
};

/** The component is intended for registering Value handlers for Input components
 * The component intercepts onChange and keeps the requested Value up to date, regardless of the data source.
 */
export const EventsAndApiValueProcessor = <TValue = unknown>({ value, onChange, children, componentId, componentName, propertyName }: IEventsAndApiValueProcessorProps<TValue>): ReactNode => {
  const handleEvent = useEvents<TValue>(componentName);
  const componentApi = useComponentApiProvider();

  const apiRef = useLiveRef<IComponentApiInputRef<TValue>>({ value, onChange });

  const onChangeHandler = useCallback((val: TValue | undefined | null): void => {
    apiRef.current.value = val;
    apiRef.current.onChange(val);
  }, [apiRef]);

  useEffect(() => {
    componentApi?.updateApi<BaseInputComponentApi>({
      id: componentId,
      componentName: componentName,
      level: 2,
      properties: [{ name: 'value', getter: () => apiRef.current.value, setter: (val: unknown) => onChangeHandler(val as TValue) }],
    });
  }, [apiRef, componentApi, componentId, componentName, onChangeHandler]);

  // eslint-disable-next-line react-hooks/refs
  return children(value, onChangeHandler, propertyName, { handleEvent });
};
