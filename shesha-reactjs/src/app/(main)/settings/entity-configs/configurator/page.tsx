"use client";

import { PageWithLayout } from "@/interfaces";
import { EntityConfiguratorPage } from  '@/generic-pages/entity-config/configurator';
import React from "react";

const Page: PageWithLayout<{}> = () => {
  return <EntityConfiguratorPage />;
};

export default Page;
