import { useMemo, useRef, useState } from "react";
import { 
  IApplicationContext,
  IConfigurableFormComponent,
  IFormComponentStyles,
  IStyleType,
  executeScriptSync,
  getActualModel,
  getParentReadOnly,
  pickStyleFromModel,
  useAvailableConstantsContexts,
  useDataContextManager,
  useDeepCompareMemo,
  useSheshaApplication,
  wrapConstantsData
} from "..";
import { TouchableProxy, makeTouchableProxy } from "@/providers/form/touchableProxy";
import { useParent } from "@/providers/parentProvider";
import { isEqual } from "lodash";
import { getBorderStyle } from "@/designer-components/_settings/utils/border/utils";
import { getFontStyle } from "@/designer-components/_settings/utils/font/utils";
import { getShadowStyle } from "@/designer-components/_settings/utils/shadow/utils";
import { useDeepCompareEffect } from "./useDeepCompareEffect";
import { getBackgroundStyle } from "@/designer-components/_settings/utils/background/utils";
import { removeUndefinedProps } from "@/utils/object";
import { getDimensionsStyle } from "@/designer-components/_settings/utils/dimensions/utils";

export function useActualContextData<T = any>(
  model: T,
  parentReadonly?: boolean,
  additionalData?: any,
  propertyFilter?: (name: string) => boolean,
  executor?: (data: any, context: any) => any,
) {
  const parent = useParent(false);
  const fullContext = useAvailableConstantsContexts();
  fullContext.dcm = useDataContextManager(); // override DataContextManager to be responsive to changes in contexts
  const accessors = wrapConstantsData({ fullContext, topContextId: 'all' });

  const contextProxyRef = useRef<TouchableProxy<IApplicationContext>>();
  if (!contextProxyRef.current) {
    contextProxyRef.current = makeTouchableProxy<IApplicationContext>(accessors);
  } else {
    contextProxyRef.current.refreshAccessors(accessors);
  }
  contextProxyRef.current.setAdditionalData(additionalData);    

  contextProxyRef.current.checkChanged();

  const pReadonly = parentReadonly ?? getParentReadOnly(parent, contextProxyRef.current);

  const prevParentReadonly = useRef(pReadonly);
  const prevModel = useRef<T>();
  const actualModelRef = useRef<T>(model);
  const prevActualModelRef = useRef<string>('');

  let actualModel = undefined;
  const modelChanged = !isEqual(prevModel.current, model);
  if (contextProxyRef.current.changed || modelChanged || !isEqual(prevParentReadonly.current, pReadonly)) {
    const preparedData = model === null || model === undefined || Array.isArray(model) 
      ? model
      : { ...model, editMode: typeof model['editMode'] === 'undefined' ? undefined : model['editMode'] }; // add editMode property if not exists

    actualModel = executor
      ? executor(preparedData, contextProxyRef.current)
      : getActualModel(preparedData, contextProxyRef.current, pReadonly, propertyFilter);
    
    prevActualModelRef.current = JSON.stringify(actualModel);
    prevParentReadonly.current = pReadonly;    
  }

  actualModelRef.current = useMemo(() => {
    return actualModel;
  }, [prevActualModelRef.current]);

  if (modelChanged)
    prevModel.current = model;

  return actualModelRef.current;
}

export function useCalculatedModel<T = any>(
  model: T,
  useCalculateModel: (model: T, allData: IApplicationContext) => T = (_model, _allData) => ({} as T),
  calculateModel?: (model: T, allData: IApplicationContext, useCalculatedModel?: T) => T,
) {
  const fullContext = useAvailableConstantsContexts();
  const accessors = wrapConstantsData({ fullContext, topContextId: 'all' });

  const contextProxyRef = useRef<TouchableProxy<IApplicationContext>>();
  if (!contextProxyRef.current) {
    contextProxyRef.current = makeTouchableProxy<IApplicationContext>(accessors);
  } else {
    contextProxyRef.current.refreshAccessors(accessors);
  }
  contextProxyRef.current.checkChanged();

  const prevModel = useRef<T>();
  const calculatedModelRef = useRef<T>();
  const useCalculatedModelRef = useRef<T>();
  
  const useCalculatedModel = useCalculateModel(model, contextProxyRef.current as any);

  const modelChanged = !isEqual(prevModel.current, model);
  const useCalculatedModelChanged = !isEqual(useCalculatedModelRef.current, useCalculatedModel);
  if (contextProxyRef.current.changed || modelChanged || useCalculatedModelChanged) {
      calculatedModelRef.current = calculateModel
        ? calculateModel(model, contextProxyRef.current as any, useCalculatedModel)
        : null;
  }

  if (useCalculatedModelChanged)
    useCalculatedModelRef.current = useCalculatedModel;
  if (modelChanged)
    prevModel.current =  model;

  return calculatedModelRef.current;
}

