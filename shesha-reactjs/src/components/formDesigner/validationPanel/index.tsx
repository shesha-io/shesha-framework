import { useAllValidationResults } from '@/providers/validator/hooks';
import { FC } from 'react';
import Panel from './panel';
import CollapsiblePanel from '@/components/panel';

export interface IValidationPanelProps {
  visible: boolean;
}

export const ValidationPanel: FC<IValidationPanelProps> = () => {
  const validationResults = useAllValidationResults();

  return (
    <CollapsiblePanel
      header="Validation"
      collapsible="header"
    >
      <Panel data={validationResults} />
    </CollapsiblePanel>
  );
};
