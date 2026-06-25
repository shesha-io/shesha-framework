import { ConfigurableFormItemContext } from "@/components/formDesigner/components/model";
import { IConfigurableFormComponent } from "@/providers";
import { isDefined } from "@/utils/nullables";
import { RadioChangeEvent } from "antd";
import { SyntheticEvent } from "react";

export type StandardEventHandler = 'onChange' | 'onBlur' | 'onFocus' | 'onClick' | 'onMouseEnter' | 'onMouseLeave' | 'onMouseMove' | 'onKeyDown' | 'onKeyUp';
export type CustomEventHandler = `${StandardEventHandler}Custom`;

interface EventConfig {
  event: StandardEventHandler;
  propertyName: CustomEventHandler;
  label: string;
  tooltip: string;
  availableConstantsExpression?: string | undefined;
};

const eventConfigs: EventConfig[] = [
  {
    event: 'onChange',
    propertyName: 'onChangeCustom',
    label: 'On Change',
    tooltip: 'Enter the data change event handling code',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n.addAllStandard()\r\n.addObject(\"event\", \"Event callback when user input\", undefined)\r\n.add(\"@valueType@\", \"value\", \"Component new value\")\r\n.build();",
  },
  {
    event: 'onFocus',
    propertyName: 'onFocusCustom',
    label: 'On Focus',
    tooltip: 'Enter the event handling code when the component gets focus',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n .add(\"@valueType@\", \"value\", \"Component current value\")\r\n .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onBlur',
    propertyName: 'onBlurCustom',
    label: 'On Blur',
    tooltip: 'Enter the event handling code when the component removes focus',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n .add(\"@valueType@\", \"value\", \"Component current value\")\r\n .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onClick',
    propertyName: 'onClickCustom',
    label: 'On Click',
    tooltip: 'Enter the event handling code on click on the component',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n .add(\"@valueType@\", \"value\", \"Component current value\")\r\n .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onMouseEnter',
    propertyName: 'onMouseEnterCustom',
    label: 'On Mouse Enter',
    tooltip: 'Enter the event handling code on mouse enter',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n .add(\"@valueType@\", \"value\", \"Component current value\")\r\n .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onMouseMove',
    propertyName: 'onMouseMoveCustom',
    label: 'On Mouse Move',
    tooltip: 'Enter the event handling code on mouse move',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n .add(\"@valueType@\", \"value\", \"Component current value\")\r\n .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onMouseLeave',
    propertyName: 'onMouseLeaveCustom',
    label: 'On Mouse Leave',
    tooltip: 'Enter the event handling code on mouse leave',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n .add(\"@valueType@\", \"value\", \"Component current value\")\r\n .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onKeyDown',
    propertyName: 'onKeyDownCustom',
    label: 'On Key Down',
    tooltip: 'Enter the event handling code on key down',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n .add(\"@valueType@\", \"value\", \"Component current value\")\r\n .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onKeyUp',
    propertyName: 'onKeyUpCustom',
    label: 'On Key Up',
    tooltip: 'Enter the event handling code on key up',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n .add(\"@valueType@\", \"value\", \"Component current value\")\r\n .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
];

export const getEventConfig = (event: StandardEventHandler, valueType: string): EventConfig | undefined => {
  const e = eventConfigs.find((config) => config.event === event);
  if (!isDefined(e)) return undefined;
  const eventConfig = { ...e };
  eventConfig.availableConstantsExpression = eventConfig.availableConstantsExpression?.replace('@valueType@', valueType) ?? undefined;
  return eventConfig;
};

type StandardEventHandlerWithoutChange = Exclude<StandardEventHandler, 'onChange'>;
type EventsObject = { [k in StandardEventHandlerWithoutChange]?: (event: SyntheticEvent<Element, Event> | RadioChangeEvent | undefined) => void };

export const getComponentEvents = <TValue>(model: IConfigurableFormComponent, events: StandardEventHandlerWithoutChange[], ctx: ConfigurableFormItemContext<TValue> | undefined, value: TValue | null | undefined, valueType: string): EventsObject => {
  const result = {} as EventsObject;
  if (!isDefined(ctx) || !isDefined(events) || events.length === 0) return result;
  events.forEach((event: StandardEventHandlerWithoutChange) => {
    const config = getEventConfig(event, valueType);
    if (!isDefined(config)) return;
    result[event] = (e: SyntheticEvent<Element, Event> | RadioChangeEvent | undefined) => ctx.handleEvent(e, { value }, model[config.propertyName]);
  });
  return result;
};
