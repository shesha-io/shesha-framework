import { evaluateString, useDataContextManager, useFormData, useGlobalState } from '@/index';
import { Key } from 'react';
import { IDataSourceArguments } from './model';
import { buildUrl } from '@/utils/url';
import { ButtonGroupItemProps, IButtonItem } from '@/providers/buttonGroupConfigurator/models';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { ButtonType } from 'antd/lib/button';
import { ISortingItem } from '@/providers/dataTable/interfaces';
import { IFullAuditedEntity } from '@/publicJsApis/entities';

interface IBuildMenuItemsArgs extends Pick<IDataSourceArguments, 'labelProperty' | 'tooltipProperty' | 'buttonType' | 'grouping' | 'sorting'> {
  actionConfiguration?: IConfigurableActionConfiguration;
}

type MenuRow = Record<string, unknown>;

const sortByItems = (items: ISortingItem[]) => (a: MenuRow, b: MenuRow) => {
  for (const { propertyName, sorting } of items) {
    if (!propertyName) continue;
    const valueA = a?.[propertyName] as string | number | undefined | null;
    const valueB = b?.[propertyName] as string | number | undefined | null;
    const result = valueA === undefined || valueA === null
      ? (valueB === undefined || valueB === null ? 0 : -1)
      : valueB === undefined || valueB === null
        ? 1
        : valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    if (result === 0) continue;
    return sorting === 'desc' ? -result : result;
  }
  return 0;
};

export const buildMenuItems = (data: unknown[], args: IBuildMenuItemsArgs): ButtonGroupItemProps[] => {
  const { labelProperty, tooltipProperty, buttonType, actionConfiguration, grouping, sorting } = args ?? {};

  const validRows = (data ?? []).filter(
    (p): p is MenuRow =>
      typeof p === 'object' && p !== null && !Array.isArray(p),
  );

  const toButtonItem = (p: MenuRow): IButtonItem => ({
    id: p.id as string,
    name: p.name as string,
    label: (p[`${labelProperty}`] as string) || 'Not Configured Properly',
    tooltip: p[`${tooltipProperty}`] as string,
    itemType: 'item',
    itemSubType: 'button',
    sortOrder: 0,
    dynamicItem: p as unknown as IFullAuditedEntity,
    buttonType: buttonType as ButtonType,
    actionConfiguration: actionConfiguration,
  });

  const sortItems = sorting?.filter(({ propertyName }) => !!propertyName) ?? [];
  const sortRows = (rows: MenuRow[]) => (sortItems.length ? [...rows].sort(sortByItems(sortItems)) : rows);

  const groupLevels = grouping?.filter(({ propertyName }) => !!propertyName) ?? [];

  const buildLevel = (rows: MenuRow[], levelIndex: number, parentPath: string): ButtonGroupItemProps[] => {
    if (levelIndex >= groupLevels.length)
      return sortRows(rows).map(toButtonItem);

    const { propertyName, sorting: groupDirection } = groupLevels[levelIndex];
    const groupValues = new Map<string, unknown>();
    const groups = new Map<string, MenuRow[]>();
    rows.forEach((p) => {
      const groupValue = p?.[propertyName];
      const groupLabel = String(groupValue ?? '');
      if (!groupValues.has(groupLabel)) groupValues.set(groupLabel, groupValue);
      const groupRows = groups.get(groupLabel);
      if (groupRows) groupRows.push(p);
      else groups.set(groupLabel, [p]);
    });

    const groupEntries = Array.from(groups.entries()).sort(([labelA], [labelB]) => {
      const valueA = groupValues.get(labelA);
      const valueB = groupValues.get(labelB);
      const result = valueA === undefined || valueA === null
        ? (valueB === undefined || valueB === null ? 0 : -1)
        : valueB === undefined || valueB === null
          ? 1
          : typeof valueA === 'number' && typeof valueB === 'number'
            ? valueA - valueB
            : labelA.localeCompare(labelB);
      return groupDirection === 'desc' ? -result : result;
    });

    return groupEntries.map(([groupLabel, groupRows], index) => {
      const groupKey = groupLabel === '' ? `_blank-${index}` : groupLabel;
      const path = `${parentPath}/group-${levelIndex}-${groupKey}`;
      return {
        id: path,
        name: groupLabel || `Group ${index + 1}`,
        label: groupLabel || '(Not specified)',
        itemType: 'group',
        sortOrder: 0,
        hideWhenEmpty: true,
        buttonType: buttonType as ButtonType,
        childItems: buildLevel(groupRows, levelIndex + 1, path),
      };
    });
  };

  return buildLevel(validRows, 0, '');
};

interface IQueryParams {
  [name: string]: Key;
}

export const useTemplates = (settings: IDataSourceArguments) => {
  const { dataSourceUrl, queryParams, entityTypeShortAlias, maxResultCount } = settings ?? {};
  const { data } = useFormData();
  const { globalState } = useGlobalState();
  const pageContext = useDataContextManager(false)?.getPageContext();

  const getQueryParams = (): IQueryParams => {
    const queryParamObj: IQueryParams = {};
    if (queryParams && queryParams?.length) {
      queryParams?.forEach(({ param, value }) => {
        const valueAsString = value as string;
        if (param?.length && valueAsString.length) {
          queryParamObj[param] = /{.*}/i.test(valueAsString)
            ? evaluateString(valueAsString, { data, globalState, pageContext: { ...pageContext.getFull() } })
            : value;
        }
      });
    }
    return queryParamObj;
  };

  const getTemplateState = (evaluatedFilters?: any) => {
    if (dataSourceUrl !== undefined) {
      const dataSourceUrlString = dataSourceUrl.id ? dataSourceUrl.id : dataSourceUrl;
      const path = buildUrl(dataSourceUrlString, getQueryParams());
      return {
        path,
      };
    }

    return {
      path: `/api/services/app/Entities/GetAll`,
      queryParams: {
        entityType: entityTypeShortAlias,
        maxResultCount: maxResultCount || 100,
        filter: evaluatedFilters,
      },
    };
  };

  return { getTemplateState, getQueryParams };
};
