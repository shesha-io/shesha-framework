import React, { Context, PropsWithChildren, ReactElement, useContext, useEffect, useMemo, useReducer } from 'react';
import { PromisedValue } from '@/utils/promises';
import { IComponentSettings } from '../appConfigurator/models';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  loadErrorAction,
  loadRequestAction,
  loadSuccessAction,
  saveErrorAction,
  saveRequestAction,
  saveSuccessAction,
} from './actions';
import {
  IConfigurableComponentActionsContext,
  IConfigurableComponentStateContext,
  getConfigurableComponentActionsContext,
  getConfigurableComponentStateContext,
  getContextInitialState,
} from './contexts';
import reducerFactory from './reducer';
import { ComponentSettingsMigrator } from '@/components/configurableComponent/index';
import { IHasVersion, Migrator } from '@/utils/fluentMigrator/migrator';
import { isObject } from 'lodash';

export interface IGenericConfigurableComponentProviderProps<TSettings extends any> {
  initialState: IConfigurableComponentStateContext<TSettings>;
  stateContext: Context<IConfigurableComponentStateContext<TSettings>>;
  actionContext: Context<IConfigurableComponentActionsContext<TSettings>>;
  name: string;
  isApplicationSpecific: boolean;
  migrator?: ComponentSettingsMigrator<TSettings>;
}

const GenericConfigurableComponentProvider = <TSettings extends any>({
  children,
  initialState,
  stateContext,
  actionContext,
  name,
  isApplicationSpecific,
  migrator,
}: PropsWithChildren<IGenericConfigurableComponentProviderProps<TSettings>>): ReactElement => {
  const reducer = useMemo(() => reducerFactory(initialState), []);

  const { getComponent, updateComponent } = useConfigurationItemsLoader();

  const upgradeSettings = (value: TSettings): TSettings => {
    if (!isObject(value))
      return value;

    if (!migrator) return value;

    const migratorInstance = new Migrator<TSettings, TSettings>();
    const fluent = migrator(migratorInstance);
    const versionedValue = { ...value } as IHasVersion;
    if (versionedValue.version === undefined)
      versionedValue.version = -1;
    const model = fluent.migrator.upgrade(versionedValue, {});
    return model;
  };

  const initialSettingsMemo = useMemo<TSettings>(() => {
    const promised = getComponent({ name, isApplicationSpecific, skipCache: false });
    const loadedSettings = promised.value?.settings as TSettings;
    if (!loadedSettings)
      return undefined;

    return upgradeSettings(loadedSettings);
  }, [name, isApplicationSpecific]);

  const initialSettings = initialSettingsMemo;

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    name,
    settings: initialSettings,
  });

  const fetchInternal = (loader: PromisedValue<IComponentSettings>): void => {
    dispatch(loadRequestAction());

    loader.promise
      .then((component) => {
        const upToDateComponent = {
          ...component,
          settings: upgradeSettings(component.settings as TSettings),
        };
        dispatch(loadSuccessAction(upToDateComponent));
      })
      .catch((error) => {
        dispatch(loadErrorAction({ error: error?.['message'] || 'Failed to load component' }));
      });
  };

  useEffect(() => {
    if (!Boolean(name) || Boolean(state.settings)) return;

    fetchInternal(getComponent({ name, isApplicationSpecific, skipCache: false }));
  }, []);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const loadComponent = (): void => {
    var loader = getComponent({ name, isApplicationSpecific, skipCache: true });
    fetchInternal(loader);
  };

  const saveComponent = (settings: TSettings): Promise<void> => {
    if (!state.name) {
      console.error('ConfigurableComponent: save of component without `name` called');
      return Promise.resolve();
    }

    dispatch(saveRequestAction());

    // keep version number, it may be removed by the settings editor
    const version = (state.settings as IHasVersion)?.version;
    const settingsToSave = version
      ? { ...(settings as object), version }
      : settings;

    const payload = {
      module: null,
      name: state.name,
      isApplicationSpecific: isApplicationSpecific,
      settings: settingsToSave as object,
    };
    return updateComponent(payload)
      .then((_response) => {
        dispatch(saveSuccessAction({ settings: payload.settings }));
      })
      .catch((_error) => {
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

type CreateConfigurableComponentResponse<TSettings extends any> = {
  ConfigurableComponentProvider: <T extends PropsWithChildren<IConfigurableComponentProviderProps>>(props: T) => ReactElement;
  useConfigurableComponent: () => IConfigurableComponentStateContext<TSettings> & IConfigurableComponentActionsContext<TSettings>;
};

export const createConfigurableComponent = <TSettings extends any>(defaultSettings: TSettings, migrator?: ComponentSettingsMigrator<TSettings>): CreateConfigurableComponentResponse<TSettings> => {
  const initialState = getContextInitialState<TSettings>(defaultSettings);
  const StateContext = getConfigurableComponentStateContext<TSettings>(initialState);
  const ActionContext = getConfigurableComponentActionsContext<TSettings>();

  const useConfigurableComponent = (): IConfigurableComponentStateContext<TSettings> & IConfigurableComponentActionsContext<TSettings> => {
    const stateContext = useContext(StateContext);
    const actionsContext = useContext(ActionContext);

    if (stateContext === undefined || actionsContext === undefined) {
      throw new Error('useConfigurableComponent must be used within a ConfigurableComponentProvider');
    }

    return { ...stateContext, ...actionsContext };
  };

  const ConfigurableComponentProvider = <T extends PropsWithChildren<IConfigurableComponentProviderProps>>(
    props: T,
  ): ReactElement => {
    return (
      <GenericConfigurableComponentProvider<TSettings>
        initialState={initialState}
        stateContext={StateContext}
        actionContext={ActionContext}
        name={props.name}
        isApplicationSpecific={props.isApplicationSpecific}
        migrator={migrator}
      >
        {props.children}
      </GenericConfigurableComponentProvider>
    );
  };

  return { ConfigurableComponentProvider, useConfigurableComponent };
};
