import { Tooltip, message } from 'antd';
import moment from 'moment';
import React from 'react';
import { IconType, ShaIcon } from '@/components';
import {
  useConfigurableActionDispatcher,
  useDataTable,
  useForm,
  useGlobalState,
  useSheshaApplication,
} from '@/providers';
import { ITableActionColumn } from '@/providers/dataTable/interfaces';
import { MODAL_DATA } from '@/shesha-constants';
import { axiosHttp } from '@/utils/fetchers';
import { ICommonCellProps } from './interfaces';
import { evaluateString, useShaRouting } from '@/index';
import Link from 'next/link';


export interface IActionCellProps<D extends object = {}, V = any> extends ICommonCellProps<ITableActionColumn, D, V> { }

export const ActionCell = <D extends object = {}, V = any>(props: IActionCellProps<D, V>) => {
  const { columnConfig } = props;
  const { changeActionedRow } = useDataTable();
  const { backendUrl } = useSheshaApplication();
  const { formData, formMode } = useForm();
  const { globalState, setState } = useGlobalState();
  const { executeAction } = useConfigurableActionDispatcher();
  const { getUrlFromNavigationRequest } = useShaRouting();

  const { actionConfiguration, icon, description } = columnConfig ?? {};

  const getRowData = (data) => {
    return data?.cell?.row?.original;
  };

  // todo: implement generic context collector
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
      setState({ data: selectedRow, key: MODAL_DATA }); // todo: remove usage of global state
      changeActionedRow(data.row.original);
      executeAction({
        actionConfiguration: actionConfiguration,
        argumentsEvaluationContext: evaluationContext,
      });

    } else console.error('Action is not configured');
  };

  const getSearchParams = (arr): string => {
    return arr && arr.map(obj => `${encodeURIComponent(obj.key)}=${obj.value}`).join('&');
  };

  const getUrlHref = (): string => {
    const searchParams = getSearchParams(actionConfiguration?.actionArguments?.queryParameters);
    const href = evaluateString(actionConfiguration?.actionArguments?.url + '?' + searchParams, evaluationContext);
    return href;
  };

  const getFormHref = (): string => {
    const url = decodeURIComponent(getUrlFromNavigationRequest(actionConfiguration?.actionArguments));
    const href = evaluateString(url, evaluationContext);
    return href;
  };

  const getHrefValue = (navigationType?: string): string => {
    if (navigationType === "url") {
      return getUrlHref();
    } else if (navigationType === "form") {
      return getFormHref();
    } else {
      return '';
    }
  };

  return (
    <>
      <Link className="sha-link" href={getHrefValue(actionConfiguration?.actionArguments?.navigationType)} onClick={(e) => clickHandler(e, props)}>
        {icon && (
          <Tooltip title={description}>
            <ShaIcon iconName={icon as IconType} />
          </Tooltip>
        )}
      </Link>
    </>);
};

export default ActionCell;
