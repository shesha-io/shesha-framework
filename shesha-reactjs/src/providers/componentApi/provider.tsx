import { createContext, FC, PropsWithChildren, useContext, useId, useState } from "react";
import { ComponentApiInstance } from "./instance";
import { IComponentApi, useComponentApiFunc } from "./model";
import { useEffectOnce } from "@/hooks/useEffectOnce";

export interface IComponentApiUpdateState {
  state: unknown;
  instance: IComponentApi | undefined;
}

export const ComponentApiContext = createContext<IComponentApi | undefined>(undefined);
export const ComponentApiUpdateContext = createContext<IComponentApiUpdateState | undefined>({ state: {}, instance: undefined });

export const useComponentApiProvider: useComponentApiFunc = () => useContext(ComponentApiContext);

export const useComponentApiUpdate = (): IComponentApi | undefined => {
  return useContext(ComponentApiUpdateContext)?.instance;
};

export interface IComponentApiProviderProps {
  id?: string;
}

const ComponentApiProvider: FC<PropsWithChildren<IComponentApiProviderProps>> = ({ id, children }) => {
  const idLocal = useId();
  const parent = useComponentApiProvider();
  const [updateState, setUpdateState] = useState<IComponentApiUpdateState | undefined>(undefined);
  const [instance] = useState<IComponentApi>(() => new ComponentApiInstance(`${id}_${idLocal}`, parent, () => setUpdateState((prev) => ({ state: {}, instance: prev?.instance }))));
  useEffectOnce(() => () => instance.dispose());
  if (updateState === undefined) setUpdateState({ state: {}, instance });

  return (
    <ComponentApiContext.Provider value={instance}>
      <ComponentApiUpdateContext.Provider value={updateState}>
        {children}
      </ComponentApiUpdateContext.Provider>
    </ComponentApiContext.Provider>
  );
};

export default ComponentApiProvider;
