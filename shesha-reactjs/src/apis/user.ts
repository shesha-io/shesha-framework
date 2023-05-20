export interface ResetPasswordVerifyOtpInput {
    /**
     * Unique runtime identifier of the operation. Is used for resending
     */
    operationId?: string;
    /**
     * Value of the One Time Pin
     */
    pin?: string | null;
    mobileNo: string;
}

export interface ResetPasswordVerifyOtpResponse {
    /**
     * Indicates that the OTP matches to the sent one
     */
    isSuccess?: boolean;
    /**
     * Error message
     */
    errorMessage?: string | null;
    token?: string | null;
    username?: string | null;
}

export interface ResetPasswordUsingTokenInput {
    username: string;
    token: string;
    newPassword: string;
}

export interface UserResetPasswordSendOtpQueryParams {
    /**
     * mobile number of the user
     */
    mobileNo?: string | null;
}