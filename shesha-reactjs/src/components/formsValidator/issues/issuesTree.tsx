import React from 'react';
import { Empty, Tree } from 'antd';
import { SeverityFilter, useSeverityFilter } from './issueFilter';
import { FieldValidationError } from '@/interfaces';
import { isDefined } from '@/utils';
import { buildGroups, toTreeData } from './utils';
import { Group, IssueTreeNode, TreeContext } from './models';

function collectKeys(group: Group, acc: string[] = []): string[] {
  for (const child of group.children.values()) {
    acc.push(child.key);
    collectKeys(child, acc);
  }
  return acc;
}

export interface IssuesTreeProps {
  issues: FieldValidationError[];
  onSelect?: ((rootId: string, issue: FieldValidationError | undefined) => void) | undefined;
  selectedId?: string | undefined;
  showFilter?: boolean | undefined;
  emptyText?: React.ReactNode | undefined;
}

export const IssuesTree: React.FC<IssuesTreeProps> = ({
  issues,
  onSelect,
  showFilter = true,
  emptyText = 'No issues',
}) => {
  const { value, setValue, counts, filtered } = useSeverityFilter(issues);

  const { treeData, allKeys } = React.useMemo(() => {
    const root = buildGroups(filtered);
    const ctx: TreeContext = { issueByKey: new Map(), keyByIssueKey: new Map() };
    const data = toTreeData(root, ctx);
    return {
      treeData: data,
      issueByKey: ctx.issueByKey,
      keyByIssueKey: ctx.keyByIssueKey,
      allKeys: collectKeys(root),
    };
  }, [filtered]);

  const [expandedKeys, setExpandedKeys] = React.useState<string[]>(allKeys);

  // Keep user expansion, but always reveal newly appeared branches.
  React.useEffect(() => {
    setExpandedKeys((prev) => Array.from(new Set([...prev, ...allKeys])));
  }, [allKeys]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {showFilter && <SeverityFilter value={value} onChange={setValue} counts={counts} />}

      {treeData.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
      ) : (
        <Tree<IssueTreeNode>
          showLine
          blockNode
          selectable
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys.map(String))}
          // selectedKeys={selectedKeys}
          onSelect={(_keys, info) => {
            if (!isDefined(onSelect))
              return;

            const { issue, componentId } = info.node;
            onSelect(componentId ?? "", issue);
          }}
        />
      )}
    </div>
  );
};
