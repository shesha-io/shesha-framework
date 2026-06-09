import React, { FC, useEffect, useMemo, useState } from 'react';
import { IConfigurableFormComponent, IPropertyMetadata, IToolboxComponent } from '@/interfaces';
import { IStyleValue, UnwrapCodeEvaluators, useCanvas, useForm, useShaFormInstance, useSheshaApplication, useTheme } from '@/providers';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { formComponentActualModelPropertyFilter, updateComponentModelFromMetadata } from '@/providers/form/utils';
import { IModelValidation, ISheshaErrorTypes } from '@/utils/errors';
import { CustomErrorBoundary } from '..';
import ErrorIconPopover from '../componentErrors/errorIconPopover';
import AttributeDecorator from '../attributeDecorator';
import { useActualContextExecution, useBackgroundStoredFile, useCalculatedModel, useFormComponentStyles } from '@/hooks/formComponentHooks';
import { useActualContextData, useDeepCompareMemo } from '@/hooks';
import { stylingUtils } from '@/components/formDesigner/utils/stylingUtils';
import { useStyles } from './styles/styles';
import { FormComponentValidationProvider, useValidationErrorsStateOrDefault } from '@/providers/validationErrors';
import { isValidGuid } from './components/utils';
import { toCamelCase } from '@/utils/string';
import { useComponentApi } from '@/providers/componentApi/provider';
import { deepMergeSkipUndefinedFunc, deepMergeValues, getValueByPropertyName, removeUndefinedProps, setValueByPropertyName } from '@/utils/object';
import { IComponentStyle, InputComponentApi } from '../../componentsApi/componentApi';
import { IBackgroundValue } from '@/designer-components/_settings/utils';

import apiCode from "../../componentsApi/componentApi.ts?raw";
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { ComponentApiProperty, IComponentApiDescription } from '@/providers/componentApi/model';
import { getStyleBoxValue } from '@/designer-components/styleBox/utils';

export interface IFormComponentProps {
  componentModel: IConfigurableFormComponent;
}

interface IFormComponentInnerProps extends IFormComponentProps {
  toolboxComponent: IToolboxComponent;
}


const updateApiModel = <T extends object>(func: (f: (prev: T) => T) => void, value: Partial<T>): void => {
  func((prev) => removeUndefinedProps(deepMergeValues(prev, value)) as T);
};

