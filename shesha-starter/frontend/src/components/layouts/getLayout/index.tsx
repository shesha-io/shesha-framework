import React, { ReactElement } from "react";
import { MainLayout } from "@shesha-io/reactjs";

/**
 * Returns the component wrapped up in a layout
 * @param page the page to be rendered within the layout
 * @returns the component wrapped up in a layout
 */
export const getLayout = (page: ReactElement): JSX.Element => {
  return <MainLayout noPadding>{page}</MainLayout>;
};

export default getLayout;
