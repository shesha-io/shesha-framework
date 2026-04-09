import { FormInstance } from 'antd';
import React, { useCallback, MutableRefObject, PropsWithChildren, useContext, useMemo, ReactElement, useEffect } from 'react';
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
import { FormFlatMarkupProvider, useChildComponentIds, useChildComponents, useComponentModel, useFormMarkup } from './providers/formMarkupProvider';
import { useFormDesignerOrUndefined } from '../formDesigner';
import { IShaFormInstance } from './store/interfaces';
import { useShaFormActions } from './configurableActions';
import { ConfigurableFormActionsProvider } from './actions';
import { ConfigurableFormSectionsProvider } from './sections';
import { throwError } from '@/utils/errors';
import { isComponentFiltered } from './utils';

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

export interface IFormProviderProps<TValues extends object = object> {
  name: string;
  formSettings: IFormSettings;
  mode: FormMode;
  form?: FormInstance<TValues> | undefined;
  actions?: IFormActions | undefined;
  sections?: IFormSections | undefined;
  formRef?: MutableRefObject<IFormActionsContext<TValues> | undefined> | undefined;
  /**
   * If true, form should register configurable actions. Should be enabled for main forms only
   */
  isActionsOwner: boolean;

  propertyFilter?: ((name: string) => boolean) | undefined;
  shaForm: IShaFormInstance<TValues>;
}

const FormProvider = <TValues extends object = object>({
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
}: PropsWithChildren<IFormProviderProps<TValues>>): ReactElement => {
  const isComponentFilteredLocal = useCallback((component: IConfigurableFormComponent): boolean => {
    return isComponentFiltered(component, propertyFilter);
  }, [propertyFilter]);

  const setFormMode = useCallback((formMode: FormMode) => {
    props.shaForm.setFormMode(formMode);
  }, [props.shaForm]);

  useShaFormActions({ isActionsOwner, name, shaForm: props.shaForm });

  const setFormData = useCallback((payload: ISetFormDataPayload<TValues>) => {
    props.shaForm.setFormData(payload);
  }, [props.shaForm]);

  // TODO: memoize after review handling of form data
  const configurableFormActions: IFormActionsContext<TValues> = {
    setFormMode,
    setFormData,
    isComponentFiltered: isComponentFilteredLocal,
  };

  useEffect(() => {
    if (formRef)
      formRef.current = configurableFormActions;
  });

  const realState: IFormStateContext<TValues> = {
    formSettings: props.shaForm.settings,
    modelMetadata: props.shaForm.modelMetadata,
    shaForm: props.shaForm,

    name: name,
    formMode: props.shaForm.formMode,
    form: props.shaForm.antdForm,
    formData: props.shaForm.formData,
  };

  return (
    <FormStateContext.Provider value={realState as unknown as IFormStateContext<object>}> {/* TODO V1: implement generic context and fix unsafe cast */}
      <FormActionsContext.Provider value={configurableFormActions as unknown as IFormActionsContext<object>}> {/* TODO V1: implement generic context and fix unsafe cast */}
        <ConfigurableFormActionsProvider actions={actions}>
          <ConfigurableFormSectionsProvider sections={sections}>
            {children}
          </ConfigurableFormSectionsProvider>
        </ConfigurableFormActionsProvider>
      </FormActionsContext.Provider>
    </FormStateContext.Provider>
  );
};

const useFormStateOrUndefined = <TValues extends object = object>(): IFormStateContext<TValues> | undefined => useContext(FormStateContext) as unknown as IFormStateContext<TValues>;

const useFormState = <TValues extends object = object>(): IFormStateContext<TValues> => useFormStateOrUndefined<TValues>() ?? throwError("useFormState must be used within a FormProvider");

const useFormActionsOrUndefined = (): IFormActionsContext | undefined => useContext(FormActionsContext);

const useFormActions = (): IFormActionsContext => useFormActionsOrUndefined() ?? throwError("useFormActions must be used within a FormProvider");

const useFormOrUndefined = <TValues extends object = object>(): ConfigurableFormInstance<TValues> | undefined => {
  const actionsContext = useFormActionsOrUndefined();
  const stateContext = useFormStateOrUndefined<TValues>();

  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

const useForm = <TValue extends object = object>(): ConfigurableFormInstance<TValue> => useFormOrUndefined() ?? throwError("useForm must be used within a FormProvider");

const useIsDrawingForm = (): boolean => {
  const { formMode } = useForm();
  const designer = useFormDesignerOrUndefined();

  const isDrawing = useMemo(() => {
    return formMode === 'designer' && Boolean(designer);
  }, [formMode, designer]);
  return isDrawing;
};

export {
  ShaForm,
  FormProvider,
  useFormOrUndefined,
  useForm,
  useFormActionsOrUndefined,
  useFormActions,
  useFormStateOrUndefined,
  useFormState,
  useIsDrawingForm,
};

export {
  ValidationErrorsProvider,
  useValidationErrorsOrDefault,
  useValidationErrorsStateOrDefault,
  useValidationErrorsActionsOrDefault,
  useComponentValidation,
} from '../validationErrors';
