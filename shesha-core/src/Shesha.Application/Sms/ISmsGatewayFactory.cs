using Shesha.Sms.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Sms
{
    /// <summary>
    /// Factory that serves the current <see cref="ISmsGateway"/>.
    /// </summary>
    /// <remarks>
    /// Prefer this over injecting <see cref="ISmsGateway"/>. The container registration of
    /// <see cref="ISmsGateway"/> exists only for backward compatibility.
    /// </remarks>
    public interface ISmsGatewayFactory
    {
        /// <summary>
        /// Gets the gateway currently selected in SMS settings.
        /// </summary>
        /// <returns>
        /// The selected gateway, or <see cref="NullSmsGateway.Instance"/> when nothing is configured
        /// or the configured uid is not registered.
        /// </returns>
        /// <remarks>
        /// Reads settings on every call, so a settings change applies to the next call. Does not block the caller.
        /// Concrete gateways are registered transient and are tracked by Windsor until released.
        /// The caller owns the returned instance and must pass it to <see cref="ReleaseGateway"/> when finished,
        /// including when the result is <see cref="NullSmsGateway.Instance"/> (that call is a no-op).
        /// A gateway received by constructor injection was not returned by this method and must not be released here.
        /// </remarks>
        Task<ISmsGateway> GetSmsGatewayAsync();

        /// <summary>
        /// Gets the catalogue entry for the gateway currently selected in SMS settings.
        /// </summary>
        /// <returns>
        /// The catalogue entry, or null when settings are missing, the uid is blank, or the uid is not registered.
        /// </returns>
        /// <remarks>
        /// Reads settings on every call and does not resolve a gateway, so there is nothing to release.
        /// <see cref="AvailableSmsGatewayInfo.SettingsType"/> comes from the cached catalogue.
        /// The default implementation returns null so existing <see cref="ISmsGatewayFactory"/> implementations keep compiling.
        /// </remarks>
        Task<AvailableSmsGatewayInfo> GetCurrentGatewayInfoAsync() => Task.FromResult<AvailableSmsGatewayInfo>(null);

        /// <summary>
        /// Releases a gateway returned by <see cref="GetSmsGatewayAsync"/>.
        /// </summary>
        /// <param name="gateway">Instance previously returned by <see cref="GetSmsGatewayAsync"/>. Null is ignored.</param>
        /// <remarks>
        /// <see cref="SmsGatewayFactory"/> removes the instance from Windsor's release policy.
        /// <see cref="NullSmsGateway.Instance"/> is not container-owned and is ignored.
        /// The default implementation does nothing so existing <see cref="ISmsGatewayFactory"/> implementations keep compiling.
        /// Custom factories that resolve from a container should override this.
        /// </remarks>
        void ReleaseGateway(ISmsGateway gateway)
        {
        }

        /// <summary>
        /// Gets the registered SMS gateways.
        /// </summary>
        /// <returns>A copy of the cached catalogue.</returns>
        /// <remarks>
        /// Type discovery is cached for the process and is safe to call concurrently.
        /// Reading the catalogue does not resolve a gateway and does not read settings.
        /// <see cref="AvailableSmsGatewayInfo.SettingsType"/> is inferred from
        /// <see cref="IConfigurableSmsGateway{TSettings}"/> without creating an instance.
        /// </remarks>
        List<AvailableSmsGatewayInfo> GetSmsGatewayTypes();
    }
}
