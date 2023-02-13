import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { CheckListItemModel, useCheckListGetSelection } from '../../apis/checkList';
import { treeToList } from '../../utils/tree';
import { ICheckListItemSelection } from './interface';

export const useChecklistTreeSelections = (id: string, ownerId: string, ownerType: string) => {
  const [selections, setSelections] = useState<ICheckListItemSelection[]>([]);
  const [tree, setTree] = useState<CheckListItemModel[]>();
  const [treeIds, setTreeIds] = useState<string[]>([]);
  const selectionsRef = useRef(selections);
  const setSelectionsRef = useRef(setSelections);

  const { refetch: fetchCheckListSelections, data: checkLisTreeSelectionsResponse, error } = useCheckListGetSelection({
    id,
    lazy: true,
    queryParams: { ownerType, ownerId },
  });

  const getMappedSelectionsFromServer = (flatTree: CheckListItemModel[]) => {
    return (
      checkLisTreeSelectionsResponse?.result?.map<ICheckListItemSelection>(item => {
        return {
          ...item,
          hasError: false,
          allowAddComments: flatTree?.find(({ id: localId }) => localId === item?.checkListItemId)?.allowAddComments,
        };
      }) || []
    );
  };

  useEffect(() => {
    if (selections?.length) {
      return;
    }
    fetchCheckListSelections();
  }, [id, ownerId, ownerType]);

  useEffect(() => {
    setSelectionsRef.current = setSelections;
  }, []);

  useEffect(() => {
    selectionsRef.current = selections;
  }, [selections]);

  /**
   * Updates the current selections
   * @param updatedSelections - updated selections
   */
  const updateSelections = (updatedSelections: ICheckListItemSelection[]) => {
    const updatedIds = updatedSelections?.map(({ checkListItemId }) => checkListItemId)?.filter(Boolean);
    const currentSelectionIds = selections?.map(({ checkListItemId }) => checkListItemId)?.filter(Boolean);

    const differenceIds = _.difference(updatedIds, currentSelectionIds);

    const differenceItems = updatedSelections?.filter(({ checkListItemId }) =>
      differenceIds?.includes(checkListItemId)
    );

    const findItem = (item: ICheckListItemSelection) =>
      updatedSelections.find(({ checkListItemId }) => checkListItemId === item.checkListItemId);

    const newSelections = selections?.map(item => {
      const newItem = findItem(item) || item;
      newItem.isNew = false;
      return newItem;
    });

    setSelections([...newSelections, ...differenceItems]);
  };

  /**
   * Updates the checklist item comments
   * @param data the comments
   */
  const updateSelectionComments = (data: ICheckListItemSelection) => {
    // console.log('updateChecklistComments selections, data', selections, selectionsRef.current, data);

    const newSelections = selectionsRef?.current?.map(c => {
      if (c.checkListItemId === data?.checkListItemId) {
        return { ...c, comments: data?.comments, hasError: false, isNew: true };
      }

      return c;
    });

    setSelectionsRef.current(newSelections);
  };

  useEffect(() => {
    if (tree?.length) {
      const flattenedTree = treeToList(tree, 'childItems');

      const selectionsFromServer = getMappedSelectionsFromServer(flattenedTree);

      setTreeIds(flattenedTree?.map(({ id: localId }) => localId));

      const selectionsFromServerIds = selectionsFromServer?.map(({ checkListItemId }) => checkListItemId);

      const mappedSelections = flattenedTree
        ?.filter(
          ({ id: localId }) => !selectionsFromServerIds?.includes(localId) // We do not initialize the ones from the server
        )
        ?.map<ICheckListItemSelection>(({ id: localId, allowAddComments }) => ({
          selection: null,
          allowAddComments,
          checkListItemId: localId,
          hasError: false,
        }));

      setSelections([...selectionsFromServer, ...mappedSelections]);
    }
  }, [tree, checkLisTreeSelectionsResponse]);

  return { selections, setSelections, setTree, updateSelectionComments, updateSelections, treeIds, error };
};
