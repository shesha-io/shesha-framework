import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { DynamicItemsEvaluationHook } from '@/providers/dynamicActionsDispatcher/models';
import React, { PropsWithChildren, FC, ComponentType } from 'react';

import { DynamicActionsProvider, IHasActions } from '../index';
import { wrapDisplayName } from '@/utils/react';

const StandardApisItems: ButtonGroupItemProps[] = [
  { id: 'r1', name: 'http', label: 'Http client', itemType: 'item', itemSubType: 'button', sortOrder: 0 },
  { id: 'r2', name: 'message', label: 'message', itemType: 'item', itemSubType: 'button', sortOrder: 1 },
  { id: 'r3', name: 'moment', label: 'moment', itemType: 'item', itemSubType: 'button', sortOrder: 2 },
];

const useStandardApis: DynamicItemsEvaluationHook = () => {
  return StandardApisItems;
};

const standardApisHoc = <TProps = unknown>(WrappedComponent: ComponentType<TProps & IHasActions>): FC<TProps> => {
  return wrapDisplayName<TProps>((props) => {
    return (<WrappedComponent {...props} items={StandardApisItems} />);
  }, 'standardApisHoc');
};

export const StandardApis: FC<PropsWithChildren> = ({ children }) => {
  return (
    <DynamicActionsProvider
      id="shesha-apis"
      name="Shesha APIs"
      renderingHoc={standardApisHoc}
      useEvaluator={useStandardApis}
    >
      {children}
    </DynamicActionsProvider>
  );
};
