import { ReactElement } from "react";
import PortalLayout from "../mainLayout";
import { LOGO } from "src/app-constants/application";

/**
 * Returns the component wrapped up in a layout
 * @param page the page to be rendered within the layout
 * @returns the component wrapped up in a layout
 */
export const getLayout = (page: ReactElement): JSX.Element => {
  return (
    <PortalLayout imageProps={LOGO} username="Admin">
      {page}
    </PortalLayout>
  );
};

export default getLayout;
