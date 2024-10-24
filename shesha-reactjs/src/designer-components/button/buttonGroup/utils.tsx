import { evaluateString, useDataContextManager, useFormData, useGet, useGlobalState } from '@/index';
import { IDynamicItem } from '@/providers/buttonGroupConfigurator/models';
import { buildUrl } from '@/utils/url';
import { MenuProps } from 'antd';
import React, { Key } from 'react';

interface IQueryParams {
  [name: string]: Key;
}

export const useTemplateActions = () => {
  const { data } = useFormData();
  const { globalState } = useGlobalState();
  const pageContext = useDataContextManager(false)?.getPageContext();
  const { refetch } = useGet({ path: '', lazy: true });
  
  const getQueryParams = (item: any): IQueryParams => {
    const queryParamObj: IQueryParams = {};
    if (item.queryParams && item.queryParams?.length) {
      item.queryParams?.forEach(({ param, value }) => {
        const valueAsString = value as string;
        if (param?.length && valueAsString.length) {
          queryParamObj[param] = /{.*}/i.test(valueAsString)
            ? evaluateString(valueAsString, { data, globalState, pageContext: { ...pageContext.getFull() } })
            : value;
        }
      });
    }
    return queryParamObj;
  };

  const getTemplateState = (items: any, customUrl: string) => {
   
    if (items.dataSourceType === 'url') {
      return {
        path: customUrl,
      };
    }
   
    return {
      path: `/api/services/app/Entities/GetAll`,
      queryParams: {
        entityType: items.entityTypeShortAlias,
        maxResultCount: 100,
      },
    };
  };
  const handleDynamicItems = async (item: IDynamicItem) => {
    try {
      const path = buildUrl(item.dataSourceUrl, getQueryParams(item));
      const response = await refetch(getTemplateState(item, path));
      
      if (!response?.success || response?.result === undefined) {
        return [];
      }
  
      const result = typeof response.result === 'object' 
        ? response.result.items 
        : response.result;
  
      if (!result) return [];
  
      return result.map((template: any) => ({
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
    } catch (error) {
      console.error('Error in handleDynamicItems:', error);
      return [];
    }
  };
  

  return { handleDynamicItems };
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
}
