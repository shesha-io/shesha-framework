import { FC } from 'react';
import { Tabs } from 'antd';
import { IssuesList } from './issuesList';
import { IssuesTree } from './issuesTree';
import { useAllValidationResults } from '@/providers/validator/hooks';
import CustomErrorBoundary from '@/components/customErrorBoundary';
import { FieldValidationError } from '@/interfaces';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { useFormDesigner } from '@/providers/formDesigner';
import { isNonEmptyArray } from '@/utils/array';

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

    onSelect: (componentId, issue) => {
      if (!isNullOrWhiteSpace(componentId)) {
        formDesigner.setSelectedComponent(componentId);
        // form.scrollToField('bio')
      } else {
        if (isDefined(issue) && isNonEmptyArray(issue.path) && issue.path[0].kind === "form-settings") {
          formDesigner.openFormSettings();
        }
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
