import React, { FC, PropsWithChildren, useEffect } from "react";
import { useSheshaApplication } from "@shesha-io/reactjs";
import { formDesignerComponents } from "@/designer";

export interface IPublicPortalPluginProps {}

export const TEMPLATE_PLUGIN_NAME = "Shesha.Template";

export const ApplicationPlugin: FC<
  PropsWithChildren<IPublicPortalPluginProps>
> = ({ children }) => {
  const { registerFormDesignerComponents } = useSheshaApplication();

  useEffect(() => {
    registerFormDesignerComponents(
      TEMPLATE_PLUGIN_NAME,
      formDesignerComponents
    );
  }, []);

  return <>{children}</>;
};
