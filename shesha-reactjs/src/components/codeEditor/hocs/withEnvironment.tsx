import { useAsyncMemo } from "@/hooks/useAsyncMemo";
import { IObjectMetadata } from "@/interfaces";
import { IMetadata } from "@/interfaces/metadata";
import { wrapDisplayName } from "@/utils/react";
import { Skeleton } from "antd";
import React, { ComponentType, FC } from "react";

type ResultMetadata = IMetadata | IObjectMetadata;

type WithEnvironment<T> = Omit<T, 'availableConstants' | 'resultType'> & {
  availableConstants?: IObjectMetadata;
  resultType?: ResultMetadata;
};

type WithEnvironmentAccessors<T> = Omit<T, 'availableConstants' | 'resultType'> & {
  availableConstants?: IObjectMetadata | (() => Promise<IObjectMetadata>);
  resultType?: ResultMetadata | (() => Promise<ResultMetadata>);
};

interface EnvironmentMetadataState {
  constants: IObjectMetadata;
  resultType: ResultMetadata;
  state: 'loading' | 'ready';
};

const evaluatePromise = <TResult extends IMetadata>(value: TResult | (() => Promise<TResult>)): Promise<TResult> => {
  const result: Promise<TResult> = value
    ? typeof (value) === 'function'
      ? value()
      : Promise.resolve(value)
    : Promise.resolve(undefined);
  return result;
};

export function withEnvironment<WrappedProps>(WrappedComponent: ComponentType<WithEnvironment<WrappedProps>>): FC<WithEnvironmentAccessors<WrappedProps>> {
  return wrapDisplayName((props) => {
    const { availableConstants, resultType } = props;

    const state = useAsyncMemo<EnvironmentMetadataState>(() => {
      const constantsPromise = evaluatePromise<IObjectMetadata>(availableConstants);
      const resultTypePromise = evaluatePromise<ResultMetadata>(resultType);

      return Promise.all([constantsPromise, resultTypePromise]).then(([constants, resultType]) => {
        const result: EnvironmentMetadataState = {
          constants,
          resultType,
          state: 'ready',
        };

        return result;
      });
    }, [availableConstants], { constants: undefined, resultType: undefined, state: 'loading' });

    return state.state === 'ready'
      ? (
        <WrappedComponent
          {...props}
          availableConstants={state.constants}
          resultType={state.resultType}
        />
      )
      : (<Skeleton loading={true} />);
  }, "withEnvironment");
};
