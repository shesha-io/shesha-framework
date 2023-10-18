import { EntityConfiguratorPage, PageWithLayout } from "@shesha/reactjs";
import { getLayout } from "src/components/layouts";

export const Page: PageWithLayout<{ id: string }> = () => {
  return <EntityConfiguratorPage />;
  //return <LazyLoadedPage id={id} />;
};

Page.getLayout = getLayout;

export default Page;
