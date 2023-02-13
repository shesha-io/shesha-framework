import React, { FC, useEffect, useState } from 'react';
import { Dropdown, Menu, Spin } from 'antd';
import { useLocalStorage } from '../../hooks';
import SearchBox from '../formDesigner/toolboxSearchBox';
import GrouppedObjectsTree from '../grouppedObjectsTree';
import { PermissionedObjectDto, usePermissionedObjectGetAllTree } from '../../apis/permissionedObject';
import { DatabaseFilled, LoadingOutlined } from '@ant-design/icons';
import { useForm } from '../..';

export interface IPermissionedObjectsTreeProps {
  objectsType?: string,

  /**
   * A callback for when the value of this component changes
   */
   onChange?: any;
}

export const PermissionedObjectsTree: FC<IPermissionedObjectsTreeProps> = (props) => {

  const [openedKeys, setOpenedKeys] = useLocalStorage('shaPermissionedObjects.toolbox.objects.openedKeys.' + props.objectsType, ['']);
  const [searchText, setSearchText] = useLocalStorage('shaPermissionedObjects.toolbox.objects.search.' + props.objectsType, '');
  const [groupBy, setGroupBy] = useLocalStorage('shaPermissionedObjects.toolbox.objects.grouping.' + props.objectsType, '-');
  const [objectsType, setObjectsType] = useLocalStorage('shaPermissionedObjects.toolbox.objects.type', null);

  const [allItems, setAllItems] = useState<PermissionedObjectDto[]>();

  const fetcher = usePermissionedObjectGetAllTree({queryParams: {type: objectsType ?? props.objectsType}, lazy: true });
  const { loading: isFetchingData, error: fetchingDataError, data: fetchingDataResponse } = fetcher;

  const [objectId, setObjectId] = useState("");
  
  const { getAction} = useForm(false);

  useEffect(() => {
    if (Boolean(getAction)){
      const action = getAction(null,'onChangeId')
      if (Boolean(action)){
        action(objectId);
      }
    }
  }, [objectId])

  useEffect(() => {
    fetcher.refetch();
  }, [objectsType])

  useEffect(() => {
    if (!isFetchingData) {
      if (fetchingDataResponse) {
        const fetchedData = fetchingDataResponse?.result;
        if (fetchedData) {
          setAllItems(fetchedData);
        }
      }

      if (fetchingDataError) {
      }
    }
  }, [isFetchingData, fetchingDataError, fetchingDataResponse])

  const onChangeHandler = (item: PermissionedObjectDto) => {
    setObjectId(item.id);
    if (Boolean(props.onChange))
      props.onChange(item.id);
  }

  const menu = (
    <Menu>
      <Menu.Item key={"1"} onClick={() => {setGroupBy("-")}}>Without grouping</Menu.Item>
      <Menu.Item key={"2"} onClick={() => {setGroupBy("module")}}>Group by Module</Menu.Item>
      <Menu.Item key={"3"} onClick={() => {setGroupBy("category")}}>Group by Category</Menu.Item>
    </Menu>
  );

  const typeMenu = (
    <Menu>
      <Menu.Item key={"1"} onClick={() => {setObjectsType("Shesha.WebApi")}}>API</Menu.Item>
      <Menu.Item key={"2"} onClick={() => {setObjectsType("Shesha.WebCrudApi")}}>CRUD API</Menu.Item>
      <Menu.Item key={"3"} onClick={() => {setObjectsType("Shesha.Entity")}}>Entities</Menu.Item>
    </Menu>
  );

  return (
    <Spin spinning={isFetchingData} tip={'Fetching data...'} indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}>
      <div className="sha-page-heading">
        <div className="sha-page-heading-left">
          <SearchBox value={searchText} onChange={setSearchText} placeholder='Search objects' />
        </div>
        <div className="sha-page-heading-right">
          <Dropdown.Button icon={<DatabaseFilled />} overlay={typeMenu} title='Objects type'/>
          <Dropdown.Button icon={<DatabaseFilled />} overlay={menu} title='Group by'/>
        </div>
      </div>
      
      <GrouppedObjectsTree<PermissionedObjectDto>
        items={allItems}
        openedKeys={openedKeys}
        searchText={searchText}
        groupBy={groupBy}
        defaultSelected={objectId}
        isMatch={(item, searchText) => {
          return item.object.toLowerCase().includes(searchText.toLowerCase()) 
          || item.name?.toLowerCase().includes(searchText.toLowerCase());}}
        setOpenedKeys={setOpenedKeys}
        onChange={onChangeHandler}
      />
    </Spin>
  );
}

export default PermissionedObjectsTree;