const FormComponentInner: FC<IFormComponentInnerProps> = ({ componentModel, toolboxComponent }) => {
  const { styles } = useStyles();
  const shaApplication = useSheshaApplication();
  const shaForm = useShaFormInstance();
  const { isComponentFiltered, formMode } = useForm();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { activeDevice } = useCanvas();
  const { theme } = useTheme();

  const { errors: validationErrors } = useValidationErrorsStateOrDefault(); // Get errors map to trigger re-renders when errors change

  const componentApi = useComponentApi();
  const [apiModel, setApiModel] = useState<Partial<IConfigurableFormComponent>>({});
  const [apiStyles, setApiStyles] = useState<Partial<IStyleValue>>({});

  // Default to 'desktop' when there's no canvas context (e.g., in datatables)
  const effectiveDevice = activeDevice || 'desktop';

  const effectiveStyle = useMemo((): IStyleValue => {
    // Default styles + Theme component styles
    const defStyle = toolboxComponent?.getDefaultStyles?.() ?? {};
    const themeDefStyle = deepMergeValues(defStyle, theme.components[componentModel.type] as object, deepMergeSkipUndefinedFunc);

    // Default styles + Theme component styles + Desktop component styles
    const desktopModel = componentModel?.desktop;
    // ToDo: AS - remove all using stylingBox after migration all components
    const desktopStylingBox = getStyleBoxValue(desktopModel?.stylingBox);
    const desktopStylingBoxJson = desktopModel?.stylingBoxJson;
    const desktopThemeStyle = deepMergeValues(themeDefStyle, { ...desktopModel, stylingBoxJson: desktopStylingBoxJson ? desktopStylingBoxJson : desktopStylingBox }, deepMergeSkipUndefinedFunc);

    if (effectiveDevice === 'desktop') return desktopThemeStyle;

    // Default styles + Theme component styles + Desktop component styles + Effective component styles
    const effectiveModel = componentModel?.[effectiveDevice] as IStyleValue;
    const effectiveStylingBox = getStyleBoxValue(effectiveModel?.stylingBox);
    const effectiveStylingBoxJson = effectiveModel?.stylingBoxJson;
    const effectiveDesktopStyle = deepMergeValues(desktopThemeStyle, { ...effectiveModel, stylingBoxJson: effectiveStylingBoxJson ? effectiveStylingBoxJson : effectiveStylingBox }, deepMergeSkipUndefinedFunc);
    return effectiveDesktopStyle;
  }, [toolboxComponent, theme.components, componentModel, effectiveDevice]);

  const sfBackground = useBackgroundStoredFile(effectiveStyle.background, shaApplication);
  const sfStyle = useMemo((): IStyleValue => ({ ...effectiveStyle, background: sfBackground }), [effectiveStyle, sfBackground]);

  // In designer mode: preserve the padding-only stylingBox, dimensions, and style (margins stripped) from wrapper
  // In preview/live mode: use original device-specific stylingBox (with margins) and dimensions
  // const isDesignerMode = shaForm.formMode === 'designer';
  // const extendedModel = componentModel as IConfigurableFormComponent & IStyleType;
  const deviceModel = useMemo(() => deepMergeValues({
    ...componentModel,
    ...sfStyle,
    // In designer: preserve padding-only stylingBox and stripped style (no margins) from wrapper
    // In preview: use original stylingBox with margins from device settings
    /* ...(isDesignerMode
      ? {
        stylingBox: extendedModel.stylingBox,
        dimensions: extendedModel.dimensions,
        style: extendedModel.style, // Keep stripped style (no margins)
      }
      : { stylingBox: componentModel?.[effectiveDevice]?.stylingBox }
    ),*/
  }, apiStyles, deepMergeSkipUndefinedFunc), [componentModel, apiStyles, sfStyle]);

  const actualModel = useActualContextData<IConfigurableFormComponent & IStyleValue>(
    deviceModel,
    undefined,
    undefined,
    (name: string, value: any) => formComponentActualModelPropertyFilter(toolboxComponent, name, value),
    undefined,
  ) as UnwrapCodeEvaluators<IConfigurableFormComponent & IStyleValue>; // TODO: move type cast to useActualContextData after refactoring

  actualModel.readOnly = actualModel.readOnly || !anyOfPermissionsGranted(actualModel?.editModePermissions || []);
  actualModel.hidden = shaForm.formMode !== 'designer' &&
    (
      // ToDo: AS - remove hidden from this check after migration
      actualModel.hidden ||
      actualModel.visible === false ||
      !anyOfPermissionsGranted(actualModel?.permissions || []) ||
      !anyOfPermissionsGranted(actualModel?.visiblePermissions || []) ||
      !isComponentFiltered(actualModel));

  if (!toolboxComponent?.isInput && !toolboxComponent?.isOutput)
    actualModel.propertyName = undefined;

  // ToDo: AS - remove afte migrate all components to use IStyleValue
  const allStyles = useFormComponentStyles(actualModel);
  actualModel.styleJson = useActualContextExecution(actualModel.style, undefined, {}); // use default style if empty or error

  // For input components: Strip margins from fullStyle and jsStyle
  // Margins are handled by the FormItem wrapper (via allStyles.margins), not the inner component
  // This prevents double margins (wrapper + component) in both designer and live modes
  if (toolboxComponent?.isInput) {
    actualModel.allStyles = {
      ...allStyles,
      fullStyle: stylingUtils.stripMargins(allStyles.fullStyle),
      jsStyle: stylingUtils.stripMargins(allStyles.jsStyle),
      // margins are preserved for FormItem wrapper use
    };
  } else {
    actualModel.allStyles = allStyles;
  }

  const calculatedModel = useCalculatedModel(actualModel, toolboxComponent?.useCalculateModel, toolboxComponent?.calculateModel);

  const actualApiModel = useDeepCompareMemo(() => deepMergeValues(actualModel, apiModel), [actualModel, apiModel]);

  if (componentApi !== undefined) {
    // common Api

    const commonApi: IComponentApiDescription<InputComponentApi> = {
      id: actualModel.id,
      componentName: actualModel.componentName,
      componentModel: actualModel,
      level: 1,
      isInput: toolboxComponent?.isInput,
      api: {
        componentName: actualModel.componentName,
        context: actualModel.context,
        propertyName: actualModel.propertyName,
      },
      typeDefinition: { typeName: 'CommonComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
      skipUpdateTypeDefinitionIfExists: true,
      properties: [
        // component properties
        // use actualModel.hidden because it's already filtered by some other means (eg permissions)
        { name: 'visible', getter: () => actualApiModel.visible, setter: (value) => updateApiModel(setApiModel, { hidden: actualModel.hidden || !value }) },
        { name: 'editable', getter: () => actualApiModel.editMode, setter: (value) => setApiModel((prev) => {
          const editMode = typeof value === 'boolean' ? value ? 'editable' : 'readOnly' : value;
          return { ...prev, editMode, readOnly: editMode === 'readOnly' ? true : editMode === 'inherited' ? prev.readOnly : false };
        }) },
        // component styles
        {
          name: 'style', getter: () => {
            const style = {} as IComponentStyle;
            componentApi.createOrUpdateApiProperty(style, { name: 'font', getter: () => actualApiModel.font, setter: (value) => updateApiModel(setApiStyles, { font: value }) });
            componentApi.createOrUpdateApiProperty(style, { name: 'background', getter: () => actualApiModel.background, setter: (value) => updateApiModel(setApiStyles, { background: value as IBackgroundValue }) });
            componentApi.createOrUpdateApiProperty(style, { name: 'border', getter: () => actualApiModel.border, setter: (value) => updateApiModel(setApiStyles, { border: value }) });
            return style;
          },
        },
      ],
    };

    // input common Api
    if (toolboxComponent?.isInput) {
      commonApi.api = {
        ...commonApi.api,
        isValid: () => actualModel.propertyName
          ? shaForm.antdForm.validateFields([actualModel.propertyName], { validateOnly: true })
            .then(() => true).catch(() => false)
          : Promise.resolve(true),
        getErrors: () => actualModel.propertyName
          ? shaForm.antdForm.validateFields([actualModel.propertyName], { validateOnly: true })
            .then(() => []).catch((e) => e.errorFields?.length ? e.errorFields[0].errors : [])
          : Promise.resolve([]),
        reset: () => actualModel.propertyName
          ? shaForm.antdForm.resetFields([actualModel.propertyName])
          : undefined,
      } as InputComponentApi;
      commonApi.typeDefinition = { typeName: 'InputComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] };

      commonApi.properties = [
        ...commonApi.properties,
        ...[
          { name: 'required', getter: () => actualApiModel.validate?.required, setter: (v) => updateApiModel(setApiModel, { validate: { required: v } }) },
          {
            name: 'value',
            getter: () => getValueByPropertyName(shaForm.formData as Record<string, unknown>, actualModel.propertyName),
            setter: (value) => shaForm.setFieldsValue(setValueByPropertyName({}, actualModel.propertyName, value)),
          },
        ] as ComponentApiProperty<InputComponentApi>[],
      ];
    }

    componentApi.updateApi<InputComponentApi>(commonApi);
  };
  useEffectOnce(() => () => componentApi?.removeApi(actualModel.id));

  const control = useMemo(() => {
    if (!toolboxComponent) return null;
    return (
      <toolboxComponent.Factory
        form={shaForm.antdForm}
        model={actualApiModel}
        calculatedModel={calculatedModel}
        shaApplication={shaApplication}
        key={actualModel.id}
      />
    );
  }, [toolboxComponent, shaForm.antdForm, actualApiModel, calculatedModel, shaApplication, actualModel.id]);

  // Run validation in both designer and runtime modes
  // Collect errors from:
  // 1. Toolbox validateModel function
  // 2. Child components registered via useComponentValidation hook
  const validationResult = useMemo((): IModelValidation | undefined => {
    const errors: Array<{ propertyName?: string; error: string }> = [];
    let validationType: ISheshaErrorTypes | undefined;

    if (actualModel?.background?.type === 'storedFile' && actualModel?.background.storedFile?.id && !isValidGuid(actualModel?.background.storedFile.id)) {
      errors.push({ propertyName: 'The provided StoredFileId is invalid', error: 'The provided StoredFileId is invalid' });
    }

    // Collect errors from toolbox validateModel
    toolboxComponent?.validateModel?.(actualModel, (propertyName, error) => {
      errors.push({ propertyName, error });
    });

    // Collect errors from child components registered via hook
    const childValidation = validationErrors.get(actualModel.id);
    if (childValidation?.hasErrors && childValidation.errors) {
      errors.push(...childValidation.errors);
      // Use the child's validationType if present (prioritize 'error' > 'warning' > 'info')
      if (childValidation.validationType) {
        if (!validationType ||
          (childValidation.validationType === 'error') ||
          (childValidation.validationType === 'warning' && validationType === 'info')) {
          validationType = childValidation.validationType;
        }
      }
    }

    if (errors.length > 0) {
      return {
        hasErrors: true,
        componentId: actualModel.id,
        componentName: actualModel.componentName,
        componentType: actualModel.type,
        validationType,
        errors,
      };
    }

    return undefined;
  }, [toolboxComponent, actualModel, validationErrors]);

  // Wrap component with error icon if there are validation errors
  // Show error icons only in designer mode
  // Use the validationType from the validation result (error/warning/info) or default to 'warning'
  const wrappedControl = validationResult?.hasErrors && formMode === 'designer' ? (
    <ErrorIconPopover
      mode="validation"
      validationResult={validationResult}
      type={validationResult.validationType ?? 'warning'}
      isDesignerMode={true}
    >
      {control}
    </ErrorIconPopover>
  ) : control;

  // Check for validation errors (in both designer and runtime modes) when the toolbox component does not exist
  if (!toolboxComponent) {
    const componentNotFoundError: IModelValidation = {
      hasErrors: true,
      componentId: actualModel.id,
      componentName: actualModel.componentName,
      componentType: actualModel.type,
      errors: [{ error: `Component '${actualModel.type}' not found` }],
    };
    // Component not found - return early with just error message
    const unregisteredMessage = <div className={styles.unregisteredComponentMessage}>Component &apos;{actualModel.type}&apos; not registered</div>;

    return (
      <div className={styles.unregisteredComponentContainer}>
        {shaForm.formMode !== 'designer' ? (
          <ErrorIconPopover
            mode="validation"
            validationResult={componentNotFoundError}
            type="error"
            isDesignerMode={false}
          >
            {unregisteredMessage}
          </ErrorIconPopover>
        ) : unregisteredMessage}
      </div>
    );
  }

  if (shaForm.form.settings.isSettingsForm)
    return control;

  const attributes = {
    'data-sha-c-id': `${componentModel.id}`,
    'data-sha-c-name': `${componentModel.componentName}`,
    'data-sha-c-property-name': `${componentModel.propertyName}`,
    'data-sha-c-type': `${componentModel.type}`,
  };

  if (componentModel.type === 'subForm') {
    if ((componentModel as any)?.formSelectionMode !== 'dynamic') {
      attributes['data-sha-c-form-name'] = `${(componentModel as any)?.formId?.module}/${(componentModel as any)?.formId?.name}`;
    }
    attributes['data-sha-parent-form-id'] = `${shaForm.form.id}`;
    attributes['data-sha-parent-form-name'] = `${(shaForm as any)?.formId?.module}/${(shaForm as any)?.formId?.name}`;
  }

  return (
    <AttributeDecorator attributes={attributes}>
      {wrappedControl}
    </AttributeDecorator>
  );
};

const FormComponentErrorWrapper: FC<IFormComponentInnerProps> = ({ componentModel, toolboxComponent }) => {
  return (
    <CustomErrorBoundary componentName={componentModel.componentName} componentType={componentModel.type} componentId={componentModel.id}>
      <FormComponentValidationProvider
        componentId={componentModel.id}
        componentName={componentModel.componentName}
        componentType={componentModel.type}
      >
        <FormComponentInner componentModel={componentModel} toolboxComponent={toolboxComponent} />
      </FormComponentValidationProvider>
    </CustomErrorBoundary>
  );
};

interface FormComponentPrepareModelProps {
  componentModel: IConfigurableFormComponent;
  children: (componentModel: IConfigurableFormComponent, toolboxComponent: IToolboxComponent) => React.JSX.Element;
}

const FormComponentModelPreparer: FC<FormComponentPrepareModelProps> = ({ componentModel: sourceComponentModel, children }) => {
  const { modelMetadata } = useForm();
  const getToolboxComponent = useFormDesignerComponentGetter();
  const [propMetadata, setPropMetadata] = useState<IPropertyMetadata | null>(null);
  // Memoize component lookup to prevent unnecessary re-renders
  const component = useMemo(() => getToolboxComponent(sourceComponentModel?.type), [getToolboxComponent, sourceComponentModel?.type]);

  useEffect(() => {
    let cancelled = false;
    if (modelMetadata?.properties && sourceComponentModel?.propertyName) {
      const pName = toCamelCase(sourceComponentModel.propertyName);
      if (Array.isArray(modelMetadata.properties)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPropMetadata(modelMetadata.properties.find((p) => toCamelCase(p.path) === pName));
      } else {
        modelMetadata.properties().then((propsMeta) => {
          if (!cancelled) setPropMetadata(propsMeta.find((p) => toCamelCase(p.path) === pName));
        }).catch((error) => {
          if (!cancelled) console.error('Failed to fetch property metadata:', error);
        });
      }
    }
    return () => {
      cancelled = true;
    };
  }, [modelMetadata, sourceComponentModel?.propertyName]);

  const componentModel = useDeepCompareMemo(() => {
    return component && propMetadata
      ? updateComponentModelFromMetadata(component, sourceComponentModel, propMetadata)
      : sourceComponentModel;
  }, [sourceComponentModel, component, propMetadata]);

  return children ? children(componentModel, component) : null;
};

const FormComponentPrepared: FC<IFormComponentProps> = ({ componentModel }) => {
  return (
    <FormComponentModelPreparer componentModel={componentModel}>
      {(componentModel, toolboxComponent) => <FormComponentErrorWrapper componentModel={componentModel} toolboxComponent={toolboxComponent} />}
    </FormComponentModelPreparer>
  );
};

const FormComponentMemo = React.memo(FormComponentPrepared);
export default FormComponentMemo;
export { FormComponentMemo as FormComponent, FormComponentErrorWrapper as FormComponentRaw, FormComponentModelPreparer as FormComponentPreparer };
