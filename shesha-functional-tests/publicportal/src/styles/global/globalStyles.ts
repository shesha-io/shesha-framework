import { createGlobalStyle } from "styled-components";
import { lgSpace, mdSpace, smSpace } from "./variables";

// Global styles come up in here
export const GlobalStyle = createGlobalStyle`
  $margin-lg: 24px;

  * {
    font-family: "Montserrat", sans-serif;
  }

  .lg-margin-bottom {
    margin-bottom: ${lgSpace};
  }

  .lg-margin-top {
    margin-top: ${lgSpace};
  }

  .md-margin-bottom {
    margin-bottom: ${mdSpace};
  }

  .md-margin-top {
    margin-top: ${mdSpace};
  }

  .sm-margin-bottom {
    margin-bottom: ${smSpace};
  }

  .sm-margin-top {
    margin-top: ${smSpace};
  }
`;

export default GlobalStyle;
