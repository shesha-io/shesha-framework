namespace Shesha.Otp
{
    public interface IOtpGenerator
    {
        /// <summary>
        /// Generates new password
        /// </summary>
        /// <returns></returns>
        string GeneratePin();

        /// <summary>
        /// Generate pin using the specified length and alphabet, falls back to the OTP settings for missing values
        /// </summary>
        string GeneratePin(int? length, string? alphabet);
    }
}
