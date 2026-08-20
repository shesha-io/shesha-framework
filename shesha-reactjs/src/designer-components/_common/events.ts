import { ConfigurableFormItemContext } from "@/components/formDesigner/components/model";
import { IConfigurableFormComponent } from "@/providers";
import { Path } from "@/utils/dotnotation";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { getValueByPropertyName } from "@/utils/object";
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
export const ALL_INPUT_EVENTS = ['onChange', 'onFocus', 'onBlur', 'onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave', 'onKeyDown', 'onKeyUp'] as const;

export type StandardEventHandler = typeof ALL_INPUT_EVENTS[number];
export type CustomEventHandler = `${StandardEventHandler}Custom`;

export type StandardEventHandlerWithoutChange = Exclude<StandardEventHandler, 'onChange'>;

/** `ALL_INPUT_EVENTS` minus `onChange` — the set `getComponentEvents` binds. */
export const ALL_INPUT_EVENTS_WITHOUT_CHANGE: readonly StandardEventHandlerWithoutChange[] =
  ALL_INPUT_EVENTS.filter((event): event is StandardEventHandlerWithoutChange => event !== 'onChange');

/**
 * `ALL_INPUT_EVENTS` minus `onDoubleClick` — for components that deliberately don't expose a
 * double-click handler. Pass this to `stdEventHandlers` in the settings form and
 * `ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK` to `getComponentEvents` at runtime so the two
 * lists stay in step (see the note on `ALL_INPUT_EVENTS`).
 */
export const ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK: readonly StandardEventHandler[] =
  ALL_INPUT_EVENTS.filter((event): event is StandardEventHandler => event !== 'onDoubleClick');

/** `ALL_INPUT_EVENTS_WITHOUT_DOUBLE_CLICK` minus `onChange` — the runtime set for those components. */
export const ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK: readonly StandardEventHandlerWithoutChange[] =
  ALL_INPUT_EVENTS_WITHOUT_CHANGE.filter((event): event is StandardEventHandlerWithoutChange => event !== 'onDoubleClick');

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
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n.addAllStandard()\r\n.addObject(\"event\", \"Event callback when user input\", undefined)\r\n @value@.build();",
  },
  {
    event: 'onFocus',
    propertyName: 'onFocusCustom',
    label: 'On Focus',
    tooltip: 'Enter the event handling code when the component gets focus',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n @value@ .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onBlur',
    propertyName: 'onBlurCustom',
    label: 'On Blur',
    tooltip: 'Enter the event handling code when the component removes focus',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n @value@ .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onClick',
    propertyName: 'onClickCustom',
    label: 'On Click',
    tooltip: 'Enter the event handling code on click on the component',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n @value@ .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onDoubleClick',
    propertyName: 'onDoubleClickCustom',
    label: 'On Double Click',
    tooltip: 'Enter the event handling code on double click on the component',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n @value@ .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onMouseEnter',
    propertyName: 'onMouseEnterCustom',
    label: 'On Mouse Enter',
    tooltip: 'Enter the event handling code on mouse enter',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n @value@ .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onMouseMove',
    propertyName: 'onMouseMoveCustom',
    label: 'On Mouse Move',
    tooltip: 'Enter the event handling code on mouse move',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n @value@ .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onMouseLeave',
    propertyName: 'onMouseLeaveCustom',
    label: 'On Mouse Leave',
    tooltip: 'Enter the event handling code on mouse leave',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n @value@ .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onKeyDown',
    propertyName: 'onKeyDownCustom',
    label: 'On Key Down',
    tooltip: 'Enter the event handling code on key down',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n @value@ .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
  {
    event: 'onKeyUp',
    propertyName: 'onKeyUpCustom',
    label: 'On Key Up',
    tooltip: 'Enter the event handling code on key up',
    availableConstantsExpression: "return metadataBuilder.object(\"constants\")\r\n .addAllStandard()\r\n @value@ .addObject(\"event\", \"Event callback when user input\", undefined)\r\n .build();",
  },
];

const addValue = (expression?: string, valueType?: string): string | undefined => expression?.replaceAll('@value@', `.add(\"${valueType}\", \"value\", \"Component current value\")\r\n`);

export const getEventConfig = (event: StandardEventHandler, valueType?: string | undefined): EventConfig | undefined => {
  const e = eventConfigs.find((config) => config.event === event);
  if (!isDefined(e)) return undefined;
  const eventConfig = { ...e };
  eventConfig.availableConstantsExpression = (valueType !== undefined ? addValue(e.availableConstantsExpression, valueType) : eventConfig.availableConstantsExpression?.replaceAll('@value@', '')) ?? undefined;
  return eventConfig;
};

/** The exact handler set `getComponentEvents` produces: the standard events minus `onChange`. */
export type EventsObject = { [k in StandardEventHandlerWithoutChange]?: (event: SyntheticEvent<Element, Event> | RadioChangeEvent | undefined) => void };

export const getComponentEvents = <TValue, TModel = IConfigurableFormComponent>(
  model: TModel,
  // `readonly` so the shared `ALL_INPUT_EVENTS_WITHOUT_CHANGE` constant can be passed directly.
  events: readonly StandardEventHandlerWithoutChange[],
  ctx: ConfigurableFormItemContext<TValue> | undefined,
  value?: TValue | null | undefined,
  valueType?: string | undefined,
  prefix?: string | undefined,
): EventsObject => {
  const result: EventsObject = {};
  if (!isDefined(ctx) || !isDefined(events) || events.length === 0) return result;
  events.forEach((event: StandardEventHandlerWithoutChange) => {
    const config = getEventConfig(event, valueType);
    if (!isDefined(config)) return;
    const propName = !isNullOrWhiteSpace(prefix) ? `${prefix}.${config.propertyName}` : config.propertyName;
    const script = getValueByPropertyName(model, propName as Path<TModel>);
    if (typeof script === 'string')
      result[event] = (e: SyntheticEvent<Element, Event> | RadioChangeEvent | undefined) => ctx.handleEvent(e, { value }, script);
  });
  return result;
};
