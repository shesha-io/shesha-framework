using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain.Enums;

namespace Shesha.Otp.Distribution.Dto
{
    /// <summary>
    /// Distributed OTP configuration
    /// </summary>
    public class DistributedOtpConfig : DistributedConfigurableItemBase
    {
        /// <summary>
        /// Name of the notification type used to deliver the pin
        /// </summary>
        public string? NotificationTypeName { get; set; }

        /// <summary>
        /// Module of the notification type used to deliver the pin
        /// </summary>
        public string? NotificationTypeModule { get; set; }

        /// <summary>
        /// Lifetime of the pin in seconds
        /// </summary>
        public int? Lifetime { get; set; }

        /// <summary>
        /// Type of the generated pin
        /// </summary>
        public RefListOtpPinType PinType { get; set; } = RefListOtpPinType.Numeric;

        /// <summary>
        /// Length of the generated pin
        /// </summary>
        public int? PinLength { get; set; }

        /// <summary>
        /// Characters used to generate the pin
        /// </summary>
        public string? Alphabet { get; set; }
    }
}
