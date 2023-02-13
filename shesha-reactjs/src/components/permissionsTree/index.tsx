import { LoadingOutlined } from '@ant-design/icons';
import { message, Space, Spin, Tooltip, Tree, Tag } from 'antd';
import { DataNode, EventDataNode } from 'antd/lib/tree';
import React, { Key, ReactNode, useEffect, useState } from 'react';
import { FC } from 'react';
import { useLocalStorage } from 'react-use';
import { useForm, useSubscribe } from '../..';
import {
  PermissionDto,
  usePermissionGetAllTree,
  usePermissionUpdateParent,
  usePermissionDelete,
} from '../../apis/permission';
import { DynamicFormPubSubConstants } from '../../pages/dynamic/pubSub';
import SearchBox from '../formDesigner/toolboxSearchBox';

export interface IDataNode {
  title: JSX.Element;
  key: string;
  isLeaf?: boolean;
  children?: IDataNode[];
  icon?: ReactNode;
}

// note: antd types were changed, CustomEventDataNode was added to fix build, to be reviewed later
interface CustomEventDataNode extends EventDataNode<{}>{}

export interface ICheckInfo {
  event: 'check';
  node: CustomEventDataNode;
  checked: boolean;
  nativeEvent: MouseEvent;
  checkedNodes: DataNode[];
  checkedNodesPositions?: {
    node: DataNode;
    pos: string;
  }[];
  halfCheckedKeys?: Key[];
}

export type PermissionsTreeMode = 'Edit' | 'Select' | 'View';

interface IPermissionsTreeProps {
  formComponentId: string;
  value?: string[];
  updateKey?: string;
  onChange?: (values?: string[]) => void;
  /**
   * Whether this control is disabled
   */
  disabled?: boolean;
  /**
   * If true, the automplete will be in read-only mode. This is not the same sa disabled mode
   */
  readOnly?: boolean;
  height?: number;
  mode: PermissionsTreeMode;
}

const emptyId = '_';

