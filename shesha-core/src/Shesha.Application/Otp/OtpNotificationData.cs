using Abp.Notifications;
using System;

namespace Shesha.Otp
{
    /// <summary>
    /// Notification data carried with OTP messages.
    /// </summary>
    /// <remarks>
    /// The Mustache template processor resolves <c>{{placeholder}}</c> tokens for <see cref="NotificationData"/>
    /// through the ABP property bag indexer (<c>this[key]</c>), not through CLR properties, and the lookup is
    /// case-sensitive on the exact key. Each property below is therefore backed by the property bag using the
    /// exact key used in the existing OTP templates so behaviour is preserved when the text is migrated into
    /// notification templates.
    /// </remarks>
    public class OtpNotificationData : NotificationData
    {
        /// <summary>
        /// The generated one-time pin / password. Available in templates as <c>{{password}}</c>.
        /// </summary>
        public string? Password
        {
            get => this[PlaceholderNames.Password] as string;
            set => this[PlaceholderNames.Password] = value;
        }

        /// <summary>
        /// Verification token used by the email-link flow. Available in templates as <c>{{token}}</c>.
        /// </summary>
        public string? Token
        {
            get => this[PlaceholderNames.Token] as string;
            set => this[PlaceholderNames.Token] = value;
        }

        /// <summary>
        /// Identifier of the recipient (e.g. encoded username). Available in templates as <c>{{userid}}</c>.
        /// </summary>
        public string? UserId
        {
            get => this[PlaceholderNames.UserId] as string;
            set => this[PlaceholderNames.UserId] = value;
        }

        /// <summary>
        /// Identifier of the OTP operation. Available in templates as <c>{{operationId}}</c>.
        /// </summary>
        public string? OperationId
        {
            get => this[PlaceholderNames.OperationId] as string;
            set => this[PlaceholderNames.OperationId] = value;
        }

        /// <summary>
        /// Indicates whether the email-link flow is a registration (as opposed to a password reset).
        /// Rendered as the lowercase string <c>true</c>/<c>false</c> via <c>{{isRegistration}}</c> to match
        /// the existing email-link URL format.
        /// </summary>
        public bool IsRegistration
        {
            get => string.Equals(this[PlaceholderNames.IsRegistration] as string, "true", StringComparison.OrdinalIgnoreCase);
            set => this[PlaceholderNames.IsRegistration] = value ? "true" : "false";
        }

        /// <summary>
        /// Exact placeholder keys used in OTP templates. Must match the tokens used in the seeded templates.
        /// </summary>
        public static class PlaceholderNames
        {
            public const string Password = "password";
            public const string Token = "token";
            public const string UserId = "userid";
            public const string OperationId = "operationId";
            public const string IsRegistration = "isRegistration";
        }
    }
}
