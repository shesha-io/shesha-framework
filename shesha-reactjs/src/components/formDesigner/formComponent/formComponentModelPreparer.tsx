import { IConfigurableFormComponent, IStyleValue, UnwrapCodeEvaluators, useCanvas, useForm, useShaFormInstance, useSheshaApplication, useSubFormOrUndefined, useTheme } from "@/providers";
import { FC, useEffect, useMemo, useState } from "react";
import * as React from "react";
import { useStyles } from "../styles/styles";
import { useFormDesignerComponentGetter } from "@/providers/form/hooks";
import { toCamelCase } from "@/utils/string";
import { IApiContext, IToolboxComponent } from "@/interfaces/formDesigner";
import { IPropertyMetadata } from "@/interfaces";
import { ErrorIconPopover } from "@/components/componentErrors/errorIconPopover";
import { IModelValidation } from "@/utils/errors";
import { formComponentActualModelPropertyFilter, updateComponentModelFromMetadata } from "@/providers/form/utils";
import { deepMergeSkipUndefinedFunc, deepMergeValues } from "@/utils/object";
import { isDefined, isNullOrWhiteSpace } from "@/utils";
import { useActualContextData, useActualContextExecution, useBackgroundStoredFile } from "@/hooks/formComponentHooks";
import { useComponentApiProvider } from "@/providers/componentApi/provider";
import { updateApi, updateApiModel } from "./formComponentApi";
import { useEffectOnce } from "@/hooks/useEffectOnce";
import { FormComponentAllStylesPreparer } from "./formComponentAllStylesPreparer";
import { getEffectiveStyle } from "@/utils/style";

interface FormComponentPrepareModelProps {
  componentModel: IConfigurableFormComponent;
  children: (componentModel: UnwrapCodeEvaluators<IConfigurableFormComponent>, toolboxComponent: IToolboxComponent, apiContext: IApiContext<IConfigurableFormComponent>) => React.JSX.Element;
}

export const FormComponentModelPreparer: FC<FormComponentPrepareModelProps> = ({ componentModel: sourceComponentModel, children }) => {
  const { styles } = useStyles();
  const shaApplication = useSheshaApplication();
  const { anyOfPermissionsGranted } = shaApplication;
  const shaForm = useShaFormInstance();
  const subForm = useSubFormOrUndefined();
  const { formSettings, isComponentFiltered } = useForm();

  const modelMetadata = isDefined(subForm) ? subForm.modelMetadata : shaForm.modelMetadata;

  const getToolboxComponent = useFormDesignerComponentGetter();
  const [propMetadata, setPropMetadata] = useState<IPropertyMetadata | undefined>(undefined);
  // Memoize component lookup to prevent unnecessary re-renders
  const toolboxComponent = useMemo(() => getToolboxComponent(sourceComponentModel.type), [getToolboxComponent, sourceComponentModel.type]);

  const { activeDevice } = useCanvas();
  const { theme } = useTheme();

  const componentApi = useComponentApiProvider();
  const [apiModel, setApiModel] = useState<Partial<IConfigurableFormComponent>>({});
  const [apiStyles, setApiStyles] = useState<Partial<IStyleValue>>({});

  // Default to 'desktop' when there's no canvas context (e.g., in datatables)
  const effectiveDevice = activeDevice || 'desktop';

  const effectiveStyle = useMemo((): IStyleValue => {
    return getEffectiveStyle(sourceComponentModel, effectiveDevice, theme, toolboxComponent, shaForm.form?.settings.isSettingsForm);
  }, [sourceComponentModel, effectiveDevice, theme, toolboxComponent, shaForm.form?.settings.isSettingsForm]);

  const sfBackground = useBackgroundStoredFile(effectiveStyle.background, shaApplication);
  const sfStyle = useMemo((): IStyleValue => ({ ...effectiveStyle, background: sfBackground }), [effectiveStyle, sfBackground]);

  const deviceModel = useMemo(() => deepMergeValues({ ...sourceComponentModel, ...sfStyle }, apiStyles, deepMergeSkipUndefinedFunc), [sourceComponentModel, apiStyles, sfStyle]);

  const unwrappedModel = useActualContextData<IConfigurableFormComponent & IStyleValue>(
    deviceModel,
    undefined,
    undefined,
    (name, value) => formComponentActualModelPropertyFilter(toolboxComponent, name, value),
    undefined,
    toolboxComponent?.actualModelFilteredPropertyProcessor,
  );

  const { isInput = false, isOutput = false } = toolboxComponent ?? {};

  const styleCss = useActualContextExecution(unwrappedModel.style, undefined, unwrappedModel.styleCss ?? {}); // use default style if empty or error
  const wrapperStyleCss = useActualContextExecution(unwrappedModel.wrapperStyle, undefined, unwrappedModel.wrapperStyleCss ?? {}); // use default style if empty or error

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

  const actualModel = useMemo((): UnwrapCodeEvaluators<IConfigurableFormComponent> => {
    return { ...unwrappedModel, styleCss, wrapperStyleCss, readOnly, disabled, hidden, propertyName };
  }, [hidden, propertyName, readOnly, disabled, styleCss, wrapperStyleCss, unwrappedModel]);

  const actualApiModel = useMemo(() => deepMergeValues(actualModel, apiModel), [actualModel, apiModel]);

  useEffect(() => {
    if (isDefined(componentApi))
      updateApi({ model: actualModel, apiModel: actualApiModel, componentApi, shaForm, toolboxComponent, setApiModel, setApiStyles });
  }, [componentApi, actualModel, actualApiModel, toolboxComponent, shaForm]);
  useEffectOnce(() => () => componentApi?.removeApi(actualModel.id));

  const apiContext: IApiContext<IConfigurableFormComponent> = useMemo(() => ({ updateApiModel: (model) => updateApiModel(setApiModel, model) }), []);

  useEffect(() => {
    let cancelled = false;
    if (modelMetadata?.properties && Boolean(actualApiModel.propertyName)) {
      const pName = toCamelCase(actualApiModel.propertyName ?? '');
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
    // clear prop metadata if model metadata is cleared
    if ((!isDefined(modelMetadata) || isNullOrWhiteSpace(actualApiModel.propertyName)) && isDefined(propMetadata))
      setPropMetadata(undefined);
    return () => {
      cancelled = true;
    };
  // propertyMetadat can retrigger the request after every resolution and cause an endless fetch loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelMetadata, actualApiModel.propertyName]);

  const componentModel = useMemo((): UnwrapCodeEvaluators<IConfigurableFormComponent> => {
    return toolboxComponent && propMetadata
      ? updateComponentModelFromMetadata(toolboxComponent, actualApiModel, propMetadata) as UnwrapCodeEvaluators<IConfigurableFormComponent>
      : actualApiModel;
  }, [actualApiModel, toolboxComponent, propMetadata]);

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
    ? children(componentModel, toolboxComponent, apiContext)
    : ( // ToDo: AS - remove after migration all components to use IStyleValue
      <FormComponentAllStylesPreparer componentModel={componentModel}>
        {(styledModel) => children(styledModel, toolboxComponent, apiContext)}
      </FormComponentAllStylesPreparer>
    );
};
