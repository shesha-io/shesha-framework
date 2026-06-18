import { stylingUtils } from '@/components/formDesigner/utils/stylingUtils';
import { IBackgroundValue, IBorderValue, IFontValue } from '@/designer-components/_settings/utils';
import { isSubFormComponent } from '@/designer-components/subForm';
import { useActualContextData, useDeepCompareMemo } from '@/hooks';
import { useActualContextExecution, useBackgroundStoredFile, useCalculatedModel, useFormComponentStyles } from '@/hooks/formComponentHooks';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { IConfigurableFormComponent, IToolboxComponent, ValidateErrorEntity } from '@/interfaces';
import { IStyleValue, useCanvas, useForm, useShaFormInstance, useSheshaApplication, useTheme } from '@/providers';
import { ComponentApiProperty, IComponentApiDescription } from '@/providers/componentApi/model';
import { useComponentApi } from '@/providers/componentApi/provider';
import { formComponentActualModelPropertyFilter, isFormFullName } from '@/providers/form/utils';
import { useValidationErrorsStateOrDefault } from '@/providers/validationErrors';
import { IModelValidation, ISheshaErrorTypes } from '@/utils/errors';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { deepMergeSkipUndefinedFunc, deepMergeValues, getValueByPropertyName, removeUndefinedProps, setValueByPropertyName } from '@/utils/object';
import React, { FC, useMemo, useState } from 'react';
import { IComponentStyle, InputComponentApi } from '../../../componentsApi/componentApi';
import apiCode from "../../../componentsApi/componentApi.ts?raw";
import AttributeDecorator from '../../attributeDecorator';
import ErrorIconPopover from '../../componentErrors/errorIconPopover';
import { isValidGuid } from '../components/utils';
import { isNonEmptyArray } from '@/utils/array';
import { getStyleBoxValue } from '@/designer-components/styleBox/utils';
import { IFormComponentProps } from './formComponent';

const updateApiModel = <T extends object>(func: (f: (prev: T) => T) => void, value: Partial<T>): void => {
  func((prev) => removeUndefinedProps(deepMergeValues(prev, value)) as T);
};

type CustomHtmlAttributes = {
  "data-sha-c-id"?: string | undefined;
  "data-sha-c-name"?: string | undefined;
  "data-sha-c-property-name"?: string | undefined;
  "data-sha-c-type"?: string | undefined;
  "data-sha-c-form-name"?: string | undefined;
  "data-sha-parent-form-id"?: string | undefined;
  "data-sha-parent-form-name"?: string | undefined;
};

type KnownFormComponentProps = IFormComponentProps & {
  toolboxComponent: IToolboxComponent;
};

