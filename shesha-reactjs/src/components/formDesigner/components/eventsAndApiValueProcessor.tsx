import { ReactNode, useCallback, useEffect } from "react";
import { HandleEvent, IConfigurableFormItemChildFunc } from "./model";
import { useComponentApi } from "@/providers/componentApi/provider";
import { InputComponentApi } from "@/componentsApi/componentApi";
import { useEffectOnce } from "@/hooks/useEffectOnce";
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

/** The component is intended for registering Value handlers for Input components
 * The component intercepts onChange and keeps the requested Value up to date, regardless of the data source.
 */
export const EventsAndApiValueProcessor = <TValue = unknown>({ value, onChange, children, componentId, componentName, propertyName }: IEventsAndApiValueProcessorProps<TValue>): ReactNode => {
  const allData = useAvailableConstantsDataNoRefresh();
  const componentApi = useComponentApi();

  const apiRef = useLiveRef<IComponentApiInputRef<TValue>>({ value, onChange });

  const onChangeHandler = useCallback((val: TValue | undefined | null): void => {
    apiRef.current.value = val;
    apiRef.current.onChange(val);
  }, [apiRef]);

  const handleEvent: HandleEvent<TValue> = (event, value, code, eventName) => {
    if (isNullOrWhiteSpace(code)) return;
    try {
      executeScriptSync(code, addContextData(allData, { event, ...value }));
    } catch (error) {
      console.error(`${componentName}: ${isDefined(eventName) ? `'${eventName}'` : ''} event script execution failed`, error);
    }
  };

  useEffect(() => {
    componentApi?.updateApi<InputComponentApi>({
      id: componentId,
      componentName: componentName,
      level: 2,
      properties: [{ name: 'value', getter: () => apiRef.current.value, setter: (val: unknown) => onChangeHandler(val as TValue) }],
    });
  }, [apiRef, componentApi, componentId, componentName, onChangeHandler]);
  useEffectOnce(() => () => componentApi?.removeApi(componentId));


  // eslint-disable-next-line react-hooks/refs
  return children(value, onChangeHandler, propertyName, { handleEvent });
};
