import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { IObjectMetadata } from "@/interfaces";
import { Skeleton } from "antd";
import React, { ComponentType, FC } from "react";

export interface IWithFormFieldRepositoryArgs {
    propertyName: string;
    getFieldValue?: (propertyName: string) => object[];
    onChange?: (...args: any[]) => void;
}

type WithObjectMetadata<T> = Omit<T, 'availableConstants'> & {
    availableConstants?: IObjectMetadata;
};

type WithObjectMetadataAccessor<T> = Omit<T, 'availableConstants'> & {
    availableConstants?: IObjectMetadata | (() => Promise<IObjectMetadata>);
};

interface ConstantsMetadataState {
    constants: IObjectMetadata;
    state: 'loading' | 'ready';
};



export function withAvailableConstants<WrappedProps>(WrappedComponent: ComponentType<WithObjectMetadata<WrappedProps>>): FC<WithObjectMetadataAccessor<WrappedProps>> {
    return props => {
        const { availableConstants } = props;

        const constantsState = useAsyncMemo<ConstantsMetadataState>(() => {
            const promise = availableConstants
                ? typeof (availableConstants) === 'function'
                    ? availableConstants()
                    : Promise.resolve(availableConstants)
                : Promise.resolve(undefined);

            return promise.then(constants => {
                const result: ConstantsMetadataState = {
                    constants,
                    state: 'ready',
                };
                return result;
            });
        }, [availableConstants], { constants: undefined, state: 'loading' });

        return constantsState.state === 'ready'
            ? (<WrappedComponent {...props} availableConstants={constantsState.constants} />)
            : (<Skeleton loading={true} />);
    };
};