import { Alert, Button, Form, Input, Modal } from 'antd';
import React, { FC, Fragment, PropsWithChildren, useState } from 'react';
import { ShaRoutingProvider, SidebarMenuProvider, useAuth } from '@/providers';
import SectionSeparator from '@/components/sectionSeparator';
import classNames from 'classnames';
import { ValidationErrors } from '@/components/validationErrors';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { useStyles } from './styles';

const { Item } = Form;

interface ILoginForm {
  baseUrl: string;
  userNameOrEmailAddress: string;
  password: string;
}

interface IAuthContainerProps {
  layout?: boolean;
}

const AuthContainer: FC<PropsWithChildren<IAuthContainerProps>> = ({ children, layout = false }) => {
  const { styles } = useStyles();
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
      <div className={styles.shaStorybookAuthenticatedContainer}>
        {layout ||
          (!isLoggedIn && (
            <Fragment>
              <div className={styles.shaStorybookAuthenticatedActionBtn}>
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
          <ShaRoutingProvider router={null}>
            <SidebarMenuProvider items={[]}>
              <div className={classNames({ [styles.shaStorybookAuthenticatedContainerLayout]: layout })}>{children}</div>
            </SidebarMenuProvider>
          </ShaRoutingProvider>
        ) : (
          <Fragment>
            <div className={styles.shaStorybookAuthenticatedActionBtn}>
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
