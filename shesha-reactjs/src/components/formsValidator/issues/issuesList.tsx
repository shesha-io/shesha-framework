import React, { FC } from 'react';
import { Empty, List, Space, Tag, Typography } from 'antd';
import {
  SEVERITY_META,
  compareIssues, issueKey,
} from './issueModel';
import { SeverityFilter, useSeverityFilter } from './issueFilter';
import { FieldValidationError } from '@/interfaces';
import { isNullOrWhiteSpace } from '@/utils';
import { IssuePath } from './issuePath';
import { getComponentIdFromPath } from './utils';
import { useAntdToken } from "antd-style";

export interface IssuesListProps {
  issues: FieldValidationError[];
  onSelect?: ((rootId: string, issue: FieldValidationError | undefined) => void) | undefined;
  selectedId?: string | undefined;
  showFilter?: boolean | undefined;
  emptyText?: React.ReactNode | undefined;
}

export const IssuesList: FC<IssuesListProps> = ({
  issues,
  onSelect,
  selectedId,
  showFilter = true,
  emptyText = 'No issues',
}) => {
  const { value, setValue, counts, filtered } = useSeverityFilter(issues);
  const sorted = React.useMemo(() => [...filtered].sort(compareIssues), [filtered]);
  const token = useAntdToken();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {showFilter && <SeverityFilter value={value} onChange={setValue} counts={counts} />}

      <List
        size="small"
        bordered
        dataSource={sorted}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />,
        }}
        renderItem={(issue) => {
          const key = issueKey(issue);
          const componentId = getComponentIdFromPath(issue.path);
          const selected = componentId === selectedId;
          const propertyDisplayName = typeof (issue.propertyLabel) === "string" && !isNullOrWhiteSpace(issue.propertyLabel)
            ? issue.propertyLabel
            : issue.propertyName;
          return (
            <List.Item
              key={key}
              onClick={() => {
                if (!isNullOrWhiteSpace(componentId) && onSelect)
                  onSelect(componentId, issue);
              }}
              style={{
                cursor: onSelect ? 'pointer' : 'default',
                background: selected ? `${token.colorPrimaryBg}80` : undefined,
              }}
            >
              <Space align="start" size={8} style={{ width: '100%' }}>
                <Tag
                  color={SEVERITY_META[issue.severity].color}
                  style={{ marginInlineEnd: 0 }}
                >
                  {SEVERITY_META[issue.severity].label}
                </Tag>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Space size={8} wrap>
                    <IssuePath path={issue.path} />
                    {!isNullOrWhiteSpace(issue.code) && (
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {issue.code}
                      </Typography.Text>
                    )}
                  </Space>
                  <div>
                    {!isNullOrWhiteSpace(propertyDisplayName) && <Typography.Text code>{propertyDisplayName}</Typography.Text>}
                    {issue.message}
                  </div>
                </div>
              </Space>
            </List.Item>
          );
        }}
      />
    </div>
  );
};
