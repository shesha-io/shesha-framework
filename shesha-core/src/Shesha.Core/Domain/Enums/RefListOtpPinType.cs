using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Type of the one-time pin generated for an OTP action
    /// </summary>
    [ReferenceList("OtpPinType")]
    public enum RefListOtpPinType : long
    {
        /// <summary>
        /// Short pin generated using the configured length and alphabet (e.g. sent by SMS)
        /// </summary>
        Numeric = 1,

        /// <summary>
        /// Long random token (e.g. embedded into an email link)
        /// </summary>
        Token = 2
    }
}
