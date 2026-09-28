import { FieldValidationError, ValidationNodeRef } from '@/interfaces';
import { TreeDataNode } from 'antd';

export interface Group {
  key: string;
  ref?: ValidationNodeRef;
  /** issues whose owner path ends exactly here */
  issues: FieldValidationError[];
  children: Map<string, Group>;
}

export interface TreeContext {
  issueByKey: Map<string, FieldValidationError>;
  keyByIssueKey: Map<string, string>;
}

export type IssueTreeNode = TreeDataNode & {
  issue: FieldValidationError | undefined;
  componentId: string | undefined;
};
