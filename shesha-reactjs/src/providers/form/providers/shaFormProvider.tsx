import React, { FC, MutableRefObject, PropsWithChildren, useContext, useRef } from "react";
import { IShaFormInstance } from '../store/interfaces';
import { DeferredUpdateProvider } from "../../deferredUpdateProvider";
import { ShaFormInstanceContext } from "../providers/contexts";

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

const FormProviderWithDeferredUpdates: FC<PropsWithChildren<IShaFormProviderProps>> = ({ children, ...props }) => {
    return (
        <DeferredUpdateProvider>
            <ShaFormProvider {...props}>
                {children}
            </ShaFormProvider>
        </DeferredUpdateProvider>
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
    FormProviderWithDeferredUpdates as ShaFormProvider,
    useShaFormInstance,
    useShaFormRef,
};