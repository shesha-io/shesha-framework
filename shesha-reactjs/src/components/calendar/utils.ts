import { evaluateDynamicFilters, IMatchData } from "@/index";
import { IAnyObject } from "@/interfaces";
import { ICalendarLayersProps } from "@/providers/layersProvider/models";
import { UseEvaluatedFilterArgs } from "@/providers/dataTable/filters/evaluateFilter";
import { IStoredFilter } from "@/providers/dataTable/interfaces";
import { NestedPropertyMetadatAccessor } from "@/providers/metadataDispatcher/contexts";

export const parseIntOrDefault = (input: any, defaultValue: number = 0): number => {
  const parsed = parseFloat(input);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const getLayerEventItems = (
  item: ICalendarLayersProps,
  layerDataItem: { [x: string]: any }[] | { [x: string]: any },
) => {
  let events;
  const { startTime, endTime , title, icon, iconColor , showIcon, color, onDblClick, onSelect, } = item;
  if (Array.isArray(layerDataItem)) {
    events = layerDataItem
      .filter((i) => i?.[startTime] && i?.[endTime])
      .map((j) => ({
        id: j?.id,
        start: new Date(j?.[startTime]),
        end: new Date(j?.[endTime]),
        icon,
        showIcon,
        color,
        iconColor: iconColor || '#000000',
        title,
        onDblClick,
        onSelect,
        ...j,
      }));
  } else {
    events = [
      {
        start: new Date(layerDataItem?.[startTime]),
        end: new Date(layerDataItem?.[endTime]),
        ...layerDataItem
      },
    ];
  }
  return { ...item, events };
};

export const getLayerEventsData = (layers: ICalendarLayersProps[], layerData: { [x: string]: any }[]): ICalendarLayersProps[] =>
  (layers || []).map((item, index) => {
    const layerDataItem = (layerData[index] as any[]) || [];

    return getLayerEventItems(item, layerDataItem);
  });

export const getLayerOptions = (layers: ICalendarLayersProps[]) =>
  (layers || [])
    .filter((item) => item.visible)
    .map((i) => ({
      label: i.label,
      value: i.id,
      disabled: !i.allowChangeVisibility,
    }));

export const getQueryProperties = ({startTime, endTime, propertyList }: ICalendarLayersProps) => {
  const properties = new Set<string>(['id']);
  properties.add(startTime).add(endTime);
  if (propertyList) {
    propertyList.forEach((property) => {
      properties.add(property);
    });
  }
  return Array.from(properties).join(' ');
};

export const getCalendarRefetchParams = (param: ICalendarLayersProps, filter: string) => {
  const { customUrl, dataSource, entityType, overfetch } = param;

  if (dataSource === 'custom') {
    return {
      path: customUrl,
    };
  }

  return {
    path: `/api/services/app/Entities/GetAll`,
    queryParams: {
      entityType,
      properties: overfetch ? getQueryProperties(param) : null,
      maxResultCount: 100,
      filter,
    },
  };
};

export const getLayerEvents = (layerEvents: ICalendarLayersProps[], checked: string[]) =>
  checked
    .map(
      (item) => layerEvents.find(({ id }) => id === item)?.events as any[],
    )
    .filter((i) => i)
    .reduce((prev, curr) => [...(prev || []), ...(curr || [])], []);

export const getResponseListToState = (res: { [key in string]: any }[]) =>
  res.map((res) => (res?.result?.items ? res.result.items : res?.result));

export const addPx = (value: string) => {
  value = value ?? "100%";
  return /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
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
  return JSON.stringify(response[0]?.expression) || '';
};

export const evaluateFilters = async (
  item: any,
  formData: any,
  globalState: IAnyObject,
  propertyMetadataAccessor: NestedPropertyMetadatAccessor,
): Promise<string> => {
  if (!item.filters) return '';

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

export const getIcon = (
  icon: string,
  formData: any = {},
  globalState: any = {},
  item: any = {},
  defaultIcon: string = 'UserOutlined',
): any => {
  if (!icon) return defaultIcon;
  return new Function('data', 'globalState', 'item', icon)(formData, globalState, item);
};
