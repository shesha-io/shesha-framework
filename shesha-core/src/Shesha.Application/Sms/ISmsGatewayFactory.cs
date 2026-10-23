using Shesha.Sms.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Sms
{
    /// <summary>
    /// Factory that serves current <see cref="ISmsGateway"/>
    /// </summary>
    public interface ISmsGatewayFactory
    {
        /// <summary>
        /// Get the gateway currently selected in SMS settings.
        /// </summary>
        /// <remarks>
        /// Reads settings on every call, so a settings change applies to the next call.
        /// Does not block the caller. Prefer this over injecting <see cref="ISmsGateway"/>.
        /// </remarks>
        Task<ISmsGateway> GetSmsGatewayAsync();

        /// <summary>
        /// Get registered SMS gateways.
        /// </summary>
        /// <remarks>
        /// Type discovery is cached for the process and is safe to call concurrently.
        /// Reading the catalogue does not resolve a gateway and does not read settings.
        /// <see cref="AvailableSmsGatewayInfo.SettingsType"/> is inferred from
        /// <see cref="IConfigurableSmsGateway{TSettings}"/> without creating an instance.
        /// </remarks>
        List<AvailableSmsGatewayInfo> GetSmsGatewayTypes();
    }
}
