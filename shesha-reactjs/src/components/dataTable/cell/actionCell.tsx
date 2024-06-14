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

export interface IActionCellProps<D extends object = {}, V = any> extends ICommonCellProps<ITableActionColumn, D, V> { }

export const ActionCell = <D extends object = {}, V = any>(props: IActionCellProps<D, V>) => {
  const { columnConfig } = props;
  const { changeActionedRow } = useDataTable();
  const { backendUrl } = useSheshaApplication();
  const { formData, formMode } = useForm();
  const { globalState, setState } = useGlobalState();
  const { executeAction } = useConfigurableActionDispatcher();

  const { actionConfiguration, icon, description } = columnConfig ?? {};

  const getRowData = (data) => {
    return data?.cell?.row?.original;
  };


  const clickHandler = (event, data) => {

    event.stopPropagation();

    const selectedRow = getRowData(data);

    if (actionConfiguration) {
      setState({ data: selectedRow, key: MODAL_DATA }); // TODO: remove usage of global state
      changeActionedRow(data.row.original);

      // TODO: implement generic context collector
      const evaluationContext = {
        selectedRow: selectedRow,
        data: formData,
        moment: moment,
        formMode: formMode,
        http: axiosHttp(backendUrl),
        message: message,
        globalState: globalState,
      };

      executeAction({
        actionConfiguration: actionConfiguration,
        argumentsEvaluationContext: evaluationContext,
      });
    } else console.error('Action is not configured');
  };

  const handleURLClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clickHandler(e, props);
  };

  return (
    <>
      {actionConfiguration?.actionArguments?.navigationType === "url" ?
        <a className="sha-link" href={actionConfiguration?.actionArguments?.url} onClick={handleURLClick}>
          {icon && (
            <Tooltip title={description}>
              <ShaIcon iconName={icon as IconType} />
            </Tooltip>
          )}
        </a>
        :
        <a className="sha-link" onClick={(e) => clickHandler(e, props)}>
          {icon && (
            <Tooltip title={description}>
              <ShaIcon iconName={icon as IconType} />
            </Tooltip>
          )}
        </a>
      }
    </>);
};

export default ActionCell;
