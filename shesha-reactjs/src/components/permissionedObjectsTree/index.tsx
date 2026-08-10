import GrouppedObjectsTree from '@/components/grouppedObjectsTree';
import React, { FC, useEffect, useState } from 'react';
import { ApiOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { PermissionedObjectDto } from '@/apis/permissionedObject';
import { IConfigurableActionConfiguration, useConfigurableAction, useConfigurableActionDispatcher, useHttpClient } from '@/providers';
import { useLocalStorage } from '@/hooks';
import { InterfaceOutlined } from '@/icons/interfaceOutlined';
import { ISetGroupingArguments, getSetGroupingArgumentsForm } from './set-grouping-arguments';
import { IUpdateItemArguments, updateItemArgumentsForm } from './update-item-arguments';
import { ISetSearchTextArguments, setSearchTextArgumentsForm } from './set-search-text-arguments';
import { extractAjaxResponse, IAjaxResponse } from '@/interfaces/ajaxResponse';
import { useAvailableConstantsData } from '@/providers/form/utils';
import ShaSpin from '../shaSpin';
import { isDefined } from '@/utils/nullables';
import { buildUrl } from '@/utils';

export interface IPermissionedObjectsTreeProps {
  objectsType?: string | undefined;
  height?: string | undefined;

  defaultAccess?: number | undefined;

  /**
   * A callback for when the value of this component changes
   */
  onChange?: ((newValue: string | undefined) => void) | undefined;

  formComponentName?: string | undefined;

  formComponentId?: string | undefined;

  onSelectAction?: IConfigurableActionConfiguration | undefined;

  searchText?: string | undefined;
}

export const PermissionedObjectsTree: FC<IPermissionedObjectsTreeProps> = (props) => {
  const [openedKeys, setOpenedKeys] = useLocalStorage('shaPermissionedObjects.toolbox.objects.openedKeys.' + props.objectsType, ['']);
  const [searchText, setSearchText] = useLocalStorage('shaPermissionedObjects.toolbox.objects.search.' + props.objectsType, '');
  const [groupBy, setGroupBy] = useLocalStorage('shaPermissionedObjects.toolbox.objects.grouping.' + props.objectsType, '-');
  const [allItems, setAllItems] = useState<PermissionedObjectDto[]>([]);

  const { executeAction } = useConfigurableActionDispatcher();
  const allData = useAvailableConstantsData();

  const httpClient = useHttpClient();
  const [isFetchingData, setIsFetchingData] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async (): Promise<void> => {
      try {
        const url = buildUrl(`/api/services/app/PermissionedObject/GetAllTree`, { type: props.objectsType });
        setIsFetchingData(true);
        const response = await httpClient.get<IAjaxResponse<PermissionedObjectDto[] | null>>(url);
        setIsFetchingData(false);
        if (isMounted) {
          const responseData = extractAjaxResponse(response.data);
          setAllItems(responseData ?? []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setIsFetchingData(false);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [props.objectsType, httpClient]);

  const [objectId, setObjectId] = useState<string>("");

  const findItem = (items: PermissionedObjectDto[], key: string): PermissionedObjectDto | undefined => {
    let res = undefined;
    let i = 0;
    while (!res && i < items.length) {
      const item = items[i];
      res = item && item.object === key
        ? item
        : undefined;
      if (!res && item && item.children) {
        res = findItem(item.children, key);
      }
      i++;
    }
    return res;
  };

  const actionsOwnerUid = props.formComponentId ?? "";

  useConfigurableAction(
    {
      name: 'Update item',
      description: 'Update Permissioned object Tree item',
      owner: props.formComponentName || "Permissioned objects tree",
      ownerUid: actionsOwnerUid,
      hasArguments: true,
      argumentsFormMarkup: updateItemArgumentsForm,
      executer: (arg: IUpdateItemArguments) => {
        const item = isDefined(arg.object) ? findItem(allItems, arg.object) : undefined;
        if (item) {
          item.access = Number(arg.access);
          item.category = arg.category;
          item.description = arg.description ?? null;
          setAllItems([...allItems]);
          setSearchText('');
        }

        return Promise.resolve();
      },
    },
  );

  useConfigurableAction(
    {
      name: 'Set grouping',
      description: 'Set grouping',
      owner: props.formComponentName || "Permissioned objects tree",
      ownerUid: actionsOwnerUid,
      hasArguments: true,
      argumentsFormMarkup: getSetGroupingArgumentsForm,
      executer: (arg: ISetGroupingArguments) => {
        setGroupBy(arg.group ?? "");
        return Promise.resolve();
      },
    },
  );

  useConfigurableAction(
    {
      name: 'Set search text',
      description: 'Set grsearch textuping',
      owner: props.formComponentName || "Permissioned objects tree",
      ownerUid: actionsOwnerUid,
      hasArguments: true,
      argumentsFormMarkup: setSearchTextArgumentsForm,
      executer: (arg: ISetSearchTextArguments) => {
        setSearchText(arg.searchText ?? "");
        return Promise.resolve();
      },
    },
  );

  const onChangeAction = (selectedRow: PermissionedObjectDto): void => {
    if (props.onSelectAction?.actionName) {
      void executeAction({
        actionConfiguration: props.onSelectAction,
        argumentsEvaluationContext: { ...allData, selectedRow },
      });
    }
  };

  const onChangeHandler = (item: PermissionedObjectDto): void => {
    setObjectId(item.id ?? "");
    onChangeAction(item);
    if (props.onChange)
      props.onChange(item.id);
  };

  const renderTitle = (item: PermissionedObjectDto): React.ReactNode => {
    const parent = item.parent ? allItems.find((x) => x.object === item.parent) : null;
    const access =
      item.access === 1 || (item.access === 2 && parent?.access === 1 /* Disabled*/)
        ? 1
        : item.access === 3 || (item.access === 2 && parent?.access === 3 /* Any authenticated*/)
          ? 3
          : item.access === 4 || (item.access === 2 && parent?.access === 4 /* Requires permissions*/)
            ? 4
            : item.access === 5 || (item.access === 2 && parent?.access === 5 /* Allow anonymous*/)
              ? 5
              : !props.defaultAccess
                ? 5 // Allow anonymous
                : props.defaultAccess;
    const name = item.hardcoded === true
      ? <span style={{ fontWeight: 'bold' }}>{item.name}</span>
      : <>{item.name}</>;
    return (
      <>
        {(item.type === "Shesha.WebApi" ? <ApiOutlined /> : <InterfaceOutlined />)}
        <span
          className="sha-component-title"
          style={access === 1 ? { textDecoration: 'line-through', color: 'gray', paddingLeft: '10px' } : { paddingLeft: '10px' }}
        >
          {item.description && <Tooltip title={item.description}>{name}</Tooltip>}
          {!item.description && name}
        </span>
        {access === 4 && <span style={{ color: 'green' }}> (permissioned)</span>}
        {access === 5 && <span style={{ color: 'red' }}> (unsecured)</span>}

      </>
    );
  };

  return (
    <ShaSpin spinning={isFetchingData} tip="Fetching data...">
      <GrouppedObjectsTree<PermissionedObjectDto>
        items={allItems}
        openedKeys={openedKeys}
        searchText={searchText || props.searchText || ''}
        groupBy={groupBy}
        defaultSelected={objectId}
        isMatch={(item, searchText) => (
          item.name?.toLowerCase().includes(searchText.toLowerCase())
        )}
        setOpenedKeys={setOpenedKeys}
        onChange={onChangeHandler}
        onRenterItem={renderTitle}
      />
    </ShaSpin>
  );
};

export default PermissionedObjectsTree;
