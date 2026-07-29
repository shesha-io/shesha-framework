import { ConfigurableFormItemContext } from "@/components/formDesigner/components/model";
import { IConfigurableFormComponent } from "@/providers";
import { isDefined } from "@/utils/nullables";
import { RadioChangeEvent } from "antd";
import { SyntheticEvent } from "react";

/**
 * The complete standard event set, in the order it should appear on the Events tab.
 *
 * Input components should expose *all* of these rather than an ad-hoc subset — pass
 * `ALL_INPUT_EVENTS` to `stdEventHandlers` in the settings form and
 * `ALL_INPUT_EVENTS_WITHOUT_CHANGE` to `getComponentEvents` at runtime. Using the shared
 * constants at both call sites keeps the two lists in step: a settings form that advertises
 * an event the runtime never binds produces a handler the user can configure but which
 * silently never fires.
 *
 * `onChange` is absent from the runtime list because each component wires it inline
 * (it also updates the component's value, which `getComponentEvents` does not do).
 */
export const ALL_INPUT_EVENTS = ['onChange', 'onFocus', 'onBlur', 'onClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave', 'onKeyDown', 'onKeyUp'] as const;

export type StandardEventHandler = typeof ALL_INPUT_EVENTS[number];
export type CustomEventHandler = `${StandardEventHandler}Custom`;

export type StandardEventHandlerWithoutChange = Exclude<StandardEventHandler, 'onChange'>;

/** `ALL_INPUT_EVENTS` minus `onChange` — the set `getComponentEvents` binds. */
export const ALL_INPUT_EVENTS_WITHOUT_CHANGE: readonly StandardEventHandlerWithoutChange[] =
  ALL_INPUT_EVENTS.filter((event): event is StandardEventHandlerWithoutChange => event !== 'onChange');

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

type EventsObject = { [k in StandardEventHandlerWithoutChange]?: (event: SyntheticEvent<Element, Event> | RadioChangeEvent | undefined) => void };

export const getComponentEvents = <TValue>(model: IConfigurableFormComponent, events: readonly StandardEventHandlerWithoutChange[], ctx: ConfigurableFormItemContext<TValue> | undefined, value: TValue | null | undefined, valueType: string): EventsObject => {
  const result = {} as EventsObject;
  if (!isDefined(ctx) || !isDefined(events) || events.length === 0) return result;
  events.forEach((event: StandardEventHandlerWithoutChange) => {
    const config = getEventConfig(event, valueType);
    if (!isDefined(config)) return;
    result[event] = (e: SyntheticEvent<Element, Event> | RadioChangeEvent | undefined) => ctx.handleEvent(e, { value }, model[config.propertyName]);
  });
  return result;
};
