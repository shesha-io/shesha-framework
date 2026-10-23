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
    /// Each operation awaits <see cref="ISmsGatewayFactory.GetSmsGatewayAsync"/>, so a settings change
    /// applies on the next call. Inject <see cref="ISmsGatewayFactory"/> in new code.
    /// </remarks>
    [Obsolete("Do not inject ISmsGateway. Inject ISmsGatewayFactory and call GetSmsGatewayAsync so gateway resolution stays asynchronous. DelegatingSmsGateway keeps existing constructor injection working without blocking a thread when the gateway is resolved.")]
    public class DelegatingSmsGateway : ISmsGateway
    {
        private readonly ISmsGatewayFactory _smsGatewayFactory;

        public DelegatingSmsGateway(ISmsGatewayFactory smsGatewayFactory)
        {
            _smsGatewayFactory = smsGatewayFactory ?? throw new ArgumentNullException(nameof(smsGatewayFactory));
        }

        /// <inheritdoc />
        public Task<SendStatus> SendSmsAsync(string mobileNumber, string body)
        {
            return ExecuteAsync(gateway => gateway.SendSmsAsync(mobileNumber, body));
        }

        /// <inheritdoc />
        public Task<object> GetSettingsAsync()
        {
            return ExecuteAsync(gateway => gateway.GetSettingsAsync());
        }

        /// <inheritdoc />
        public Task SetSettingsAsync(object settings)
        {
            return ExecuteAsync(async gateway =>
            {
                await gateway.SetSettingsAsync(settings);
                return true;
            });
        }

        /// <summary>
        /// Settings type of the gateway most recently returned by <see cref="ISmsGatewayFactory.GetSmsGatewayAsync"/>,
        /// taken from the cached gateway catalogue. Returns null until a gateway has been resolved and when the
        /// configured gateway has no settings type. Does not read settings and does not block.
        /// </summary>
        [Obsolete("Do not read SettingsType on an ISmsGateway resolved from the container. It does not query settings and never blocks; it echoes the settings type cached for the gateway last returned by ISmsGatewayFactory.GetSmsGatewayAsync. Inject ISmsGatewayFactory, await GetSmsGatewayAsync, and read SettingsType on that gateway. Settings types for every registered gateway are available from GetSmsGatewayTypes without I/O.")]
        public Type SettingsType =>
            _smsGatewayFactory is SmsGatewayFactory factory
                ? factory.GetCachedSettingsType()
                : null;

        private async Task<T> ExecuteAsync<T>(Func<ISmsGateway, Task<T>> action)
        {
            var gateway = await _smsGatewayFactory.GetSmsGatewayAsync();
            if (gateway == null || gateway is DelegatingSmsGateway)
                gateway = NullSmsGateway.Instance;

            try
            {
                return await action(gateway);
            }
            finally
            {
                // NullSmsGateway.Instance is not container-owned. Every other gateway was resolved
                // for this call and must be released so Windsor does not track it until the container dies.
                if (!ReferenceEquals(gateway, NullSmsGateway.Instance) && _smsGatewayFactory is SmsGatewayFactory factory)
                    factory.ReleaseGateway(gateway);
            }
        }
    }
}
