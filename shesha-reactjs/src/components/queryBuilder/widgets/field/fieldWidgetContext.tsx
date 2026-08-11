import { WidgetProps } from '@react-awesome-query-builder/antd';
import { useContext, createContext, FC, PropsWithChildren } from 'react';

const FieldWidgetContext = createContext<WidgetProps | undefined>(undefined);

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

export const useFieldWidget = (): WidgetProps | undefined => useContext(FieldWidgetContext);
