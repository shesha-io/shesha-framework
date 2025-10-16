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
import { useAsyncDeepCompareMemo } from '@/hooks/useAsyncMemo';
import { TypedProxy, useAvailableConstantsData } from '@/index';


export type IActionCellProps<D extends object = object, V = any> = ICommonCellProps<ITableActionColumn, D, V>;

export const ActionCell = <D extends object = object, V = any>(props: IActionCellProps<D, V>): JSX.Element => {
  const { columnConfig } = props;
  const { changeActionedRow } = useDataTable();
  const { executeAction, prepareArguments, useActionDynamicContext } = useConfigurableActionDispatcher();
  const { getUrlFromNavigationRequest } = useShaRouting();

  const { actionConfiguration, icon, description } = columnConfig ?? {};
  const dynamicContext = useActionDynamicContext(actionConfiguration);
  const evaluationContext = useAvailableConstantsData({}, dynamicContext);
  (evaluationContext as TypedProxy<any>).addAccessor('selectedRow', () => props?.cell?.row?.original);

  const clickHandler = (event, data): void => {
    event.preventDefault();

    if (actionConfiguration) {
      changeActionedRow(data.row.original);
      executeAction({
        actionConfiguration: actionConfiguration,
        argumentsEvaluationContext: evaluationContext,
      });
    } else console.error('Action is not configured');
  };

  const navigationUrl = useAsyncDeepCompareMemo(async () => {
    if (!isNavigationActionConfiguration(actionConfiguration) || !actionConfiguration.actionArguments)
      return "";

    const preparedArguments = await prepareArguments({ actionConfiguration, argumentsEvaluationContext: evaluationContext });
    return getUrlFromNavigationRequest(preparedArguments);
  }, [
    actionConfiguration,
    { ...evaluationContext.data },
    // TODO: review contexts and add to corresponding type
    evaluationContext.contexts.appConext,
    evaluationContext.contexts.pageContext,
    evaluationContext.contexts.formContext,
  ], "");

  return (
    <>
      {navigationUrl === ""
        ? (
          <a className="sha-link" onClick={(e) => clickHandler(e, props)}>
            {icon && (
              <Tooltip title={description}>
                <ShaIcon iconName={icon as IconType} />
              </Tooltip>
            )}
          </a>
        )
        : (
          <Link className="sha-link" href={navigationUrl} onClick={(e) => clickHandler(e, props)}>
            {icon && (
              <Tooltip title={description}>
                <ShaIcon iconName={icon as IconType} />
              </Tooltip>
            )}
          </Link>
        )}
    </>
  );
};

export default ActionCell;
