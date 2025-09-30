import React, { FC, useContext, useState } from 'react';
import { CollapsiblePanel, ICollapsiblePanelProps } from '@/components';
import { useSettingsForm } from './settingsForm';
import { createNamedContext } from '@/utils/react';

interface ISettingsCollapsiblePanelProps extends ICollapsiblePanelProps { }

export interface ISettingsCollapsiblePanelActionsContext {
  registerField: (name: string) => void;
}

export const SettingsCollapsiblePanelActionsContext = createNamedContext<ISettingsCollapsiblePanelActionsContext>(undefined, "SettingsCollapsiblePanelActionsContext");

const SettingsCollapsiblePanel: FC<ISettingsCollapsiblePanelProps> = (props) => {
  const [fields, setFields] = useState([]);
  const { propertyFilter } = useSettingsForm<any>();

  const registerField = (name: string) => {
    if (!Boolean(fields.find((x) => (x === name))))
      setFields((prev) => ([...prev, name]));
  };

  const settingsCollapsiblePanelActions: ISettingsCollapsiblePanelActionsContext = { registerField };

  const show = !fields || fields.length === 0 || typeof propertyFilter !== 'function' ||
    Boolean(fields.find((x) => (propertyFilter(x))));

  return (
        <SettingsCollapsiblePanelActionsContext.Provider value={settingsCollapsiblePanelActions}>
            {show
              ? <CollapsiblePanel expandIconPosition="start" {...props} bodyStyle={{ borderRadius: '8px' }} headerStyle={{ borderRadius: '8px' }} />
              : null}
        </SettingsCollapsiblePanelActionsContext.Provider>
  );
};

export function useSettingsPanel(required: Boolean) {
  const actionsContext = useContext(SettingsCollapsiblePanelActionsContext);
  if (actionsContext === undefined && required)
    throw new Error('useSettingsPanel must be used within a SettingsCollapsiblePanel');

  return actionsContext;
}

export default SettingsCollapsiblePanel;
