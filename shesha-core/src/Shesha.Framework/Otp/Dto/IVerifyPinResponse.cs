namespace Shesha.Otp.Dto
{
    /// <summary>
    /// OTP verification response
    /// </summary>
    public interface IVerifyPinResponse
    {
        /// <summary>
        /// Indicates that the OTP matches to the sent one
        /// </summary>
        bool IsSuccess { get; set; }

        /// <summary>
        /// Error message
        /// </summary>
        string ErrorMessage { get; set; }
    }
}
