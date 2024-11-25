using Abp.Domain.Repositories;
using Castle.Core.Logging;
using DocumentFormat.OpenXml.Wordprocessing;
using Newtonsoft.Json;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email.Dtos;
using Shesha.Notifications.Dto;
using Shesha.OmoNotifications.Configuration;
using Shesha.OmoNotifications.Configuration.Email;
using Shesha.OmoNotifications.Configuration.Sms;
using Shesha.OmoNotifications.Emails.Gateways;
using Shesha.OmoNotifications.Helpers;
using Shesha.OmoNotifications.Sms.Gateways;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Shesha.OmoNotifications.SMS
{
    public class SmsChannelSender : INotificationChannelSender
    {
        private readonly INotificationSettings _notificationSettings;
        private readonly IRepository<NotificationGatewayConfig, Guid> _notificationGatewayRepository;
        private readonly SmsGatewayFactory _smsGatewayFactory;

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public SmsChannelSender(INotificationSettings notificationSettings, SmsGatewayFactory smsGatewayFactory, IRepository<NotificationGatewayConfig, Guid> notificationGatewayRepository)
        {
            _notificationSettings = notificationSettings;
            _smsGatewayFactory = smsGatewayFactory;
            _notificationGatewayRepository = notificationGatewayRepository;
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
            return await _notificationSettings.SmsSettings.GetValueAsync();
        }

        public async Task<bool> SendAsync(Person fromPerson, Person toPerson, OmoNotificationMessage message, bool isBodyHtml, string cc = "", bool throwException = false, List<EmailAttachment> attachments = null)
        {
            var settings = await GetSettings();

            if (!settings.SmsEnabled)
            {
                Logger.Warn("SMSs are disabled");
                return await Task.FromResult(false);
            }
            var preferredGateway = await _notificationGatewayRepository.GetAsync(settings.PreferredGateway.Id);

            var gateway = _smsGatewayFactory.GetGateway(preferredGateway.GatewayTypeName);
            return await gateway.SendAsync(GetRecipientId(toPerson), message.Message);
        }

        public async Task<bool> BroadcastAsync(NotificationTopic topic, string subject, string message, List<EmailAttachment> attachments = null)
        {
            return await Task.FromResult(false);
        }
    }
}
