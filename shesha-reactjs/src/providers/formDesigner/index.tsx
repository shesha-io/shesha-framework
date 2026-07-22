import React, { FC, PropsWithChildren, useContext, useEffect, useState } from 'react';
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
import { useIsDevMode } from '@/hooks/useIsDevMode';
import { isDefined } from '@/utils/nullables';
import { useDataContextManagerActionsOrUndefined } from '../dataContextManager/hooks';
import ConditionalWrap from '@/components/conditionalWrapper';
import { DataContextProvider } from '../dataContextProvider';
import ParentProvider from '../parentProvider';
import { SheshaCommonContexts } from '../dataContextManager/models';

export interface IFormDesignerProviderProps {
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
  const devMode = useIsDevMode();
  const noPageContext = !Boolean(useDataContextManagerActionsOrUndefined()?.getPageContext());

  const [formDesigner] = useState<IFormDesignerInstance>(() => {
    return new FormDesignerInstance({
      readOnly,
      toolboxComponentGroups,
      formPersister,
      formFlatMarkup: flatMarkup,
      formSettings,
      logEnabled: devMode,
    });
  });

  useEffect(() => {
    formDesigner.setReadOnly(readOnly);
  }, [formDesigner, readOnly]);

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
          {children}
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

export const useFormDesignerSubscription = (subscriptionType: FormDesignerSubscriptionType): object => {
  const formDesigner = useFormDesigner();

  const [dummy, forceUpdate] = useState({});
  useEffect(() => {
    return formDesigner.subscribe(subscriptionType, () => forceUpdate({}));
  }, [formDesigner, subscriptionType]);

  return dummy;
};

const useFormDesignerMarkup = (): IFlatComponentsStructure => {
  useFormDesignerSubscription('markup');
  return useFormDesigner().state.formFlatMarkup;
};
const useFormDesignerSettings = (): IFormSettings => {
  useFormDesignerSubscription('markup');
  return useFormDesigner().state.formSettings;
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

const useFormDesignerActiveSettingsTabKey = (): string | undefined => {
  useFormDesignerSubscription('settings-tab');
  return useFormDesigner().activeSettingsTabKey;
};

export {
  FormDesignerProvider,
  useFormDesignerOrUndefined,
  useFormDesigner,
  useFormDesignerMarkup,
  useFormDesignerSettings,
  useFormDesignerSelectedComponentId,
  useFormDesignerSelectedComponent,
  useFormDesignerReadOnly,
  useFormDesignerIsDebug,
  useFormDesignerFormMode,
  useFormDesignerUndoRedo,
  useFormDesignerIsModified,
  useFormDesignerActiveSettingsTabKey,
};
