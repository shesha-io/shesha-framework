import { DynamicActionsProvider, DynamicItemsEvaluationHook, useHttpClient } from '@/providers';
import React, { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { ButtonGroupItemProps, IButtonGroupItem } from '@/providers/buttonGroupConfigurator';
import { IDataSourceArguments } from '../model';
import { useUrlTemplates } from '../utils';
import { getSettings } from './urlSettings';
import { IAjaxResponse } from '@/interfaces';
import { extractAjaxResponse } from '@/interfaces/ajaxResponse';
import { ButtonType } from 'antd/lib/button';
import { useFormViaFactory } from '@/form-factory/hooks';
import { buildUrl } from '@/utils';
import { getStringPropertyOrUndefined } from '@/utils/object';

type ArrayOrObjectWithItems<T> = T[] | {
  items: T[];
};
type FetchResponse = ArrayOrObjectWithItems<IButtonGroupItem>;

const useUrlActions: DynamicItemsEvaluationHook<IDataSourceArguments> = ({ item, settings }) => {
  const { actionConfiguration, labelProperty, tooltipProperty, buttonType: buttonTypeSetting } = settings ?? {};
  const httpClient = useHttpClient();
  const { getUrlTemplateState } = useUrlTemplates(settings);
  const [data, setData] = useState<IButtonGroupItem[] | undefined>(undefined);

  useEffect(() => {
    const templateState = getUrlTemplateState();
    if (templateState) {
      const url = buildUrl(templateState.path, templateState.queryParams);
      httpClient.get<IAjaxResponse<FetchResponse>>(url).then((response) => {
        const responseData = extractAjaxResponse(response.data);
        const result = Array.isArray(responseData)
          ? responseData
          : responseData.items;

        setData(result);
      });
    }
  }, [getUrlTemplateState, httpClient]);

  const operations = useMemo<ButtonGroupItemProps[]>(() => {
    if (!data) return [];
    const result = data.map<ButtonGroupItemProps>((p) => ({
      id: p.id,
      name: p.name,
      label: getStringPropertyOrUndefined(p, labelProperty) ?? 'Not Configured Properly',
      tooltip: getStringPropertyOrUndefined(p, tooltipProperty),
      itemType: 'item',
      itemSubType: 'button',
      sortOrder: 0,
      dynamicItem: p,
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
      permissions: p.permissions ?? item.permissions,
    }));

    return result;
  }, [data, labelProperty, tooltipProperty, item.buttonType, item.size, item.background, item.border, item.shadow, item.font, item.stylingBox, item.style, item.dimensions, item.permissions, buttonTypeSetting, actionConfiguration]);

  return operations;
};

export const UrlActions: FC<PropsWithChildren> = ({ children }) => {
  const settingsMarkup = useFormViaFactory(getSettings);
  return (
    <DynamicActionsProvider
      id="Url"
      name="Url"
      useEvaluator={useUrlActions}
      hasArguments={true}
      settingsFormMarkup={settingsMarkup}
    >
      {children}
    </DynamicActionsProvider>
  );
};
