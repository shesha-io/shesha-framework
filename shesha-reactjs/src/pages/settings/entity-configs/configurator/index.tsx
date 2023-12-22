import { getLayout } from "@/components/mainLayout/index";
import { PageWithLayout } from "@/interfaces";
import { EntityConfiguratorPage } from  '@/generic-pages/entity-config/configurator';
import React from "react";

const Page: PageWithLayout<{ id: string }> = () => {
  return <EntityConfiguratorPage />;
};

Page.getLayout = getLayout;

export default Page;
