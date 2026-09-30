import { ConfigurationIssue } from '@/providers/formDesigner/models';
import { FC } from 'react';

export type IssuesModalProps = {
  issues: ConfigurationIssue[];
};

export const IssuesModal: FC<IssuesModalProps> = ({ }) => {
  return (
    <div>
      New Component
    </div>
  );
};
