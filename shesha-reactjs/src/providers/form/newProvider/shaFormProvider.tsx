import React, { FC, MutableRefObject, PropsWithChildren, useContext, useRef } from "react";
import { IShaFormInstance } from '../store/interfaces';
import { DelayedUpdateProvider } from "../../delayedUpdateProvider";
import { ShaFormInstanceContext } from "./contexts";

export interface IShaFormProviderProps {
    shaForm: IShaFormInstance;
}

const ShaFormProvider: FC<PropsWithChildren<IShaFormProviderProps>> = ({ children, shaForm }) => {
    return (
        <ShaFormInstanceContext.Provider value={shaForm}>
            {children}
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
    useShaFormRef,
};