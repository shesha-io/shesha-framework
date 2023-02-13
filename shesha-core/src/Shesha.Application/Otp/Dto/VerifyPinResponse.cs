namespace Shesha.Otp.Dto
{
    public class VerifyPinResponse
    {
        /// <summary>
        /// Indicates that the OTP matches to the sent one
        /// </summary>
        public bool IsSuccess { get; set; }
        /// <summary>
        /// Error message
        /// </summary>
        public string ErrorMessage { get; set; }

        public static VerifyPinResponse Success()
        {
            return new VerifyPinResponse {IsSuccess = true};
        }

        public static VerifyPinResponse Failed(string errorMessage)
        {
            return new VerifyPinResponse { IsSuccess = false, ErrorMessage = errorMessage };
        }
    }
}
