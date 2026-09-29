import { FC } from 'react';
import { Tabs } from 'antd';
import { IssuesList } from './issuesList';
import { IssuesTree } from './issuesTree';
import { useAllValidationResults } from '@/providers/validator/hooks';
import CustomErrorBoundary from '@/components/customErrorBoundary';
import { FieldValidationError } from '@/interfaces';
import { isNullOrWhiteSpace } from '@/utils';
import { useFormDesigner } from '@/providers/formDesigner';

type CommonIssuesProps = {
  issues: FieldValidationError[];
  showFilter?: boolean | undefined;
  onSelect?: ((rootId: string, issue: FieldValidationError | undefined) => void) | undefined;
  selectedId?: string | undefined;
};

export const IssuesPanel: FC = () => {
  // const [selected, setSelected] = React.useState<Issue | undefined>();
  const data = useAllValidationResults();
  const formDesigner = useFormDesigner();

  const common: CommonIssuesProps = {
    issues: data,
    showFilter: false,
    onSelect: (componentId) => {
      if (!isNullOrWhiteSpace(componentId)) {
        formDesigner.setSelectedComponent(componentId);
        // form.scrollToField('bio')
      }
    },
    selectedId: formDesigner.selectedComponentId,
  };

  return (
    <CustomErrorBoundary>
      <Tabs
        size="small"
        items={[
          { key: 'flat', label: `Problems (${data.length})`, children: <IssuesList {...common} /> },
          { key: 'tree', label: 'By component', children: <IssuesTree {...common} /> },
        ]}
      />
    </CustomErrorBoundary>
  );
};
