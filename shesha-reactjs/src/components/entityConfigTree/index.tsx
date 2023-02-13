import React, { FC, MutableRefObject, useEffect, useMemo, useState } from 'react';
import { Checkbox, Dropdown, Menu, Spin } from 'antd';
import { useLocalStorage } from '../../hooks';
import SearchBox from '../formDesigner/toolboxSearchBox';
import GrouppedObjectsTree from '../grouppedObjectsTree';
import { DatabaseFilled, EyeInvisibleOutlined, LoadingOutlined, QuestionCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import { useForm } from '../..';
import { EntityConfigDto, EntityConfigDtoPagedResultDto, useEntityConfigGetMainDataList } from '../../apis/entityConfig';
import { EntityConfigType, MetadataSourceType } from '../../interfaces/metadata';
import { InterfaceOutlined } from '../../icons/interfaceOutlined';
import { ClassOutlined } from '../../icons/classOutlined';

export interface IEntityConfigTreeInstance {
  refresh: (id: string) => void;
  update: (item: EntityConfigDto) => void;
}


export interface IEntityConfigTreeProps {
  /**
   * A callback for when the value of this component changes
   */
   onChange?: (item: EntityConfigDto) => void;

   defaultSelected?: string
   entityConfigTreeRef?: MutableRefObject<IEntityConfigTreeInstance | null>;
}

export const EntityConfigTree: FC<IEntityConfigTreeProps> = (props) => {

  const [openedKeys, setOpenedKeys] = useLocalStorage('shaEntityConfig.toolbox.objects.openedKeys', ['']);
  const [searchText, setSearchText] = useLocalStorage('shaEntityConfig.toolbox.objects.search', '');
  const [groupBy, setGroupBy] = useLocalStorage('shaEntityConfig.toolbox.objects.grouping', '-');
  const [showSuppress, setShowSuppress] = useLocalStorage('shaEntityConfig.toolbox.objects.showSuppress', false);
  const [showNotImplemented, setShowNotImplemented] = useLocalStorage('shaEntityConfig.toolbox.objects.showNotImplemented', false);

  const [response, setResponse] = useState<EntityConfigDtoPagedResultDto>();

  const fetcher = useEntityConfigGetMainDataList({queryParams: {maxResultCount: 10000, sorting: 'className'}, lazy: true });
  const { loading: isFetchingData, error: fetchingDataError, data: fetchingDataResponse } = fetcher;

  const [objectId, setObjectId] = useState(null);
  const [refershId, setRefreshId] = useState(props.defaultSelected);
  
  const form = useForm(false);

  useEffect(() => {
    if (props.defaultSelected && props.defaultSelected != objectId)
      setObjectId(props.defaultSelected);
  }, [props.defaultSelected])

  useEffect(() => {
    if (Boolean(form?.getAction)){
      const action = form?.getAction(null,'onChangeId')
      if (Boolean(action)){
        action(objectId);
      }
    }
  }, [objectId])

  useEffect(() => {
    fetcher.refetch();
  }, [])

  useEffect(() => {if (!props.defaultSelected) setObjectId(null); }, [props.defaultSelected]);

  useEffect(() => {
    if (!isFetchingData) {
      if (fetchingDataResponse) {
        const fetchedData = fetchingDataResponse?.result;
        if (fetchedData) {
          setResponse(fetchedData);
          if (refershId != objectId) {
            setObjectId(refershId);
          }
        }
      }

      if (fetchingDataError) {
      }
    }
  }, [isFetchingData, fetchingDataError, fetchingDataResponse])

  const items = useMemo(() => {
    let list = response?.items ? response.items: [];
    list = !showSuppress ? list.filter(item => !item.suppress) : list;
    list = !showNotImplemented ? list.filter(item => !item.notImplemented) : list;
    return list;
  }, [response, showSuppress, showNotImplemented])

  //useEffect(() => {fetcher.refetch();}, [showSuppress])

  const refresh = (id: string) => {
    fetcher.refetch();
    setRefreshId(id);
  }

  const update = (item: EntityConfigDto) => {
    setResponse((prev) => { 
      return {...prev, items: prev.items.map(i => i.id == objectId ? {...i, className: item.className, suppress: item.suppress, module: item.module} : i)}
    });
  }

  if (props.entityConfigTreeRef) {
    props.entityConfigTreeRef.current = {
      refresh: refresh,
      update: update
    };
  }

  const onChangeHandler = (item: EntityConfigDto) => {
    setObjectId(item.id);
    if (Boolean(props.onChange))
      props.onChange(item);
  }

  const menu = (
    <Menu>
      <Menu.Item key={"1"} onClick={() => {setGroupBy('-')}}>Without grouping</Menu.Item>
      <Menu.Item key={"2"} onClick={() => {setGroupBy('namespace')}}>Group by Namespace</Menu.Item>
      <Menu.Item key={"3"} onClick={() => {setGroupBy('module')}}>Group by Module</Menu.Item>
      <Menu.Item key={"4"} onClick={() => {setGroupBy('source')}}>Group by Source</Menu.Item>
      <Menu.Item key={"5"} onClick={() => {setGroupBy('entityConfigType')}}>Group by Type</Menu.Item>
    </Menu>
  );

  return (
    <Spin spinning={isFetchingData} tip={'Fetching data...'} indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}>
      <div className="sha-page-heading">
          <div className="sha-page-heading-left">
            <SearchBox value={searchText} onChange={setSearchText} placeholder='Search objects' />
          </div>
          <div className="sha-page-heading-right">
            <Dropdown.Button icon={<DatabaseFilled />} overlay={menu} title='Group by'/>
          </div>
      </div>
      <div className="sha-page-heading">
        <div className="sha-page-heading-left">
          Show suppressed entities <Checkbox checked={showSuppress} onChange={(e) => {setShowSuppress(e.target.checked);}} />
        </div>
      </div>
      <div className="sha-page-heading">
        <div className="sha-page-heading-left">
          Show not implemented entities <Checkbox checked={showNotImplemented} onChange={(e) => {setShowNotImplemented(e.target.checked);}} />
        </div>
      </div>

      <GrouppedObjectsTree<EntityConfigDto>
        items={items}
        openedKeys={openedKeys}
        searchText={searchText}
        groupBy={groupBy}
        defaultSelected={objectId}
        isMatch={(item, searchText) => {
          return item.className?.toLowerCase().includes(searchText?.toLowerCase()) 
            || item.friendlyName?.toLowerCase().includes(searchText?.toLowerCase());}}
        setOpenedKeys={setOpenedKeys}
        onChange={onChangeHandler}
        onGetGroupName={(gb, name) => {
          if (gb == 'source'){
            switch(name.toString()) {
              case '1': return "Application Entities";
              case '2': return "User defined Entities";
            }
          }
          if (gb == 'entityConfigType'){
            switch(name.toString()) {
              case '1': return "Entities";
              case '2': return "Json entities";
            }
          }
          return name;
        }}
        onRenterItem={(item) => { 
          return <>
            {item.suppress
              ? <EyeInvisibleOutlined />
              : item.source == MetadataSourceType.UserDefined
                ? <UserAddOutlined />
                : item.notImplemented
                  ? <QuestionCircleOutlined />
                  : item.entityConfigType == EntityConfigType.Interface
                    ? <InterfaceOutlined />
                    : <ClassOutlined />
            }
            <span className='sha-component-title'> {item.className}</span>
          </>
        }}
      />
    </Spin>
  );
}

export default EntityConfigTree;