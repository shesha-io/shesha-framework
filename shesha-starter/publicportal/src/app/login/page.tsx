"use client";

import { LOGO } from "@/app-constants";
import { ShaButton, ShaInput, ShaTitle } from "@/components";
import { ILoginForm } from "@/models";
import { URL_FORGOT_PASSWORD } from "@/routes";
import { ValidationErrors, useAuth, useTheme } from "@shesha-io/reactjs";
import { Checkbox, Form } from "antd";
import FormItem from "antd/lib/form/FormItem";
import Link from "next/link";
import { FC } from "react";
import { LoginPageWrapper } from "./styles";

const Login: FC = () => {
  const { theme } = useTheme();

  const {
    loginUser,
    errorInfo,
    isInProgress: { loginUser: isLoggingInUser },
  } = useAuth();

  const [form] = Form.useForm<ILoginForm>();

  const handleLogin = (payload: ILoginForm) => {
    loginUser(payload);
  };

  return (
    <LoginPageWrapper imgSrc={LOGO.src} imgWidth={350} colorTheme={theme}>
      <Form form={form} onFinish={handleLogin}>
        <ShaTitle title="Sign In" />

        <ShaInput
          className="lg-margin-bottom"
          name="userNameOrEmailAddress"
          label="Email Address"
          placeholder="Email Address"
        />

        <ShaInput
          className="lg-margin-bottom"
          name="password"
          label="Password"
          placeholder="Password"
          type="password"
        />

        <div className="sha-space-inline">
          <Checkbox className="sha-remember-me-check">Remember Me</Checkbox>

          <Link href={URL_FORGOT_PASSWORD} className="sha-forget-password-link">
            Forgot Password
          </Link>
        </div>

        <FormItem>
          <ShaButton
            type="primary"
            block
            loading={isLoggingInUser}
            size="large"
            htmlType="submit"
          >
            {isLoggingInUser ? "Signing in...." : "Sign In"}
          </ShaButton>
        </FormItem>

        <div className="sha-error">
          <ValidationErrors error={errorInfo} />
        </div>

        <div className="sha-space-inline lg-margin-top">
          <span className="sha-dont-have-password">Don't have an account?</span>

          <div className="sha-forget-password-link">Register</div>
        </div>
      </Form>
    </LoginPageWrapper>
  );
};

export default Login;
