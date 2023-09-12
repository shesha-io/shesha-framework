import React, { createContext, FC, useContext, useState } from 'react';
import { CollapsiblePanel, ICollapsiblePanelProps } from '../../components';

interface ISettingsCollapsiblePanelProps extends ICollapsiblePanelProps {
  propertyFilter: (name: string) => boolean;
}

/*export interface IRegisterFieldPayload {

}*/

export interface ISettingsCollapsiblePanelActionsContext {
  registerField: (name: string) => void;
  getPropertyFilter: () => (name: string) => boolean;
}

export const SettingsCollapsiblePanelActionsContext = createContext<ISettingsCollapsiblePanelActionsContext>(undefined);

const SettingsCollapsiblePanel: FC<ISettingsCollapsiblePanelProps> = (props) => {
  const [fields, setFields] = useState([]);

  const registerField = (name: string) => {
    if (
      !Boolean(
        fields.find((x) => {
          return x === name;
        })
      )
    )
      setFields((prev) => {
        return [...prev, name];
      });
  };

  const getPropertyFilter = () => {
    return props.propertyFilter;
  };

  const settingsCollapsiblePanelActions: ISettingsCollapsiblePanelActionsContext = {
    registerField,
    getPropertyFilter,
  };

  const show =
    !fields ||
    fields.length === 0 ||
    typeof props.propertyFilter !== 'function' ||
    Boolean(
      fields.find((x) => {
        return props.propertyFilter(x);
      })
    );

  return (
    <SettingsCollapsiblePanelActionsContext.Provider value={settingsCollapsiblePanelActions}>
      {show ? <CollapsiblePanel ghost={true} expandIconPosition="left" {...props} /> : null}
    </SettingsCollapsiblePanelActionsContext.Provider>
  );
};

export function useSettingsPanel() {
  const actionsContext = useContext(SettingsCollapsiblePanelActionsContext);
  return actionsContext !== undefined ? actionsContext : undefined;
}

export default SettingsCollapsiblePanel;
