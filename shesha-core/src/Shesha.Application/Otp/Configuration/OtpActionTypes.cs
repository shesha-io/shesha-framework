namespace Shesha.Otp.Configuration
{
    /// <summary>
    /// Action types of one-time pins (<see cref="Dto.SendPinInput.ActionType"/>) that change how the pin is sent
    /// </summary>
    public static class OtpActionTypes
    {
        /// <summary>
        /// Email link that verifies the email address of a new registration. Its link carries <c>isRegistration=true</c>.
        /// </summary>
        public const string EmailRegistration = "EmailRegistration";

        /// <summary>
        /// OTP (SMS pin or email link) that verifies a password reset. The password reset endpoints only accept OTPs of this type.
        /// </summary>
        public const string PasswordReset = "password-reset";
    }
}
