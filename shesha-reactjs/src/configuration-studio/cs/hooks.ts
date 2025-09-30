import { useEffect, useState } from "react";
import { ConfigItemTreeNode, DocumentDefinition, IDocumentInstance, TreeNode } from "../models";
import { CsSubscriptionType, ProcessingState } from "./configurationStudio";
import { useConfigurationStudio, useConfigurationStudioIfAvailable } from "./contexts";
import { TreeProps } from "antd";
import { isDefined } from "../../utils/nullables";

type ExpandedKeys = TreeProps['expandedKeys'];
type SeletcedKeys = TreeProps['selectedKeys'];
type OnTreeExpand = TreeProps['onExpand'];

export const useCsSubscription = (subscriptionType: CsSubscriptionType): object => {
  const cs = useConfigurationStudioIfAvailable();

  const [dummy, forceUpdate] = useState({});
  useEffect(() => {
    if (isDefined(cs)) {
      // Subscribe to changes
      const unsubscribe = cs.subscribe(subscriptionType, () => forceUpdate({}));
      return unsubscribe; // Cleanup on unmount
    } else
      return undefined;
  }, [cs, subscriptionType]);

  return dummy;
};

export type UseCsTreeResponse = {
  readonly treeNodes: TreeNode[];
  readonly getTreeNodeById: (itemId: string) => TreeNode | undefined;
  readonly treeLoadingState: ProcessingState;
  loadTreeAsync: () => Promise<void>;

  quickSearch?: string;
  setQuickSearch: (value: string) => void;
  expandedKeys: ExpandedKeys;
  selectedKeys: SeletcedKeys;
  selectedItemNode?: ConfigItemTreeNode;
  onNodeExpand: OnTreeExpand;
};
export const useCsTree = (): UseCsTreeResponse => {
  const cs = useConfigurationStudio();
  useCsSubscription('tree');

  return {
    treeNodes: cs.treeNodes,
    getTreeNodeById: cs.getTreeNodeById,
    loadTreeAsync: cs.loadTreeAndDocsAsync,
    treeLoadingState: cs.treeLoadingState,
    quickSearch: cs.quickSearch,
    setQuickSearch: cs.setQuickSearch,
    expandedKeys: cs.treeExpandedKeys,
    selectedKeys: cs.treeSelectedKeys,
    selectedItemNode: cs.treeSelectedItemNode,
    onNodeExpand: cs.onTreeNodeExpand,
  };
};

export type UseCsTreeDndResponse = {
  readonly isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
};
export const useCsTreeDnd = (): UseCsTreeDndResponse => {
  const cs = useConfigurationStudioIfAvailable();
  useCsSubscription('tree-dnd');
  return cs
    ? {
      isDragging: cs.isTreeDragging,
      setIsDragging: cs.setIsTreeDragging,
    }
    : {
      isDragging: false,
      setIsDragging: () => {
        //
      },
    };
};

export type UseCsTabsResponse = {
  readonly docs: IDocumentInstance[];
  readonly activeDocId?: string;
  readonly activeDocument?: IDocumentInstance;
  readonly openDocById: (tabId?: string) => void;
  readonly closeDoc: (tabId?: string) => void;
  readonly closeMultipleDocs: (predicate: (doc: IDocumentInstance, index: number) => boolean) => void;
};
export const useCsTabs = (): UseCsTabsResponse => {
  const cs = useConfigurationStudio();
  useCsSubscription('tabs');

  return {
    docs: cs.docs,
    activeDocId: cs.activeDocId,
    activeDocument: cs.activeDocument,
    openDocById: cs.openDocById,
    closeDoc: cs.closeDocAsync,
    closeMultipleDocs: cs.closeMultipleDocsAsync,
  };
};

export type UseActiveDocResponse = IDocumentInstance | undefined;

export const useActiveDoc = (): UseActiveDocResponse => {
  const cs = useConfigurationStudio();
  useCsSubscription('doc');

  return cs.activeDocument;
};

export const useConfigurationStudioDocumentDefinitions = (definitions: DocumentDefinition[]): void => {
  const cs = useConfigurationStudio();

  useEffect(() => {
    definitions.forEach((definition) => {
      cs.registerDocumentDefinition(definition);
    });

    return (): void => {
      definitions.forEach((definition) => {
        cs.unregisterDocumentDefinition(definition);
      });
    };
  }, [cs, definitions]);
};
