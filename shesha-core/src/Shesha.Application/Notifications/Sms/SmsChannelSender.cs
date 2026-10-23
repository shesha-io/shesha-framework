using Abp.Domain.Repositories;
using Castle.Core.Logging;
using Shesha.Domain;
using Shesha.Email.Dtos;
using Shesha.Notifications.Dto;
using Shesha.Notifications.MessageParticipants;
using Shesha.Sms;
using Shesha.Sms.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Notifications.SMS
{
#nullable enable
    public class SmsChannelSender : INotificationChannelSender
    {
        private readonly ISmsSettings _smsSettings;
        private readonly ISmsGatewayFactory _smsGatewayFactory;        

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public SmsChannelSender(ISmsSettings smsSettings, IRepository<NotificationChannelConfig, Guid> notificationChannelRepository, ISmsGatewayFactory smsGatewayFactory)
        {
            _smsSettings = smsSettings;
            _smsGatewayFactory = smsGatewayFactory;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        public string? GetRecipientId(Person person)
        {
            return person.MobileNumber1;
        }
        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        private async Task<SmsSettings> GetSettingsAsync()
        {
            return await _smsSettings.SmsSettings.GetValueAsync();
        }

        /// <summary>
        /// Sends an SMS through the gateway currently selected in settings, then releases that gateway.
        /// </summary>
        /// <param name="sender">Message sender. Unused by this channel.</param>
        /// <param name="reciever">Recipient whose address is the destination mobile number.</param>
        /// <param name="message">Notification body.</param>
        /// <param name="attachments">Unused by this channel.</param>
        /// <returns>The send result, or a failure when SMS is disabled or the mobile number is empty.</returns>
        public async Task<SendStatus> SendAsync(IMessageSender? sender, IMessageReceiver reciever, NotificationMessage message, List<EmailAttachment>? attachments = null)
        {
            var settings = await GetSettingsAsync();

            if (!settings.IsSmsEnabled)
            {
                Logger.Warn("SMSs are disabled");
                return SendStatus.Failed("SMSs are disabled");
            }

            var mobileNo = !string.IsNullOrWhiteSpace(settings.RedirectAllMessagesTo)
                ? settings.RedirectAllMessagesTo
                : reciever.GetAddress(this);

            if (string.IsNullOrWhiteSpace(mobileNo))
                return SendStatus.Failed("Recipient mobileNo is empty");

            var smsGateway = await _smsGatewayFactory.GetSmsGatewayAsync();
            try
            {
                return await smsGateway.SendSmsAsync(mobileNo, message.Message);
            }
            finally
            {
                _smsGatewayFactory.ReleaseGateway(smsGateway);
            }
        }

        public Task<SendStatus> BroadcastAsync(NotificationTopic topic, string subject, string message, List<EmailAttachment>? attachments = null)
        {
            return Task.FromResult(SendStatus.Failed("Broadcast Implementation not yet implemented!"));
        }
    }
#nullable restore
}
