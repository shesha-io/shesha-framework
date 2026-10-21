"use client";

import {
  ConfigurableForm,
  PageWithLayout,
} from "@shesha-io/reactjs";
import { ACTIVE_LOGIN } from "@/app-constants/layout";

const Login: PageWithLayout = () => (
  <ConfigurableForm
    mode="edit"
    formId={ACTIVE_LOGIN}
  />
);

export default Login;
