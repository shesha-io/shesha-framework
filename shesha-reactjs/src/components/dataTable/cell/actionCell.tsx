import { Tooltip, message } from 'antd';
import moment from 'moment';
import React from 'react';
import { IconType, ShaIcon } from '@/components';
import {
  isNavigationActionConfiguration,
  useConfigurableActionDispatcher,
  useDataTable,
  useForm,
  useGlobalState,
  useShaRouting,
  useSheshaApplication,
} from '@/providers';
import { ITableActionColumn } from '@/providers/dataTable/interfaces';
import { MODAL_DATA } from '@/shesha-constants';
import { axiosHttp } from '@/utils/fetchers';
import { ICommonCellProps } from './interfaces';
import Link from 'next/link';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';


export interface IActionCellProps<D extends object = {}, V = any> extends ICommonCellProps<ITableActionColumn, D, V> { }

export const ActionCell = <D extends object = {}, V = any>(props: IActionCellProps<D, V>) => {
  const { columnConfig } = props;
  const { changeActionedRow } = useDataTable();
  const { backendUrl } = useSheshaApplication();
  const { formData, formMode } = useForm();
  const { globalState, setState } = useGlobalState();
  const { executeAction, prepareArguments } = useConfigurableActionDispatcher();
  const { getUrlFromNavigationRequest } = useShaRouting();

  const { actionConfiguration, icon, description } = columnConfig ?? {};

  const getRowData = (data) => {
    return data?.cell?.row?.original;
  };

  const evaluationContext = {
    selectedRow: getRowData(props),
    data: formData,
    moment: moment,
    formMode: formMode,
    http: axiosHttp(backendUrl),
    message: message,
    globalState: globalState,
  };


  const clickHandler = (event, data) => {

    event.preventDefault();

    const selectedRow = getRowData(data);

    if (actionConfiguration) {
      setState({ data: selectedRow, key: MODAL_DATA });
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
