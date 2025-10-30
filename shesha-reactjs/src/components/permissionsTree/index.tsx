import React, { ReactNode, useEffect, useRef, useState, FC } from 'react';
import SearchBox from '../formDesigner/toolboxSearchBox';
import { IUpdateItemArguments, updateItemArgumentsForm } from './update-item-arguments';
import { Key } from 'rc-tree/lib/interface';
import {
  App,
  Space,
  Tag,
  Tooltip,
  Tree,
  TreeProps,
} from 'antd';
import { IConfigurableActionConfiguration, useConfigurableAction, useConfigurableActionDispatcher } from '@/providers';
import { useLocalStorage } from 'react-use';
import {
  PermissionDto,
  usePermissionGetAllTree,
  usePermissionUpdateParent,
  usePermissionDelete,
} from '@/apis/permission';
import { GuidEntityReferenceDto } from '@/apis/common';
import { useShaFormInstanceOrUndefined } from '@/providers/form/providers/shaFormProvider';
import { ShaSpin, useAvailableConstantsData } from '@/index';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';

interface IDataNode {
  title: JSX.Element;
  key: string;
  isLeaf?: boolean;
  children?: IDataNode[];
  icon?: ReactNode;
  checkable?: boolean;
  selectable?: boolean;
}

interface IPermissionModule {
  moduleName: string;
  permissions: PermissionDto[];
}

export type PermissionsTreeMode = 'Edit' | 'Select' | 'View';

export interface IPermissionsTreeProps {
  formComponentId: string;
  formComponentName: string;
  value?: string[];
  updateKey?: string;
  onChange?: (values?: string[]) => void;
  /**
   * If true, the automplete will be in read-only mode. This is not the same sa disabled mode
   */
  readOnly?: boolean;
  height?: number;
  mode: PermissionsTreeMode;

  hideSearch?: boolean;
  searchText?: string;

  onSelectAction?: IConfigurableActionConfiguration;
}

const emptyId = '_';
const withoutModule = '[no-module]';

const getErrorMessageOrDefault = (error: unknown, defaultMessage: string = "Unknown error"): string => {
  return typeof (error) === 'object' && 'message' in error && typeof (error.message) === 'string' ? error.message : defaultMessage;
};

