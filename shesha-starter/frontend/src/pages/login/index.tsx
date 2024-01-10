import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import FormItem from "antd/lib/form/FormItem";
import { ILoginForm } from "models";
import Link from "next/link";
import React from "react";
import { URL_FORGOT_PASSWORD } from "routes";
import { useAuth, ValidationErrors } from "@shesha-io/reactjs";
import { LoginPageWrapper } from "../../components/pages/logon/styles";

export const Login = () => {
  const {
    loginUser,
    errorInfo,
    isInProgress: { loginUser: isLoggingInUser },
  } = useAuth();
  // const { nextRoute } = useRouteState();

  const [form] = Form.useForm<ILoginForm>();

  const handleLogin = (payload: ILoginForm) => {
    loginUser(payload);
  };

  return (
    <LoginPageWrapper
      className="login-page"
      heading="Welcome!"
      hint="Please enter your personal details in order to access your profile."
    >
      <Form form={form} onFinish={handleLogin}>
        <ValidationErrors error={errorInfo} />

        <FormItem
          name="userNameOrEmailAddress"
          help="This field is required"
          rules={[{ required: true }]}
        >
          <Input prefix={<MailOutlined />} placeholder="Username" />
        </FormItem>

        <FormItem
          name="password"
          help="This field is required"
          rules={[{ required: true }]}
        >
          <Input.Password
            autoComplete="on"
            prefix={<LockOutlined />}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            placeholder="Password"
          />
        </FormItem>

        <FormItem className="un-authed-btn-container">
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            block
            loading={isLoggingInUser}
            size="large"
          >
            {isLoggingInUser ? "Signing in...." : "Sign In"}
          </Button>
        </FormItem>

        <div className="custom-form-item">
          <Checkbox>Remember me</Checkbox>

          <Link href={URL_FORGOT_PASSWORD} className="login-form-forgot">
            Forgot password
          </Link>
        </div>
      </Form>
    </LoginPageWrapper>
  );
};

export default Login;
