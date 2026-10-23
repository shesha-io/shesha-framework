using Shesha.Notifications.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.Sms
{
    /// <summary>
    /// SMS gateway.
    /// </summary>
    /// <remarks>
    /// Do not inject <see cref="ISmsGateway"/> from the dependency container. That registration exists
    /// only for backward compatibility and is a <see cref="DelegatingSmsGateway"/>: constructing it does
    /// no I/O, and each operation awaits <see cref="ISmsGatewayFactory.GetSmsGatewayAsync"/>.
    /// Inject <see cref="ISmsGatewayFactory"/> and resolve the current gateway per operation.
    /// </remarks>
    public interface ISmsGateway
    {
        /// <summary>
        /// Send sms to specified mobile number
        /// </summary>
        Task<SendStatus> SendSmsAsync(string mobileNumber, string body);

        Task<object> GetSettingsAsync();
        Task SetSettingsAsync(object settings);

        /// <summary>
        /// CLR type of this gateway's settings, or null when the gateway has none.
        /// </summary>
        /// <remarks>
        /// On a gateway returned by <see cref="ISmsGatewayFactory.GetSmsGatewayAsync"/> this is the
        /// concrete gateway's settings type. On the container-registered <see cref="DelegatingSmsGateway"/>
        /// it is read from the cached gateway catalogue and does not block; prefer the factory.
        /// </remarks>
        Type SettingsType { get; }
    }
}
