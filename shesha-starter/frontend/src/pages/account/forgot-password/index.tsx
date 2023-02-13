import { IdcardOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import {
  ResetPasswordSendOtpResponseAjaxResponse,
  ResetPasswordVerifyOtpInput,
  UserResetPasswordSendOtpQueryParams,
  useUserResetPasswordVerifyOtp,
} from 'api/user';
import { useRouter } from 'next/router';
import React, { FC, useState } from 'react';
import { useMutate } from 'restful-react';
import { URL_LOGIN_PAGE } from 'routes';
import { useAuth, ValidationErrors } from '@shesha/reactjs';
import { ForgotPasswordPage, VerifyOtpModal } from './styles';
import './styles.ts';

interface IProps {}

export const ForgotPassword: FC<IProps> = () => {
  const router = useRouter();

  const { verifyOtpSuccess } = useAuth();

  const [isVerifyOtpModalVisible, setIsVerifyOtpModalVisible] = useState(false);

  const [operationId, setOperationId] = useState('');

  const [sentOtpForm] = Form.useForm<UserResetPasswordSendOtpQueryParams>();

  const [verifyOtpForm] = Form.useForm<ResetPasswordVerifyOtpInput>();

  const {
    mutate: sendOtpHttp,
    error: sendOtpError,
    loading: isSendingOtp,
  } = useMutate<ResetPasswordSendOtpResponseAjaxResponse>({
    verb: 'POST',
    path: `/api/services/app/User/ResetPasswordSendOtp?mobileNo`,
  });

  const { mutate: verifyOtpHttp, loading: isVerifyingOtp, error: verifyOtpError } = useUserResetPasswordVerifyOtp({});

  const handleSendOtpFormFinish = ({ mobileNo }: UserResetPasswordSendOtpQueryParams) => {
    if (mobileNo) {
      sendOtpHttp(null, { queryParams: { mobileNo } })
        .then((response) => {
          setOperationId(response?.result?.operationId);
          toggleVerifyOtpModalVisibility();
        })
        .catch(() => {
          toggleVerifyOtpModalVisibility();
        });
    }
  };

  const handleVerifyOtpFormFinish = ({ pin }: ResetPasswordVerifyOtpInput) => {
    verifyOtpHttp({
      mobileNo: sentOtpForm?.getFieldValue('mobileNo'),
      pin,
      operationId,
    }).then((response) => verifyOtpSuccess(response?.result));
  };

  const toggleVerifyOtpModalVisibility = () => setIsVerifyOtpModalVisible((visible) => !visible);

  return (
    <ForgotPasswordPage
      className="forgot-password-page"
      heading="Forgot Password"
      hint="Please provide your registered cell number"
    >
      <ValidationErrors error={sendOtpError?.data} />

      <Form form={sentOtpForm} onFinish={handleSendOtpFormFinish}>
        <FormItem name="mobileNo" help="This field is required" rules={[{ required: true }]}>
          <Input prefix={<IdcardOutlined />} placeholder="Phone number" required />
        </FormItem>

        <FormItem className="un-authed-btn-container">
          <Button type="primary" htmlType="submit" className="login-form-button" block loading={isSendingOtp}>
            {isSendingOtp ? 'Sending Otp....' : 'Send Otp'}
          </Button>
        </FormItem>

        <FormItem>
          <Button type="link" block onClick={() => router.push(URL_LOGIN_PAGE)}>
            Back To Login Page
          </Button>
        </FormItem>
      </Form>

      <VerifyOtpModal
        visible={isVerifyOtpModalVisible}
        className="verify-otp-modal"
        title="Verify OTP"
        destroyOnClose
        onCancel={toggleVerifyOtpModalVisibility}
        footer={null}
      >
        <Alert
          message={
            <span>
              A One-Time Pin has successfully been sent to . Please check your phone and enter the OTP in the text below
            </span>
          }
          type="success"
        />
        <ValidationErrors error={verifyOtpError?.data as any} />

        <Form form={verifyOtpForm} onFinish={handleVerifyOtpFormFinish}>
          <FormItem name="pin" help="This field is required" rules={[{ required: true }]}>
            <Input placeholder="One-Time Pin" disabled={isSendingOtp || isVerifyingOtp} />
          </FormItem>

          <FormItem>
            <Button type="primary" htmlType="submit" className="login-form-button" block loading={isVerifyingOtp}>
              {isSendingOtp ? 'Verifying Otp....' : 'Verify Otp'}
            </Button>
          </FormItem>

          <FormItem>
            <Button
              type="link"
              htmlType="submit"
              className="login-form-button"
              block
              loading={isSendingOtp}
              disabled={isSendingOtp}
            >
              {isSendingOtp ? 'Resending Otp....' : 'Resend Otp'}
            </Button>
          </FormItem>
        </Form>
      </VerifyOtpModal>
    </ForgotPasswordPage>
  );
};

export default ForgotPassword;
