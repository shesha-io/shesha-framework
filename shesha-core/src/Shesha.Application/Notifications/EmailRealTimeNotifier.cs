using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Net.Mail;
using Abp.Notifications;
using Hangfire;
using NHibernate.Linq;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email;
using Shesha.Email.Dtos;
using Shesha.Extensions;
using Shesha.NHibernate;
using Shesha.NotificationMessages.Dto;
using Shesha.Services;

namespace Shesha.Notifications
{
    /// <summary>
    /// Email notifier
    /// </summary>
    public class EmailRealTimeNotifier : RealTimeNotifierBase, IShaRealTimeNotifier, ITransientDependency
    {
        private readonly ISheshaEmailSender _emailSender;
        private readonly IRepository<NotificationMessageAttachment, Guid> _attachmentRepository;
        private readonly IStoredFileService _fileService;

        public EmailRealTimeNotifier(UserManager userManager, IRepository<Person, Guid> personRepository, IRepository<NotificationTemplate, Guid> templateRepository, IRepository<NotificationMessage, Guid> notificationMessageRepository, IUnitOfWorkManager uowManager, IRepository<Notification, Guid> notificationRepository, ISheshaEmailSender emailSender, IRepository<NotificationMessageAttachment, Guid> attachmentRepository, IStoredFileService fileService) : base(userManager, personRepository, templateRepository, notificationMessageRepository, uowManager, notificationRepository)
        {
            _emailSender = emailSender;
            _attachmentRepository = attachmentRepository;
            _fileService = fileService;
        }

        /// inheritedDoc
        public override RefListNotificationType NotificationType => RefListNotificationType.Email;

        /// inheritedDoc
        public async Task SendNotificationsAsync(UserNotification[] userNotifications)
        {
            try
            {
                if (!userNotifications.Any())
                    return;

                foreach (var userNotification in userNotifications)
                {
                    // todo: use explicitly specified template with fallback to default
                    var template = await GetTemplateAsync(userNotification.Notification.NotificationName, RefListNotificationType.Email);
                    if (template == null || !template.IsEnabled)
                        continue;

                    if (template.SendType != RefListNotificationType.Email)
                        throw new Exception($"Wrong type of template. Expected `{RefListNotificationType.Email}`, actual `{template.SendType}`");

                    var person = await GetRecipientAsync(userNotification);
                    var email = person?.GetEmail();
                    if (string.IsNullOrWhiteSpace(email))
                        continue;

                    var subject = await GenerateContentAsync(template.Subject, userNotification);
                    var body = await GenerateContentAsync(template.Body, userNotification);

                    if (string.IsNullOrWhiteSpace(subject) && string.IsNullOrWhiteSpace(body))
                        continue;

                    var messageId = await CreateNotificationMessageAsync(template.Id, person.Id, message =>
                    {
                        message.Subject = subject;
                        message.Body = body;
                        message.RecipientText = email;
                    });

                    // save attachments


                    // schedule sending
                    UowManager.Current.DoAfterTransaction(() => BackgroundJob.Enqueue(() => SendNotification(messageId)));
                }
            }
            catch (Exception e)
            {
                throw;
            }
        }

        private async Task<List<EmailAttachment>> GetAttachmentsAsync(NotificationMessage message)
        {
            var attachments = await _attachmentRepository.GetAll().Where(a => a.Message == message).ToListAsync();

            var result = attachments.Select(a => new EmailAttachment(a.FileName, _fileService.GetStream(a.File))).ToList();
            
            return result;
        }

        private List<EmailAttachment> GetAttachments(NotificationMessage message)
        {
            var attachments = _attachmentRepository.GetAll().Where(a => a.Message == message).ToList();

            var result = attachments.Select(a => new EmailAttachment(a.FileName, _fileService.GetStream(a.File))).ToList();

            return result;
        }

        /// inheritedDoc
        protected override async Task DoSendNotificationMessageAsync(NotificationMessage message)
        {
            var attachments = await GetAttachmentsAsync(message);

            _emailSender.SendMail(null, message.RecipientText, message.Subject, message.Body, message.Template?.BodyFormat == RefListNotificationTemplateType.Html, attachments, throwException: true);
        }

        protected override void DoSendNotificationMessage(NotificationMessage message)
        {
            var attachments = GetAttachments(message);

            _emailSender.SendMail(null, message.RecipientText, message.Subject, message.Body, message.Template?.BodyFormat == RefListNotificationTemplateType.Html, attachments, throwException: true);
        }

        /// inheritedDoc
        public async Task SendNotificationsAsync(List<NotificationMessageDto> notificationMessages)
        {
            await SendNotificationsAsync(notificationMessages, RefListNotificationType.Email);
        }

        public Task ResendMessageAsync(Guid notificationMessageId)
        {
            throw new NotImplementedException();
        }
    }
}