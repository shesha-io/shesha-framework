import { createAction } from 'redux-actions';

export enum ConfigurableComponentActionEnums {
  addCaller = 'ADD_CALLER',
  removeCaller = 'REMOVE_CALLER',
};

export const addCallerAction = createAction<string, string>(
  ConfigurableComponentActionEnums.addCaller,
  (p) => p
);

export const removeCallerAction = createAction<string, string>(
  ConfigurableComponentActionEnums.removeCaller,
  (p) => p
);