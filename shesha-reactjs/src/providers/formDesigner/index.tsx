/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import { FC, PropsWithChildren, useCallback, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { useFormDesignerComponentGroups } from '../form/hooks';
import { FormMode, IConfigurableFormComponent, IFlatComponentsStructure, IFormSettings, isConfigurableFormComponent } from '../form/models';
import {
  FormDesignerContext,
  IFormDesignerInstance,
  IUndoable,
} from './contexts';
import { FormDesignerInstance } from './instance';
import { FormDesignerSubscriptionType } from './models';
import { useFormPersister } from '../formPersisterProvider';
import { isDefined } from '@/utils/nullables';
import { useDataContextManagerActionsOrUndefined } from '../dataContextManager/hooks';
import ConditionalWrap from '@/components/conditionalWrapper';
import { DataContextProvider } from '../dataContextProvider';
import ParentProvider from '../parentProvider';
import { SheshaCommonContexts } from '../dataContextManager/models';
import { ValidationCollectorContext } from '../validator/contexts';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { useTheme } from '../theme';
import { useCanvas } from '../canvas';
import { useConfigurableActionDispatcher } from '../configurableActionsDispatcher';
import { useAvailableConstantsDataNoRefresh, useConfigurationItemsLoader, useHttpClient, useSettingsComponents } from '../..';

interface IFormDesignerProviderProps {
  flatMarkup: IFlatComponentsStructure;
  formSettings: IFormSettings;
  readOnly: boolean;
}

const FormDesignerProvider: FC<PropsWithChildren<IFormDesignerProviderProps>> = ({ children, ...props }) => {
  const {
    flatMarkup,
    formSettings,
    readOnly,
  } = props;
  const toolboxComponentGroups = useFormDesignerComponentGroups();
  const formPersister = useFormPersister();
  const httpClient = useHttpClient();
  const { theme } = useTheme();
  const { activeDevice } = useCanvas();
  const noPageContext = !Boolean(useDataContextManagerActionsOrUndefined()?.getPageContext());
  const formBuilderFactory = useFormBuilderFactory();
  const { getConfigurableActionOrNull } = useConfigurableActionDispatcher();
  const settingsComponents = useSettingsComponents();
  const allData = useAvailableConstantsDataNoRefresh();
  const configurationLoader = useConfigurationItemsLoader();

  const [formDesigner] = useState<IFormDesignerInstance>(() => {
    return new FormDesignerInstance({
      httpClient,
      readOnly,
      toolboxComponentGroups,
      settingsComponents: settingsComponents,
      formPersister,
      formFlatMarkup: flatMarkup,
      formSettings,
      // logEnabled: devMode,
      formBuilderFactory,
      theme,
      activeDevice,
      getConfigurableActionOrNull: getConfigurableActionOrNull,
      appContext: allData,
      configurationLoader: configurationLoader,
    });
  });

  useEffect(() => {
    formDesigner.setReadOnly(readOnly);
  }, [formDesigner, readOnly]);
  useEffect(() => {
    formDesigner.setActiveDevice(activeDevice);
  }, [formDesigner, activeDevice]);

  // TODO: sync markup and settings
  useEffect(() => {
    formDesigner.setMarkupAndSettings(flatMarkup, formSettings);
  }, [formDesigner, flatMarkup, formSettings]);

  /* Use special format of parent properties to avoid adding form context */
  /* pageContext has added only to customize the designed form. It is not used as a data context.*/
  /* formContext has added only to customize the designed form. It is not used as a data context.*/
  return (
    <ParentProvider model={null} formMode="designer" name="designer" isScope addContext={false}>
      <ConditionalWrap
        condition={noPageContext}
        wrap={(children) => (
          <DataContextProvider
            id={SheshaCommonContexts.PageContext}
            description="Designer Page context"
            name={SheshaCommonContexts.PageContext}
            type="page"
            webStorageType="sessionStorage"
          >
            <DataContextProvider
              id={SheshaCommonContexts.FormContext}
              description="Designer Form context"
              name={SheshaCommonContexts.FormContext}
              type="form"
              webStorageType="sessionStorage"
            >
              {children}
            </DataContextProvider>
          </DataContextProvider>
        )}
      >
        <FormDesignerContext.Provider value={formDesigner}>
          <ValidationCollectorContext.Provider value={formDesigner.validationCollector}>
            {children}
          </ValidationCollectorContext.Provider>
        </FormDesignerContext.Provider>
      </ConditionalWrap>
    </ParentProvider>
  );
};

const useFormDesignerOrUndefined = (): IFormDesignerInstance | undefined => {
  return useContext(FormDesignerContext);
};

const useFormDesigner = (): IFormDesignerInstance => {
  const formDesigner = useFormDesignerOrUndefined();
  if (formDesigner === undefined) {
    throw new Error('useFormDesigner must be used within a FormDesignerProvider');
  }
  return formDesigner;
};

const useFormDesignerSubscription = (subscriptionType: FormDesignerSubscriptionType): object => {
  const formDesigner = useFormDesigner();

  const [dummy, forceUpdate] = useState({});
  useEffect(() => {
    return formDesigner.subscribe(subscriptionType, () => forceUpdate({}));
  }, [formDesigner, subscriptionType]);

  return dummy;
};

const getSettingsPanelServerSnapshot = (): null => null;

/**
 * Element of the properties panel to render the settings of the selected component into.
 * Note: the element is assigned by a ref callback during the commit phase, i.e. after the components are rendered.
 * `useSyncExternalStore` re-reads it right after subscribing, a plain subscription would miss that assignment
 * on mount and the components would keep rendering with the stale `null` (#4223)
 */
const useFormDesignerSettingsPanelElement = (): HTMLDivElement | null => {
  const formDesigner = useFormDesigner();

  const subscribe = useCallback(
    (onStoreChange: () => void) => formDesigner.subscribe('selection', onStoreChange),
    [formDesigner],
  );
  const getSnapshot = useCallback(() => formDesigner.settingsPanelElement, [formDesigner]);

  return useSyncExternalStore(subscribe, getSnapshot, getSettingsPanelServerSnapshot);
};

/** The designer's structure version. Re-renders only when a container's list of children changes */
const useFormDesignerStructureVersion = (): number => {
  const formDesigner = useFormDesigner();
  const subscribe = useCallback((onStoreChange: () => void) => formDesigner.subscribe('structure', onStoreChange), [formDesigner]);
  const getSnapshot = useCallback(() => formDesigner.structureVersion, [formDesigner]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

/**
 * For components that show one pane at a time (Tabs, Wizard, Collapsible Panel): opens a pane when the designer
 * asks for it to be revealed, e.g. after a component inside it was selected in the Layers panel.
 * Pass a stable `open` (useCallback). Does nothing outside the form designer.
 */
const useFormDesignerReveal = (containerIds: readonly string[], open: (containerId: string) => void): void => {
  const formDesigner = useFormDesignerOrUndefined();
  const idsKey = containerIds.join('\n');

  useEffect(() => {
    if (!isDefined(formDesigner))
      return undefined;
    const ids = idsKey.split('\n');
    let timer: number | undefined;
    // On the next tick, so the component's own mount effects (Tabs selecting its default tab) can't undo it,
    // and StrictMode's extra unmount cancels it instead of using up the request
    const apply = (): void => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const request = formDesigner.revealRequest;
        request.containerIds
          .filter((id) => ids.includes(id) && !request.opened.has(id))
          .forEach((id) => {
            request.opened.add(id);
            open(id);
          });
      }, 0);
    };
    apply();
    const unsubscribe = formDesigner.subscribe('reveal', apply);
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [formDesigner, idsKey, open]);
};

/** False while the selected component isn't drawn on the canvas (e.g. it sits in a closed tab) */
const useFormDesignerIsSelectedMounted = (): boolean => {
  const formDesigner = useFormDesigner();
  const subscribe = useCallback((onStoreChange: () => void) => {
    const unsubscribeMounted = formDesigner.subscribe('mounted', onStoreChange);
    const unsubscribeSelection = formDesigner.subscribe('selection', onStoreChange);
    return () => {
      unsubscribeMounted();
      unsubscribeSelection();
    };
  }, [formDesigner]);
  const getSnapshot = useCallback(() => {
    const id = formDesigner.selectedComponentId;
    return !isDefined(id) || formDesigner.isComponentMounted(id);
  }, [formDesigner]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

const useFormDesignerMarkup = (): IFlatComponentsStructure => {
  useFormDesignerSubscription('markup');
  return useFormDesigner().state.formFlatMarkup;
};
const useFormDesignerSettings = (): IFormSettings => {
  useFormDesignerSubscription('markup');
  return useFormDesigner().state.formSettings;
};
const useFormDesignerSettingsEditorVisible = (): boolean => {
  useFormDesignerSubscription('settings');
  return useFormDesigner().isFormSettingsVisible;
};
const useFormDesignerSelectedComponentId = (): string | undefined => {
  useFormDesignerSubscription('selection');
  return useFormDesigner().selectedComponentId;
};
const useFormDesignerSelectedComponent = (): IConfigurableFormComponent | undefined => {
  const id = useFormDesignerSelectedComponentId();
  const markup = useFormDesignerMarkup();

  return isDefined(id) && isConfigurableFormComponent(markup.allComponents[id])
    ? markup.allComponents[id]
    : undefined;
};


const useFormDesignerReadOnly = (): boolean => {
  useFormDesignerSubscription('readonly');
  return useFormDesigner().readOnly;
};
const useFormDesignerIsDebug = (): boolean => {
  useFormDesignerSubscription('debug');
  return useFormDesigner().isDebug;
};
const useFormDesignerFormMode = (): FormMode => {
  useFormDesignerSubscription('mode');
  return useFormDesigner().formMode;
};
const useFormDesignerIsModified = (): boolean => {
  useFormDesignerSubscription('data-modified');
  return useFormDesigner().isDataModified;
};

const useFormDesignerUndoRedo = (): IUndoable => {
  useFormDesignerSubscription('history');
  const designer = useFormDesigner();
  return {
    canRedo: designer.canRedo,
    canUndo: designer.canUndo,
    redo: designer.redo,
    undo: designer.undo,
    future: designer.future,
    past: designer.past,
    history: designer.history,
    historyIndex: designer.historyIndex,
  };
};

export {
  FormDesignerProvider,
  useFormDesignerReveal,
  useFormDesigner,
  useFormDesignerFormMode,
  useFormDesignerIsDebug,
  useFormDesignerIsModified,
  useFormDesignerIsSelectedMounted,
  useFormDesignerMarkup,
  useFormDesignerOrUndefined,
  useFormDesignerReadOnly,
  useFormDesignerSelectedComponent,
  useFormDesignerSelectedComponentId,
  useFormDesignerSettings,
  useFormDesignerSettingsPanelElement,
  useFormDesignerStructureVersion,
  useFormDesignerUndoRedo,
  useFormDesignerSettingsEditorVisible,
};
