import { evaluateDynamicFilters } from "@/utils/datatable";
import { IAnyObject } from "@/interfaces";
import { ICalendarEvent, ICalendarLayersProps } from "@/providers/layersProvider/models";
import { UseEvaluatedFilterArgs } from "@/providers/dataTable/filters/evaluateFilter";
import { IStoredFilter } from "@/providers/dataTable/interfaces";
import { NestedPropertyMetadatAccessor } from "@/providers/metadataDispatcher/contexts";
import { ILayerWithMetadata } from "./interfaces";
import { getEntityTypeIdentifierQueryParams } from "@/providers/metadataDispatcher/entities/utils";
import { IMatchData } from "@/providers/form/utils";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { getDatePropertyOrUndefined } from "@/utils/object";
import { getIdOrUndefined } from "@/utils/entity";
import { buildUrl } from "@/utils";

export const getLayerEventItems = (
  item: ICalendarLayersProps,
  layerDataItem: IAnyObject[] | IAnyObject,
): ICalendarLayersProps => {
  let events: ICalendarEvent[] = [];
  const { startTime, endTime, title, icon, iconColor, showIcon, color, onDblClick, onSelect } = item;

  if (!isNullOrWhiteSpace(startTime) && !isNullOrWhiteSpace(endTime)) {
    const tryAddEvent = (item: IAnyObject): void => {
      const startDate = getDatePropertyOrUndefined(item, startTime);
      const endDate = getDatePropertyOrUndefined(item, endTime);
      if (!isDefined(startDate) || !isDefined(endDate))
        return;
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
        return;
      const id = getIdOrUndefined(item);
      if (!isDefined(id))
        return;

      const event: ICalendarEvent = {
        ...item,
        id: id,
        start: startDate,
        end: endDate,
        icon,
        showIcon,
        color,
        iconColor: iconColor || '#000000',
        title: "",
        titleTemplate: title,
        onDblClick,
        onSelect,
      };
      events.push(event);
    };

    if (Array.isArray(layerDataItem)) {
      layerDataItem.forEach((item) => {
        tryAddEvent(item);
      });
    } else {
      tryAddEvent(layerDataItem);
    }
  }
  return { ...item, events };
};

export const getLayerEventsData = (layers: ICalendarLayersProps[], layerData: Array<IAnyObject[] | null>): ICalendarLayersProps[] =>
  layers.map((item, index): ICalendarLayersProps => {
    const layerDataItem = layerData[index] || [];

    return getLayerEventItems(item, layerDataItem);
  });

export const getLayerOptions = (layers: ICalendarLayersProps[] | undefined): Array<{ label: string; value: string; disabled: boolean }> =>
  (layers ?? [])
    .filter((item) => item.visible)
    .map((i) => ({
      label: i.label,
      value: i.id,
      disabled: !i.allowChangeVisibility,
    }));

export const getQueryProperties = ({ startTime, endTime, propertyList, title }: ICalendarLayersProps): string => {
  const properties = new Set<string>(['id']);
  if (startTime?.trim()) {
    properties.add(startTime);
  }
  if (endTime?.trim()) {
    properties.add(endTime);
  }
  if (propertyList) {
    propertyList.forEach((property) => {
      if (!isNullOrWhiteSpace(property)) {
        properties.add(property);
      }
    });
  }
  // Add 'title' property if it's used in the template
  if (title && typeof title === 'string' && title.includes('{{title}}')) {
    properties.add('title');
  }
  return Array.from(properties).join(' ');
};

export const getCalendarDataUrl = (param: ICalendarLayersProps, filter: string): string => {
  const { customUrl, dataSource, entityType, overfetch } = param;

  if (dataSource === 'custom') {
    if (isNullOrWhiteSpace(customUrl))
      throw new Error('customUrl is required for custom data source');
    return customUrl;
  }

  return buildUrl("/api/services/app/Entities/GetAll", {
    ...getEntityTypeIdentifierQueryParams(entityType ?? ''),
    properties: overfetch ? getQueryProperties(param) : null,
    maxResultCount: 100,
    filter,
  });
};

export const getLayerEvents = (
  layerEvents: ICalendarLayersProps[],
  checked: string[],
): ICalendarEvent[] => {
  return checked
    .map((item) => {
      const found = layerEvents.find(({ id }) => id === item);
      // Map each event to include the layer's properties
      return found?.events?.map<ICalendarEvent>((event) => ({
        ...event,
        color: event.color ?? found.color,
        icon: event.icon ?? found.icon,
        showIcon: event.showIcon ?? found.showIcon,
        iconColor: event.iconColor ?? found.iconColor,
      }));
    })
    .filter(isDefined)
    .reduce((prev, curr) => [...prev, ...curr], []);
};

export const evaluateFilterAsync = async (args: UseEvaluatedFilterArgs): Promise<string> => {
  const { filter, mappings, metadataAccessor } = args;

  if (!filter) return '';

  const preparedMappings: IMatchData[] = [];
  mappings.forEach((item) => {
    const { prepare, ...restItemProps } = item;
    const preparedData = item.prepare ? item.prepare(item.data) : item.data;
    preparedMappings.push({ ...restItemProps, data: preparedData });
  });

  // Evaluate the filters asynchronously
  const response = await evaluateDynamicFilters(
    [{ expression: filter } as IStoredFilter],
    preparedMappings,
    metadataAccessor,
  );

  // Return the evaluated filter expression or an empty string if it's not found
  const evaluated = response[0]?.expression;
  if (!evaluated) return '';
  return typeof evaluated === 'string' ? evaluated : JSON.stringify(evaluated);
};

// Using any types for item and formData parameters because these are dynamic objects
// with unknown structure that depend on the form/application context
export const evaluateFilters = async (
  item: ILayerWithMetadata,
  formData: object,
  globalState: IAnyObject,
  propertyMetadataAccessor: NestedPropertyMetadatAccessor | undefined,
): Promise<string> => {
  if (!isDefined(item.filters)) return '';

  const evaluatedFilters = await evaluateFilterAsync({
    filter: item.filters,
    mappings: [
      {
        match: 'data',
        data: formData,
      },
      {
        match: 'globalState',
        data: globalState,
      },
    ],
    metadataAccessor: propertyMetadataAccessor,
  });

  return evaluatedFilters;
};

export const isDateDisabled = (date: Date, minDate?: string, maxDate?: string): boolean => {
  // Reset time to start of day for accurate date comparison
  const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (minDate) {
    const minDateObj = new Date(minDate);
    const minDateReset = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
    if (dateToCheck < minDateReset) return true;
  }

  if (maxDate) {
    const maxDateObj = new Date(maxDate);
    const maxDateReset = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), maxDateObj.getDate());
    if (dateToCheck > maxDateReset) return true;
  }

  return false;
};

export const getDayStyles = (newDate: Date, minDate?: string, maxDate?: string): { style?: { backgroundColor: string; color: string; cursor: string; opacity?: number } } => {
  const dateToCheck = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
  const minDateObj = minDate ? new Date(minDate) : null;
  const maxDateObj = maxDate ? new Date(maxDate) : null;

  if (minDateObj) {
    const minDateReset = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
    if (dateToCheck < minDateReset) {
      return {
        style: { backgroundColor: '#d9d9d9', color: '#666666', cursor: 'not-allowed' },
      };
    }
  }

  if (maxDateObj) {
    const maxDateReset = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), maxDateObj.getDate());
    if (dateToCheck > maxDateReset) {
      return {
        style: { backgroundColor: '#d9d9d9', color: '#666666', cursor: 'not-allowed', opacity: 0.6 },
      };
    }
  }

  return {};
};
