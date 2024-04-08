import { createContext } from 'react';
import { IFlagsSetters } from '@/interfaces/flagsSetters';
import { IFlagsState } from '@/interfaces/flagsState';


export type IFlagProgressFlags = 'fetchFileInfo' /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags = 'fetchFileInfo' /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags = 'fetchFileInfo' /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = '__DEFAULT__' /* NEW_ACTIONED_FLAG_GOES_HERE */;

export interface ICanvasConfigStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  width?: number;
  zoom?: number;
}

export interface ICanvasConfigActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  setCanvasWidth: (width: number) => void;
  setCanvasZoom: (zoom: number) => void;
  /* NEW_ACTION_ACTION_DECLARATION_GOES_HERE */
}

export const CANVAS_CONFIG_CONTEXT_INITIAL_STATE: ICanvasConfigStateContext = {
  isInProgress: {},
  succeeded: {},
  error: {},
  actioned: {},
  width: 100,
  zoom: 100,
};

export const CanvasConfigStateContext = createContext<ICanvasConfigStateContext>(CANVAS_CONFIG_CONTEXT_INITIAL_STATE);

export const CanvasConfigActionsContext = createContext<ICanvasConfigActionsContext>(undefined);

//#endregion
