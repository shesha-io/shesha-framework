import React, { FC } from 'react';
import useThunkReducer from 'react-hook-thunk-reducer';
import { SETTINGS_CONTEXT_INITIAL_STATE, SettingsContext } from './contexts';
import reducer from './reducer';

export interface ISettingsProviderProps {
    
}

export const SettingsProvider: FC<ISettingsProviderProps> = ({ children }) => {
    const [state, dispatch] = useThunkReducer(reducer, SETTINGS_CONTEXT_INITIAL_STATE);

    const contextValue = {
        ...state
    };

    return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
}

export default SettingsProvider;