namespace Shesha.Otp
{
    public interface IOtpGenerator
    {
        /// <summary>
        /// Generates new password
        /// </summary>
        /// <returns></returns>
        string GeneratePin();
    }
}
