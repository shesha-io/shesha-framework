import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { FC } from 'react';
import { buildMenuItems, useTemplates } from '../utils';
import { useAppConfigurator } from '@/providers/appConfigurator';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator';
import { DynamicActionsProvider, DynamicItemsEvaluationHook, FormMarkup, useDataContextManager, useFormData, useGlobalState } from '@/providers';
import settingsJson from './urlSettings.json';
import { useGet } from '@/hooks';
import { IDataSourceArguments, IWorkflowInstanceStartActionsProps } from '../model';

const settingsMarkup = settingsJson as FormMarkup;

const useUrlActions: DynamicItemsEvaluationHook<IDataSourceArguments> = ({ item, settings }) => {
  const { actionConfiguration, labelProperty, tooltipProperty, buttonType, grouping, sorting } = settings ?? {};
  const { refetch } = useGet({ path: '', lazy: true });
  const { getTemplateState } = useTemplates(settings);
  const [data, setData] = useState(null);
  const pageContext = useDataContextManager(false)?.getPageContext();
  const { data: FormData } = useFormData();
  const { globalState } = useGlobalState();

  useEffect(() => {
    refetch(getTemplateState()).then((response) => {
        const result = Array.isArray(response.result) ? response.result : response.result.items;
        setData(result);
    });
}, [item, settings, pageContext, FormData, globalState]);


  const { configurationItemMode } = useAppConfigurator();

  const operations = useMemo<ButtonGroupItemProps[]>(() => {
    if (!data) return [];
    return buildMenuItems(data, { labelProperty, tooltipProperty, buttonType, actionConfiguration, grouping, sorting });
  }, [item, data, configurationItemMode, settings]);

  return operations;
};

export const UrlActions: FC<PropsWithChildren<IWorkflowInstanceStartActionsProps>> = ({ children }) => {
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
