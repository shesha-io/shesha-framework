import { createContext } from 'react';


export interface ILoadSettingPayload {
    
}

export interface ISettingsStateContext {
  
}

export interface ISettingsActionsContext {
  //getSetting: () => Promise<IModelMetadata>;
}

export interface ISettingsContext extends ISettingsStateContext, ISettingsActionsContext {
  
}

/** initial state */
export const SETTINGS_CONTEXT_INITIAL_STATE: ISettingsStateContext = {
  
};

export const SettingsContext = createContext<ISettingsActionsContext>(undefined);