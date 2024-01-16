import React, { createContext, useContext, FC, PropsWithChildren } from "react";
import { FormMode } from "../index";

export interface IParentProviderStateContext {
  formMode?: FormMode;
  subFormIdPrefix?: string;
  context?: string;
  model: any;
}

export interface IParentProviderProps { 
  formMode?: FormMode;
  subFormIdPrefix?: string;
  context?: string;
  model: any;
}

export const ParentProviderStateContext = createContext<IParentProviderStateContext>({model: {}});

const ParentProvider: FC<PropsWithChildren<IParentProviderProps>> = (props) => {
  const { 
    children,
    subFormIdPrefix,
    model,
    formMode,
    context
  } = props;

  const parent = useParent(false);

  const value: IParentProviderStateContext = {
    formMode: formMode ?? parent?.formMode,
    subFormIdPrefix: subFormIdPrefix ?? parent?.subFormIdPrefix,
    context,
    model: {...parent?.model, ...model}
  };

  return (
    <ParentProviderStateContext.Provider value={value}>
      {children}
    </ParentProviderStateContext.Provider>
  );
};

export function useParent(require: boolean = true) {
  const stateContext = useContext(ParentProviderStateContext);

  if (stateContext === undefined && require) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return stateContext;
}

export default ParentProvider;