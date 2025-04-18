import React, { FC, MutableRefObject, PropsWithChildren, useContext, useEffect, useMemo, useRef } from 'react';
import { useDeepCompareEffect } from 'react-use';
import useThunkReducer from '@/hooks/thunkReducer';
import {
  IAsyncValidationError,
  IFormValidationErrors,
  ISettingsFormFactory,
  IToolboxComponent,
  IToolboxComponentGroup,
} from '@/interfaces';
import { UndoableActionCreators } from '@/utils/undoable';
import { useFormDesignerComponentGroups, useFormDesignerComponents } from '../form/hooks';
import { FormMode, IFlatComponentsStructure, IFormSettings } from '../form/models';
import { IComponentSettingsEditorsCache, IDataSource } from '../formDesigner/models';
import {
  addDataSourceAction,
  componentAddAction,
  componentAddFromTemplateAction,
  componentDeleteAction,
  componentDuplicateAction,
  componentUpdateAction,
  componentUpdateSettingsValidationAction,
  dataPropertyAddAction,
  endDraggingAction,
  endDraggingNewItemAction,
  removeDataSourceAction,
  setActiveDataSourceAction,
  setDebugModeAction,
  setFlatComponentsAction,
  setFormModeAction,
  setReadOnlyAction,
  setSelectedComponentAction,
  setValidationErrorsAction,
  startDraggingAction,
  startDraggingNewItemAction,
  updateChildComponentsAction,
  updateFormSettingsAction,
  updateToolboxComponentGroupsAction,
} from './actions';
import {
  FORM_DESIGNER_CONTEXT_INITIAL_STATE,
  FormDesignerActionsContext,
  FormDesignerStateContext,
  IAddDataPropertyPayload,
  IComponentAddFromTemplatePayload,
  IComponentAddPayload,
  IComponentDeletePayload,
  IComponentDuplicatePayload,
  IComponentUpdatePayload,
  IFormDesignerActionsContext,
  IFormDesignerStateContext,
  IUpdateChildComponentsPayload,
  UndoableFormDesignerStateContext,
} from './contexts';
import formReducer from './reducer';
import { useCallback } from 'react';
import { useContextSelector } from 'use-context-selector';

export interface IFormDesignerProviderProps {
  flatMarkup: IFlatComponentsStructure;
  formSettings: IFormSettings;
  readOnly: boolean;
}

