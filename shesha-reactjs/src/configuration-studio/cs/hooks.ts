import { ReactNode, useEffect, useState } from "react";
import { ConfigItemTreeNode, DocumentDefinition, IDocumentInstance, TreeNode } from "../models";
import { CsSubscriptionType, ProcessingState } from "./configurationStudio";
import { useConfigurationStudio, useConfigurationStudioIfAvailable } from "./contexts";
import { TreeProps } from "antd";
import { isDefined } from "../../utils/nullables";

type ExpandedKeys = TreeProps['expandedKeys'];
type SeletcedKeys = TreeProps['selectedKeys'];
type OnTreeExpand = Required<TreeProps<TreeNode>>['onExpand'];

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

  quickSearch?: string | undefined;
  setQuickSearch: (value: string) => void;
  expandedKeys: ExpandedKeys;
  selectedKeys: SeletcedKeys;
  selectedItemNode?: ConfigItemTreeNode | undefined;
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
  readonly renderedDocs: Map<string, ReactNode>;
  readonly activeDocId: string | undefined;
  readonly activeDocument: IDocumentInstance | undefined;
  readonly navigateToDocumentAsync: (docId: string) => Promise<void>;
  readonly closeDocumentAsync: (tabId: string) => Promise<void>;
  readonly reloadDocumentAsync: (tabId: string) => Promise<void>;
  readonly closeMultipleDocumentsAsync: (predicate: (doc: IDocumentInstance, index: number) => boolean) => Promise<void>;
};
export const useCsTabs = (): UseCsTabsResponse => {
  const cs = useConfigurationStudio();
  useCsSubscription('tabs');

  return {
    docs: cs.docs,
    activeDocId: cs.activeDocId,
    activeDocument: cs.activeDocument,
    navigateToDocumentAsync: cs.navigateToDocumentAsync,
    closeDocumentAsync: cs.closeDocumentAsync,
    reloadDocumentAsync: cs.reloadDocumentAsync,
    closeMultipleDocumentsAsync: cs.closeMultipleDocumentsAsync,
    renderedDocs: cs.renderedDocs,
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
