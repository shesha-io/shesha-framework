import GrouppedObjectsTree from '@/components/grouppedObjectsTree';
import React, { FC, MutableRefObject, useEffect, useMemo, useState } from 'react';
import SearchBox from '../formDesigner/toolboxSearchBox';
import {
  Button,
  Checkbox,
  Dropdown,
  MenuProps,
  Tag
} from 'antd';
import { ClassOutlined } from '@/icons/classOutlined';
import {
  DatabaseFilled,
  EyeInvisibleOutlined,
  QuestionCircleOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { EntityConfigDto, EntityConfigDtoPagedResultDto, useEntityConfigGetMainDataList } from '@/apis/entityConfig';
import { EntityConfigType, MetadataSourceType } from '@/interfaces/metadata';
import { InterfaceOutlined } from '@/icons/interfaceOutlined';
import { useLocalStorage } from '@/hooks';
import { ConfigurationItemVersionStatusMap } from '@/utils/configurationFramework/models';
import { useStyles } from './styles/styles';
import SectionSeparator from '../sectionSeparator';
import { useConfigurableFormActions } from '@/providers/form/actions';
import { ShaSpin } from '..';

type MenuItem = MenuProps['items'][number];

export interface IEntityConfigTreeInstance {
  refresh: (id: string) => void;
  update: (item: EntityConfigDto) => void;
}

export interface IEntityConfigTreeProps {
  /**
   * A callback for when the value of this component changes
   */
  onChange?: (item: EntityConfigDto) => void;

  defaultSelected?: string;
  entityConfigTreeRef?: MutableRefObject<IEntityConfigTreeInstance | null>;
}

export const EntityConfigTree: FC<IEntityConfigTreeProps> = (props) => {
  const [openedKeys, setOpenedKeys] = useLocalStorage('shaEntityConfig.toolbox.objects.openedKeys', ['']);
  const [searchText, setSearchText] = useLocalStorage('shaEntityConfig.toolbox.objects.search', '');
  const [groupBy, setGroupBy] = useLocalStorage('shaEntityConfig.toolbox.objects.grouping', '-');
  const [showSuppress, setShowSuppress] = useLocalStorage('shaEntityConfig.toolbox.objects.showSuppress', false);
  const [showNotImplemented, setShowNotImplemented] = useLocalStorage(
    'shaEntityConfig.toolbox.objects.showNotImplemented',
    false
  );

  const [response, setResponse] = useState<EntityConfigDtoPagedResultDto>();

  const fetcher = useEntityConfigGetMainDataList({
    queryParams: { maxResultCount: 10000, sorting: 'className' },
    lazy: true,
  });
  const { loading: isFetchingData, error: fetchingDataError, data: fetchingDataResponse } = fetcher;

  const [objectId, setObjectId] = useState(null);
  const [refershId, setRefreshId] = useState(props.defaultSelected);

  const { onChangeId } = useConfigurableFormActions(false) ?? {};

  const {styles} = useStyles();

  useEffect(() => {
    if (props.defaultSelected && props.defaultSelected !== objectId) setObjectId(props.defaultSelected);
  }, [props.defaultSelected]);

  useEffect(() => {
    onChangeId?.(objectId);
  }, [objectId]);

  useEffect(() => {
    fetcher.refetch();
  }, []);

  useEffect(() => {
    if (!props.defaultSelected) setObjectId(null);
  }, [props.defaultSelected]);

  useEffect(() => {
    if (!isFetchingData) {
      if (fetchingDataResponse) {
        const fetchedData = fetchingDataResponse?.result;
        if (fetchedData) {
          setResponse(fetchedData);
          if (refershId !== objectId) {
            setObjectId(refershId);
          }
        }
      }
    }
  }, [isFetchingData, fetchingDataError, fetchingDataResponse]);

  const items = useMemo(() => {
    let list = response?.items ? response.items : [];
    list = !showSuppress ? list.filter((item) => !item.suppress) : list;
    list = !showNotImplemented ? list.filter((item) => !item.notImplemented) : list;
    return list;
  }, [response, showSuppress, showNotImplemented]);

  //useEffect(() => {fetcher.refetch();}, [showSuppress])

  const refresh = (id: string) => {
    fetcher.refetch();
    setRefreshId(id);
  };

  const update = (item: EntityConfigDto) => {
    setResponse((prev) => {
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === objectId ? { ...i, className: item.className, suppress: item.suppress, module: item.module } : i
        ),
      };
    });
  };

  if (props.entityConfigTreeRef) {
    props.entityConfigTreeRef.current = {
      refresh: refresh,
      update: update,
    };
  }

  const onChangeHandler = (item: EntityConfigDto) => {
    setObjectId(item.id);
    if (Boolean(props.onChange)) props.onChange(item);
  };

  const groupByMenuItems: MenuItem[] = [
    {
      key: '1',
      label: 'Without grouping',
      onClick: () => {
        setGroupBy('-');
      },
    },
    {
      key: '2',
      label: 'Group by Namespace',
      onClick: () => {
        setGroupBy('namespace');
      },
    },
    {
      key: '3',
      label: 'Group by Module',
      onClick: () => {
        setGroupBy('module');
      },
    },
    {
      key: '4',
      label: 'Group by Source',
      onClick: () => {
        setGroupBy('source');
      },
    },
    {
      key: '5',
      label: 'Group by Type',
      onClick: () => {
        setGroupBy('entityConfigType');
      },
    },
    {
      key: '6',
      label: (
        <div>
          <SectionSeparator />
          <div className="sha-page-heading">
            <div className="sha-page-heading-left">
              <Checkbox
                checked={showSuppress}
                onChange={(e) => {
                  setShowSuppress(e.target.checked);
                }}
              />{' '}
              Show suppressed entities
            </div>
          </div>
          <div className="sha-page-heading" style={{ borderBottom: 'unset' }}>
            <div className="sha-page-heading-left">
              <Checkbox
                checked={showNotImplemented}
                onChange={(e) => {
                  setShowNotImplemented(e.target.checked);
                }}
              />{' '}
              Show not implemented entities
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <ShaSpin spinning={isFetchingData} tip={'Fetching data...'}>
      <div className="sha-page-heading sha-paging-height">
        <div className="sha-page-heading-left" style={{width: 'calc(100% - 60px)'}}>
          <SearchBox value={searchText} onChange={setSearchText} placeholder="Search objects" />
        </div>
        <div className="sha-page-heading-right">
          <Dropdown menu={{ items: groupByMenuItems }}>
            <Button title="Group by">
              <DatabaseFilled />
            </Button>
          </Dropdown>
        </div>
      </div>
      <div className={styles.shaTreeMain}>
        <GrouppedObjectsTree<EntityConfigDto>
          items={items}
          openedKeys={openedKeys}
          searchText={searchText}
          groupBy={groupBy}
          defaultSelected={objectId}
          isMatch={(item, searchText) => {
            return (
              item.className?.toLowerCase().includes(searchText?.toLowerCase()) ||
              item.friendlyName?.toLowerCase().includes(searchText?.toLowerCase())
            );
          }}
          setOpenedKeys={setOpenedKeys}
          onChange={onChangeHandler}
          onGetGroupName={(gb, name) => {
            if (gb === 'source') {
              switch (name.toString()) {
                case '1':
                  return 'Application Entities';
                case '2':
                  return 'User defined Entities';
              }
            }
            if (gb === 'entityConfigType') {
              switch (name.toString()) {
                case '1':
                  return 'Entities';
                case '2':
                  return 'Json entities';
              }
            }
            return name;
          }}
          onRenterItem={(item) => {
            const versionStatus = ConfigurationItemVersionStatusMap[item.versionStatus];
            return <div className={styles.shaComponentParent}>
              {item.suppress
                ? <EyeInvisibleOutlined />
                : item.source === MetadataSourceType.UserDefined
                  ? <UserAddOutlined />
                  : item.notImplemented
                    ? <QuestionCircleOutlined />
                    : item.entityConfigType === EntityConfigType.Interface
                      ? <InterfaceOutlined />
                      : <ClassOutlined />
              }<span style={{paddingRight: '5px'}}> </span>
              <Tag color={versionStatus.color}>{versionStatus.text}</Tag>
              <span className={styles.shaComponentTitle}> {item.className} </span>
            </div>;
          }}
        />
      </div>
    </ShaSpin>
  );
};

export default EntityConfigTree;
