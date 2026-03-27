import React, { FC, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { ButtonGroupItemProps, IButtonGroupItem } from '@/providers/buttonGroupConfigurator';
import {
  DynamicActionsProvider,
  DynamicItemsEvaluationHook,
  useDataContextManagerActionsOrUndefined,
  useFormData,
  useGlobalState,
  useNestedPropertyMetadatAccessor,
} from '@/providers';
import { IDataSourceArguments } from '../model';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { getSettings } from './entitySettings';
import { IAjaxResponse } from '@/interfaces';
import { extractAjaxResponse } from '@/interfaces/ajaxResponse';
import { ButtonType } from 'antd/lib/button';
import { useFormViaFactory } from '@/form-factory/hooks';
import { buildUrl, convertDotNotationPropertiesToGraphQL, useHttpClient } from '@/index';
import { unsafeGetValueByPropertyName } from '@/utils/object';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { getEntityTypeIdentifierQueryParams, isEntityTypeIdentifier } from '@/providers/metadataDispatcher/entities/utils';

type ArrayOrObjectWithItems<T> = T[] | {
  items: T[];
};
type FetchResponse = ArrayOrObjectWithItems<IButtonGroupItem>;

const tryExtractStringProperty = (item: unknown | undefined, propsToSearch: string[]): string | undefined => {
  if (!isDefined(item))
    return undefined;

  if (typeof (item) === "string")
    return item;

  if (typeof (item) === "object") {
    for (const prop of propsToSearch) {
      const rawProp = (item as Record<string, unknown>)[prop];
      if (typeof (rawProp) === "string" && !isNullOrWhiteSpace(rawProp))
        return rawProp;
    }
  }
  return undefined;
};

const EMPTY_ACTIONS: IButtonGroupItem[] = [];
const useEntityActions: DynamicItemsEvaluationHook<IDataSourceArguments> = ({ item, settings }) => {
  const { actionConfiguration, tooltipProperty, labelProperty, entityType, maxResultCount, filter, buttonType: buttonTypeSetting } = settings ?? {};

  const httpClient = useHttpClient();
  const { data: FormData } = useFormData();
  const { globalState } = useGlobalState();
  const [data, setData] = useState<IButtonGroupItem[] | undefined>(undefined);
  const pageContext = useDataContextManagerActionsOrUndefined()?.getPageContext();
  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityType);
  const evaluatedFilters = useFormEvaluatedFilter({
    filter,
    metadataAccessor: propertyMetadataAccessor,
  });

  const fetchTemplateData = useCallback(async (): Promise<void> => {
    if (isEntityTypeIdentifier(entityType)) {
      const props: string[] = [];
      if (labelProperty) props.push(labelProperty);
      if (tooltipProperty) props.push(tooltipProperty);

      const properties = convertDotNotationPropertiesToGraphQL(props);
      const queryParams = {
        ...getEntityTypeIdentifierQueryParams(entityType),
        maxResultCount: maxResultCount || 100,
        properties: properties,
        filter: evaluatedFilters,
      };
      const url = buildUrl("/api/services/app/Entities/GetAll", queryParams);
      const response = await httpClient.get<IAjaxResponse<FetchResponse>>(url);

      const responseData = extractAjaxResponse(response.data);

      const result = Array.isArray(responseData) ? responseData : responseData.items;
      setData(result);
    } else {
      setData(EMPTY_ACTIONS);
    }
  }, [labelProperty, tooltipProperty, entityType, maxResultCount, evaluatedFilters, httpClient]);

  useEffect(() => {
    // TODO V1: debug and ensure that it doesn't fetch when it shouldn't
    fetchTemplateData();
  }, [item, settings, evaluatedFilters, pageContext, FormData, globalState, fetchTemplateData, filter]);

  const operations = useMemo<ButtonGroupItemProps[]>(() => {
    if (!isDefined(data)) return [];

    const result = data.map<ButtonGroupItemProps>((p) => {
      const labelValue = !isNullOrWhiteSpace(labelProperty)
        ? unsafeGetValueByPropertyName(p, labelProperty)
        : undefined;
      const tooltipValue = !isNullOrWhiteSpace(tooltipProperty)
        ? unsafeGetValueByPropertyName(p, tooltipProperty)
        : undefined;

      const label = typeof (labelValue) === "object" && !isDefined(labelValue)
        ? "empty"
        : tryExtractStringProperty(labelValue, ["_displayName", "name", "fullName", "label"]) ?? 'Not Configured Properly';
      const tooltip = tryExtractStringProperty(tooltipValue, ["_displayName", "name", "fullName", "label"]);

      return {
        id: p.id,
        name: p.name,
        label,
        tooltip,
        itemType: 'item',
        itemSubType: 'button',
        sortOrder: 0,
        permissions: p.permissions ?? item.permissions ?? [],
        buttonType: p.buttonType ?? item.buttonType ?? (buttonTypeSetting as ButtonType),
        size: item.size,
        background: p.background ?? item.background,
        border: p.border ?? item.border,
        shadow: p.shadow ?? item.shadow,
        font: p.font ?? item.font,
        stylingBox: p.stylingBox ?? item.stylingBox,
        style: p.style ?? item.style,
        dimensions: p.dimensions ?? item.dimensions,
        actionConfiguration: actionConfiguration,
      } satisfies ButtonGroupItemProps;
    });

    return result;
  }, [data, labelProperty, tooltipProperty, item.permissions, item.buttonType, item.size, item.background, item.border, item.shadow, item.font, item.stylingBox, item.style, item.dimensions, buttonTypeSetting, actionConfiguration]);

  return operations;
};

export const EntityActions: FC<PropsWithChildren> = ({ children }) => {
  const settingsMarkup = useFormViaFactory(getSettings);

  return (
    <DynamicActionsProvider
      id="Entity"
      name="Entity"
      useEvaluator={useEntityActions}
      hasArguments={true}
      settingsFormMarkup={settingsMarkup}
    >
      {children}
    </DynamicActionsProvider>
  );
};