export const PermissionsTree: FC<IPermissionsTreeProps> = ({ value, onChange, onSelectAction, ...rest }) => {
  const { message } = App.useApp();
  const [openedKeys, setOpenedKeys] = useLocalStorage('shaPermissions.toolbox.objects.openedKeys', ['']);
  const [searchText, setSearchText] = useLocalStorage('shaPermissions.toolbox.objects.search', '');

  const [visibleNodes, setVisibleNodes] = useState<IDataNode[]>();
  const [allItems, setAllItems] = useState<PermissionDto[]>(null);
  const [allModules, setAllModules] = useState<GuidEntityReferenceDto[]>(null);
  const [firstExpand, setFirstExpand] = useState(true);

  const [checked, setChecked] = useState<Key[]>([]);
  const [expanded, setExpanded] = useState<Key[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [dragInfo, setDragInfo] = useState<any>();

  const [doSelect, setDoSelect] = useState<string>(null);

  const fetcher = usePermissionGetAllTree({ queryParams: {}, lazy: true });
  const { loading: isFetchingData, error: fetchingDataError, data: fetchingDataResponse } = fetcher;
  const updateParentRequest = usePermissionUpdateParent();
  const { loading: isParentUpdating, error: updateParentDataError } = updateParentRequest;
  const deleteRequest = usePermissionDelete();
  const { loading: isDeleting, error: deleteDataError } = deleteRequest;

  const shaForm = useShaFormInstanceOrUndefined();
  const { setFormMode } = shaForm ?? {};

  const { executeAction } = useConfigurableActionDispatcher();
  const allData = useRef<any>({});
  allData.current = useAvailableConstantsData();

  useEffect(() => {
    if (rest.mode === 'Select' && allItems) return; // skip refetch for selectmode if fetched

    fetcher.refetch();
    setSearchText('');
  }, []);

  useEffect(() => {
    setChecked(value);
  }, [value]);

  // do autoexpand only for new object
  useEffect(() => {
    const exp = openedKeys ?? [];
    const expand = (key: string): void => {
      if (!exp.find((e) => e === key)) {
        exp.push(key);
      }
    };
    if (allItems) {
      if (value) {
        const f = (list: PermissionDto[]): void => {
          list.forEach((item) => {
            if (item.child?.length > 0 && item.child.find((c) => value.find((v) => v === c.id))) {
              if (exp.find((e) => e === item.id))
                expand(item.id);
              f(item.child);
            }
          });
        };
        f(allItems);
      }

      const modules: GuidEntityReferenceDto[] = [];
      const sorted = [...allItems].sort((a, b) => a.module?._displayName.localeCompare(b.module?._displayName));

      sorted?.forEach((item) => {
        if (!modules.find((m) => m?.id === item.module?.id))
          modules.push(item.module);
      });

      if (firstExpand)
        modules.forEach((m) => expand(m?._displayName ?? withoutModule));
      setFirstExpand(false);

      setAllModules(modules);
      setExpanded(exp);
      setOpenedKeys(exp);
    }
  }, [allItems]);

  useEffect(() => {
    if (!isFetchingData) {
      if (isAjaxSuccessResponse(fetchingDataResponse)) {
        const fetchedData = fetchingDataResponse.result;
        if (fetchedData)
          setAllItems(fetchedData);
      }

      if (fetchingDataError) {
        message.error(fetchingDataError.message);
      }
    }
  }, [isFetchingData, fetchingDataError, fetchingDataResponse]);

  const onCheck: TreeProps['onCheck'] = (keys, _info): void => {
    if (rest.readOnly) return;
    if (!keys || Array.isArray(keys))
      return;
    setChecked(keys.checked);
    if (Boolean(onChange))
      onChange(
        keys.checked.map((item) => {
          return item.toString();
        }),
      );
  };

  const onExpand = (keys: Key[]): void => {
    setExpanded(keys);
    setOpenedKeys(keys.map((item) => item.toString()));
  };

  const findItem = (items: PermissionDto[], key: string): PermissionDto => {
    let res = null;
    let i = 0;
    while (items && !res && i < items.length) {
      res = items[i]?.id === key ? items[i] : null;
      if (!res) {
        res = findItem(items[i].child, key);
      }
      i++;
    }
    return res;
  };

  const onChangeAction = (selectedRow: PermissionDto): void => {
    if (onSelectAction?.actionName) {
      executeAction({
        actionConfiguration: onSelectAction,
        argumentsEvaluationContext: { ...allData.current, selectedRow },
      });
    }
  };

  const onSelect = (keys: Key[]): void => {
    if (!keys || keys.length === 0) {
      setSelected(null);

      onChangeAction(null);
      return;
    }

    const ids = keys.map((item) => {
      return item.toString();
    });
    const item = findItem(allItems, ids[0]);
    if (rest.mode === 'Edit') {
      if (!item.isDbPermission) {
        setFormMode?.('readonly');
      }
    }
    onChangeAction(item);
    setSelected(ids);
  };

  useEffect(() => {
    if (doSelect) {
      if (doSelect === '') {
        onSelect([]);
      } else {
        onSelect([doSelect]);
      }
      setDoSelect(null);
    }
  }, [doSelect]);

  const addPermission = (parent: PermissionDto, list: PermissionDto[]): PermissionDto => {
    const o: PermissionDto = {
      id: emptyId,
      name: 'NewPermission',
      displayName: 'New permission',
      description: '',
      parentName: parent ? parent.name : null,
      isDbPermission: true,
      parent: null,
      child: [],
    };
    list.push(o);
    return o;
  };

  const deletePermission = (): void => {
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

  const expandNode = (key: string): void => {
    if (expanded.length === 0 || !expanded.find((x) => x === key))
      setExpanded((prev) => [...prev, key]);
  };

  const expandParent = (items: PermissionDto[], item: PermissionDto): void => {
    const parent = item.parentName ? findItem(items, item.parentName) : null;
    const exp = parent ? parent.id : item.module?._displayName ?? withoutModule;
    expandNode(exp);
    if (parent)
      expandParent(items, parent);
  };

  useEffect(() => {
    if (!isDeleting && Boolean(selected[0]) && selected.length > 0) {
      if (deleteDataError) {
        message.error(getErrorMessageOrDefault(deleteDataError));
      } else {
        deletePermission();
      }
    }
  }, [isDeleting, deleteDataError]);

  useEffect(() => {
    if (!isParentUpdating && Boolean(dragInfo)) {
      if (updateParentDataError) {
        message.error(getErrorMessageOrDefault(updateParentDataError));
      } else {
        const newItems = [...allItems];
        const dragItem = findItem(newItems, dragInfo.dragNode.key);

        // remove from the old place
        if (Boolean(dragItem.parentName)) {
          const parent = findItem(newItems, dragItem.parentName);
          const index = parent.child.indexOf(dragItem);
          if (index > -1) {
            parent.child.splice(index, 1);
          }
        } else {
          const index = newItems.indexOf(dragItem);
          if (index > -1) {
            newItems.splice(index, 1);
          }
        }

        // add to the new place

        const dropItem = findItem(newItems, dragInfo.node.key);
        // drop to Permission
        if (dropItem) {
          if (!dropItem || dragInfo.dropToGap) {
            newItems.push(dragItem);
            dragItem.parentName = null;
          } else {
            dropItem.child.push(dragItem);
            dragItem.parentName = dropItem.name;
          }
        } else {
          const dropModule = allModules.find((x) => x._displayName === dragInfo.node.key);
          newItems.push(dragItem);
          dragItem.parentName = null;
          dragItem.module = dropModule;
        }

        expandParent(newItems, dragItem);
        setDragInfo(null);
        setAllItems([...newItems]);
        setDoSelect(dragItem.id);
      }
    }
  }, [isParentUpdating, updateParentDataError]);

  const onDragStart = (info): void => {
    setSelected([info.node.key]);
  };

  const onDrop = (info): void => {
    const dropItem = findItem(allItems, info.node.key);
    const dragItem = findItem(allItems, info.dragNode.key);
    if (!dragItem) return;

    if (!dragItem.isDbPermission) {
      message.warning('Permission "' + dragItem.displayName + '" is a system permission and can not be moved!');
      return;
    }

    // drop to Permission
    if (dropItem) {
      if (dragItem.parentName === dropItem.name || (!dragItem.parentName && info.dropToGap)) return;
      setDragInfo(info);
      updateParentRequest.mutate({ ...dragItem, parentName: info.dropToGap ? null : dropItem.name, module: { ...dropItem.module } });
      return;
    }

    // drop to module
    if (info.node.key === withoutModule) {
      setDragInfo(info);
      updateParentRequest.mutate({ ...dragItem, parentName: null, module: null });
      return;
    }
    const dropModule = allModules.find((x) => x._displayName === info.node.key);
    if (dropModule) {
      setDragInfo(info);
      updateParentRequest.mutate({ ...dragItem, parentName: null, module: { ...dropModule } });
    }
  };

  const getVisible = (items: PermissionDto[], searchText: string): PermissionDto[] => {
    const result: PermissionDto[] = [];
    if (!items) return result;

    items?.forEach((item) => {
      const childItems = getVisible(item.child, searchText);
      const matched =
        (searchText ?? '') === '' ||
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

  const getModules = (items: PermissionDto[]): IPermissionModule[] => {
    const result: IPermissionModule[] = [];
    if (!items) return result;

    const sorted = [...items].sort((a, b) => a.module?._displayName.localeCompare(b.module?._displayName));

    sorted?.forEach((item) => {
      const moduleName = item.module?._displayName ?? withoutModule;
      let m = result.find((m) => m.moduleName === moduleName);
      if (!m) {
        m = { moduleName: moduleName, permissions: [] };
        result.push(m);
      }
      m.permissions.push(item);
    });

    return result;
  };

  const mapItem = (item: IPermissionModule | PermissionDto): IDataNode => {
    const p = item as PermissionDto;
    if (!p.id) {
      const m = item as IPermissionModule;
      return {
        key: m.moduleName,
        title: <span>{m.moduleName}</span>,
        children: m.permissions?.map(mapItem),
        checkable: false,
        selectable: false,
      } as IDataNode;
    }
    return {
      key: p.id,
      title:
        (Boolean(p.description) && (
          <Tooltip title={p.description} mouseEnterDelay={1}>
            <span>
              {!p.isDbPermission ? <Tag>sys</Tag> : null} {p.displayName ?? p.name}
            </span>
          </Tooltip>
        )) ||
        (!Boolean(p.description) && (
          <span>
            {!p.isDbPermission ? <Tag>sys</Tag> : null} {p.displayName ?? p.name}
          </span>
        )),
      children: p.child?.map(mapItem),
      checkable: rest.mode === 'Select',
      selectable: true,
    } satisfies IDataNode;
  };

  const updateTree = (): void => {
    const visible = getVisible(allItems, rest.hideSearch ? rest.searchText : searchText);
    if (searchText || rest.searchText) {
      const nodes = [];
      const f = (item: PermissionDto): void => {
        if (item.child.length > 0) {
          item.child.forEach(f);
          // nodes.push(...item.child.map(f));
        } else {
          nodes.push(item);
        }
      };
      visible.forEach(f);
      nodes.forEach((n) => expandParent(allItems, n));
    }
    setVisibleNodes(getModules(visible).map(mapItem));
  };

  useEffect(() => {
    updateTree();
  }, [allItems, searchText, rest.hideSearch, rest.searchText]);

  useConfigurableAction(
    {
      name: 'Update item',
      description: 'Update Permission Tree item',
      owner: rest.formComponentName,
      ownerUid: rest.formComponentId,
      hasArguments: true,
      argumentsFormMarkup: updateItemArgumentsForm,
      executer: (arg: IUpdateItemArguments) => {
        const item = findItem(allItems, selected[0]);
        if (rest.mode === 'Edit' && item) {
          item.id = arg.name;
          item.name = arg.name;
          item.displayName = arg.displayName;
          item.description = arg.description;
          item.module = arg.moduleId ? { id: arg.moduleId, _displayName: arg.moduleName } : null;
          setAllItems([...allItems]);
          setSelected([item.id]);
          setSearchText('');
          updateTree();
        }

        return Promise.resolve();
      },
    },
  );

  useConfigurableAction(
    {
      name: 'Create root',
      description: 'Create root Permission Tree item',
      owner: rest.formComponentName,
      ownerUid: rest.formComponentId,
      hasArguments: false,
      executer: () => {
        let s = findItem(allItems, emptyId);
        if (!s) {
          setAllItems((prev) => {
            addPermission(null, prev);
            return [...prev];
          });
        } else {
          message.warning('A new permission is already added! Please edit it first.');
          expandParent(allItems, s);
        }
        setDoSelect(emptyId);
        setSearchText('');
        setFormMode?.('edit');

        return Promise.resolve();
      },
    },
  );

  useConfigurableAction(
    {
      name: 'Create child',
      description: 'Create child Permission Tree item',
      owner: rest.formComponentName,
      ownerUid: rest.formComponentId,
      hasArguments: false,
      executer: () => {
        const newItems = [...allItems];
        let s = findItem(newItems, emptyId);
        if (!s) {
          s = findItem(newItems, selected[0]);
          if (s) {
            if (!s.child) s.child = [];
            s = addPermission(s, s.child);
            setAllItems([...newItems]);
          }
        } else {
          message.warning('A new permission is already added! Please edit it first.');
        }
        expandParent(newItems, s);
        setDoSelect(emptyId);
        setSearchText('');
        setFormMode?.('edit');

        return Promise.resolve();
      },
    },
  );

  useConfigurableAction(
    {
      name: 'Delete item',
      description: 'Delete Permission Tree item',
      owner: rest.formComponentName,
      ownerUid: rest.formComponentId,
      hasArguments: false,
      executer: () => {
        const s = findItem(allItems, selected[0]);
        if (s) {
          if (!s.isDbPermission) {
            message.warning('Permission "' + s.displayName + '" is a system permission and can not be deleted!');
            return Promise.resolve();
          }
          if (s.id === emptyId) {
            deletePermission();
          } else {
            deleteRequest.mutate({ name: s.name });
          }
        }
        setSearchText('');

        return Promise.resolve();
      },
    },
  );

  const getLoadingHint = (): string => {
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
      <ShaSpin spinning={isFetchingData || isDeleting || isParentUpdating} tip={getLoadingHint()}>
        {!rest.hideSearch && <SearchBox value={searchText} onChange={setSearchText} placeholder="Search objects" />}
        <Tree
          expandedKeys={expanded}
          defaultExpandAll
          checkable={rest.mode === 'Select'}
          selectable={!rest.readOnly}
          draggable={rest.mode === 'Edit' && !rest.readOnly}
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
      </ShaSpin>
    </Space>
  );
};
