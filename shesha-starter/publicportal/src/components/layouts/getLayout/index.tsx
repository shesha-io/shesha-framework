import React, { ReactElement } from "react";
import { PortalLayout } from "@shesha-io/pd-publicportal";

/**
 * Returns the component wrapped up in a layout
 * @param page the page to be rendered within the layout
 * @returns the component wrapped up in a layout
 */
export const getLayout = (page: ReactElement): JSX.Element => {
  return <PortalLayout>{page}</PortalLayout>;
};

export default getLayout;
