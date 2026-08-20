"use client";

import {
  ConfigurableForm,
  FormFullName,
  LOGIN_CONFIGURATION,
  PageWithLayout,
} from "@shesha-io/reactjs";
const Login: PageWithLayout = () => (
  <ConfigurableForm
    mode="edit"
    formId={LOGIN_CONFIGURATION as FormFullName}
  />
);

export default Login;
