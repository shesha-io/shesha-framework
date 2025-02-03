using Abp.Domain.Repositories;
using Castle.Core.Logging;
using DocumentFormat.OpenXml.Wordprocessing;
using NetTopologySuite.Densify;
using Newtonsoft.Json;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email.Dtos;
using Shesha.Notifications.Configuration;
using Shesha.Notifications.Dto;
using Shesha.Notifications.Helpers;
using Shesha.Notifications.MessageParticipants;
using Shesha.Services;
using Shesha.Sms;
using Shesha.Sms.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Shesha.Notifications.SMS
{
    public class SmsChannelSender : INotificationChannelSender
    {
        private readonly ISmsSettings _smsSettings;
        private readonly IRepository<NotificationChannelConfig, Guid> _notificationChannelRepository;
        private readonly ISmsGateway _smsGateway;

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public SmsChannelSender(ISmsSettings smsSettings,IRepository<NotificationChannelConfig, Guid> notificationChannelRepository, ISmsGateway smsGateway)
        {
            _smsSettings = smsSettings;
            _notificationChannelRepository = notificationChannelRepository;
            _smsGateway = smsGateway;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        public string GetRecipientId(Person person)
        {
            return person.MobileNumber1;
        }
        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        private async Task<SmsSettings> GetSettings()
        {
            return await _smsSettings.SmsSettings.GetValueAsync();
        }

        public async Task<SendStatus> SendAsync(IMessageSender fromPerson, IMessageReciever toPerson, NotificationMessage message, string cc = "", List<EmailAttachment> attachments = null)
        {
            var settings = await GetSettings();

            if (!settings.IsSmsEnabled)
            {
                Logger.Warn("SMSs are disabled");
                return await Task.FromResult(new SendStatus(){
                    IsSuccess= false,
                    Message = "SMSs are disabled"
                });
            }

            return await _smsGateway.SendSmsAsync(toPerson.GetAddress(), message.Message);
        }

        public async Task<SendStatus> BroadcastAsync(NotificationTopic topic, string subject, string message, List<EmailAttachment> attachments = null)
        {
            return await Task.FromResult(new SendStatus()
            {
                IsSuccess = false,
                Message = "Broadcast Implementation not yet implemented!"
            });
        }
    }
}
