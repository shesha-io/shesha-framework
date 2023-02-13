import React, { useContext, PropsWithChildren, useEffect, Context, useReducer, useMemo } from 'react';
import reducerFactory from './reducer';
import {
  getConfigurableComponentActionsContext,
  getConfigurableComponentStateContext,
  getContextInitialState,
  IConfigurableComponentActionsContext,
  IConfigurableComponentStateContext,
} from './contexts';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  loadRequestAction,
  loadSuccessAction,
  loadErrorAction,
  saveRequestAction,
  saveSuccessAction,
  saveErrorAction,
} from './actions';
import { useConfigurationItemsLoader } from '../configurationItemsLoader';
import { PromisedValue } from '../../utils/promises';
import { IComponentSettings } from '../appConfigurator/models';

export interface IGenericConfigurableComponentProviderProps<TSettings extends any> {
  initialState: IConfigurableComponentStateContext<TSettings>;
  stateContext: Context<IConfigurableComponentStateContext<TSettings>>;
  actionContext: Context<IConfigurableComponentActionsContext<TSettings>>;
  name: string;
  isApplicationSpecific: boolean;
}

const GenericConfigurableComponentProvider = <TSettings extends any>({
  children,
  initialState,
  stateContext,
  actionContext,
  name,
  isApplicationSpecific,
}: PropsWithChildren<IGenericConfigurableComponentProviderProps<TSettings>>) => {
  const reducer = useMemo(() => (reducerFactory(initialState)), []);

  const { getComponent, updateComponent } = useConfigurationItemsLoader();

  const settingsPromise = useMemo(() => {
    return getComponent({ name, isApplicationSpecific, skipCache: false });
  }, [name, isApplicationSpecific]);

  const initialSettings = settingsPromise?.value?.settings as TSettings;

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    name,
    settings: initialSettings,
  });

  useEffect(() => {
    if (!Boolean(name) || Boolean(state.settings))
      return;

    fetchInternal(getComponent({ name, isApplicationSpecific, skipCache: false }));
  }, []);

  const fetchInternal = (loader: PromisedValue<IComponentSettings>) => {
    dispatch(loadRequestAction({ name, isApplicationSpecific }));
    loader.promise.then(settings => {
      dispatch(loadSuccessAction({ ...settings }));
    }).catch((error) => {
      dispatch(loadErrorAction({ error: error?.['message'] || 'Failed to load component' }))
    });
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const loadComponent = () => {
    var loader = getComponent({ name, isApplicationSpecific, skipCache: true });
    fetchInternal(loader);
  };

  const saveComponent = (settings: TSettings): Promise<void> => {
    if (!state.name) {
      console.error('ConfigurableComponent: save of component without `name` called');
      return Promise.resolve();
    }

    dispatch(saveRequestAction({}));

    const payload = {
      module: null,
      name: state.name,
      isApplicationSpecific: isApplicationSpecific,
      settings: settings as object
    };
    return updateComponent(payload)
      .then(_response => {
        dispatch(saveSuccessAction({ settings: payload.settings }));
      })
      .catch(_error => {
        dispatch(saveErrorAction({ error: '' }));
      });
  };

  const configurableFormActions: IConfigurableComponentActionsContext<TSettings> = {
    ...getFlagSetters(dispatch),
    load: loadComponent,
    save: saveComponent,
    /* NEW_ACTION_GOES_HERE */
  };

  return (
    <stateContext.Provider value={state}>
      <actionContext.Provider value={configurableFormActions}>{children}</actionContext.Provider>
    </stateContext.Provider>
  );
};

export interface IConfigurableComponentProviderProps {
  name: string;
  isApplicationSpecific: boolean;
}

export const createConfigurableComponent = <TSettings extends any>(defaultSettings: TSettings) => {
  const initialState = getContextInitialState<TSettings>(defaultSettings);
  const StateContext = getConfigurableComponentStateContext<TSettings>(initialState);
  const ActionContext = getConfigurableComponentActionsContext<TSettings>();

  const useConfigurableComponent = () => {
    const stateContext = useContext(StateContext);
    const actionsContext = useContext(ActionContext);

    if (stateContext === undefined || actionsContext === undefined) {
      throw new Error('useConfigurableComponent must be used within a ConfigurableComponentProvider');
    }

    return { ...stateContext, ...actionsContext };
  };

  const ConfigurableComponentProvider = <T extends PropsWithChildren<IConfigurableComponentProviderProps>>(
    props: T
  ) => {
    return (
      <GenericConfigurableComponentProvider<TSettings>
        initialState={initialState}
        stateContext={StateContext}
        actionContext={ActionContext}
        name={props.name}
        isApplicationSpecific={props.isApplicationSpecific}
      >
        {props.children}
      </GenericConfigurableComponentProvider>
    );
  };

  return { ConfigurableComponentProvider, useConfigurableComponent };
};
