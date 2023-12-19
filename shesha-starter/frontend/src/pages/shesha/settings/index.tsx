import React from "react";
import dynamic from "next/dynamic";
import { getLayout } from "src/components/layouts";
import { NextPageWithLayout } from "models";

const LazyLoadedPage = dynamic(
  async () => {
    const modules = await import("@shesha-io/reactjs");
    return modules.SettingsPage;
  },
  { ssr: false }
);

const SettingsPage: NextPageWithLayout = (props) => {
  return <LazyLoadedPage {...props} />;
};

export default SettingsPage;

SettingsPage.getLayout = getLayout;
