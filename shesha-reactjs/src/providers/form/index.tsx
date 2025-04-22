import { FormInstance } from 'antd';
import React, { useCallback, FC, MutableRefObject, PropsWithChildren, useContext, useMemo } from 'react';
import {
  IConfigurableFormComponent,
} from '@/interfaces';
import {
  ConfigurableFormInstance,
  FormActionsContext,
  FormStateContext,
  IFormActionsContext,
  IFormStateContext,
  ISetFormDataPayload,
} from './contexts';
import { FormMode, IFormActions, IFormSections, IFormSettings } from './models';
import { isComponentFiltered } from '@/index';
import { FormFlatMarkupProvider, useChildComponentIds, useChildComponents, useComponentModel, useFormMarkup } from './providers/formMarkupProvider';
import { useFormDesignerActions } from '../formDesigner';
import { IShaFormInstance } from './store/interfaces';
import { useShaFormActions } from './configurableActions';
import { ConfigurableFormActionsProvider } from './actions';
import { ConfigurableFormSectionsProvider } from './sections';

type ShaFormCompoundedComponent = {
  useMarkup: typeof useFormMarkup;
  useComponentModel: typeof useComponentModel;
  useChildComponents: typeof useChildComponents;
  useChildComponentIds: typeof useChildComponentIds;
  MarkupProvider: typeof FormFlatMarkupProvider;
};
const ShaForm: ShaFormCompoundedComponent = {
  useMarkup: useFormMarkup,
  useComponentModel: useComponentModel,
  useChildComponents: useChildComponents,
  useChildComponentIds: useChildComponentIds,
  MarkupProvider: FormFlatMarkupProvider,
};

export interface IFormProviderProps {
  name: string;
  formSettings: IFormSettings;
  mode: FormMode;
  form?: FormInstance<any>;
  actions?: IFormActions;
  sections?: IFormSections;
  formRef?: MutableRefObject<Partial<ConfigurableFormInstance> | null>;
  /**
   * If true, form should register configurable actions. Should be enabled for main forms only
   */
  isActionsOwner: boolean;

  propertyFilter?: (name: string) => boolean;
  shaForm: IShaFormInstance;
}

const FormProvider: FC<PropsWithChildren<IFormProviderProps>> = ({
  name,
  children,
  form,
  actions,
  sections,
  formRef,
  formSettings,
  isActionsOwner,
  propertyFilter,
  ...props
}) => {
  const isComponentFilteredLocal = useCallback((component: IConfigurableFormComponent): boolean => {
    return isComponentFiltered(component, propertyFilter);
  }, [propertyFilter]);

  const setFormMode = useCallback((formMode: FormMode) => {
    props.shaForm.setFormMode(formMode);
  }, [props.shaForm]);

  useShaFormActions({ isActionsOwner, name, shaForm: props.shaForm });

  const setFormData = useCallback((payload: ISetFormDataPayload) => {
    props.shaForm.setFormData(payload);
  }, [props.shaForm]);

  // TODO: memoize after review handling of form data
  const configurableFormActions: IFormActionsContext = {
    setFormMode,
    setFormData,
    isComponentFiltered: isComponentFilteredLocal,
  };
  if (formRef)
    formRef.current = { ...configurableFormActions };

  const realState: Required<IFormStateContext> = {
    formSettings: props.shaForm.settings,
    modelMetadata: props.shaForm.modelMetadata,
    shaForm: props.shaForm,

    name: name,
    formMode: props.shaForm.formMode,
    form: props.shaForm.antdForm,
    formData: props.shaForm.formData,

    // TODO: AS - review and remove
    initialValues: undefined
  };

  return (
    <FormStateContext.Provider value={realState}>
      <FormActionsContext.Provider value={configurableFormActions}>
        <ConfigurableFormActionsProvider actions={actions}>
          <ConfigurableFormSectionsProvider sections={sections}>
            {children}
          </ConfigurableFormSectionsProvider>
        </ConfigurableFormActionsProvider>
      </FormActionsContext.Provider>
    </FormStateContext.Provider>
  );
};

const useFormState = (required: boolean = true): IFormStateContext => {
  const context = useContext(FormStateContext);

  if (required && context === undefined) {
    throw new Error('useFormState must be used within a FormProvider');
  }

  return context;
};

const useFormActions = (require: boolean = true): IFormActionsContext => {
  const context = useContext(FormActionsContext);

  if (require && context === undefined) {
    throw new Error('useFormActions must be used within a FormProvider');
  }

  return context;
};

const useForm = (require: boolean = true): ConfigurableFormInstance => {
  const actionsContext = useFormActions(require);
  const stateContext = useFormState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

const useIsDrawingForm = (): boolean => {
  const { formMode } = useForm();
  const designer = useFormDesignerActions(false);

  const isDrawing = useMemo(() => {
    return formMode === 'designer' && Boolean(designer);
  }, [formMode, designer]);
  return isDrawing;
};

export {
  ShaForm,
  FormProvider,
  useForm,
  useFormActions,
  useFormState,
  useIsDrawingForm,
};