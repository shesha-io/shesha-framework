import { useMemo, useRef, useState } from "react";
import {
  DataContextTopLevels,
  IApplicationContext,
  IBackgroundValue,
  IConfigurableFormComponent,
  IFormComponentStyles,
  IStyleValue,
  ProxyPropertiesAccessors,
  StyleBoxValue,
  TypedProxy,
  UnwrapCodeEvaluators,
  executeScriptSync,
  getActualModel,
  getParentDisabled,
  getParentReadOnly,
  isConfigurableFormComponent,
  pickStyleFromModel,
  useAvailableConstantsContexts,
  useAvailableConstantsContextsNoRefresh,
  useCanvas,
  useDeepCompareMemo,
  wrapConstantsData,
} from "..";
import { TouchableProxy, makeTouchableProxy } from "@/providers/form/touchableProxy";
import { useParentOrUndefined } from "@/providers/parentProvider";
import { isEqual } from "lodash";
import { getBorderStyle } from "@/designer-components/_settings/utils/border/utils";
import { getFontStyle } from "@/designer-components/_settings/utils/font/utils";
import { getShadowStyle } from "@/designer-components/_settings/utils/shadow/utils";
import { useDeepCompareEffect } from "./useDeepCompareEffect";
import { getBackgroundStyle } from "@/designer-components/_settings/utils/background/utils";
import { jsonSafeParse, removeUndefinedProps } from "@/utils/object";
import { getDimensionsStyle } from "@/designer-components/_settings/utils/dimensions/utils";
import { getOverflowStyle } from "@/designer-components/_settings/utils/overflow/util";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { useIsFirstRender } from "./useIsFirstRender";
import { ISheshaApplicationInstance } from "@/providers/sheshaApplication/application";
import { getDisabledAndReadOnly, IDisabledAndReadOnly } from "@/components/formDesigner/formComponent/formComponentApi";
import { isHasEditMode } from "@/providers/form/utils/js-settings";

type MayHaveEditMode<T> = T & {
  editMode?: unknown | undefined;
};

export const useTouchableProxy = <T>(accessors: ProxyPropertiesAccessors<T>, additionalData?: object): TouchableProxy<T> => {
  const [proxy] = useState<TouchableProxy<T>>(() => {
    const result = makeTouchableProxy<T>(accessors);
    if (additionalData)
      result.setAdditionalData(additionalData);
    return result;
  });
  const isFirstRender = useIsFirstRender();
  if (!isFirstRender) {
    proxy.refreshAccessors(accessors);
    if (additionalData)
      proxy.setAdditionalData(additionalData);

    proxy.checkChanged();
  }

  return proxy;
};

const unwrapModel = <T extends object = object>(
  model: T,
  contextProxy: TypedProxy<IApplicationContext>,
  propertyFilter?: (name: string, value: unknown) => boolean,
  executor?: (data: T, context: TypedProxy<IApplicationContext>) => UnwrapCodeEvaluators<T>,
  parentDisabledAndReadOnly?: IDisabledAndReadOnly,
): UnwrapCodeEvaluators<T> => {
  const hasEditMode = model.hasOwnProperty('editMode');

  const preparedData: MayHaveEditMode<T> = Array.isArray(model)
    ? model
    : {
      ...model,
      editMode: hasEditMode ? (model as MayHaveEditMode<T>).editMode : undefined, // add editMode property if not exists (with undefined value)
    };

  const actualModel: UnwrapCodeEvaluators<T> = executor
    ? executor(preparedData, contextProxy)
    : getActualModel<T>(preparedData, contextProxy, parentDisabledAndReadOnly, propertyFilter, undefined, (m) => {
      const newModel = m as object;
      if (isHasEditMode(newModel)) {
        const parentReadOnly = !isDefined(parentDisabledAndReadOnly?.readOnly)
          ? contextProxy.form?.formMode === 'readonly'
          : parentDisabledAndReadOnly.readOnly;
        const disabledAndReadOnly = isConfigurableFormComponent(newModel) && isDefined(newModel.editMode) ? getDisabledAndReadOnly(newModel.editMode) : { disabled: false, readOnly: parentReadOnly };
        newModel.readOnly = disabledAndReadOnly.readOnly === true || parentReadOnly;
        newModel.disabled = disabledAndReadOnly.disabled === true || parentDisabledAndReadOnly?.disabled === true;
      }
    });
  return actualModel;
};

