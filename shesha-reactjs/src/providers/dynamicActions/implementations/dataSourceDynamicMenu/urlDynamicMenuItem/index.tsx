import { useGet } from '@/hooks';
import { DynamicActionsProvider, DynamicItemsEvaluationHook, FormMarkup } from '@/providers';
import React, { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { ButtonGroupItemProps, IButtonGroupItem } from '@/providers/buttonGroupConfigurator';
import { IDataSourceArguments } from '../model';
import { useUrlTemplates } from '../utils';
import { getSettings } from './urlSettings';
import { IAjaxResponse } from '@/interfaces';
import { extractAjaxResponse } from '@/interfaces/ajaxResponse';
import { ButtonType } from 'antd/lib/button';

const settingsMarkup = getSettings() as FormMarkup;

type ArrayOrObjectWithItems<T> = T[] | {
  items: T[];
};
type FetchResponse = ArrayOrObjectWithItems<IButtonGroupItem>;

const useUrlActions: DynamicItemsEvaluationHook<IDataSourceArguments> = ({ item, settings }) => {
  const { actionConfiguration, labelProperty, tooltipProperty, buttonType: buttonTypeSetting } = settings ?? {};
  const { refetch } = useGet<IAjaxResponse<FetchResponse>>({ path: '', lazy: true });
  const { getUrlTemplateState } = useUrlTemplates(settings);
  const [data, setData] = useState<IButtonGroupItem[] | undefined>(undefined);

  useEffect(() => {
    const templateState = getUrlTemplateState();
    if (templateState) {
      refetch(templateState).then((response) => {
        const responseData = extractAjaxResponse(response);
        const result = Array.isArray(responseData) ? responseData : responseData.items;

        setData(result);
      });
    }
  }, [getUrlTemplateState, refetch]);

  const operations = useMemo<ButtonGroupItemProps[]>(() => {
    if (!data) return [];
    const result = data.map<ButtonGroupItemProps>((p) => ({
      id: p.id,
      name: p.name,
      label: p[`${labelProperty}`] ?? 'Not Configured Properly',
      tooltip: p[`${tooltipProperty}`],
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
  }, [item, data]);

  return operations;
};

export const UrlActions: FC<PropsWithChildren> = ({ children }) => {
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