export const PermissionsTree: FC<IPermissionsTreeProps> = ({ value, onChange, ...rest }) => {
  const [openedKeys, setOpenedKeys] = useLocalStorage('shaPermissions.toolbox.objects.openedKeys', ['']);
  const [searchText, setSearchText] = useLocalStorage('shaPermissions.toolbox.objects.search', '');

  const [visibleNodes, setVisibleNodes] = useState<IDataNode[]>();
  const [allItems, setAllItems] = useState<PermissionDto[]>(null);
  const [checked, setChecked] = useState<Key[]>([]);
  const [expanded, setExpanded] = useState<Key[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [dragInfo, setDragInfo] = useState<any>();

  const [doUpdateTree, setDoUpdateTree] = useState<Boolean>(false);
  const [doCreate, setDoCreate] = useState<Boolean>(false);
  const [doCreateRoot, setDoCreateRoot] = useState<Boolean>(false);
  const [doDelete, setDoDelete] = useState<Boolean>(false);
  const [doSelect, setDoSelect] = useState<string>(null);

  const fetcher = usePermissionGetAllTree({ queryParams: {}, lazy: true });
  const { loading: isFetchingData, error: fetchingDataError, data: fetchingDataResponse } = fetcher;
  const updateParentRequest = usePermissionUpdateParent({ queryParams: {} });
  const { loading: isParentUpdating, error: updateParentDataError } = updateParentRequest;
  const deleteRequest = usePermissionDelete({ queryParams: {} });
  const { loading: isDeleting, error: deleteDataError } = deleteRequest;

  const { getAction, registerActions, formData, setFormMode } = useForm(false);

  useEffect(() => {
    if (rest.mode == 'Select' && allItems != null) return; // skip refetch for selectmode if fetched

    fetcher.refetch();
    setSearchText('');
  }, []);

  useEffect(() => {
    setChecked(value);
  }, [value]);

  // do autoexpand only for new object
  useEffect(() => {
    if (Boolean(allItems) && Boolean(value)) {
      const exp = openedKeys;
      const f = (list: PermissionDto[]) => {
        list.forEach(item => {
          const i = item.child.find(c => {
            return value.find(v => {
              return v == c.id;
            });
          });
          if (item.child?.length > 0 && Boolean(i)) {
            if (
              !Boolean(
                exp.find(e => {
                  return e == item.id;
                })
              )
            )
              exp.push(item.id);
            f(item.child);
          }
        });
      };
      f(allItems);
      setExpanded(exp);
      setOpenedKeys(exp);
    }
  }, [allItems]);

  useEffect(() => {
    if (!isFetchingData) {
      if (fetchingDataResponse) {
        const fetchedData = fetchingDataResponse?.result;
        if (fetchedData) {
          setAllItems(fetchedData);
          if (rest.mode != 'Select')
            registerActions(null, { createRootPermission, createPermission, deletePermission });
        }
      }

      if (fetchingDataError) {
        message.error(fetchingDataError.message);
      }
    }
  }, [isFetchingData, fetchingDataError, fetchingDataResponse]);

  const onCheck = (keys: any, _info: ICheckInfo) => {
    if (rest.readOnly) return;
    setChecked(keys?.checked);
    if (Boolean(onChange))
      onChange(
        keys?.checked.map(item => {
          return item.toString();
        })
      );
  };

  const onExpand = (keys: Key[]) => {
    setExpanded(keys);
    setOpenedKeys(
      keys.map(item => {
        return item.toString();
      })
    );
  };

  useEffect(() => {
    if (doSelect != null) {
      if (doSelect == '') {
        onSelect([]);
      } else {
        onSelect([doSelect]);
      }
      setDoSelect(null);
    }
  }, [doSelect]);

  const onSelect = (keys: Key[]) => {
    if (!keys || keys.length === 0) {
      setSelected(null);
      if (Boolean(getAction)) {
        const action = getAction(rest.formComponentId, 'onChangeFormData');
        if (Boolean(action)) {
          action({ values: { id: null }, mergeValues: false });
        }
      }
      return;
    }

    const ids = keys.map(item => {
      return item.toString();
    });
    const item = findItem(allItems, ids[0]);
    if (rest.mode == 'Edit' && Boolean(getAction)) {
      if (!item.isDbPermission) {
        setFormMode('readonly');
      }
      if (item.id == emptyId) {
        const action = getAction(rest.formComponentId, 'onChangeFormData');
        if (Boolean(action)) {
          action({ values: item, mergeValues: false });
        }
      } else {
        const action = getAction(rest.formComponentId, 'onChangeId');
        if (Boolean(action)) {
          action(ids[0]);
        }
      }
    }
    setSelected(ids);
  };

  const findItem = (items: PermissionDto[], key: string): PermissionDto => {
    let res = null;
    let i = 0;
    while (items != null && res == null && i < items.length) {
      res = items[i]?.id == key ? items[i] : null;
      if (res == null) {
        res = findItem(items[i].child, key);
      }
      i++;
    }
    return res;
  };

  const addPermission = (parent: PermissionDto, list: PermissionDto[]) => {
    const o = {
      id: emptyId,
      name: 'NewPermission',
      displayName: 'New permission',
      description: '',
      parentName: parent != null ? parent.name : null,
      isDbPermission: true,
      parent: null,
    };
    list.push(o);
    return o;
  };

  const expandParent = item => {
    if (Boolean(item.parentName)) {
      const parent = findItem(allItems, item.parentName);
      if (parent != null) {
        if (
          expanded.find(x => {
            return x == parent.id;
          }) == null
        ) {
          setExpanded(prev => {
            return [...prev, parent.id];
          });
        }
        expandParent(parent);
      }
    }
  };

  useEffect(() => {
    if (doUpdateTree && Boolean(formData)) {
      const item = findItem(allItems, selected[0]);
      if (rest.mode == 'Edit' && item != null) {
        item.id = formData.name;
        item.name = formData.name;
        item.displayName = formData.displayName;
        item.description = formData.description;
        setAllItems([...allItems]);
        setDoSelect(item.id);
        setDoUpdateTree(false);
        setSearchText('');
      }
    }
  }, [doUpdateTree]);

  useSubscribe(DynamicFormPubSubConstants.DataSaved, () => {
    if (rest.mode == 'Edit') setDoUpdateTree(true);
  });

  useEffect(() => {
    if (doCreateRoot) {
      let s = findItem(allItems, emptyId);
      if (s == null) {
        setAllItems(prev => {
          addPermission(null, prev);
          return [...prev];
        });
      } else {
        message.warning('A new permission is already added! Please edit it first.');
        expandParent(s);
      }
      setDoSelect(emptyId);
      setDoCreateRoot(false);
      setSearchText('');
      setFormMode('edit');
    }
  }, [doCreateRoot]);

  const createRootPermission = () => {
    setDoCreateRoot(true);
  };

  useEffect(() => {
    if (doCreate) {
      let s = findItem(allItems, emptyId);
      if (s == null) {
        s = findItem(allItems, selected[0]);
        if (s != null) {
          if (s.child == null) s.child = [];
          s = addPermission(s, s.child);
          setAllItems([...allItems]);
        }
      } else {
        message.warning('A new permission is already added! Please edit it first.');
      }
      expandParent(s);
      setDoSelect(emptyId);
      setDoCreate(false);
      setSearchText('');
      setFormMode('edit');
    }
  }, [doCreate]);

  const createPermission = () => {
    setDoCreate(true);
  };

  useEffect(() => {
    if (!isDeleting && Boolean(selected[0]) && selected.length > 0) {
      if (deleteDataError) {
        message.error(deleteDataError.message);
      } else {
        _delete();
      }
    }
  }, [isDeleting, deleteDataError]);

  const _delete = () => {
    const s = findItem(allItems, selected[0]);
    if (Boolean(s.parentName)) {
      setDoSelect(s.parentName);
      const p = findItem(allItems, s.parentName);
      if (p && p.child) {
        const index = p.child.indexOf(s);
        if (index > -1) p.child.splice(index, 1);
      }
    } else {
      setDoSelect('');
      const index = allItems.indexOf(s);
      if (index > -1) allItems.splice(index, 1);
    }

    setAllItems([...allItems]);
  };

  useEffect(() => {
    if (doDelete) {
      const s = findItem(allItems, selected[0]);
      if (s != null) {
        if (!s.isDbPermission) {
          message.warning('Permission "' + s.displayName + '" is a system permission and can not be deleted!');
          return;
        }
        if (s.id == emptyId) {
          _delete();
        } else {
          deleteRequest.mutate(null, { queryParams: { name: s.name } });
        }
      }
      setDoDelete(false);
      setSearchText('');
    }
  }, [doDelete]);

  const deletePermission = () => {
    setDoDelete(true);
  };

  useEffect(() => {
    if (!isParentUpdating && Boolean(dragInfo)) {
      if (updateParentDataError) {
        message.error(updateParentDataError.message);
      } else {
        const dropItem = findItem(allItems, dragInfo.node.key);
        const dragItem = findItem(allItems, dragInfo.dragNode.key);

        // remove from the old place
        if (Boolean(dragItem.parentName)) {
          const parent = findItem(allItems, dragItem.parentName);
          const index = parent.child.indexOf(dragItem);
          if (index > -1) {
            parent.child.splice(index, 1);
          }
        } else {
          const index = allItems.indexOf(dragItem);
          if (index > -1) {
            allItems.splice(index, 1);
          }
        }

        // add to the new place
        if (dragInfo.dropToGap) {
          allItems.push(dragItem);
          dragItem.parentName = null;
        } else {
          dropItem.child.push(dragItem);
          dragItem.parentName = dropItem.name;
        }

        expandParent(dragItem);
        setDragInfo(null);
        setAllItems([...allItems]);
        setDoSelect(dragItem.id);
      }
    }
  }, [isParentUpdating, updateParentDataError]);

  const onDragStart = info => {
    setSelected([info.node.key]);
  };

  const onDrop = info => {
    const dropItem = findItem(allItems, info.node.key);
    const dragItem = findItem(allItems, info.dragNode.key);

    if (dragItem.parentName == dropItem.name || (!Boolean(dragItem.parentName) && info.dropToGap)) return;

    if (!dragItem.isDbPermission) {
      message.warning('Permission "' + dragItem.displayName + '" is a system permission and can not be moved!');
      return;
    }

    setDragInfo(info);
    updateParentRequest.mutate({ ...dragItem, parentName: info.dropToGap ? null : dropItem.name });
  };

  useEffect(() => {
    setVisibleNodes(getVisible(allItems, searchText).map(mapItem));
  }, [allItems, searchText]);

  const getVisible = (items: PermissionDto[], searchText: string): PermissionDto[] => {
    const result: PermissionDto[] = [];
    if (!items) return result;

    items?.forEach(item => {
      const childItems = getVisible(item.child, searchText);
      const matched =
        (searchText ?? '') == '' ||
        item.displayName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchText.toLowerCase());

      if (matched || childItems.length > 0) {
        const filteredItem: PermissionDto = { ...item, child: childItems };
        result.push(filteredItem);
      }
    });

    return result;
  };

  const mapItem = (item: PermissionDto) => {
    return {
      key: item.id,
      title:
        (Boolean(item.description) && (
          <Tooltip title={item.description} mouseEnterDelay={1}>
            <span>
              {!item.isDbPermission ? <Tag>sys</Tag> : null} {item.displayName ?? item.name}
            </span>
          </Tooltip>
        )) ||
        (!Boolean(item.description) && (
          <span>
            {!item.isDbPermission ? <Tag>sys</Tag> : null} {item.displayName ?? item.name}
          </span>
        )),
      children: item.child?.map(mapItem),
    } as IDataNode;
  };

  const getLoadingHint = () => {
    switch (true) {
      case isFetchingData:
        return 'Fetching data...';
      case isDeleting:
      case isParentUpdating:
        return 'Saving data...';
      default:
        return 'Loading...';
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Spin
        spinning={isFetchingData || isDeleting || isParentUpdating}
        tip={getLoadingHint()}
        indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
      >
        <SearchBox value={searchText} onChange={setSearchText} placeholder="Search objects" />
        <Tree
          disabled={rest.disabled}
          expandedKeys={expanded}
          defaultExpandAll
          checkable={rest.mode == 'Select'}
          draggable={rest.mode == 'Edit'}
          onCheck={onCheck}
          onExpand={onExpand}
          onSelect={onSelect}
          onDrop={onDrop}
          onDragStart={onDragStart}
          checkStrictly
          treeData={visibleNodes}
          checkedKeys={checked}
          selectedKeys={selected}
          height={rest.height}
        />
      </Spin>
    </Space>
  );
};
