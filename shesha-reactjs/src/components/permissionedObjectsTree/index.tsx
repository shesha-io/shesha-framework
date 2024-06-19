import GrouppedObjectsTree from '@/components/grouppedObjectsTree';
import React, { FC, useEffect, useState } from 'react';
import SearchBox from '../formDesigner/toolboxSearchBox';
import { ApiOutlined, DatabaseFilled, LoadingOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Spin } from 'antd';
import { PermissionedObjectDto, usePermissionedObjectGetAllTree } from '@/apis/permissionedObject';
import { useConfigurableAction, useForm } from '@/providers';
import { useLocalStorage } from '@/hooks';
import { InterfaceOutlined } from '@/icons/interfaceOutlined';
import { IUpdateItemArguments, updateItemArgumentsForm } from './update-item-arguments';

type MenuItem = MenuProps['items'][number];

export interface IPermissionedObjectsTreeProps {
  objectsType?: string;
  height?: string;

  /**
   * A callback for when the value of this component changes
   */
  onChange?: any;

  formComponentName?: string;

  formComponentId?: string;
}

export const PermissionedObjectsTree: FC<IPermissionedObjectsTreeProps> = (props) => {

  const [openedKeys, setOpenedKeys] = useLocalStorage('shaPermissionedObjects.toolbox.objects.openedKeys.' + props.objectsType, ['']);
  const [searchText, setSearchText] = useLocalStorage('shaPermissionedObjects.toolbox.objects.search.' + props.objectsType, '');
  const [groupBy, setGroupBy] = useLocalStorage('shaPermissionedObjects.toolbox.objects.grouping.' + props.objectsType, '-');
  //const [objectsType, setObjectsType] = useLocalStorage('shaPermissionedObjects.toolbox.objects.type', null);
  const objectsType = 'Shesha.WebApi';

  const [allItems, setAllItems] = useState<PermissionedObjectDto[]>();

  const fetcher = usePermissionedObjectGetAllTree({ queryParams: { type: objectsType ?? props.objectsType }, lazy: true });
  const { loading: isFetchingData, error: fetchingDataError, data: fetchingDataResponse } = fetcher;

  const [objectId, setObjectId] = useState("");

  const { getAction } = useForm(false) ?? {};

  useEffect(() => {
    if (Boolean(getAction)) {
      const action = getAction(null, 'onChangeId');
      if (Boolean(action)) {
        action(objectId);
      }
    }
  }, [objectId]);

  useEffect(() => {
    fetcher.refetch();
  }, [objectsType]);

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

  const onChangeHandler = (item: PermissionedObjectDto) => {
    setObjectId(item.id);
    if (Boolean(props.onChange))
      props.onChange(item.id);
  };

  const menuItems: MenuItem[] = [
    {
      key: '1', label: 'Without grouping', onClick: () => {
        setGroupBy("-");
      }
    },
    {
      key: '2', label: 'Group by Module', onClick: () => {
        setGroupBy("module");
      }
    },
    {
      key: '3', label: 'Group by Category', onClick: () => {
        setGroupBy("category");
      }
    },
  ];

  /*const typeMenuItems: MenuItem[] = [
    {
      key: '1', label: 'API', onClick: () => {
        setObjectsType("Shesha.WebApi");
      }
    },
    {
      key: '2', label: 'CRUD API', onClick: () => {
        setObjectsType("Shesha.WebCrudApi");
      }
    },
    {
      key: '3', label: 'Entities', onClick: () => {
        setObjectsType("Shesha.Entity");
      }
    },
  ];*/
  
  const renderTitle = (item: PermissionedObjectDto): React.ReactNode => {
    const parent = item.parent ? allItems.find(x => x.object === item.parent) : null;
    const access = 
      item.access === 1 || item.access === 2 && parent?.access === 1 // Disabled
        ? 1
        : item.access === 3 || item.access === 2 && parent?.access === 3 // Any authenticated
          ? 3
          : item.access === 4 || item.access === 2 && parent?.access === 4 // Requires permissions
            ? 4
            : item.access === 5 || item.access === 2 && parent?.access === 5 //Allow anonymous
              ? 5
              : 3; // Any authenticated
    return (
      <>
        {(item.type === "Shesha.WebApi" ? <ApiOutlined /> : <InterfaceOutlined />)}
        <span 
          className='sha-component-title' 
          style={access === 1 ? { textDecoration: 'line-through', color: 'gray'} : {}}
        >
          {item.name}
          </span>
          {access === 4 && <span style={{color: 'green'}}> (permissioned)</span>}
          {access === 5 && <span style={{color: 'red'}}> (unsecured)</span>}
        
      </>
    );
  };

  return (
    <Spin spinning={isFetchingData} tip={'Fetching data...'} indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}>
      <div style={{height: props.height, overflow: 'auto'}}>
        <div className="sha-page-heading">
          <div className="sha-page-heading-left" style={{width: '100%'}}>
            <SearchBox value={searchText} onChange={setSearchText} placeholder='Search objects' />
          </div>
          <div className="sha-page-heading-right">
            {/*<Dropdown.Button icon={<DatabaseFilled />} menu={{ items: typeMenuItems }} title='Objects type' />*/}
            <Dropdown.Button icon={<DatabaseFilled />} menu={{ items: menuItems }} title='Group by' />
          </div>
        </div>


        <GrouppedObjectsTree<PermissionedObjectDto>
          items={allItems}
          openedKeys={openedKeys}
          searchText={searchText}
          groupBy={groupBy}
          defaultSelected={objectId}
          isMatch={(item, searchText) => (
            item.name?.toLowerCase().includes(searchText.toLowerCase())
            //|| item.object.toLowerCase().includes(searchText.toLowerCase())
          )}
          setOpenedKeys={setOpenedKeys}
          onChange={onChangeHandler}
          /*getIcon={(item) => {
            return (item.type === "Shesha.WebApi" ? <ApiOutlined /> : <InterfaceOutlined />);
          }}*/
          onRenterItem={renderTitle}
        />
      </div>
    </Spin>
  );
};

export default PermissionedObjectsTree;