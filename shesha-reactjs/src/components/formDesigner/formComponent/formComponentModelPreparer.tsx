import { IConfigurableFormComponent, IStyleValue, UnwrapCodeEvaluators, useCanvas, useForm, useShaFormInstance, useSheshaApplication, useTheme } from "@/providers";
import React, { FC, useEffect, useMemo, useState } from "react";
import { useStyles } from "../styles/styles";
import { useFormDesignerComponentGetter } from "@/providers/form/hooks";
import { toCamelCase } from "@/utils/string";
import { IApiContext, IToolboxComponent } from "@/interfaces/formDesigner";
import { IPropertyMetadata } from "@/interfaces";
import { useDeepCompareMemo } from "@/hooks";
import { ErrorIconPopover } from "@/components/componentErrors/errorIconPopover";
import { IModelValidation } from "@/utils/errors";
import { formComponentActualModelPropertyFilter, updateComponentModelFromMetadata } from "@/providers/form/utils";
import { deepMergeSkipUndefinedFunc, deepMergeValues } from "@/utils/object";
import { isDefined } from "@/utils";
import { getStyleBoxValue } from "@/designer-components/styleBox/utils";
import { useActualContextData, useActualContextExecution, useBackgroundStoredFile } from "@/hooks/formComponentHooks";
import { useComponentApi } from "@/providers/componentApi/provider";
import { updateApi, updateApiModel } from "./formComponentApi";
import { useEffectOnce } from "@/hooks/useEffectOnce";
import { FormComponentAllStylesPreparer } from "./formComponentAllStylesPreparer";

interface FormComponentPrepareModelProps {
  componentModel: IConfigurableFormComponent;
  children: (componentModel: UnwrapCodeEvaluators<IConfigurableFormComponent>, toolboxComponent: IToolboxComponent, apiContext: IApiContext<IConfigurableFormComponent>) => React.JSX.Element;
}

