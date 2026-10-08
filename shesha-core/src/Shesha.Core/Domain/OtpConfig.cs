using Shesha.Domain.Attributes;
using Shesha.Domain.Constants;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    /// <summary>
    /// Configuration of an OTP-protected action (e.g. login, password reset).
    /// Defines how the pin is generated and which notification type is used to deliver it,
    /// so the template and transport channel(s) are configured via the standard notification editor.
    /// </summary>
    [FixedView(ConfigurationItemsViews.Create, SheshaFrameworkModule.ModuleName, "cs-otp-config-create")]
    [Entity(
        FriendlyName = "OTP Configuration",
        TypeShortAlias = "Shesha.Domain.OtpConfig"
    )]
    [JoinedProperty("otp_configs", Schema = "frwk")]
    [DiscriminatorValue(ItemTypeName)]
    [SnakeCaseNaming]
    [Prefix(UsePrefixes = false)]
    public class OtpConfig : ConfigurationItem
    {
        public OtpConfig()
        {
        }

        /// <summary>
        /// Item type const
        /// </summary>
        public const string ItemTypeName = "otp-config";

        /// <summary>
        /// Item type
        /// </summary>
        public override string ItemType => ItemTypeName;

        /// <summary>
        /// Notification type used to deliver the pin. Its templates and channels define the message content and transport
        /// </summary>
        public virtual NotificationTypeConfig? NotificationType { get; set; }

        /// <summary>
        /// Lifetime of the pin in seconds. Falls back to the default lifetime from the OTP settings when empty
        /// </summary>
        public virtual int? Lifetime { get; set; }

        /// <summary>
        /// Type of the generated pin
        /// </summary>
        public virtual RefListOtpPinType PinType { get; set; } = RefListOtpPinType.Numeric;

        /// <summary>
        /// Length of the generated pin. Falls back to the OTP settings when empty. Applies to <see cref="RefListOtpPinType.Numeric"/> only
        /// </summary>
        public virtual int? PinLength { get; set; }

        /// <summary>
        /// Characters used to generate the pin. Falls back to the OTP settings when empty. Applies to <see cref="RefListOtpPinType.Numeric"/> only
        /// </summary>
        public virtual string? Alphabet { get; set; }

        /// <summary>
        /// If true, the action falls back to the legacy OTP behaviour as if no configuration was specified
        /// </summary>
        public virtual bool Disable { get; set; }
    }
}
