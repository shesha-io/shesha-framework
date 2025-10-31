import { UseCsTabsResponse } from "@/configuration-studio/cs/hooks";
import { IDocumentInstance } from "@/configuration-studio/models";
import { MenuProps } from "antd";

type MenuItem = Required<MenuProps>['items'][number];

export const getContextMenuItems = (tabsApi: UseCsTabsResponse, doc: IDocumentInstance): MenuItem[] => [
  {
    key: 'close',
    label: 'Close',
    onClick: (): void => {
      void tabsApi.closeDocumentAsync(doc.itemId, true, true);
    },
  },
  {
    key: 'closeOthers',
    label: 'Close Others',
    onClick: (): void => {
      void tabsApi.closeMultipleDocumentsAsync((d) => (d !== doc), true);
    },
  },
  {
    key: 'closeToTheRight',
    label: 'Close to the Right',
    onClick: (): void => {
      void tabsApi.closeMultipleDocumentsAsync((_, index) => {
        const docIndex = tabsApi.docs.indexOf(doc);
        return index > docIndex;
      }, true);
    },
  },
  {
    key: 'closeSaved',
    label: 'Close Saved',
    onClick: (): void => {
      void tabsApi.closeMultipleDocumentsAsync((doc) => {
        return !doc.isDataModified;
      }, true);
    },
  },
  {
    key: 'closeAll',
    label: 'Close All',
    onClick: (): void => {
      void tabsApi.closeMultipleDocumentsAsync((_) => (true), true);
    },
  },
  { type: 'divider' },
  {
    key: 'reload',
    label: 'Reload',
    onClick: (): void => {
      void tabsApi.reloadDocumentAsync(doc.itemId);
    },
  },
];
