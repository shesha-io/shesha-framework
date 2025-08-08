import { Tooltip } from 'antd';
import React from 'react';
import { IconType, ShaIcon } from '@/components';
import {
  isNavigationActionConfiguration,
  useConfigurableActionDispatcher,
  useDataTable,
  useShaRouting,
} from '@/providers';
import { ITableActionColumn } from '@/providers/dataTable/interfaces';
import { ICommonCellProps } from './interfaces';
import Link from 'next/link';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { TypedProxy, useAvailableConstantsData } from '@/index';


export interface IActionCellProps<D extends object = {}, V = any> extends ICommonCellProps<ITableActionColumn, D, V> { }

export const ActionCell = <D extends object = {}, V = any>(props: IActionCellProps<D, V>) => {
  const { columnConfig } = props;
  const { changeActionedRow } = useDataTable();
  const { executeAction, prepareArguments, useActionDynamicContext } = useConfigurableActionDispatcher();
  const { getUrlFromNavigationRequest } = useShaRouting();

  const { actionConfiguration, icon, description } = columnConfig ?? {};
  const dynamicContext = useActionDynamicContext(actionConfiguration);
  const evaluationContext = useAvailableConstantsData({}, dynamicContext);
  (evaluationContext as TypedProxy<any>).addAccessor('selectedRow', () => props?.cell?.row?.original);

  const clickHandler = (event, data) => {
    event.preventDefault();

    if (actionConfiguration) {
      changeActionedRow(data.row.original);
      executeAction({
        actionConfiguration: actionConfiguration,
        argumentsEvaluationContext: evaluationContext,
      });

    } else console.error('Action is not configured');
  };

  const navigationUrl = useAsyncMemo(async () => {
    if (!isNavigationActionConfiguration(actionConfiguration) || !actionConfiguration.actionArguments)
      return "";

    const preparedArguments = await prepareArguments({ actionConfiguration, argumentsEvaluationContext: evaluationContext });
    return getUrlFromNavigationRequest(preparedArguments);
  }, [actionConfiguration], "");

  return (
    <>
      {navigationUrl === "" ?
        <a className="sha-link" onClick={(e) => clickHandler(e, props)}>
          {icon && (
            <Tooltip title={description}>
              <ShaIcon iconName={icon as IconType} />
            </Tooltip>
          )}
        </a>
        :
        <Link className="sha-link" href={navigationUrl} onClick={(e) => clickHandler(e, props)}>
          {icon && (
            <Tooltip title={description}>
              <ShaIcon iconName={icon as IconType} />
            </Tooltip>
          )}
        </Link>}
    </>);
};

export default ActionCell;