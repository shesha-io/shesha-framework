using Shesha.Notifications.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.Sms
{
    /// <summary>
    /// Container registration for <see cref="ISmsGateway"/>.
    /// </summary>
    /// <remarks>
    /// Constructing this type does no I/O and does not call <see cref="ISmsGatewayFactory"/>.
    /// Each operation awaits <see cref="ISmsGatewayFactory.GetSmsGatewayAsync"/>, remembers that
    /// gateway's <see cref="ISmsGateway.SettingsType"/> on this instance, and then releases the instance
    /// the factory returned. A null result or another <see cref="DelegatingSmsGateway"/> is not used;
    /// the operation runs on <see cref="NullSmsGateway.Instance"/> instead.
    /// A settings change applies on this instance's next call. Inject <see cref="ISmsGatewayFactory"/> in new code.
    /// </remarks>
    [Obsolete("Do not inject ISmsGateway. Inject ISmsGatewayFactory and call GetSmsGatewayAsync so gateway resolution stays asynchronous. DelegatingSmsGateway keeps existing constructor injection working without blocking a thread when the gateway is resolved.")]
    public class DelegatingSmsGateway : ISmsGateway
    {
        private readonly ISmsGatewayFactory _smsGatewayFactory;
        private Type _settingsTypeUsed;

        /// <summary>
        /// Creates a delegating gateway that forwards each operation to <paramref name="smsGatewayFactory"/>.
        /// </summary>
        /// <param name="smsGatewayFactory">Factory that resolves the currently configured gateway. Required.</param>
        public DelegatingSmsGateway(ISmsGatewayFactory smsGatewayFactory)
        {
            _smsGatewayFactory = smsGatewayFactory ?? throw new ArgumentNullException(nameof(smsGatewayFactory));
        }

        /// <summary>
        /// Sends through the gateway currently selected in settings, then releases it.
        /// </summary>
        /// <param name="mobileNumber">Destination mobile number.</param>
        /// <param name="body">Message body.</param>
        /// <returns>The selected gateway's send result.</returns>
        public Task<SendStatus> SendSmsAsync(string mobileNumber, string body)
        {
            return ExecuteAsync(gateway => gateway.SendSmsAsync(mobileNumber, body));
        }

        /// <summary>
        /// Reads settings from the gateway currently selected in settings, then releases it.
        /// </summary>
        /// <returns>The selected gateway's settings.</returns>
        public Task<object> GetSettingsAsync()
        {
            return ExecuteAsync(gateway => gateway.GetSettingsAsync());
        }

        /// <summary>
        /// Writes settings on the gateway currently selected in settings, then releases it.
        /// </summary>
        /// <param name="settings">Settings object passed to the selected gateway.</param>
        public Task SetSettingsAsync(object settings)
        {
            return ExecuteAsync(async gateway =>
            {
                await gateway.SetSettingsAsync(settings);
                return true;
            });
        }

        /// <summary>
        /// Settings type of the gateway this instance most recently used.
        /// </summary>
        /// <remarks>
        /// Returns null until this instance has run an operation, and when that gateway has no settings type.
        /// The value comes from the concrete gateway this instance resolved for its own last operation.
        /// It is not shared with other <see cref="DelegatingSmsGateway"/> instances.
        /// Reading it does not read settings, does not resolve a gateway, and does not block.
        /// A later settings change shows up here only after this instance's next operation.
        /// For the gateway currently configured, await <see cref="ISmsGatewayFactory.GetCurrentGatewayInfoAsync"/>.
        /// </remarks>
        [Obsolete("Do not read SettingsType on an ISmsGateway resolved from the container. On DelegatingSmsGateway it does not query settings and never blocks; it is the settings type of the gateway this instance most recently used, or null if this instance has not used a gateway yet. Await ISmsGatewayFactory.GetCurrentGatewayInfoAsync for the gateway currently selected in settings.")]
        public Type SettingsType => _settingsTypeUsed;

        /// <summary>
        /// Resolves the current gateway, records its settings type on this instance, runs <paramref name="action"/>, and releases the factory's instance.
        /// </summary>
        /// <typeparam name="T">Result of <paramref name="action"/>.</typeparam>
        /// <param name="action">Work to run against the gateway selected for this operation.</param>
        /// <returns>The result of <paramref name="action"/>.</returns>
        /// <remarks>
        /// <see cref="ISmsGateway.SettingsType"/> is read inside the try. If that getter throws, the exception
        /// propagates, this instance's <see cref="SettingsType"/> is left unchanged, <paramref name="action"/> does not run,
        /// and <see cref="ISmsGatewayFactory.ReleaseGateway"/> still receives the instance the factory returned.
        /// When the factory returns null or another <see cref="DelegatingSmsGateway"/>, <paramref name="action"/> runs on
        /// <see cref="NullSmsGateway.Instance"/> and release is still called with the original factory result.
        /// <see cref="ISmsGatewayFactory.ReleaseGateway"/> ignores null and <see cref="NullSmsGateway.Instance"/>.
        /// </remarks>
        private async Task<T> ExecuteAsync<T>(Func<ISmsGateway, Task<T>> action)
        {
            var resolved = await _smsGatewayFactory.GetSmsGatewayAsync();
            var gateway = resolved == null || resolved is DelegatingSmsGateway
                ? NullSmsGateway.Instance
                : resolved;

            try
            {
                _settingsTypeUsed = gateway.SettingsType;
                return await action(gateway);
            }
            finally
            {
                _smsGatewayFactory.ReleaseGateway(resolved);
            }
        }
    }
}
