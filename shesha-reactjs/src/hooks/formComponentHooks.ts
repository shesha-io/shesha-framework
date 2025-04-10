import { CSSProperties, useMemo, useRef, useState } from "react";
import { 
  IApplicationContext,
  IConfigurableFormComponent,
  IStyleType,
  executeScriptSync,
  getActualModel,
  getParentReadOnly,
  pickStyleFromModel,
  useAvailableConstantsContexts,
  useDataContextManager,
  useSheshaApplication,
  wrapConstantsData
} from "..";
import { TouchableProxy, makeTouchableProxy } from "@/providers/form/touchableProxy";
import { useParent } from "@/providers/parentProvider";
import { isEqual } from "lodash";
import { getSizeStyle } from "@/designer-components/_settings/utils/dimensions/utils";
import { getBorderStyle } from "@/designer-components/_settings/utils/border/utils";
import { getFontStyle } from "@/designer-components/_settings/utils/font/utils";
import { getShadowStyle } from "@/designer-components/_settings/utils/shadow/utils";
import { useDeepCompareEffect } from "./useDeepCompareEffect";
import { getBackgroundStyle } from "@/designer-components/_settings/utils/background/utils";
import { removeUndefinedProps } from "@/utils/object";

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
    
    prevActualModelRef.current = JSON.stringify(actualModel)      
    prevParentReadonly.current = pReadonly;    
  }

  actualModelRef.current = useMemo(() => {
    return actualModel;
  }, [prevActualModelRef.current])

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
  
  const calculatedModel = useCalculateModel(model, contextProxyRef.current as any);

  const modelChanged = !isEqual(prevModel.current, model);
  if (contextProxyRef.current.changed || modelChanged) {
      calculatedModelRef.current = calculateModel
        ? calculateModel(model, contextProxyRef.current as any, calculatedModel)
        : null;
  }

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

  if (contextProxyRef.current.changed || prevCode.current != executor) {
    actualDataRef.current = executor(contextProxyRef.current);
  }

  prevCode.current = executor;

  return actualDataRef.current;
};

// export function useRegisterDataContextListeners(componentId: string, touchedProps: Map<string, any>, listener: () => void) {
//   const dcm = useDataContextManager(false);
//   if (!dcm) 
//     return;

//   const touchedContexts = new Map<string, string[]>();
//   for (let key of touchedProps.keys()) {
//     const parts = key.split('.');
//     let context = '';
//     let propName = '';
//     if (parts[0] === SheshaCommonContexts.AppContext
//         || parts[0] === SheshaCommonContexts.PageContext
//         || parts[0] === SheshaCommonContexts.FormContext) {
//       context = parts[0];
//       propName = parts.slice(1).join('.');
//     }
//     else if (parts[0] === 'contexts') {
//       context = parts[1];
//       propName = parts.slice(2).join('.');
//     }

//     if (context && propName) {
//       if (!touchedContexts.has(context)) {
//         touchedContexts.set(context, [propName]);
//       } else {
//         const existing = touchedContexts.get(context);
//         existing.push(propName);
//         touchedContexts.set(context, existing);
//       }
//     }    
//   }

//   for (let key of touchedContexts.keys()) {
//     const dc = dcm.getDataContext(key);
//     if (!dc)
//       continue;

//     const propNames = touchedContexts.get(key);
//     if (!propNames || propNames.length === 0)
//       continue;

//     for (let propName of propNames) {
//       dc.registerListener(componentId, propName, listener);
//     }
//   }
// };

export const useModelAppearanceStyles = (model: IStyleType & IConfigurableFormComponent): CSSProperties => {
  
  const app = useSheshaApplication();

  const dimensions = model.dimensions;
  const border = model.border;
  const font = model.font;
  const shadow = model.shadow;
  const background = model.background;

  const [backgroundStyles, setBackgroundStyles] = useState(
    background?.storedFile?.id && background?.type === 'storedFile' 
      ? {} 
      : getBackgroundStyle(background, model.jsStyle)
  );

  const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
  const borderStyles = useMemo(() => getBorderStyle(border, model.jsStyle), [border, model.jsStyle]);
  const fontStyles = useMemo(() => getFontStyle(font), [font]);
  const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);
  const stylingBoxAsCSS = useMemo(() => pickStyleFromModel(JSON.parse(model.stylingBox || '{}')), [model.stylingBox]);

  useDeepCompareEffect(() => {
    if (background?.storedFile?.id && background?.type === 'storedFile')
      fetch(`${app.backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
        { headers: { ...app.httpHeaders, "Content-Type": "application/octet-stream" } })
        .then((response) => {
          return response.blob();
        })
        .then((blob) => {
          const url =  URL.createObjectURL(blob);
          const style = getBackgroundStyle(background, model.jsStyle, url);
          setBackgroundStyles(style);
        });
  }, [background, model.jsStyle, app.backendUrl, app.httpHeaders]);

  const finalStyle = useMemo(()=> {
    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      ...shadowStyles
    });
  
    return removeUndefinedProps({ ...additionalStyles, fontWeight: additionalStyles.fontWeight || 400 });
  }, [stylingBoxAsCSS, dimensionsStyles, borderStyles, fontStyles, backgroundStyles, shadowStyles]);

  return finalStyle;
};