using Abp.Domain.Repositories;
using Castle.Core.Logging;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using NHibernate.Linq;
using Shesha.Configuration.Email;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email.Dtos;
using Shesha.Notifications.Dto;
using Shesha.OmoNotifications.Configuration;
using Shesha.OmoNotifications.Configuration.Email;
using Shesha.OmoNotifications.Emails.Gateways;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.OmoNotifications
{
    public class EmailChannelSender : INotificationChannelSender
    {
        private readonly INotificationSettings _notificationSettings;
        private readonly EmailGatewayFactory _emailGatewayFactory;
        private readonly IRepository<NotificationGatewayConfig, Guid> _notificationGatewayRepository;
        private readonly IRepository<UserTopicSubscription, Guid> _userTopicSubscriptionRepository;
        public ILogger Logger { get; set; } = NullLogger.Instance;

        public EmailChannelSender(INotificationSettings notificationSettings, EmailGatewayFactory emailGatewayFactory, IRepository<NotificationGatewayConfig, Guid> notificationGatewayRepository, IRepository<UserTopicSubscription, Guid> userTopicSubscriptionRepository)
        {
            _notificationSettings = notificationSettings;
            _userTopicSubscriptionRepository = userTopicSubscriptionRepository;
            _emailGatewayFactory = emailGatewayFactory;
            _notificationGatewayRepository = notificationGatewayRepository;
        }

        public string GetRecipientId(Person person)
        {
            return person.EmailAddress1;
        }

        public async Task<string> GetRecipients(NotificationTopic topic)
        {
            var recipients = await _userTopicSubscriptionRepository.GetAll().Where(s => s.Topic.Id == topic.Id).Select(s => GetRecipientId(s.User)).ToListAsync();
            return string.Join(";", recipients);
        }


        private async Task<EmailSettings> GetSettings()
        {
            return await _notificationSettings.EmailSettings.GetValueAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        private bool EmailsEnabled()
        {
            var enabled = _notificationSettings.EmailSettings.GetValue().EmailsEnabled;
            if (!enabled)
                Logger.Warn("Emails are disabled");

            return enabled;
        }

        public async Task<bool> SendAsync(Person fromPerson, Person toPerson, OmoNotificationMessage message, bool isBodyHtml, string cc = "", bool throwException = false, List<EmailAttachment> attachments = null)
        {
            //if (message.Length > MaxMessageSize)
            //    throw new ArgumentException("Message exceeds the maximum allowed size for Email.");
            var settings = await GetSettings();

            if (!settings.EmailsEnabled)
            {
                Logger.Warn("Emails are disabled");
                return await Task.FromResult(false);
            }

            var preferredGateway = await _notificationGatewayRepository.GetAsync(settings.PreferredGateway.Id);

            var gateway = _emailGatewayFactory.GetGateway(preferredGateway.GatewayTypeName);

            return await gateway.SendAsync(GetRecipientId(fromPerson), GetRecipientId(toPerson), message, isBodyHtml, cc, throwException, attachments);
        }

        public async Task<bool> BroadcastAsync(NotificationTopic topic, string subject, string message, List<EmailAttachment> attachments = null)
        {
            var settings = await GetSettings();

            if (!settings.EmailsEnabled)
            {
                Logger.Warn("Emails are disabled");
                return await Task.FromResult(false);
            }

            var gateway = _emailGatewayFactory.GetGateway(settings.PreferredGateway.GatewayTypeName);

            return await gateway.BroadcastAsync(GetRecipients(topic).Result, subject, message, attachments);
        }
    }

}