export function useActualContextData<T extends object = object>(
  model: T,
  parentDisabledAndReadOnly?: IDisabledAndReadOnly,
  additionalData?: object,
  propertyFilter?: (name: string, value: unknown) => boolean,
  executor?: (data: T, context: TypedProxy<IApplicationContext>) => UnwrapCodeEvaluators<T>,
): UnwrapCodeEvaluators<T> {
  const parent = useParentOrUndefined();
  const fullContext = useAvailableConstantsContexts();
  const accessors = wrapConstantsData({ fullContext, topContextId: DataContextTopLevels.All });

  const contextProxy = useTouchableProxy<IApplicationContext>(accessors, additionalData);
  const context = contextProxy as unknown as TypedProxy<IApplicationContext>;

  const pDisabledAndReadOnly: IDisabledAndReadOnly = {
    readOnly: parentDisabledAndReadOnly?.readOnly ?? getParentReadOnly(parent, context),
    disabled: parentDisabledAndReadOnly?.disabled ?? getParentDisabled(parent),
  };

  const prevParentReadonly = useRef<IDisabledAndReadOnly>(pDisabledAndReadOnly);
  const prevModel = useRef<T>(undefined);
  const actualModelRef = useRef<UnwrapCodeEvaluators<T> | undefined>(undefined);
  const prevActualModelRef = useRef<string>('');

  let actualModel: UnwrapCodeEvaluators<T> | undefined = undefined;
  const modelChanged = !isEqual(prevModel.current, model);
  if (!isDefined(actualModelRef.current) || contextProxy.changed || modelChanged || !isEqual(prevParentReadonly.current, pDisabledAndReadOnly)) {
    actualModel = unwrapModel(model, context, propertyFilter, executor, pDisabledAndReadOnly);

    // ToDo: AS - review copy and compare for performance and reliability
    const actualModelJson = JSON.stringify(actualModel);
    if (prevActualModelRef.current !== actualModelJson) {
      actualModelRef.current = actualModel;
    }
    prevActualModelRef.current = actualModelJson;
    prevParentReadonly.current = pDisabledAndReadOnly;
  }

  if (modelChanged)
    prevModel.current = model;

  if (!isDefined(actualModelRef.current))
    throw new Error('Actual model is not defined');

  return actualModelRef.current;
}

export function useCalculatedModel<T extends IConfigurableFormComponent = IConfigurableFormComponent, TCalculatedModel extends object = object>(
  model: T,
  useCalculateModel: (model: T, allData: IApplicationContext) => TCalculatedModel = (_model, _allData) => ({} as TCalculatedModel),
  calculateModel?: (model: T, allData: IApplicationContext, useCalculatedModel?: TCalculatedModel) => TCalculatedModel,
): TCalculatedModel {
  const fullContext = useAvailableConstantsContextsNoRefresh();
  const accessors = wrapConstantsData({ fullContext, topContextId: DataContextTopLevels.All });

  const contextProxyRef = useTouchableProxy<IApplicationContext>(accessors);

  // TODO: update TouchableProxy<T> to implement T and use without unsafe cast
  const allData = contextProxyRef as unknown as IApplicationContext;

  const prevModel = useRef<T>(undefined);
  const calculatedModelRef = useRef<TCalculatedModel>(undefined);
  const useCalculatedModelRef = useRef<TCalculatedModel>(undefined);

  const useCalculatedModel = useCalculateModel(model, allData);

  const modelChanged = !isEqual(prevModel.current, model);
  const useCalculatedModelChanged = !isEqual(useCalculatedModelRef.current, useCalculatedModel);
  if (contextProxyRef.changed || modelChanged || useCalculatedModelChanged) {
    calculatedModelRef.current = calculateModel
      ? calculateModel(model, allData, useCalculatedModel)
      : useCalculatedModel;
  }

  if (useCalculatedModelChanged)
    useCalculatedModelRef.current = useCalculatedModel;
  if (modelChanged)
    prevModel.current = model;

  // TODO: Alex, please review this code. calculatedModelRef.current may be undefined
  return calculatedModelRef.current as TCalculatedModel;
}

export function useActualContextExecution<T = unknown>(code: string | undefined, additionalData: object | undefined, defaultValue: T): T {
  const fullContext = useAvailableConstantsContexts();
  const accessors = wrapConstantsData({ fullContext });

  const contextProxyRef = useTouchableProxy<IApplicationContext>(accessors, additionalData);

  const prevCode = useRef<string>(undefined);
  const actualDataRef = useRef<T>(defaultValue);

  if (contextProxyRef.changed || !isEqual(prevCode.current, code)) {
    const result = !isNullOrWhiteSpace(code)
      ? executeScriptSync(code, contextProxyRef) as T
      : defaultValue;

    // Only update if result is not undefined, otherwise keep previous value or use default
    actualDataRef.current = result !== undefined ? result : (actualDataRef.current ?? defaultValue);
  }

  prevCode.current = code;

  return actualDataRef.current;
}

export function useActualContextExecutionExecutor<T = unknown, TAdditionalData extends object = object>(executor: (context: IApplicationContext & TAdditionalData) => T, additionalData?: TAdditionalData): T | undefined {
  const fullContext = useAvailableConstantsContextsNoRefresh();
  const accessors = wrapConstantsData({ fullContext });

  const contextProxyRef = useTouchableProxy<IApplicationContext>(accessors, additionalData);

  // TODO: update TouchableProxy<T> to implement T and use without unsafe cast
  const allData = contextProxyRef as unknown as IApplicationContext & TAdditionalData;

  const prevCode = useRef(executor);
  const actualDataRef = useRef<T>(undefined);

  if (contextProxyRef.changed || prevCode.current !== executor) {
    actualDataRef.current = executor(allData);
  }

  prevCode.current = executor;

  return actualDataRef.current;
};

