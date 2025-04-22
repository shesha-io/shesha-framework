import GrouppedObjectsTree from '@/components/grouppedObjectsTree';
import React, { FC, useEffect, useRef, useState } from 'react';
import { ApiOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { PermissionedObjectDto, usePermissionedObjectGetAllTree } from '@/apis/permissionedObject';
import { IConfigurableActionConfiguration, useConfigurableAction, useConfigurableActionDispatcher } from '@/providers';
import { useLocalStorage } from '@/hooks';
import { InterfaceOutlined } from '@/icons/interfaceOutlined';
import { ISetGroupingArguments, setGroupingArgumentsForm } from './set-grouping-arguments';
import { IUpdateItemArguments, updateItemArgumentsForm } from './update-item-arguments';
import { ISetSearchTextArguments, setSearchTextArgumentsForm } from './set-search-text-arguments';
import { ShaSpin, useAvailableConstantsData } from '@/index';

export interface IPermissionedObjectsTreeProps {
  objectsType?: string;
  height?: string;

  defaultAccess?: number;

  /**
   * A callback for when the value of this component changes
   */
  onChange?: any;

  formComponentName?: string;

  formComponentId?: string;

  onSelectAction?: IConfigurableActionConfiguration;
}

export const PermissionedObjectsTree: FC<IPermissionedObjectsTreeProps> = (props) => {

  const [openedKeys, setOpenedKeys] = useLocalStorage('shaPermissionedObjects.toolbox.objects.openedKeys.' + props.objectsType, ['']);
  const [searchText, setSearchText] = useLocalStorage('shaPermissionedObjects.toolbox.objects.search.' + props.objectsType, '');
  const [groupBy, setGroupBy] = useLocalStorage('shaPermissionedObjects.toolbox.objects.grouping.' + props.objectsType, '-');
  //const [objectsType, setObjectsType] = useLocalStorage('shaPermissionedObjects.toolbox.objects.type', null);
  //const objectsType = 'Shesha.WebApi';

  const [allItems, setAllItems] = useState<PermissionedObjectDto[]>();

  const { executeAction } = useConfigurableActionDispatcher();
  const allData = useRef<any>({});
  allData.current = useAvailableConstantsData();

  const fetcher = usePermissionedObjectGetAllTree({ queryParams: { type: props.objectsType }, lazy: true });
  const { loading: isFetchingData, error: fetchingDataError, data: fetchingDataResponse } = fetcher;

  const [objectId, setObjectId] = useState("");

  useEffect(() => {
    fetcher.refetch();
  }, [props.objectsType]);

  useEffect(() => {
    if (!isFetchingData) {
      if (fetchingDataResponse) {
        const fetchedData = fetchingDataResponse?.result;
        if (fetchedData) {
          setAllItems(fetchedData);
        }
      }
    }
  }, [isFetchingData, fetchingDataError, fetchingDataResponse]);
  
  const findItem = (items: PermissionedObjectDto[], key: string): PermissionedObjectDto => {
    let res = null;
    let i = 0;
    while (items && !res && i < items.length) {
      res = items[i]?.object === key ? items[i] : null;
      if (!res) {
        res = findItem(items[i].children, key);
      }
      i++;
    }
    return res;
  };

  useConfigurableAction(
    {
      name: 'Update item',
      description: 'Update Permissioned object Tree item',
      owner: props.formComponentName || "Permissioned objects tree",
      ownerUid: props.formComponentId,
      hasArguments: true,
      argumentsFormMarkup: updateItemArgumentsForm,
      executer: (arg: IUpdateItemArguments) => {
        const item = findItem(allItems, arg?.object);
        if (item) {
          item.access = Number(arg?.access);
          item.category = arg?.category;
          item.description = arg?.description;
          item.description = arg?.description;
          setAllItems([...allItems]);
          setSearchText('');
        }

        return Promise.resolve();
      },
    }
  );

  useConfigurableAction(
    {
      name: 'Set grouping',
      description: 'Set grouping',
      owner: props.formComponentName || "Permissioned objects tree",
      ownerUid: props.formComponentId,
      hasArguments: true,
      argumentsFormMarkup: setGroupingArgumentsForm,
      executer: (arg: ISetGroupingArguments) => {
        setGroupBy(arg.group);
        return Promise.resolve();
      },
    }
  );

  useConfigurableAction(
    {
      name: 'Set search text',
      description: 'Set grsearch textuping',
      owner: props.formComponentName || "Permissioned objects tree",
      ownerUid: props.formComponentId,
      hasArguments: true,
      argumentsFormMarkup: setSearchTextArgumentsForm,
      executer: (arg: ISetSearchTextArguments) => {
        setSearchText(arg.searchText);
        return Promise.resolve();
      },
    }
  );

  const onChangeAction = (selectedRow: PermissionedObjectDto) => {
    if (props.onSelectAction?.actionName) {
      executeAction({
        actionConfiguration: props.onSelectAction,
        argumentsEvaluationContext: {...allData.current, selectedRow},
      });
    }
  };

  const onChangeHandler = (item: PermissionedObjectDto) => {
    setObjectId(item.id);
    onChangeAction(item);
    if (Boolean(props.onChange))
      props.onChange(item.id);
  };

  const renderTitle = (item: PermissionedObjectDto): React.ReactNode => {
    const parent = item.parent ? allItems.find(x => x.object === item.parent) : null;
    const access = 
      item.access === 1 || item.access === 2 && parent?.access === 1 // Disabled
        ? 1
        : item.access === 3 || item.access === 2 && parent?.access === 3 // Any authenticated
          ? 3
          : item.access === 4 || item.access === 2 && parent?.access === 4 // Requires permissions
            ? 4
            : item.access === 5 || item.access === 2 && parent?.access === 5 // Allow anonymous
              ? 5
              : !props.defaultAccess
                ? 5 // Allow anonymous
                : props.defaultAccess;
    const name = item.hardcoded === true
      ? <span style={{fontWeight: 'bold'}}>{item.name}</span>
      : <>{item.name}</>;
    return (
      <>
        {(item.type === "Shesha.WebApi" ? <ApiOutlined /> : <InterfaceOutlined />)}
        <span 
          className='sha-component-title' 
          style={access === 1 ? { textDecoration: 'line-through', color: 'gray', paddingLeft: '10px'} : {paddingLeft: '10px'}}
        >
          {item.description && <Tooltip title={item.description}>{name}</Tooltip>}
          {!item.description && name}
          </span>
          {access === 4 && <span style={{color: 'green'}}> (permissioned)</span>}
          {access === 5 && <span style={{color: 'red'}}> (unsecured)</span>}
        
      </>
    );
  };

  return (
    <ShaSpin spinning={isFetchingData} tip={'Fetching data...'}>
      <GrouppedObjectsTree<PermissionedObjectDto>
        items={allItems}
        openedKeys={openedKeys}
        searchText={searchText}
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