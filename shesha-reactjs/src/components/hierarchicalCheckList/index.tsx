import { Alert, Button, Dropdown, Menu, Popover, Tree, TreeProps } from 'antd';
import { DownOutlined, InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import React, {
  ForwardRefRenderFunction,
  Fragment,
  Key,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  filterOnSelectionsChange,
  getNodeById,
  getNodeFullTitle,
  getValidationError,
  onPreventDefaultClickClick,
} from './utils';
import { ChecklistTitle } from './checklistTitle';
import {
  // CheckListItemType,
  CheckListSelectionType,
  ICheckInfo,
  ICheckListItemSelection,
  IDataNode,
  // IEventDataNodeWithData,
  IExtendedCheckListItemModel,
  ISaveSelectionsInput,
  ISelectProps,
} from './interface';
import _ from 'lodash';
import { nanoid } from 'nanoid/non-secure';
import { CheckListItemModel, useCheckListGetCheckListTree, useCheckListSaveSelection } from '../../apis/checkList';
import { useChecklistTreeSelections } from './useChecklistTreeSelections';
import ValidationErrors from '../validationErrors';
import SectionSeparator from '../sectionSeparator';
import { CHECKLIST_MESSAGES } from './messages';

export interface IHierarchicalCheckListProps {
  /**
   * The id of the checklist
   */
  id: string;

  /**
   * whether the checklist should display as a dropdown or not
   */
  dropdown?: boolean;

  /**
   * Whether you should be able to make multiple selections or not.
   *
   * You should not be in a dropdown mode
   */
  multiple?: boolean;

  /**
   * Whether the checklist is in read-only mode or not
   */
  readOnly?: boolean;

  /**
   * The owner type of this item
   */
  ownerType: string;

  /**
   * The owner of this checkbox
   */
  ownerId?: string;

  /**
   * number of required selections for this checklist for the `isValid` method to return true
   */
  numOfRequiredSelections?: number;

  /**
   * minimum number of required selections for this checklist for the `isValid` method to return true
   */
  minRequiredSelections?: number;

  /**
   * maximum number of required selections for this checklist for the `isValid` method to return true
   */
  maxRequiredSelections?: number;

  /**
   * Whether you should only save locally or not
   */
  saveLocally?: boolean;

  /**
   * A hint to display at the top of the checklist
   */
  hint?: string | null;

  /**
   * A callback for when the selections change
   */
  onSelectionsChange?: (selections: ISaveSelectionsInput) => void;
}

interface HierarchicalCheckListHandle {
  /**
   * A handle to check that the checklist is valid.
   *
   * A checklist is valid if
   *  - All the checklists that require comments are checked or have comments
   *  - (if numOfRequiredSelections is provided) the minimum number of checked items is at least the numOfRequiredSelections
   *  - (if minRequiredSelections is provided) the number of checked items is minRequiredSelections
   *  - (if maxRequiredSelections is provided) the user has not selected more than maxRequiredSelections items
   *
   * It validates and return whether the checkboxes are invalid or not
   */
  isValid: () => boolean;

  /**
   * A callback for saving the selections
   */
  save: () => void;
}

const Checklist: ForwardRefRenderFunction<HierarchicalCheckListHandle, IHierarchicalCheckListProps> = (
  props,
  forwardedRef
) => {
  const {
    id,
    ownerType,
    ownerId,
    dropdown = false,
    multiple = false,
    readOnly,
    numOfRequiredSelections,
    minRequiredSelections,
    maxRequiredSelections,
    saveLocally,
    hint = CHECKLIST_MESSAGES.hint,
    onSelectionsChange,
  } = props;

  useImperativeHandle(forwardedRef, () => ({
    isValid() {
      let hasError = false;
      const listOfErrors: string[] = [];

      const countSelections = selections?.filter(({ selection }) => selection === CheckListSelectionType.Yes)?.length;

      if (numOfRequiredSelections && numOfRequiredSelections !== countSelections) {
        listOfErrors?.push(getValidationError('numberOfSelectionsInvalid', numOfRequiredSelections));
      }

      if (minRequiredSelections && countSelections < minRequiredSelections) {
        listOfErrors?.push(getValidationError('minSelectionsRequired', minRequiredSelections));
      }

      if (maxRequiredSelections && countSelections > maxRequiredSelections) {
        listOfErrors?.push(getValidationError('maxSelectionsExceeded', maxRequiredSelections));
      }

      if (dropdown) {
        const hasSelection = selections?.find(({ selection }) => selection === CheckListSelectionType.Yes);
        hasError = !hasSelection;
      } else {
        // If there's any checklist item that requires comments if not checked and it's not selected and the
        // comments are not added, then set an error to that and return false. The user will do whatever is necessary with the error message
        const newSelections = selections?.map<ICheckListItemSelection>(item => {
          hasError =
            item?.allowAddComments && item?.selection !== CheckListSelectionType.Yes && !item?.comments?.trim();

          return {
            ...item,
            hasError,
          };
        });

        // Now we're updating the selections. This will trigger the updating of the treeData and, in turn rerender checklists with
        // proper error messages
        setSelections(newSelections);
      }

      if (listOfErrors) {
        setValidationErrors(listOfErrors);
      }

      return !hasError || listOfErrors?.length > 0;
    },
    save() {
      saveCheckChanges(selections, true);
    },
  }));

  const treeRef = useRef(null);

  // TODO: Consolidate the states to avoid many rerenders when you have to set multiple values, one after the other

  // This property is set when a selection is being made
  const [disableTree, setDisableTree] = useState(false);
  const [isDropdownTreeOverlayVisible, setIsDropdownTreeOverlayVisible] = useState(false);
  const { mutate: saveSelection, error: saveSelectionError } = useCheckListSaveSelection({ id });
  const {
    refetch: getCheckListTree,
    loading: isFetchingChecklistTree,
    data: checkListTreeResponse,
  } = useCheckListGetCheckListTree({ id, lazy: true });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<IDataNode[]>();
  const {
    selections,
    setSelections,
    setTree,
    updateSelectionComments,
    updateSelections,
    treeIds,
    error: fetchCheckListSelectionsError,
  } = useChecklistTreeSelections(id, ownerId, ownerType);

  // Memoize the selections selectedKeys
  const selectedKeys = useMemo(() => {
    if (onSelectionsChange) {
      onSelectionsChange(filterOnSelectionsChange(selections, { id, ownerId, ownerType }));
    }

    return selections
      ?.filter(({ selection }) => selection === CheckListSelectionType.Yes)
      ?.map(({ checkListItemId }) => checkListItemId)
      ?.filter(Boolean);
  }, [selections]);

  // Memoize the selected node in case of a dropdown
  const selectedNode = useMemo(() => {
    const firstSelectedNode = selectedKeys?.length
      ? getNodeById(checkListTreeResponse?.result?.items, selectedKeys[0])
      : null;

    return firstSelectedNode;
  }, [selectedKeys]);

  // Memoize the selections selectedChecklistName
  const selectedChecklistName = useMemo(() => {
    const checklistName = checkListTreeResponse?.result?.name || 'Please select...';

    // The name of the selected item is either the first selected leaf in the hierarchy (in case of a dropdown)
    // Or the name of the Checklist item (in case the user has not yet made any selection)
    return dropdown ? selectedNode?.name || checklistName : checklistName;
  }, [selectedNode, checkListTreeResponse, selections]);

  // Memoize the selections selectedChecklistName
  const selectedFullChecklistName = useMemo(() => {
    const checklistName = checkListTreeResponse?.result?.name || 'Please select...';

    // The name of the selected item is either the first selected leaf in the hierarchy (in case of a dropdown)
    // Or the name of the Checklist item (in case the user has not yet made any selection)
    return dropdown
      ? getNodeFullTitle(checkListTreeResponse?.result?.items, selectedNode?.id) || checklistName
      : checklistName;
  }, [selectedNode, checkListTreeResponse]);

  useEffect(() => {
    getCheckListTree();
  }, [id]);

  useEffect(() => {
    // We only wanna perform this operation if we are done fetching both the tree and selections because we
    // Want to initialize the comments if they're there
    if (!isFetchingChecklistTree && checkListTreeResponse) {
      // Do something up
      const localTree = mapCheckListItemModelTree(checkListTreeResponse?.result?.items || []);

      setTreeData(localTree);

      if (!selections?.length) {
        setTree(checkListTreeResponse?.result?.items); // Make sure you pass this value
      }
    }
  }, [isFetchingChecklistTree, selections]);

  /**
   * Callback function for when the user clicks a treeNode
   *
   * This function only gets called when we're in a dropdown mode. when we're not in dropdown mode, we only use onCheck as we do not show the checkbox
   * @param incomingSelectedKeys selected keys
   * @param info information about the new selection
   */
  const onSelect = (_keys: Key[], info: ISelectProps) => {
    if (!info?.node?.isLeaf) {
      // Maybe show a message that you can only select a leaf
      return;
    }

    const newSelections = selections?.map(item => {
      if (item?.checkListItemId === info?.node?.key) {
        // console.log('incomingSelectedKeys, info :>> ', incomingSelectedKeys, info);
        return {
          ...item,
          selection:
            item?.selection === CheckListSelectionType.Yes ? CheckListSelectionType.No : CheckListSelectionType.Yes,
          isNew: true,
        };
      }

      return {
        ...item,
        selection: CheckListSelectionType.No,
        isNew: item.selection === CheckListSelectionType.Yes,
      };
    });

    saveCheckChanges(newSelections);
  };

  // This function only gets called when we're not in a dropdown mode.
  // In dropdown mode, we only use onSelect as we do not show the checkbox
  const onCheck = (checked: Key[] | any, _info: ICheckInfo) => {
    if (readOnly) return;

    // console.log('onCheck checked, _', checked, info);

    // const data = (info?.node as IEventDataNodeWithData)?.data;

    const currentlyChecked = checked as string[];

    setValidationErrors([]); // Reset validation errors

    const newSelections = selections?.map<ICheckListItemSelection>(item => {
      const isNew = currentlyChecked?.includes(item?.checkListItemId);

      let selection = isNew ? CheckListSelectionType.Yes : CheckListSelectionType.No;

      if (item.selection === CheckListSelectionType.NotAvailable) {
        selection = CheckListSelectionType.NotAvailable;
      }

      return {
        ...item,
        selection,
        comments: selection === CheckListSelectionType.No ? null : item?.comments,
        isNew: selection !== item.selection,
      };
    });

    saveCheckChanges(newSelections);
  };

  const handleCheckFromChecklistTitle = (checkListItemId: string, newSelection: CheckListSelectionType) => {
    const newSelections = selectionsRef.current?.map<ICheckListItemSelection>(item => {
      const isNew = checkListItemId === item?.checkListItemId;

      const selection = isNew ? newSelection : item?.selection;

      return {
        ...item,
        selection,
        comments: selection === CheckListSelectionType.No ? null : item?.comments,
        isNew: selection !== item.selection,
      };
    });

    saveCheckChanges(newSelections);
  };

  const handleCheckFromChecklistTitleRef = useRef(handleCheckFromChecklistTitle);

  useEffect(() => {
    handleCheckFromChecklistTitleRef.current = handleCheckFromChecklistTitle;
  }, []);

  //#region Save comments
  useEffect(() => {
    saveCheckChangesRef.current = saveCheckChanges;
  }, []);

  const selectionsRef = useRef(selections);

  useEffect(() => {
    selectionsRef.current = selections;
  }, [selections]);

  const saveComments = () => {
    saveCheckChangesRef.current(selectionsRef.current);
  };
  //#endregion

  /**
   * Saves the new selections
   * @param newSelections - new selections
   * @param forceSave - if true, all the newSelections will be saved. It's called by the save handle when saveLocally is true
   */
  const saveCheckChanges = (newSelections: ICheckListItemSelection[], forceSave = false) => {
    let filteredSelections: ICheckListItemSelection[] = [];

    console.log('saveCheckChanges saveLocally', saveLocally);

    if (saveLocally) {
      if (forceSave) {
        filteredSelections = newSelections;
      } else {
        updateSelections(newSelections);
        return;
      }
    } else {
      filteredSelections = newSelections?.filter(({ isNew }) => isNew);
    }

    const incomingSelections = filteredSelections?.map(item => {
      const incomingSelection = { ...item };
      delete incomingSelection.isNew;
      delete incomingSelection.hasError;

      return incomingSelection;
    });

    if (incomingSelections?.length) {
      setDisableTree(true);

      saveSelection({
        id,
        ownerType,
        ownerId,
        selection: incomingSelections,
      })
        .then(() => {
          setDisableTree(false);
          updateSelections(newSelections);
          setIsDropdownTreeOverlayVisible(false);
        })
        .catch(() => {
          setDisableTree(false);
          setIsDropdownTreeOverlayVisible(false);
        });
    }
  };

  const saveCheckChangesRef = useRef(saveCheckChanges);

  //#region Helper functions
  function mapData(data: IExtendedCheckListItemModel, parentId?: string): IDataNode {
    const { id: localId, name, childItems, description, allowAddComments, itemType } = data;

    const itemInitialComments = selections?.find(({ checkListItemId }) => checkListItemId === localId);

    return {
      key: localId || '',
      data: {
        ...data,
        parentId,
        childItems: null, // I do not want to include even the children to avoid a lot of data. Rather, we'll use hasChildren property instead
        hasChildren: !!childItems?.length,
      },
      title: (
        <ChecklistTitle
          title={name as string}
          onChange={updateSelectionComments}
          onBlur={saveComments}
          checkListItemId={localId}
          showCommentBox={allowAddComments && itemInitialComments?.selection !== CheckListSelectionType.Yes}
          value={itemInitialComments?.comments || ''}
          description={description || ''}
          readOnly={readOnly}
          itemType={itemType}
          selection={itemInitialComments?.selection}
          onCheck={handleCheckFromChecklistTitleRef?.current}
        />
      ),
      // title: (name as unknown) as JSX.Element,
      isLeaf: !childItems || childItems?.length === 0,
    };
  }

  const mapCheckListItemModelTree = (incomingTree: CheckListItemModel[]): IDataNode[] => {
    return incomingTree?.map(item => {
      const localTree = mapData(item);

      if (item?.childItems) {
        return {
          ...localTree,
          children: mapCheckListItemModelTree(item?.childItems),
        };
      }

      return localTree;
    });
  };
  //#endregion

  const commonTreeProps: TreeProps = {
    disabled: (disableTree || readOnly) ?? false,
    treeData,
    multiple: true,
  };

  const tree = () => {
    return (
      <Menu>
        <div
          className="sha-hierarchical-checklist sha-hierarchical-checklist-dropdown-overlay"
          onClick={onPreventDefaultClickClick}
        >
          <Tree
            {...commonTreeProps}
            multiple={multiple}
            onCheck={onCheck}
            blockNode
            ref={treeRef}
            height={500}
            onSelect={onSelect}
            checkStrictly
            showLine={{ showLeafIcon: true }}
            selectedKeys={selectedKeys as string[]}
            icon={() => {
              return null;
            }}
          />
        </div>
      </Menu>
    );
  };

  if (!treeData || treeData?.length === 0) {
    return (
      <span>
        <LoadingOutlined /> Loading checklist...
      </span>
    );
  }

  return (
    <div className="sha-hierarchical-checklist" onClick={onPreventDefaultClickClick}>
      <ValidationErrors error={saveSelectionError} />
      <ValidationErrors error={fetchCheckListSelectionsError} />

      {!!validationErrors?.length && (
        <Alert
          type="error"
          showIcon
          message={CHECKLIST_MESSAGES.validationError}
          closable
          description={
            <ul>
              {validationErrors?.map(validationError => (
                <li key={nanoid()}>{validationError}</li>
              ))}
            </ul>
          }
        />
      )}

      {dropdown ? (
        // {checkListDetailseResponse?.result?.itemType === CheckListItemType.Group ? (
        <Fragment>
          <Dropdown
            overlay={tree()}
            //   onClick={() => console.log('Dropdown.Button >> ')}
            visible={isDropdownTreeOverlayVisible}
            trigger={['click']}
            //   placement="bottomLeft"
            onVisibleChange={setIsDropdownTreeOverlayVisible}
            //   icon={<UserOutlined />}
          >
            <Button>
              {selectedChecklistName || 'Select item...'}{' '}
              <DownOutlined rotate={isDropdownTreeOverlayVisible ? 180 : 0} />
            </Button>
          </Dropdown>
          <Button
            icon={
              <Popover
                // title="This is the tooltip for now"
                content={selectedFullChecklistName}
                placement="right"
              >
                <InfoCircleOutlined />
              </Popover>
            }
            type="link"
          />
        </Fragment>
      ) : (
        <Fragment>
          <SectionSeparator title={checkListTreeResponse?.result?.name} />

          {!readOnly && hint && (
            <Alert message={hint} type="info" className="sha-hierarchical-checklist-alert" showIcon closable />
          )}

          <Tree
            {...commonTreeProps}
            expandedKeys={treeIds}
            checkable
            switcherIcon={<Fragment />}
            selectable={false}
            defaultExpandAll
            blockNode
            ref={treeRef}
            disabled={(disableTree || readOnly) ?? false}
            treeData={treeData}
            onCheck={onCheck}
            checkedKeys={selectedKeys as string[]}
          />
        </Fragment>
      )}
    </div>
  );
};

const HierarchicalCheckList = React.forwardRef(Checklist);

export type HierarchicalCheckListHandleRefType = React.ElementRef<typeof HierarchicalCheckList>;

export default HierarchicalCheckList;