export const FormComponentModelPreparer: FC<FormComponentPrepareModelProps> = ({ componentModel: sourceComponentModel, children }) => {
  const { styles } = useStyles();
  const shaApplication = useSheshaApplication();
  const { anyOfPermissionsGranted } = shaApplication;
  const shaForm = useShaFormInstance();
  const { modelMetadata, isComponentFiltered, formSettings } = useForm();
  const getToolboxComponent = useFormDesignerComponentGetter();
  const [propMetadata, setPropMetadata] = useState<IPropertyMetadata | undefined>(undefined);
  // Memoize component lookup to prevent unnecessary re-renders
  const toolboxComponent = useMemo(() => getToolboxComponent(sourceComponentModel.type), [getToolboxComponent, sourceComponentModel.type]);

  const { activeDevice } = useCanvas();
  const { theme } = useTheme();

  const componentApi = useComponentApi();
  const [apiModel, setApiModel] = useState<Partial<IConfigurableFormComponent>>({});
  const [apiStyles, setApiStyles] = useState<Partial<IStyleValue>>({});

  // Default to 'desktop' when there's no canvas context (e.g., in datatables)
  const effectiveDevice = activeDevice || 'desktop';

  const effectiveStyle = useMemo((): IStyleValue => {
    // Default styles + Theme component styles
    const defStyle: IStyleValue = toolboxComponent?.getDefaultStyles?.() ?? {};
    const themeDefStyle: IStyleValue = isDefined(theme.components)
      ? deepMergeValues(defStyle, theme.components[sourceComponentModel.type] as IStyleValue, deepMergeSkipUndefinedFunc)
      : defStyle;

    // Default styles + Theme component styles + Desktop component styles
    const desktopModel = sourceComponentModel.desktop;
    // ToDo: AS - remove all using stylingBox after migration all components
    const desktopStylingBox = isDefined(desktopModel?.stylingBox) ? getStyleBoxValue(desktopModel.stylingBox) : undefined;
    const desktopStylingBoxJson = desktopModel?.stylingBoxJson;
    const desktopThemeStyle: IStyleValue = deepMergeValues(themeDefStyle, { ...desktopModel, stylingBoxJson: Boolean(desktopStylingBoxJson) ? desktopStylingBoxJson : desktopStylingBox }, deepMergeSkipUndefinedFunc);

    if (effectiveDevice === 'desktop') return desktopThemeStyle;

    // Default styles + Theme component styles + Desktop component styles + Effective component styles
    const effectiveModel = sourceComponentModel[effectiveDevice as keyof typeof sourceComponentModel] as IStyleValue | undefined;
    const effectiveStylingBox = isDefined(effectiveModel?.stylingBox) ? getStyleBoxValue(effectiveModel.stylingBox) : undefined;
    const effectiveStylingBoxJson = effectiveModel?.stylingBoxJson;
    const effectiveDesktopStyle = deepMergeValues(desktopThemeStyle, { ...effectiveModel, stylingBoxJson: (Boolean(effectiveStylingBoxJson)) ? effectiveStylingBoxJson : effectiveStylingBox }, deepMergeSkipUndefinedFunc);
    return effectiveDesktopStyle as IStyleValue;
  }, [sourceComponentModel, effectiveDevice, theme.components, toolboxComponent]);

  const sfBackground = useBackgroundStoredFile(effectiveStyle.background, shaApplication);
  const sfStyle = useMemo((): IStyleValue => ({ ...effectiveStyle, background: sfBackground }), [effectiveStyle, sfBackground]);

  const deviceModel = useMemo(() => deepMergeValues({ ...sourceComponentModel, ...sfStyle }, apiStyles, deepMergeSkipUndefinedFunc), [sourceComponentModel, apiStyles, sfStyle]);

  const unwrappedModel = useActualContextData<IConfigurableFormComponent & IStyleValue>(
    deviceModel,
    undefined,
    undefined,
    (name, value) => formComponentActualModelPropertyFilter(toolboxComponent, name, value),
    undefined,
  );

  const { isInput = false, isOutput = false } = toolboxComponent ?? {};

  const styleJson = useActualContextExecution(unwrappedModel.style, undefined, {}); // use default style if empty or error

  const allowInherit = toolboxComponent?.allowInherit === true;
  const readOnly = useMemo(() =>
    (allowInherit !== true && unwrappedModel.disabled === true) || // ToDo: AS - remove allowInherit after migrate all components
    unwrappedModel.readOnly === true ||
    !anyOfPermissionsGranted(unwrappedModel.editModePermissions || []),
  [allowInherit, unwrappedModel.disabled, unwrappedModel.readOnly, unwrappedModel.editModePermissions, anyOfPermissionsGranted]);

  const disabled = useMemo(() => unwrappedModel.disabled === true || !anyOfPermissionsGranted(unwrappedModel.editModePermissions || []), [unwrappedModel, anyOfPermissionsGranted]);
  const hidden = useMemo(() => shaForm.formMode !== 'designer' &&
    (
      // ToDo: AS - remove hidden from this check after migration
      Boolean(unwrappedModel.hidden) ||
      unwrappedModel.visible === false ||
      !anyOfPermissionsGranted(unwrappedModel.permissions || []) || // ToDo: AS - remove afte migrate all components to use visiblePermissions
      !anyOfPermissionsGranted(unwrappedModel.visiblePermissions || []) ||
      !isComponentFiltered(unwrappedModel)),
  [anyOfPermissionsGranted, isComponentFiltered, shaForm.formMode, unwrappedModel]);

  const propertyName = isInput || isOutput ? unwrappedModel.propertyName : undefined;

  const actualModel = useMemo(() => {
    return { ...unwrappedModel, styleJson, readOnly, disabled, hidden, propertyName };
  }, [hidden, propertyName, readOnly, disabled, styleJson, unwrappedModel]);

  const actualApiModel = useDeepCompareMemo(() => deepMergeValues(actualModel, apiModel), [actualModel, apiModel]);

  useEffect(() => {
    if (isDefined(componentApi))
      updateApi({ model: actualModel, apiModel: actualApiModel, componentApi, shaForm, isInput, setApiModel, setApiStyles });
  }, [componentApi, actualModel, actualApiModel, isInput, shaForm]);
  useEffectOnce(() => () => componentApi?.removeApi(actualModel.id));

  const apiContext: IApiContext<IConfigurableFormComponent> = useMemo(() => ({ updateApiModel: (model) => updateApiModel(setApiModel, model) }), []);

  useEffect(() => {
    let cancelled = false;
    if (modelMetadata?.properties && Boolean(sourceComponentModel.propertyName)) {
      const pName = toCamelCase(sourceComponentModel.propertyName ?? '');
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
  }, [modelMetadata, sourceComponentModel.propertyName]);

  const componentModel = useDeepCompareMemo(() => {
    return toolboxComponent && propMetadata
      ? updateComponentModelFromMetadata(toolboxComponent, sourceComponentModel, propMetadata)
      : sourceComponentModel;
  }, [sourceComponentModel, toolboxComponent, propMetadata]);

  // Check for validation errors (in both designer and runtime modes) when the toolbox component does not exist
  if (!toolboxComponent) {
    const componentNotFoundError: IModelValidation = {
      hasErrors: true,
      componentId: componentModel.id,
      componentName: componentModel.componentName,
      componentType: componentModel.type,
      errors: [{ error: `Component '${componentModel.type}' not found` }],
    };
    // Component not found - return early with just error message
    const unregisteredMessage = <div className={styles.unregisteredComponentMessage}>Component &apos;{componentModel.type}&apos; not registered</div>;

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

  return toolboxComponent.allowInherit === true || formSettings?.isSettingsForm === true
    ? children(actualApiModel, toolboxComponent, apiContext)
    : ( // ToDo: AS - remove after migration all components to use IStyleValue
      <FormComponentAllStylesPreparer componentModel={actualApiModel}>
        {(styledModel) => children(styledModel, toolboxComponent, apiContext)}
      </FormComponentAllStylesPreparer>
    );
};
