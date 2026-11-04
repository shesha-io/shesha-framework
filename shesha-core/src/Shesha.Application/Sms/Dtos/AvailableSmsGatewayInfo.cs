using System;

namespace Shesha.Sms.Dtos
{
    /// <summary>
    /// Available SMS gateway registered in IoC and ready to use.
    /// </summary>
    public class AvailableSmsGatewayInfo
    {
        /// <summary>
        /// CLR type of the gateway. Resolved from the container only when a caller asks for an instance.
        /// </summary>
        public Type Type { get; init; }

        /// <summary>
        /// Value of <see cref="Shesha.Attributes.ClassUidAttribute"/> on <see cref="Type"/>.
        /// </summary>
        public string Uid { get; init; }

        /// <summary>
        /// Short alias derived from the gateway's display name.
        /// </summary>
        public string Alias { get; init; }

        /// <summary>
        /// Display name of the gateway.
        /// </summary>
        public string Name { get; init; }

        /// <summary>
        /// Description of the gateway, or null when the type has none.
        /// </summary>
        public string Description { get; init; }

        /// <summary>
        /// Settings CLR type inferred from <c>IConfigurableSmsGateway&lt;TSettings&gt;</c>, or null.
        /// Populated from the gateway type without creating an instance.
        /// </summary>
        public Type SettingsType { get; init; }
    }
}
