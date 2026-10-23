using System;

namespace Shesha.Sms.Dtos
{
    /// <summary>
    /// Available SMS gateway registered in IoC and ready to use
    /// </summary>
    public class AvailableSmsGatewayInfo
    {
        public Type Type { get; init; }
        public string Uid { get; init; }
        public string Alias { get; init; }
        public string Name { get; init; }
        public string Description { get; init; }

        /// <summary>
        /// Settings CLR type inferred from <c>IConfigurableSmsGateway&lt;TSettings&gt;</c>, or null.
        /// Populated from the gateway type without creating an instance.
        /// </summary>
        public Type SettingsType { get; init; }
    }
}
