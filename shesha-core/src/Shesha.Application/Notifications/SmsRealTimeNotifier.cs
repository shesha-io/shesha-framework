using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Notifications;
using Hangfire;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.NHibernate;
using Shesha.NotificationMessages.Dto;
using Shesha.Sms;
using Shesha.Utilities;

namespace Shesha.Notifications
{
    /// <summary>
    /// SMS notifier
    /// </summary>
    public class SmsRealTimeNotifier : RealTimeNotifierBase, IShaRealTimeNotifier, ITransientDependency
    {
        private readonly ISmsGateway _smsGateway;

        public SmsRealTimeNotifier(UserManager userManager, IRepository<Person, Guid> personRepository, IRepository<NotificationTemplate, Guid> templateRepository, IRepository<NotificationMessage, Guid> notificationMessageRepository, IUnitOfWorkManager uowManager, IRepository<Notification, Guid> notificationRepository, ISmsGateway smsGateway) : base(userManager, personRepository, templateRepository, notificationMessageRepository, uowManager, notificationRepository)
        {
            _smsGateway = smsGateway;
        }

        /// inheritedDoc
        public override RefListNotificationType NotificationType => RefListNotificationType.SMS;

        /// inheritedDoc
        public async Task SendNotificationsAsync(UserNotification[] userNotifications)
        {
            try
            {
                if (!userNotifications.Any())
                    return;

                foreach (var userNotification in userNotifications)
                {
                    var template = await GetTemplateAsync(userNotification.Notification.NotificationName, RefListNotificationType.SMS);
                    if (template == null || !template.IsEnabled)
                        continue;

                    if (template.SendType != RefListNotificationType.SMS)
                        throw new Exception($"Wrong type of template. Expected `{RefListNotificationType.SMS}`, actual `{template.SendType}`");

                    var person = await GetRecipientAsync(userNotification);
                    var mobileNo = person?.GetMobileNumber();
                    if (string.IsNullOrWhiteSpace(mobileNo))
                        continue;

                    var body = await GenerateContentAsync(template.Body, userNotification);

                    if (string.IsNullOrWhiteSpace(body))
                        continue;

                    // save to audit
                    var messageId = await CreateNotificationMessageAsync(template.Id, person.Id, message =>
                    {
                        message.Body = body;
                        message.RecipientText = mobileNo;
                    });

                    // schedule sending
                    UowManager.Current.DoAfterTransaction(() => BackgroundJob.Enqueue(() => SendNotification(messageId)));
                }
            }
            catch (Exception e)
            {
                throw;
            }
        }

        /// inheritedDoc
        protected override async Task DoSendNotificationMessageAsync(NotificationMessage message)
        {
            await _smsGateway.SendSmsAsync(message.RecipientText, message.Body);
        }

        protected override void DoSendNotificationMessage(NotificationMessage message)
        {
            AsyncHelper.RunSync(() => _smsGateway.SendSmsAsync(message.RecipientText, message.Body));
        }

        /// inheritedDoc
        public async Task SendNotificationsAsync(List<NotificationMessageDto> notificationMessages)
        {
            await SendNotificationsAsync(notificationMessages, RefListNotificationType.SMS);
        }

        public Task ResendMessageAsync(Guid notificationMessageId)
        {
            throw new NotImplementedException();
        }
    }
}