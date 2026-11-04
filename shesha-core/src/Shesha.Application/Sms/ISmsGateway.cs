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
    /// Inject <see cref="ISmsGatewayFactory"/> and resolve the current gateway per operation, then
    /// pass it to <see cref="ISmsGatewayFactory.ReleaseGateway"/>.
    /// </remarks>
    public interface ISmsGateway
    {
        /// <summary>
        /// Sends an SMS to the specified mobile number.
        /// </summary>
        /// <param name="mobileNumber">Destination mobile number.</param>
        /// <param name="body">Message body.</param>
        /// <returns>The gateway's send result.</returns>
        Task<SendStatus> SendSmsAsync(string mobileNumber, string body);

        /// <summary>
        /// Reads this gateway's settings.
        /// </summary>
        /// <returns>The gateway settings object.</returns>
        Task<object> GetSettingsAsync();

        /// <summary>
        /// Writes this gateway's settings.
        /// </summary>
        /// <param name="settings">Settings object, or null to clear them where the gateway allows it.</param>
        Task SetSettingsAsync(object settings);

        /// <summary>
        /// Gets the CLR type of this gateway's settings, or null when the gateway has none.
        /// </summary>
        /// <remarks>
        /// On a concrete gateway this is that gateway's settings type and does not read settings.
        /// On the container-registered <see cref="DelegatingSmsGateway"/> it is the settings type of the
        /// gateway that instance most recently used. It does not read settings and does not block.
        /// It is null until that instance has performed an operation. Use
        /// <see cref="ISmsGatewayFactory.GetCurrentGatewayInfoAsync"/> for the gateway currently selected in settings.
        /// </remarks>
        Type SettingsType { get; }
    }
}
