import { useMutate } from '@/index';
import { MenuProps } from 'antd';
import React from 'react';


export const useTemplateActions = () => {
  const { mutate } = useMutate<any>();


  const fetchTemplateState = async (url: string) => {
    try {
      const response = await mutate(
        {
          url: url ||  `/api/dynamic/Shesha/Organisation/Crud/GetAll`,
          httpVerb: 'GET',
        },
  
      );

      if (response?.success && response?.result !== undefined) {
        return response.result.items;
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