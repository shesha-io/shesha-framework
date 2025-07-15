import React, { FC, MutableRefObject, PropsWithChildren, useContext, useEffect, useRef } from "react";
import { IShaFormInstance } from '../store/interfaces';
import { DelayedUpdateProvider } from "../../delayedUpdateProvider";
import { ShaFormDataUpdateContext, ShaFormInstanceContext } from "../providers/contexts";

export interface IShaFormProviderProps {
    shaForm: IShaFormInstance;
}

const ShaFormProvider: FC<PropsWithChildren<IShaFormProviderProps>> = ({ children, shaForm }) => {
    const [state, setState] = React.useState({});

    // force update context on change form data
    useEffect(() => {
      shaForm.updateData = () => setState({}); 
    }, []);

    return (
        <ShaFormInstanceContext.Provider value={shaForm}>
            <ShaFormDataUpdateContext.Provider value={state}>
                {children}
            </ShaFormDataUpdateContext.Provider>
        </ShaFormInstanceContext.Provider>
    );
};

const FormProviderWithDelayedUpdates: FC<PropsWithChildren<IShaFormProviderProps>> = ({ children, ...props }) => {
    return (
        <DelayedUpdateProvider>
            <ShaFormProvider {...props}>
                {children}
            </ShaFormProvider>
        </DelayedUpdateProvider>
    );
};

const useShaFormRef = (): MutableRefObject<IShaFormInstance> => {
    return useRef<IShaFormInstance>();
};

const useShaFormDataUpdate = (): object => useContext(ShaFormDataUpdateContext);

const useShaFormInstance = (required: boolean = true): IShaFormInstance => {
    const context = useContext(ShaFormInstanceContext);

    if (required && context === undefined) {
        throw new Error('useShaFormInstance must be used within a ShaFormProvider');
    }

    return context;
};

export {
    FormProviderWithDelayedUpdates as ShaFormProvider,
    useShaFormInstance,
    useShaFormDataUpdate,
    useShaFormRef,
};