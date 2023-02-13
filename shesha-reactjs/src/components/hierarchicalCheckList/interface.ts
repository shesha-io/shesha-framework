import { DataNode, EventDataNode } from 'antd/lib/tree';
import { Key, ReactNode } from 'react';
import { CheckListItemModel, CheckListItemSelectionDto, SaveSelectionInput } from '../../apis/checkList';

export enum CheckListItemType {
  /**
   * Group
   */
  Group = 1,

  /**
   * Two state (yes/no)
   */
  TwoState = 2,

  /**
   * Tri state (yes/no/na)
   */
  ThreeStateTriState = 3,
}

// [ReferenceList("Shesha.Core", "CheckListSelectionType")]
export enum CheckListSelectionType {
  /**
   * Yes
   */
  Yes = 1,

  /**
   * No
   */
  No = 2,

  /**
   * N/A
   */
  NotAvailable = 3,
}

// note: antd types were changed, CustomEventDataNode was added to fix build, to be reviewed later
interface CustomEventDataNode extends EventDataNode<{}>{}

export interface IEventDataNodeWithData extends CustomEventDataNode {
  data: IExtendedCheckListItemModel;
}

export interface IDataNode {
  data: IExtendedCheckListItemModel;
  title: JSX.Element;
  key: string;
  isLeaf?: boolean;
  children?: IDataNode[];
  icon?: ReactNode;
}

export interface IExpandProps {
  node: CustomEventDataNode;
  expanded: boolean;
  nativeEvent: MouseEvent;
}

export interface ISelectProps {
  event: 'select';
  selected: boolean;
  node: CustomEventDataNode | IEventDataNodeWithData;
  selectedNodes: DataNode[];
  nativeEvent: MouseEvent;
}

export interface IExtendedCheckListItemModel extends CheckListItemModel {
  parentId?: string;
  hasChildren?: boolean;
}

export interface ICheckProps {
  checked: Key[];
  halfChecked: Key[];
}

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

export interface ICheckListItemSelection extends CheckListItemSelectionDto {
  hasError?: boolean;
  allowAddComments?: boolean;
  /**
   * Used when updating selections to avoid sending all selections to the server
   */
  isNew?: boolean;
}

export interface ISaveSelectionsInput extends SaveSelectionInput {
  allChecked?: boolean;
}

export interface ISelectionsChangeValue extends ISaveSelectionsInput {}
