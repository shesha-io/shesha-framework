"use client";

import React, { useEffect } from "react";
import {
  DynamicPage,
  FormIdentifier,
  PageWithLayout,
  useAuth,
} from "@shesha-io/reactjs";
import { useRouter } from "next/navigation";

interface IProps {
  searchParams: NodeJS.Dict<string | string[]>;
}

const Home: PageWithLayout<IProps> = (props) => {
  const { searchParams } = props;
  const route = useRouter();

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      route.push("dynamic/Boxfusion.SheshaCloud/dashboard");
    }
  }, [isLoggedIn]);

  const formId: FormIdentifier = {
    module: "Shesha",
    name: "login-public-portal",
  };
  return <DynamicPage {...searchParams} formId={formId} />;
};

export default Home;
