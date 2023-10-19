import React from "react";
import dynamic from "next/dynamic";
import { getLayout } from "src/components/layouts";
import { NextPageWithLayout } from "models";

const LazyLoadedPage = dynamic(
  async () => {
    const modules = await import("@shesha-io/reactjs");
    return modules.ConfigurableThemePage;
  },
  { ssr: false }
);

const Page: NextPageWithLayout = (props) => {
  return <LazyLoadedPage {...props} />;
};

Page.getLayout = getLayout;

export default Page;
