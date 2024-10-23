import { useMutate } from '@/index';
import { MenuProps } from 'antd';
import React from 'react';


export const useTemplateActions = () => {
  const { mutate } = useMutate<any>();


  const fetchTemplateState = async (url: string, queryParams: any) => {
    try {
      const response = await mutate(
        {
          url: url ||  `/api/dynamic/Shesha/Organisation/Crud/GetAll`,
          httpVerb: 'GET',
        },
        queryParams
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

  return {fetchTemplateState};
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