const FormDesignerProvider: FC<PropsWithChildren<IFormDesignerProviderProps>> = ({
  children,
  flatMarkup,
  formSettings,
  readOnly,
}) => {
  const toolboxComponentGroups = useFormDesignerComponentGroups();
  const toolboxComponents = useFormDesignerComponents();
  const settingsPanelRef = useRef();
  const componentInitialization = useRef<Boolean>(false);

  const getToolboxComponent = useCallback((type: string) => toolboxComponents[type], [toolboxComponents]);
  const componentEditors = useRef<IComponentSettingsEditorsCache>({});

  const getCachedComponentEditor = useCallback((type: string, evaluator: (() => ISettingsFormFactory)) => {
    const existingEditor = componentEditors.current[type];
    if (existingEditor !== undefined)
      return existingEditor;

    return componentEditors.current[type] = evaluator();
  }, [componentEditors]);

  const [state, dispatch] = useThunkReducer(formReducer, undefined, () => {
    const initial: IFormDesignerStateContext = {
      ...FORM_DESIGNER_CONTEXT_INITIAL_STATE,
      readOnly: readOnly,
      toolboxComponentGroups,
      formFlatMarkup: flatMarkup,
      formSettings: formSettings,
      settingsPanelRef: settingsPanelRef,
    };
    return {
      past: [],
      present: initial,
      future: [],
    };
  });

  const statePresent = state.present;
  const { formFlatMarkup } = statePresent;

  useEffect(() => {
    if (flatMarkup && formFlatMarkup !== flatMarkup) {
      dispatch((dispatchThunk, _getState) => {
        dispatchThunk(setFlatComponentsAction(flatMarkup));
        dispatchThunk(UndoableActionCreators.clearHistory());
      });
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatMarkup]);

  const setReadOnly = useCallback((value: boolean) => {
    dispatch(setReadOnlyAction(value));
  }, [dispatch]);

  useEffect(() => {
    setReadOnly(readOnly);
  }, [readOnly]);

  const updateToolboxComponentGroups = (payload: IToolboxComponentGroup[]) => {
    dispatch(updateToolboxComponentGroupsAction(payload));
  };

  useDeepCompareEffect(() => {
    if (toolboxComponentGroups?.length !== 0) {
      updateToolboxComponentGroups(toolboxComponentGroups);
    }
  }, [toolboxComponentGroups]);

  const addDataProperty = useCallback((payload: IAddDataPropertyPayload) => {
    dispatch(dataPropertyAddAction(payload));
  }, [dispatch]);

  const addComponent = useCallback((payload: IComponentAddPayload) => {
    dispatch(componentAddAction(payload));
  }, [dispatch]);

  const addComponentsFromTemplate = useCallback((payload: IComponentAddFromTemplatePayload) => {
    dispatch(componentAddFromTemplateAction(payload));
  }, [dispatch]);

  const deleteComponent = useCallback((payload: IComponentDeletePayload) => {
    dispatch(componentDeleteAction(payload));
  }, [dispatch]);

  const duplicateComponent = useCallback((payload: IComponentDuplicatePayload) => {
    dispatch(componentDuplicateAction(payload));
  }, [dispatch]);

  const updateComponent = useCallback((payload: IComponentUpdatePayload) => {
    // ToDo: AS - optimize
     if (componentInitialization.current) {
      // Do not trigger an update if first component initialization (reduce unnecessary re-renders)
      componentInitialization.current = false;
      return; 
    }

    dispatch(componentUpdateAction(payload));
    const component = flatMarkup.allComponents[payload.componentId];
    if (!component)
      return; // TODO: debug validation, component must be defined
    const toolboxComponent = getToolboxComponent(component.type) as IToolboxComponent;
    if (toolboxComponent.validateSettings) {
      toolboxComponent
        .validateSettings(payload.settings)
        .then(() => {
          if (component.settingsValidationErrors && component.settingsValidationErrors.length > 0)
            dispatch(componentUpdateSettingsValidationAction({ componentId: payload.componentId, validationErrors: [] }));
        })
        .catch(({ errors }) => {
          const validationErrors = errors as IAsyncValidationError[];
          dispatch(
            componentUpdateSettingsValidationAction({
              componentId: payload.componentId,
              validationErrors,
            })
          );
        });
    }
  }, [dispatch]);

  const setDebugMode = useCallback((isDebug: boolean) => {
    dispatch(setDebugModeAction(isDebug));
  }, [dispatch]);

  const startDraggingNewItem = useCallback(() => {
    dispatch(startDraggingNewItemAction());
  }, [dispatch]);

  const endDraggingNewItem = useCallback(() => {
    dispatch(endDraggingNewItemAction());
  }, [dispatch]);

  const startDragging = useCallback(() => {
    dispatch(startDraggingAction());
  }, [dispatch]);

  const endDragging = useCallback(() => {
    dispatch(endDraggingAction());
  }, [dispatch]);

  const setValidationErrors = useCallback((payload: IFormValidationErrors) => {
    dispatch(setValidationErrorsAction(payload));
  }, [dispatch]);

  const updateChildComponents = useCallback((payload: IUpdateChildComponentsPayload) => {
    dispatch(updateChildComponentsAction(payload));
  }, [dispatch]);

  const undo = useCallback(() => {
    dispatch(UndoableActionCreators.undo());
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch(UndoableActionCreators.redo());
  }, [dispatch]);

  const setSelectedComponent = useCallback((componentId: string, componentRef?: MutableRefObject<any>) => {
    if (componentId !== state.present.selectedComponentId ||
      componentRef !== state.present.selectedComponentRef)
      dispatch(setSelectedComponentAction({ id: componentId, componentRef }));
      componentInitialization.current = true;
  }, [dispatch]);

  const updateFormSettings = useCallback((settings: IFormSettings) => {
    dispatch(updateFormSettingsAction(settings));
  }, [dispatch]);

  //#region move to designer
  const addDataSource = useCallback((dataSource: IDataSource) => {
    dispatch(addDataSourceAction(dataSource));
  }, [dispatch]);
  const removeDataSource = useCallback((datasourceId: string) => {
    dispatch(removeDataSourceAction(datasourceId));
  }, [dispatch]);

  const setActiveDataSource = useCallback((datasourceId: string) => {
    dispatch(setActiveDataSourceAction(datasourceId));
  }, [dispatch]);

  const setFormMode = useCallback((value: FormMode) => {
    dispatch(setFormModeAction(value));
  }, [dispatch]);

  //#endregion

  const configurableFormActions: IFormDesignerActionsContext = useMemo(() => {
    return {
      addDataProperty,
      addComponent,
      addComponentsFromTemplate,
      deleteComponent,
      duplicateComponent,
      updateComponent,
      setDebugMode,
      startDraggingNewItem,
      endDraggingNewItem,
      startDragging,
      endDragging,
      setValidationErrors,
      updateChildComponents,
      undo,
      redo,
      setSelectedComponent,
      updateFormSettings,
      getToolboxComponent,
      addDataSource,
      removeDataSource,
      setActiveDataSource,
      setReadOnly,
      setFormMode,
      getCachedComponentEditor,
    };
  }, [
    addDataProperty,
    addComponent,
    addComponentsFromTemplate,
    deleteComponent,
    duplicateComponent,
    updateComponent,
    setDebugMode,
    startDraggingNewItem,
    endDraggingNewItem,
    startDragging,
    endDragging,
    setValidationErrors,
    updateChildComponents,
    undo,
    redo,
    setSelectedComponent,
    updateFormSettings,
    getToolboxComponent,
    addDataSource,
    removeDataSource,
    setActiveDataSource,
    setReadOnly
    /* NEW_ACTION_GOES_HERE */
  ]);

  return (
    <UndoableFormDesignerStateContext.Provider value={state}>
      <FormDesignerStateContext.Provider value={statePresent}>
        <FormDesignerActionsContext.Provider value={configurableFormActions}>
          {children}
        </FormDesignerActionsContext.Provider>
      </FormDesignerStateContext.Provider>
    </UndoableFormDesignerStateContext.Provider>
  );
};

function useFormDesignerStateSelector(selector: (state: IFormDesignerStateContext) => any) {
  return useContextSelector(FormDesignerStateContext, selector);
}

function useFormDesignerState(require: boolean = true) {
  const context = useContextSelector(FormDesignerStateContext, state => state);

  if (require && context === undefined) {
    throw new Error('useFormDesignerState must be used within a FormDesignerProvider');
  }

  return context;
}

function useFormDesignerActions(require: boolean = true) {
  const context = useContext(FormDesignerActionsContext);

  if (require && context === undefined) {
    throw new Error('useFormDesignerActions must be used within a FormDesignerProvider');
  }

  return context;
}

function useFormDesignerUndoableState(require: boolean = true) {
  const context = useContext(UndoableFormDesignerStateContext);

  if (require && context === undefined) {
    throw new Error('useUndoableState must be used within a FormDesignerProvider');
  }

  return {
    canUndo: context.past.length > 0,
    canRedo: context.future.length > 0,
  };
}

export { FormDesignerProvider, useFormDesignerUndoableState, useFormDesignerActions, useFormDesignerState, useFormDesignerStateSelector };