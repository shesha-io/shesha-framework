"use client";

import React from "react";
import {
  ConfigurableForm,
  PageWithLayout,
} from "@shesha-io/reactjs";
import { ACTIVE_LOGIN } from "@/app-constants/layout";

interface IProps {}

const Login: PageWithLayout<IProps> = () => (
  <ConfigurableForm
    mode={"edit"}
    formId={ACTIVE_LOGIN}
  />
);

export default Login;