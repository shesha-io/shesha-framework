"use client";

import {
  ResetPasswordVerifyOtpInput,
  UserResetPasswordSendOtpQueryParams,
  useResetPasswordSendOtp,
  useResetPasswordVerifyOtp,
} from "@/api/user";
import { LOGO } from "@/app-constants";
import { LoginPageWrapper } from "@/app/login/styles";
import { ShaButton, ShaInput, ShaTitle } from "@/components";
import { URL_LOGIN_PAGE } from "@/routes";
import {
  PageWithLayout,
  ValidationErrors,
  useAuth,
  useTheme,
} from "@shesha-io/reactjs";
import { Form } from "antd";
import FormItem from "antd/lib/form/FormItem";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { VerifyOtpModal } from "./styles";

interface IProps {}

const ForgotPassword: PageWithLayout<IProps> = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const { verifyOtpSuccess } = useAuth();

  const [isVerifyOtpModalVisible, setIsVerifyOtpModalVisible] = useState(false);

  const [operationId, setOperationId] = useState("");

  const [sentOtpForm] = Form.useForm<UserResetPasswordSendOtpQueryParams>();

  const [verifyOtpForm] = Form.useForm<ResetPasswordVerifyOtpInput>();

  const {
    mutate: sendOtpHttp,
    error: sendOtpError,
    loading: isSendingOtp,
  } = useResetPasswordSendOtp();

  const {
    mutate: verifyOtpHttp,
    loading: isVerifyingOtp,
    error: verifyOtpError,
  } = useResetPasswordVerifyOtp();

  const toggleVerifyOtpModalVisibility = () =>
    setIsVerifyOtpModalVisible((visible) => !visible);

  const handleSendOtpFormFinish = ({
    mobileNo,
  }: UserResetPasswordSendOtpQueryParams) => {
    if (mobileNo) {
      sendOtpHttp({ mobileNo })
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
      mobileNo: sentOtpForm?.getFieldValue("mobileNo"),
      pin,
      operationId,
    }).then((response) => {
      verifyOtpSuccess(response?.result);
    });
  };

  return (
    <LoginPageWrapper imgSrc={LOGO.src} imgWidth={350} colorTheme={theme}>
      <Form form={sentOtpForm} onFinish={handleSendOtpFormFinish}>
        <ShaTitle title="Forgot Password" />

        <ValidationErrors error={sendOtpError?.data} />

        <ShaInput
          className="lg-margin-bottom"
          name="mobileNo"
          label="Phone number"
          placeholder="Phone number"
        />

        <FormItem>
          <ShaButton
            type="primary"
            block
            loading={isSendingOtp}
            size="large"
            htmlType="submit"
          >
            {isSendingOtp ? "Sending Otp...." : "Send Otp"}
          </ShaButton>
        </FormItem>

        <FormItem>
          <ShaButton
            type="link"
            block
            onClick={() => router.push(URL_LOGIN_PAGE)}
          >
            Back To Login Page
          </ShaButton>
        </FormItem>

        <div className="sha-components-container">
          <VerifyOtpModal
            visible={isVerifyOtpModalVisible}
            className="verify-otp-modal"
            title="Verify OTP"
            destroyOnClose
            onCancel={toggleVerifyOtpModalVisibility}
            footer={null}
          >
            <ValidationErrors error={verifyOtpError?.data as any} />

            <Form form={verifyOtpForm} onFinish={handleVerifyOtpFormFinish}>
              <ShaInput
                className="lg-margin-bottom"
                name="pin"
                label="OTP"
                placeholder="One-Time Pin"
                disabled={isSendingOtp || isVerifyingOtp}
              />

              <FormItem>
                <ShaButton
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  block
                  loading={isVerifyingOtp}
                >
                  {isSendingOtp ? "Verifying Otp...." : "Verify Otp"}
                </ShaButton>
              </FormItem>

              <FormItem>
                <ShaButton
                  type="link"
                  htmlType="submit"
                  className="login-form-button"
                  block
                  loading={isSendingOtp}
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? "Resending Otp...." : "Resend Otp"}
                </ShaButton>
              </FormItem>
            </Form>
          </VerifyOtpModal>
        </div>
      </Form>
    </LoginPageWrapper>
  );
};

export default ForgotPassword;
