import { createNamedContext } from "@/utils/react";
import React, { FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { useShaFormInstance } from "./shaFormProvider";
import { useDataContextManager } from "@/index";

export const DataUpdateListenerContext = createNamedContext<any>(undefined, "DataUpdateListenerContext");


export const DataUpdateListenerProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [state, setState] = useState({});

  const dcm = useDataContextManager(false);
  const shaInsatnce = useShaFormInstance();

  const update = () => {
    setState({});
  };

  useEffect(() => {
    dcm?.regiterListener(update);
    shaInsatnce.dataUpdate = update;
  }, []);

  return (
    <DataUpdateListenerContext.Provider value={state}>
      {children}
    </DataUpdateListenerContext.Provider>
  );
};

export const useDataUpdateListener = () => {
  return useContext(DataUpdateListenerContext);
};