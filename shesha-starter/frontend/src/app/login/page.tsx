"use client";

import React from "react";
import {
  ConfigurableForm,
  FormFullName,
  LOGIN_CONFIGURATION,
  PageWithLayout,
} from "@shesha-io/reactjs";

interface IProps {}

const Login: PageWithLayout<IProps> = () => (
  <ConfigurableForm
    mode={"edit"}
    formId={LOGIN_CONFIGURATION as FormFullName}
  />
);

export default Login;