const KnownFormComponent: FC<KnownFormComponentProps> = ({ componentModel, toolboxComponent }) => {
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
    const defStyle: IStyleValue = toolboxComponent.getDefaultStyles?.() ?? {};
    const themeDefStyle: IStyleValue = isDefined(theme.components)
      ? deepMergeValues(defStyle, theme.components[componentModel.type] as IStyleValue, deepMergeSkipUndefinedFunc)
      : defStyle;

    // Default styles + Theme component styles + Desktop component styles
    const desktopModel = componentModel.desktop;
    // ToDo: AS - remove all using stylingBox after migration all components
    const desktopStylingBox = isDefined(desktopModel?.stylingBox) ? getStyleBoxValue(desktopModel.stylingBox) : undefined;
    const desktopStylingBoxJson = desktopModel?.stylingBoxJson;
    const desktopThemeStyle: IStyleValue = deepMergeValues(themeDefStyle, { ...desktopModel, stylingBoxJson: Boolean(desktopStylingBoxJson) ? desktopStylingBoxJson : desktopStylingBox }, deepMergeSkipUndefinedFunc);

    if (effectiveDevice === 'desktop') return desktopThemeStyle;

    // Default styles + Theme component styles + Desktop component styles + Effective component styles
    const effectiveModel = componentModel[effectiveDevice as keyof typeof componentModel] as IStyleValue | undefined;
    const effectiveStylingBox = isDefined(effectiveModel?.stylingBox) ? getStyleBoxValue(effectiveModel.stylingBox) : undefined;
    const effectiveStylingBoxJson = effectiveModel?.stylingBoxJson;
    const effectiveDesktopStyle = deepMergeValues(desktopThemeStyle, { ...effectiveModel, stylingBoxJson: (Boolean(effectiveStylingBoxJson)) ? effectiveStylingBoxJson : effectiveStylingBox }, deepMergeSkipUndefinedFunc);
    return effectiveDesktopStyle as IStyleValue;
  }, [componentModel, effectiveDevice, theme.components, toolboxComponent]);

  const sfBackground = useBackgroundStoredFile(effectiveStyle.background, shaApplication);
  const sfStyle = useMemo((): IStyleValue => ({ ...effectiveStyle, background: sfBackground }), [effectiveStyle, sfBackground]);

  // In designer mode: preserve the padding-only stylingBox, dimensions, and style (margins stripped) from wrapper
  // In preview/live mode: use original device-specific stylingBox (with margins) and dimensions
  // const isDesignerMode = shaForm.formMode === 'designer';
  // const extendedModel = componentModel as IConfigurableFormComponent & IStyleValue;
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
      : { stylingBox: deviceModelConfig?.stylingBox }
    ),*/
  }, apiStyles, deepMergeSkipUndefinedFunc), [componentModel, apiStyles, sfStyle]);

  const unwrappedModel = useActualContextData<IConfigurableFormComponent & IStyleValue>(
    deviceModel,
    undefined,
    undefined,
    (name, value) => formComponentActualModelPropertyFilter(toolboxComponent, name, value),
    undefined,
  );

  const { isInput, isOutput = false } = toolboxComponent;

  const allStyles = useFormComponentStyles(unwrappedModel); // ToDo: AS - remove afte migrate all components to use IStyleValue
  const styleJson = useActualContextExecution(unwrappedModel.style, undefined, {}); // use default style if empty or error

  const actualModel = useMemo(() => {
    const readOnly = Boolean(unwrappedModel.readOnly) || !anyOfPermissionsGranted(unwrappedModel.editModePermissions || []);
    const hidden = shaForm.formMode !== 'designer' &&
      (
        // ToDo: AS - remove hidden from this check after migration
        Boolean(unwrappedModel.hidden) ||
        unwrappedModel.visible === false ||
        !anyOfPermissionsGranted(unwrappedModel.permissions || []) ||
        !anyOfPermissionsGranted(unwrappedModel.visiblePermissions || []) ||
        !isComponentFiltered(unwrappedModel));

    const propertyName = !isInput && !isOutput
      ? undefined
      : unwrappedModel.propertyName;

    // For input components: Strip margins from fullStyle and jsStyle
    // Margins are handled by the FormItem wrapper (via allStyles.margins), not the inner component
    // This prevents double margins (wrapper + component) in both designer and live modes
    const finalAllStyles = isInput
      ? {
        ...allStyles,
        fullStyle: stylingUtils.stripMargins(allStyles.fullStyle),
        jsStyle: stylingUtils.stripMargins(allStyles.jsStyle),
      // margins are preserved for FormItem wrapper use
      }
      : allStyles;

    return {
      ...unwrappedModel,
      styleJson,
      readOnly,
      hidden,
      propertyName,
      allStyles: finalAllStyles,
    };
  }, [allStyles, anyOfPermissionsGranted, isComponentFiltered, isInput, isOutput, shaForm.formMode, styleJson, unwrappedModel]);

  const calculatedModel = useCalculatedModel(actualModel, toolboxComponent.useCalculateModel, toolboxComponent.calculateModel);

  const actualApiModel = useDeepCompareMemo(() => deepMergeValues(actualModel, apiModel), [actualModel, apiModel]);

  if (componentApi !== undefined && !isNullOrWhiteSpace(actualModel.componentName)) {
    const propertyName = actualModel.propertyName ?? "";
    // common Api
    const commonApi: IComponentApiDescription<InputComponentApi> = {
      id: actualModel.id,
      componentName: actualModel.componentName,
      componentModel: actualModel,
      level: 1,
      isInput: isInput,
      api: {
        componentName: actualModel.componentName,
        context: actualModel.context,
        propertyName: propertyName,
      },
      typeDefinition: { typeName: 'CommonComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
      skipUpdateTypeDefinitionIfExists: true,
      properties: [
        // component properties
        // use actualModel.hidden because it's already filtered by some other means (eg permissions)
        { name: 'visible',
          getter: () => actualApiModel.visible ?? false,
          setter: (value) => updateApiModel(setApiModel, { hidden: actualModel.hidden === true ? actualModel.hidden : !value }),
        },
        { name: 'editable',
          getter: () => actualApiModel.editMode,
          setter: (value) => setApiModel((prev) => {
            const editMode = typeof value === 'boolean' ? value ? 'editable' : 'readOnly' : value;
            return { ...prev, editMode, readOnly: editMode === 'readOnly' ? true : editMode === 'inherited' ? prev.readOnly : false };
          }),
        },
        // component styles
        {
          name: 'style', getter: () => {
            const style = {} as IComponentStyle;
            // TODO: implement generic methods and avoid type casts
            componentApi.createOrUpdateApiProperty(style, { name: 'font', getter: () => actualApiModel.font, setter: (value) => updateApiModel(setApiStyles, { font: value as IFontValue }) });
            componentApi.createOrUpdateApiProperty(style, { name: 'background', getter: () => actualApiModel.background, setter: (value) => updateApiModel(setApiStyles, { background: value as IBackgroundValue }) });
            componentApi.createOrUpdateApiProperty(style, { name: 'border', getter: () => actualApiModel.border, setter: (value) => updateApiModel(setApiStyles, { border: value as IBorderValue }) });
            return style;
          },
        },
      ],
    };

    // input common Api
    if (isInput) {
      commonApi.api = {
        ...commonApi.api,
        isValid: () => !isNullOrWhiteSpace(propertyName)
          ? shaForm.antdForm.validateFields([propertyName], { validateOnly: true })
            .then(() => true).catch(() => false)
          : Promise.resolve(true),
        getErrors: () => !isNullOrWhiteSpace(propertyName)
          ? shaForm.antdForm.validateFields([propertyName], { validateOnly: true })
            .then(() => []).catch((e: ValidateErrorEntity) => isNonEmptyArray(e.errorFields) ? e.errorFields[0].errors : [])
          : Promise.resolve([]),
        reset: () => !isNullOrWhiteSpace(propertyName)
          ? shaForm.antdForm.resetFields([propertyName])
          : undefined,
      } as InputComponentApi;
      commonApi.typeDefinition = { typeName: 'InputComponentApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] };

      commonApi.properties = [
        ...(commonApi.properties ?? []),
        ...[
          { name: 'required', getter: () => actualApiModel.validate?.required, setter: (v) => updateApiModel(setApiModel, { validate: { required: v } }) },
          {
            name: 'value',
            getter: () => !isNullOrWhiteSpace(propertyName)
              ? getValueByPropertyName(shaForm.formData as Record<string, unknown>, propertyName)
              : undefined,
            setter: (value) => {
              if (!isNullOrWhiteSpace(propertyName))
                shaForm.setFieldsValue(setValueByPropertyName({}, propertyName, value));
            },
          },
        ] as ComponentApiProperty<InputComponentApi>[],
      ];
    }

    componentApi.updateApi<InputComponentApi>(commonApi);
  };
  useEffectOnce(() => () => componentApi?.removeApi(actualModel.id));

  const control = useMemo(() => {
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

    if (actualModel.background?.type === 'storedFile' && isDefined(actualModel.background.storedFile?.id) && !isValidGuid(actualModel.background.storedFile.id)) {
      errors.push({ propertyName: 'The provided StoredFileId is invalid', error: 'The provided StoredFileId is invalid' });
    }

    // Collect errors from toolbox validateModel
    toolboxComponent.validateModel?.(actualModel, (propertyName, error) => {
      errors.push({ propertyName, error });
    });

    // Collect errors from child components registered via hook
    const childValidation = validationErrors.get(actualModel.id);
    if (isDefined(childValidation) && childValidation.hasErrors && childValidation.errors) {
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
  const wrappedControl = isDefined(validationResult) && validationResult.hasErrors && formMode === 'designer' ? (
    <ErrorIconPopover
      mode="validation"
      validationResult={validationResult}
      type={validationResult.validationType ?? 'warning'}
      isDesignerMode={true}
    >
      {control}
    </ErrorIconPopover>
  ) : control;

  if (shaForm.form && (shaForm.form.settings.isSettingsForm ?? false))
    return control;

  const attributes: CustomHtmlAttributes = {
    'data-sha-c-id': `${componentModel.id}`,
    'data-sha-c-name': `${componentModel.componentName}`,
    'data-sha-c-property-name': `${componentModel.propertyName}`,
    'data-sha-c-type': `${componentModel.type}`,
  };

  if (isSubFormComponent(componentModel)) {
    if (componentModel.formSelectionMode !== 'dynamic' && isFormFullName(componentModel.formId)) {
      attributes['data-sha-c-form-name'] = `${componentModel.formId.module}/${componentModel.formId.name}`;
    }
    if (!isNullOrWhiteSpace(shaForm.form?.id))
      attributes['data-sha-parent-form-id'] = `${shaForm.form.id}`;
    if (isFormFullName(shaForm.formId))
      attributes['data-sha-parent-form-name'] = `${shaForm.formId.module}/${shaForm.formId.name}`;
  }

  return isDefined(wrappedControl)
    ? (
      <AttributeDecorator attributes={attributes as Record<string, string>}>
        {wrappedControl}
      </AttributeDecorator>
    )
    : undefined;
};

const KnownFormComponentMemo = React.memo(KnownFormComponent);
export default KnownFormComponentMemo;
