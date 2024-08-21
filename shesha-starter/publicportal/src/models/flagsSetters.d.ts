export interface IFlagsSetters<A extends string, B extends string, C extends string, D extends string> {
  setIsInProgressFlag: (key: { [key in A]?: boolean }) => void;
  setSucceededFlag: (key: { [key in B]?: boolean }) => void;
  setFailedFlag: (key: { [key in C]?: boolean }) => void;
  setActionedFlag: (key: { [key in D]?: boolean }) => void;
  resetIsInProgressFlag: () => void;
  resetSucceededFlag: () => void;
  resetFailedFlag: () => void;
  resetActionedFlag: () => void;
  resetAllFlag: () => void;
}
