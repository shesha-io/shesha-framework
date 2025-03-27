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
    public class SmsChannelSender : INotificationChannelSender
    {
        private readonly ISmsSettings _smsSettings;
        private readonly ISmsGateway _smsGateway;

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public SmsChannelSender(ISmsSettings smsSettings,IRepository<NotificationChannelConfig, Guid> notificationChannelRepository, ISmsGateway smsGateway)
        {
            _smsSettings = smsSettings;
            _smsGateway = smsGateway;
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

        public async Task<SendStatus> SendAsync(IMessageSender? sender, IMessageReceiver reciever, NotificationMessage message,  List<EmailAttachment>? attachments = null)
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

            return await _smsGateway.SendSmsAsync(mobileNo, message.Message);
        }

        public Task<SendStatus> BroadcastAsync(NotificationTopic topic, string subject, string message, List<EmailAttachment>? attachments = null)
        {
            return Task.FromResult(SendStatus.Failed("Broadcast Implementation not yet implemented!"));
        }
    }
}
