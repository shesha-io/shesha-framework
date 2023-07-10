import { useDataContextRegister } from "providers/dataContextManager";
import React, { FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { createContext } from 'react';

export interface IDataContextProviderStateContext {
    id: string;
    name: string;
    type: string;
    data?: object;
}

/*export interface IDataContextProviderActionsContext {
    onChange: (name: string | string[], value: any) => void;
}*/

/** initial state */
export const DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE: IDataContextProviderStateContext = { id: '', name: '', type: '', data: {} };

export const DataContextProviderStateContext = createContext<IDataContextProviderStateContext>(DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE);
//export const DataContextProviderActionsContext = createContext<IDataContextProviderActionsContext>(undefined);

export type DataContextType = 'root' | 'custom' | string;

export interface IDataContextProviderProps { 
    id: string;
    name: string;
    type: DataContextType;
    data?: object;
}

const DataContextProvider: FC<PropsWithChildren<IDataContextProviderProps>> = ({ children, ...props }) => {

    const [state,setState] = useState<IDataContextProviderStateContext>(props);
    const { id, name, type = 'custom', data } = props;

    useEffect(() => {
        setState({id, name, type,  data});
    }, [id, name, data]);

    /*const onChange = (name: string, value: any) => {
        setState({...state, data: {...state.data, [name]: value}});
    };*/

    const parentContext = useDataContext(false);
    useDataContextRegister({id, name, type, data, parentId: parentContext.id}, [id, name, parentContext.id ]);

    return (
        <DataContextProviderStateContext.Provider value={state}>
            {children}
        </DataContextProviderStateContext.Provider>
        /*<DataContextProviderActionsContext.Provider value={{ onChange }}>
            <DataContextProviderStateContext.Provider value={state}>
                <DataContextRegistrar {...props} parentDataContext={parentContext}>
                    {children}
                </DataContextRegistrar>
            </DataContextProviderStateContext.Provider>
        </DataContextProviderActionsContext.Provider>*/
    );
};

export interface IDataContextRegistrarProps extends IDataContextProviderProps { 
    parentDataContext?: DataContextFullInstance;
}

/*const DataContextRegistrar: FC<PropsWithChildren<IDataContextRegistrarProps>> = ({ children, id, name, data, parentDataContext }) => {
    const context = useDataContext();
    useDataContextRegister({id, name, data, parentId: parentDataContext.id}, [id, name, parentDataContext.id ]);
    return <>{children}</>;
};*/

function useDataContext(require: boolean = true) {
    //const actionsContext = useContext(DataContextProviderActionsContext);
    const stateContext = useContext(DataContextProviderStateContext);
  
    if ((/*actionsContext === undefined || */stateContext === undefined) && require) {
      throw new Error('useDataContext must be used within a DataContextProvider');
    }
    return /*actionsContext !== undefined &&*/ stateContext !== undefined
      ? { /*...actionsContext, */...stateContext } as DataContextFullInstance
      : undefined;
}

export interface DataContextFullInstance extends IDataContextProviderStateContext/*, IDataContextProviderActionsContext*/ { }
 
export { DataContextProvider, useDataContext };