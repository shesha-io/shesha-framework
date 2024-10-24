import { evaluateString, useFormData, useMutate } from '@/index';
import { IDynamicItem } from '@/providers/buttonGroupConfigurator/models';
import { buildUrl } from '@/utils/url';
import { MenuProps } from 'antd';
import React, { Key } from 'react';

interface IQueryParams {
  // tslint:disable-next-line:typedef-whitespace
  [name: string]: Key;
}

export const useTemplateActions = () => {
  const { mutate } = useMutate<any>();
  const { data } = useFormData();

  
  const getQueryParams = (item: any): IQueryParams => {
    const queryParamObj: IQueryParams = {};
  
    if (item.queryParams?.length) {
      item.queryParams?.forEach(({ param, value }) => {
        const valueAsString = value as string;
        if (param?.length && valueAsString.length) {
          queryParamObj[param] = /{.*}/i.test(valueAsString) ? evaluateString(valueAsString, { data }) : value;
        }
      });
    }
  
    return queryParamObj;
  
  };

  const fetchTemplateState = async (url: any) => {
  
    try {
      const response = await mutate(
        {
          url:  url || '/api/services/app/ShaRole/GetAll',
          httpVerb: 'GET',
        }
      );

      if (response?.success && response?.result !== undefined) {
        if (typeof response.result === 'object') {
          return response.result.items;
        }else{
          return response.result;
        }
      }
    } catch (error) {
      console.error('Error fetching column state:', error);
    }
  };


  const handleDynamicItems = async (
    item: IDynamicItem,
) => {
    const path = buildUrl(item.dataSourceUrl, getQueryParams(item));
    const templates = await fetchTemplateState(path);
    return templates?.map((template: any) => ({
        ...item,
        data: template,
        id: template.id,
        name: template.name,
        tooltip: template[`${item?.tooltipProperty}` || null],
        label: template[`${item?.labelProperty}` || 'name'],
        itemType: 'item',
        itemSubType: 'button',
        sortOrder: 0,
        actionConfiguration: item.actionConfiguration || null,
        buttonType: item.buttonType || 'link',
    }));
};
  
  return { handleDynamicItems};
};

type MenuItem = MenuProps['items'][number];

export function getButtonGroupMenuItem(
  label: React.ReactNode,
  key: React.Key,
  disabled = false,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    children,
    label,
    className: 'sha-button-menu',
    disabled,
  } as MenuItem;
};