import React, { FC, PropsWithChildren, useId, useState } from "react";
import { ComponentApiInstance } from "./instance";
import { IComponentApi, useComponentApiFunc } from "./model";

export const ComponentApiContext = React.createContext<IComponentApi | undefined>(undefined);

export const useComponentApi: useComponentApiFunc = () => React.useContext(ComponentApiContext);

export interface IComponentApiProviderProps {
  id?: string;
}

const ComponentApiProvider: FC<PropsWithChildren<IComponentApiProviderProps>> = ({ id, children }) => {
  const idLocal = useId();
  const parent = useComponentApi();
  const [instance] = useState<IComponentApi>(() => new ComponentApiInstance(id ?? idLocal, parent));

  return (
    <ComponentApiContext.Provider value={instance}>
      {children}
    </ComponentApiContext.Provider>
  );
};

export default ComponentApiProvider;