export interface IUseFormComponentStylesOptions {
  /** Use wrapperStyle instead of style for jsStyle calculation (for container components) */
  useWrapperStyle?: boolean;
}

export const useBackgroundStoredFile = (model: IBackgroundValue | undefined, app: ISheshaApplicationInstance): IBackgroundValue | undefined => {
  const [background, setBackground] = useState<IBackgroundValue | undefined>(model);
  const objectUrlRef = useRef<string | null>(null);

  const storedFileId = model?.storedFile?.id;
  const storedFileType = model?.type;

  useDeepCompareEffect(() => {
    if (storedFileType === 'storedFile') {
      if (storedFileId) {
        fetch(`${app.backendUrl}/api/StoredFile/Download?id=${storedFileId}`,
          { headers: { ...app.httpHeaders, "Content-Type": "application/octet-stream" } })
          .then((response) => {
            return response.blob();
          })
          .then((blob) => {
            // Revoke previous object URL to prevent memory leak
            if (objectUrlRef.current) {
              URL.revokeObjectURL(objectUrlRef.current);
              objectUrlRef.current = null;
            }
            objectUrlRef.current = URL.createObjectURL(blob);
            setBackground({ ...model, url: objectUrlRef.current });
          })
          .catch((error) => {
            console.error('Failed to fetch image', error);
          });
      }
    }
    // Cleanup on unmount
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [storedFileId, storedFileType, app.backendUrl, app.httpHeaders, model]);

  return storedFileType === 'storedFile' ? background : model;
};

// ToDo: AS - remove after migration all components to the new styles

export const useFormComponentStyles = <TModel extends IStyleValue & Pick<IConfigurableFormComponent, 'style' | 'wrapperStyle'>>(
  model: TModel/* & IStyleValue & Omit<IConfigurableFormComponent, 'id' | 'type'>*/,
  options?: IUseFormComponentStylesOptions,
): IFormComponentStyles => {
  const { useWrapperStyle = false } = options || {};
  // For container components, use wrapperStyle instead of style
  const styleSource = useWrapperStyle && !isNullOrWhiteSpace(model.wrapperStyle)
    ? model.wrapperStyle
    : model.style;
  const jsStyle = useActualContextExecution(styleSource, undefined, {}); // use default style if empty or error
  const { designerWidth } = useCanvas();

  const { dimensions, border, font, shadow, background, stylingBox, overflow } = model;

  const backgroundLocal = useMemo(() => getBackgroundStyle(background, jsStyle, background?.url), [background, jsStyle]);

  const stylingBoxParsed = useMemo(() => !isNullOrWhiteSpace(stylingBox) ? jsonSafeParse<StyleBoxValue>(stylingBox) : {}, [stylingBox]);

  const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
  const fontStyles = useMemo(() => getFontStyle(font), [font]);
  const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);
  const stylingBoxAsCSS = useMemo(() => pickStyleFromModel(stylingBoxParsed as StyleBoxValue), [stylingBoxParsed]);
  const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions, designerWidth, undefined), [dimensions, designerWidth]);
  const overflowStyles = useMemo(() => isDefined(overflow) ? getOverflowStyle(overflow, false) : {}, [overflow]);

  const appearanceStyle = useDeepCompareMemo(() => removeUndefinedProps(
    {
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...fontStyles,
      ...backgroundLocal,
      ...shadowStyles,
      ...overflowStyles,
      fontWeight: Boolean(fontStyles.fontWeight) ? fontStyles.fontWeight : 400,
    }), [stylingBoxAsCSS, dimensionsStyles, borderStyles, fontStyles, background, backgroundLocal, shadowStyles, overflowStyles]);

  const fullStyle = useDeepCompareMemo(() => ({ ...appearanceStyle, ...jsStyle }), [appearanceStyle, jsStyle]);

  // Extract margin styles for wrapper use
  const margins = useMemo(() => ({
    marginTop: fullStyle.marginTop,
    marginBottom: fullStyle.marginBottom,
    marginLeft: fullStyle.marginLeft,
    marginRight: fullStyle.marginRight,
  }), [fullStyle.marginTop, fullStyle.marginBottom, fullStyle.marginLeft, fullStyle.marginRight]);

  const allStyles: IFormComponentStyles = useMemo(() => ({
    stylingBoxAsCSS,
    dimensionsStyles,
    borderStyles,
    fontStyles,
    backgroundStyles: backgroundLocal,
    shadowStyles,
    overflowStyles,
    jsStyle,
    appearanceStyle,
    fullStyle,
    margins,
  }), [stylingBoxAsCSS, dimensionsStyles, borderStyles, fontStyles, backgroundLocal, shadowStyles, overflowStyles, jsStyle, appearanceStyle, fullStyle, margins]);

  return allStyles;
};
