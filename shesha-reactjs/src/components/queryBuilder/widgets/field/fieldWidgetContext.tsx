import { WidgetProps } from '@react-awesome-query-builder/antd';
import React, { createContext, FC, PropsWithChildren } from 'react';

const FieldWidgetContext = createContext<WidgetProps>(null);

export interface FieldWidgetProviderProps {
  widgetProps: WidgetProps;
}
export const FieldWidgetProvider: FC<PropsWithChildren<FieldWidgetProviderProps>> = (props) => {
  return (
    <FieldWidgetContext.Provider value={props.widgetProps}>
      {props.children}
    </FieldWidgetContext.Provider>
  );
};

export const useFieldWidget = (): WidgetProps => React.useContext(FieldWidgetContext);
