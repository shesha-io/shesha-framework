import { Tooltip } from 'antd';
import React, { MouseEventHandler } from 'react';
import {
  isNavigationActionConfiguration,
  useConfigurableActionDispatcher,
  useDataTableStore,
  useShaRouting,
} from '@/providers';
import { ITableActionColumn, ITableRowData } from '@/providers/dataTable/interfaces';
import { ICommonCellProps } from './interfaces';
import Link from 'next/link';
import { useAsyncDeepCompareMemo } from '@/hooks/useAsyncMemo';
import { isProxyWithRefresh } from '@/providers/form/observableProxy';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { ShaIcon, IconType } from '@/components/shaIcon';
import { isNullOrWhiteSpace } from '@/utils/nullables';

export type IActionCellProps<D extends object = object, V = unknown> = ICommonCellProps<ITableActionColumn, D, V>;

export const ActionCell = <D extends ITableRowData = ITableRowData, V = unknown>(props: IActionCellProps<D, V>): React.JSX.Element => {
  const { columnConfig } = props;
  const { changeActionedRow } = useDataTableStore();
  const { executeAction, prepareArguments, useActionDynamicContext } = useConfigurableActionDispatcher();
  const { getUrlFromNavigationRequest } = useShaRouting();

  const { actionConfiguration, icon, description } = columnConfig;
  const dynamicContext = useActionDynamicContext(actionConfiguration);
  const evaluationContext = useAvailableConstantsData({}, dynamicContext);
  if (isProxyWithRefresh(evaluationContext))
    evaluationContext.addAccessor('selectedRow', () => props.cell.row.original);

  const clickHandler: MouseEventHandler<HTMLAnchorElement> = (event): void => {
    event.preventDefault();

    if (actionConfiguration) {
      changeActionedRow(props.row.original);
      void executeAction({
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
    evaluationContext.contexts?.["appConext"],
    evaluationContext.contexts?.["pageContext"],
    evaluationContext.contexts?.["formContext"],
  ], "");

  return (
    <>
      {isNullOrWhiteSpace(navigationUrl)
        ? (
          <a className="sha-link" onClick={clickHandler}>
            {icon && (
              <Tooltip title={description}>
                <ShaIcon iconName={icon as IconType} />
              </Tooltip>
            )}
          </a>
        )
        : (
          <Link
            className="sha-link"
            href={navigationUrl}
            onClick={clickHandler}
          >
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
