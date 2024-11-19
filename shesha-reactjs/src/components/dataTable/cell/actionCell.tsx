import { Tooltip, App } from 'antd';
import moment from 'moment';
import React from 'react';
import { IconType, ShaIcon } from '@/components';
import {
  isNavigationActionConfiguration,
  useConfigurableActionDispatcher,
  useDataTable,
  useForm,
  useGlobalState,
  useHttpClient,
  useShaRouting,
} from '@/providers';
import { ITableActionColumn } from '@/providers/dataTable/interfaces';
import { ICommonCellProps } from './interfaces';
import Link from 'next/link';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';


export interface IActionCellProps<D extends object = {}, V = any> extends ICommonCellProps<ITableActionColumn, D, V> { }

export const ActionCell = <D extends object = {}, V = any>(props: IActionCellProps<D, V>) => {
  const { columnConfig } = props;
  const { changeActionedRow } = useDataTable();
  const httpClient = useHttpClient();
  const { formData, formMode } = useForm();
  const { globalState } = useGlobalState();
  const { executeAction, prepareArguments } = useConfigurableActionDispatcher();
  const { getUrlFromNavigationRequest } = useShaRouting();
  const { message } = App.useApp();

  const { actionConfiguration, icon, description } = columnConfig ?? {};

  const getRowData = (data) => {
    return data?.cell?.row?.original;
  };

  const evaluationContext = {
    selectedRow: getRowData(props),
    data: formData,
    moment: moment,
    formMode: formMode,
    http: httpClient,
    message: message,
    globalState: globalState,
  };


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