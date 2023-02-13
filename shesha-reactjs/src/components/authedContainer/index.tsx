import { Alert, Button, Form, Input, Modal } from 'antd';
import React, { FC, Fragment, useState } from 'react';
import { ShaRoutingProvider, SidebarMenuProvider, useAuth } from '../../providers';
import SectionSeparator from '../sectionSeparator';
import classNames from 'classnames';
import './index.less';
import { ValidationErrors } from '../validationErrors';
import { IErrorInfo } from '../../interfaces/errorInfo';

const { Item } = Form;

interface ILoginForm {
  baseUrl: string;
  userNameOrEmailAddress: string;
  password: string;
}

interface IAuthContainerProps {
  layout?: boolean;
}

const AuthContainer: FC<IAuthContainerProps> = ({ children, layout = false }) => {
  const [isSignInModalVisible, setSignInModalVisibility] = useState(false);

  const { loginUser, logoutUser, isInProgress, loginInfo, error } = useAuth();

  const isLoggedIn = Boolean(loginInfo?.userName);

  const [loginForm] = Form.useForm();

  const showSignInModal = () => setSignInModalVisibility(true);
  const hideSignInModal = () => setSignInModalVisibility(false);

  const login = ({ baseUrl, ...payload }: ILoginForm) => {
    loginUser({
      password: payload.password,
      userNameOrEmailAddress: payload.userNameOrEmailAddress,
    });
  };

  const logout = () => {
    logoutUser();
  };

  return (
    <>
      <div className="sha-storybook-authenticated-container">
        {layout ||
          (!isLoggedIn && (
            <Fragment>
              <div className="sha-storybook-authenticated-action-btn">
                {isLoggedIn ? (
                  <Button type="primary" onClick={logout} danger>
                    Logout
                  </Button>
                ) : (
                  <Button type="primary" onClick={showSignInModal}>
                    Authorize
                  </Button>
                )}
              </div>

              <SectionSeparator title="" />
            </Fragment>
          ))}

        {isLoggedIn ? (
          <ShaRoutingProvider>
            <SidebarMenuProvider items={[]}>
              <div className={classNames({ 'sha-storybook-authenticated-container-layout': layout })}>{children}</div>
            </SidebarMenuProvider>
          </ShaRoutingProvider>
        ) : (
          <Fragment>
            <div className="sha-storybook-authenticated-action-btn">
              <Button type="primary" onClick={showSignInModal}>
                Authorize
              </Button>
            </div>
            <Alert
              message="Not authorized"
              description="Please make sure you are authorized before accessing this content"
              showIcon
              type="warning"
            />
          </Fragment>
        )}

        <Modal
          title="Login"
          open={isSignInModalVisible}
          onCancel={hideSignInModal}
          onOk={() => loginForm?.submit()}
          okButtonProps={{ loading: isInProgress?.loginUser || false }}
        >
          <ValidationErrors error={error?.loginUser as IErrorInfo} />

          <Form form={loginForm} onFinish={login}>
            <Item name="userNameOrEmailAddress" rules={[{ required: true }]}>
              <Input placeholder="username" />
            </Item>

            <Item name="password" rules={[{ required: true }]}>
              <Input.Password placeholder="password" />
            </Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default AuthContainer;