export function useActualContextExecution<T = any>(code: string, additionalData?: any, defaultValue?: T) {
  const fullContext = useAvailableConstantsContexts();
  const accessors = wrapConstantsData({ fullContext });

  const contextProxyRef = useRef<TouchableProxy<IApplicationContext>>();
  if (!contextProxyRef.current) {
    contextProxyRef.current = makeTouchableProxy<IApplicationContext>(accessors);
  } else {
    contextProxyRef.current.refreshAccessors(accessors);
  }
  contextProxyRef.current.setAdditionalData(additionalData);    

  contextProxyRef.current.checkChanged();

  const prevCode = useRef<string>();
  const actualDataRef = useRef<T>(defaultValue);

  if (contextProxyRef.current.changed || !isEqual(prevCode.current, code)) {
    actualDataRef.current = Boolean(code) 
      ? executeScriptSync(code, contextProxyRef.current) 
      : defaultValue;
  }

  prevCode.current = code;

  return actualDataRef.current;
}

export function useActualContextExecutionExecutor<T = any>(executor: (context: any) => any, additionalData?: any) {
  const fullContext = useAvailableConstantsContexts();
  const accessors = wrapConstantsData({ fullContext });

  const contextProxyRef = useRef<TouchableProxy<IApplicationContext>>();
  if (!contextProxyRef.current) {
    contextProxyRef.current = makeTouchableProxy<IApplicationContext>(accessors);
  } else {
    contextProxyRef.current.refreshAccessors(accessors);
  }
  contextProxyRef.current.setAdditionalData(additionalData);    

  contextProxyRef.current.checkChanged();

  const prevCode = useRef(executor);
  const actualDataRef = useRef<T>(undefined);

  if (contextProxyRef.current.changed || prevCode.current !== executor) {
    actualDataRef.current = executor(contextProxyRef.current);
  }

  prevCode.current = executor;

  return actualDataRef.current;
};

export const useFormComponentStyles = <TModel,>(
  model: TModel & IStyleType & IConfigurableFormComponent
): IFormComponentStyles => {
  const app = useSheshaApplication();
  const jsStyle = useActualContextExecution(model.style, null, {}); // use default style if empty or error

  const { dimensions, border, font, shadow, background, stylingBox } = model;
  
  const [backgroundStyles, setBackgroundStyles] = useState(
    background?.storedFile?.id && background?.type === 'storedFile' 
      ? {} 
      : getBackgroundStyle(background, jsStyle)
  );

  const styligBox = JSON.parse(stylingBox || '{}');

  const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions, styligBox), [dimensions, stylingBox]);
  const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
  const fontStyles = useMemo(() => getFontStyle(font), [font]);
  const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);
  const stylingBoxAsCSS = useMemo(() => pickStyleFromModel(styligBox), [stylingBox]);

  useDeepCompareEffect(() => {
    if (background?.storedFile?.id && background?.type === 'storedFile'){
      fetch(`${app.backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
        { headers: { ...app.httpHeaders, "Content-Type": "application/octet-stream" } })
        .then((response) => {
          return response.blob();
        })
        .then((blob) => {
          const url =  URL.createObjectURL(blob);
          const style = getBackgroundStyle(background, jsStyle, url);
          setBackgroundStyles(style);
        });
      }else{
        setBackgroundStyles(getBackgroundStyle(background, jsStyle));
      }
  }, [background, jsStyle, app.backendUrl, app.httpHeaders]);

  const appearanceStyle = useMemo(()=> removeUndefinedProps(
    {
    ...stylingBoxAsCSS,
    ...dimensionsStyles,
    ...borderStyles,
    ...fontStyles,
    ...backgroundStyles,
    ...shadowStyles,
    fontWeight: fontStyles.fontWeight || 400,
  }), [stylingBoxAsCSS, dimensionsStyles, borderStyles, fontStyles, backgroundStyles, shadowStyles]);

  const fullStyle = useDeepCompareMemo(() => ({...appearanceStyle, ...jsStyle}), [appearanceStyle, jsStyle]);

  const allStyles: IFormComponentStyles = useMemo(() => ({
    stylingBoxAsCSS,
    dimensionsStyles,
    borderStyles,
    fontStyles,
    backgroundStyles,
    shadowStyles,
    jsStyle,
    appearanceStyle,
    fullStyle
  }), [stylingBoxAsCSS, dimensionsStyles, borderStyles, fontStyles, backgroundStyles, shadowStyles, jsStyle, appearanceStyle, fullStyle]);

  return allStyles;
};