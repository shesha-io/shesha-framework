import React from 'react';
import { Space, Tag, Typography } from 'antd';
import {
  SEVERITY_META,
  issueKey,
} from './issueModel';
import { FieldValidationError, ValidationNodeRef } from '@/interfaces';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { Group, IssueTreeNode, TreeContext } from './models';
import { ValidationNodeDisplay } from './validationNodeDisplay';
import { isNonEmptyArray } from '@/utils/array';

const segmentKey = (ref: ValidationNodeRef): string => {
  const {
    kind,
    index,
    id = "",
    name = "",
  } = ref;
  return `${kind}:${index ?? ''}:${id}:${name}`;
};

export function buildGroups(issues: FieldValidationError[]): Group {
  const root: Group = { key: '', issues: [], children: new Map() };

  for (const issue of issues) {
    let node = root;
    let pathKey = '';

    for (const ref of issue.path) {
      pathKey += `/${segmentKey(ref)}`;

      let next = node.children.get(pathKey);
      if (!next) {
        next = { key: pathKey, ref, issues: [], children: new Map() };
        node.children.set(pathKey, next);
      }
      node = next;
    }
    node.issues.push(issue);
  }
  return root;
}

function collectIssues(group: Group): FieldValidationError[] {
  const out = [...group.issues];
  for (const child of group.children.values()) out.push(...collectIssues(child));
  return out;
}

const IssueTitle: React.FC<{ issue: FieldValidationError }> = ({ issue }) => (
  <Space size={8} align="start">
    <Tag color={SEVERITY_META[issue.severity].color} style={{ marginInlineEnd: 0 }}>
      {SEVERITY_META[issue.severity].label}
    </Tag>
    <span>
      {isDefined(issue.propertyLabel) && <Typography.Text code>{issue.propertyLabel}</Typography.Text>}
      {issue.message}
      {!isNullOrWhiteSpace(issue.code) && (
        <>{' '}
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            [{issue.code}]
          </Typography.Text>
        </>
      )}
    </span>
  </Space>
);

const GroupTitle: React.FC<{ nodeRef?: ValidationNodeRef | undefined; errors: number; warns: number }> = ({
  nodeRef,
  errors,
  warns,
}) => {
  return (
    <Space size={6}>
      {nodeRef && <ValidationNodeDisplay nodeRef={nodeRef} />}
      {errors > 0 && (
        <Tag color="error" style={{ marginInlineEnd: 0 }}>
          {errors}
        </Tag>
      )}
      {warns > 0 && (
        <Tag color="warning" style={{ marginInlineEnd: 0 }}>
          {warns}
        </Tag>
      )}
    </Space>
  );
};

export function toTreeData(group: Group, ctx: TreeContext): IssueTreeNode[] {
  const nodes: IssueTreeNode[] = [];

  for (const child of group.children.values()) {
    const descendants = collectIssues(child);
    const errors = descendants.filter((i) => i.severity === 'error').length;
    const warns = descendants.length - errors;

    const issueNodes: IssueTreeNode[] = child.issues.map((issue, idx) => {
      const key = `${child.key}#${idx}`;
      ctx.issueByKey.set(key, issue);
      ctx.keyByIssueKey.set(issueKey(issue), key);
      return {
        key,
        issue,
        componentId: getComponentIdFromPath(issue.path),
        isLeaf: true,
        title: (
          <IssueTitle issue={issue} />
        ) };
    });

    nodes.push({
      key: child.key,
      issue: undefined,
      componentId: child.ref?.id,
      title: <GroupTitle nodeRef={child.ref} errors={errors} warns={warns} />,
      children: [...issueNodes, ...toTreeData(child, ctx)],
    });
  }

  return nodes;
}

export const getComponentIdFromPath = (path: ValidationNodeRef[]): string | undefined => {
  return isNonEmptyArray(path) ? path[0].id : undefined;
};
