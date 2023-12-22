import GrouppedObjectsTree from '@/components/grouppedObjectsTree';
import React, { FC, useEffect, useState } from 'react';
import SearchBox from '../formDesigner/toolboxSearchBox';
import { DatabaseFilled, LoadingOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps, Spin } from 'antd';
import { PermissionedObjectDto, usePermissionedObjectGetAllTree } from '@/apis/permissionedObject';
import { useForm } from '@/providers';
import { useLocalStorage } from '@/hooks';

type MenuItem = MenuProps['items'][number];

export interface IPermissionedObjectsTreeProps {
  objectsType?: string;

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

  const typeMenuItems: MenuItem[] = [
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
  ];
  
  return (
    <Spin spinning={isFetchingData} tip={'Fetching data...'} indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}>
      <div className="sha-page-heading">
        <div className="sha-page-heading-left">
          <SearchBox value={searchText} onChange={setSearchText} placeholder='Search objects' />
        </div>
        <div className="sha-page-heading-right">
          <Dropdown.Button icon={<DatabaseFilled />} menu={{ items: typeMenuItems }} title='Objects type' />
          <Dropdown.Button icon={<DatabaseFilled />} menu={{ items: menuItems }} title='Group by' />
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
            || item.name?.toLowerCase().includes(searchText.toLowerCase());
        }}
        setOpenedKeys={setOpenedKeys}
        onChange={onChangeHandler}
      />
    </Spin>
  );
};

export default PermissionedObjectsTree;