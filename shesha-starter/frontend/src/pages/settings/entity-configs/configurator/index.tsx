import React from "react";
import { EntityConfiguratorPage, PageWithLayout } from "@shesha-io/reactjs";
import { getLayout } from "src/components/layouts";

export const Page: PageWithLayout<{ id: string }> = () => {
  return <EntityConfiguratorPage />;
};

Page.getLayout = getLayout;

export default Page;
