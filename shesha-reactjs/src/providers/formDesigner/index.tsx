import React, { FC, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { useFormDesignerComponentGroups } from '../form/hooks';
import { FormMode, IFlatComponentsStructure, IFormSettings } from '../form/models';
import {
  FormDesignerContext,
  IFormDesignerInstance,
  IUndoable,
} from './contexts';
import { FormDesignerInstance } from './instance';
import { FormDesignerSubscriptionType } from './models';
import { useFormPersister } from '../formPersisterProvider';
import { useIsDevMode } from '@/hooks/useIsDevMode';

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
  const settingsPanelRef = useRef<HTMLDivElement>();
  const devMode = useIsDevMode();

  const [formDesigner] = useState<IFormDesignerInstance>(() => {
    return new FormDesignerInstance({
      readOnly,
      toolboxComponentGroups,
      formPersister,
      formFlatMarkup: flatMarkup,
      formSettings,
      settingsPanelRef,
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

  return (
    <FormDesignerContext.Provider value={formDesigner}>
      {children}
    </FormDesignerContext.Provider>
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
  useFormDesignerOrUndefined,
  useFormDesigner,
  useFormDesignerMarkup,
  useFormDesignerSettings,
  useFormDesignerSelectedComponentId,
  useFormDesignerReadOnly,
  useFormDesignerIsDebug,
  useFormDesignerFormMode,
  useFormDesignerUndoRedo,
  useFormDesignerIsModified,
};
