import { Tooltip } from 'antd';
import React, { useMemo } from 'react';
import { ShaIcon } from '@/components';
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
import { useAvailableConstantsData } from '@/providers/form/utils';

export interface IActionCellProps<D extends object = {}, V = unknown> extends ICommonCellProps<ITableActionColumn, D, V> { }

export const ActionCell = <D extends object = {}, V = unknown>(props: IActionCellProps<D, V>) => {
  const { columnConfig } = props;
  const { changeActionedRow } = useDataTable();
  const { executeAction, prepareArguments, useActionDynamicContext } = useConfigurableActionDispatcher();
  const { getUrlFromNavigationRequest } = useShaRouting();

  const { actionConfiguration, icon, description } = columnConfig ?? {};
  const dynamicContext = useActionDynamicContext(actionConfiguration);

  const allData = useAvailableConstantsData();

  const getRowData = (data: IActionCellProps<D, V>): D | undefined => {
    return data?.cell?.row?.original;
  };

  const selectedRow = getRowData(props);
  const evaluationContext = useMemo(() => ({
    ...allData,
    selectedRow,
    ...dynamicContext,
  }), [allData, selectedRow, dynamicContext]);
  


  const clickHandler = (event: React.MouseEvent<HTMLAnchorElement>, data: IActionCellProps<D, V>) => {
    event.preventDefault();

    if (actionConfiguration) {
      const rowData = getRowData(data);
      changeActionedRow(rowData);
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
  }, [actionConfiguration, evaluationContext], "");

  return (
    <>
      {navigationUrl === "" ?
        <a className="sha-link" onClick={(e) => clickHandler(e, props)}>
          {icon && (
            <Tooltip title={description}>
              <ShaIcon iconName={icon} />
            </Tooltip>
          )}
        </a>
        :
        <Link className="sha-link" href={navigationUrl} onClick={(e) => clickHandler(e, props)}>
          {icon && (
            <Tooltip title={description}>
              <ShaIcon iconName={icon} />
            </Tooltip>
          )}
        </Link>}
    </>);
};

export default ActionCell;