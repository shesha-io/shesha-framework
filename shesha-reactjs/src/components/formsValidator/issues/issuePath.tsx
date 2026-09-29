import { ValidationNodeRef } from '@/interfaces';
import { FC, useMemo } from 'react';
import { Breadcrumb } from 'antd';
import type { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { ComponentIcon } from './componentIcon';

export interface IIssuePathProps {
  path: ValidationNodeRef[];
  separator?: React.ReactNode;
  onNavigate?: (nodeRef: ValidationNodeRef) => void;
}

export const IssuePath: FC<IIssuePathProps> = ({
  path,
  separator = '›',
  onNavigate,
}) => {
  const items = useMemo<BreadcrumbItemType[]>(() => {
    return path.map<BreadcrumbItemType>((segment, index) => {
      const componentId = segment.kind === 'component' && isDefined(segment.id)
        ? segment.id
        : '';
      return {
        key: segment.id ?? index,
        title: !isNullOrWhiteSpace(componentId)
          ? (
            <>
              <ComponentIcon componentId={componentId} /> {segment.name}
            </>
          )
          : segment.name,
        onClick: () => onNavigate?.(segment),
      } satisfies BreadcrumbItemType;
    });
  }, [path, onNavigate]);

  return <Breadcrumb items={items} separator={separator} />;
};
