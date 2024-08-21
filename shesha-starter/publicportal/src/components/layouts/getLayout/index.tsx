import React, { ReactElement } from "react";
import MainLayout from "../mainLayout";
import { LOGO } from "@/app-constants";

/**
 * Returns the component wrapped up in a layout
 * @param page the page to be rendered within the layout
 * @returns the component wrapped up in a layout
 */
export const getLayout = (page: ReactElement): JSX.Element => {
  return <MainLayout imageProps={LOGO}>{page}</MainLayout>;
};

export default getLayout;
