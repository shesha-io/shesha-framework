using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Notifications;
using Hangfire;
using NHibernate.Linq;
using NHibernate.Linq.Functions;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;
using Shesha.Exceptions;
using Shesha.NHibernate;
using Shesha.NotificationMessages.Dto;
using Shesha.Notifications.Dto;
using Shesha.Notifications.Exceptions;
using Shesha.Utilities;
using Stubble.Core;
using Stubble.Core.Builders;
using Stubble.Core.Settings;

namespace Shesha.Notifications
{
    /// <summary>
    /// Base class of realtime notifier. Key features:
    /// 1. Generation of messages based on templates. Uses mustache syntax
    /// 2. Audit (uses <see cref="NotificationMessage"/>)
    /// 3. Work in background with retries
    /// </summary>
    public abstract class RealTimeNotifierBase
    {
        protected readonly UserManager UserManager;
        protected readonly IRepository<Person, Guid> PersonRepository;
        protected readonly IRepository<Notification, Guid> NotificationRepository;
        protected readonly IRepository<NotificationTemplate, Guid> TemplateRepository;
        protected readonly IRepository<NotificationMessage, Guid> NotificationMessageRepository;

        public abstract RefListNotificationType NotificationType { get; }

        private readonly StubbleVisitorRenderer _stubbleRenderer = new StubbleBuilder().Configure(settings =>
        {
            //settings.di
        }).Build(); // todo: move to DI Container

        protected readonly IUnitOfWorkManager UowManager;

        protected RealTimeNotifierBase(UserManager userManager, IRepository<Person, Guid> personRepository,
            IRepository<NotificationTemplate, Guid> templateRepository,
            IRepository<NotificationMessage, Guid> notificationMessageRepository, IUnitOfWorkManager uowManager,
            IRepository<Notification, Guid> notificationRepository)
        {
            UserManager = userManager;
            PersonRepository = personRepository;
            TemplateRepository = templateRepository;
            NotificationMessageRepository = notificationMessageRepository;
            UowManager = uowManager;
            NotificationRepository = notificationRepository;
        }

        private IQueryable<NotificationTemplate> GetTemplateQuery(string notificationName,
            RefListNotificationType sendType)
        {
            return TemplateRepository.GetAll()
                .Where(t => t.Notification != null &&
                            t.Notification.Name == notificationName &&
                            t.SendType == sendType)
                .OrderByDescending(t => t.CreationTime);
        }


        /// <summary>
        /// Get template by notification name and send type (email/sms etc)
        /// </summary>
        protected async Task<NotificationTemplate> GetTemplateAsync(string notificationName,
            RefListNotificationType sendType)
        {
            return await GetTemplateQuery(notificationName, sendType).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Get template by notification name and send type (email/sms etc)
        /// </summary>
        protected NotificationTemplate GetTemplate(string notificationName, RefListNotificationType sendType)
        {
            return GetTemplateQuery(notificationName, sendType).FirstOrDefault();
        }

        private IQueryable<Notification> GetNotificationQuery(string notificationName)
        {
            return NotificationRepository.GetAll().Where(t => t.Name == notificationName);
        }

        /// <summary>
        /// Get notification by name
        /// </summary>
        protected Notification GetNotification(string notificationName)
        {
            return GetNotificationQuery(notificationName).FirstOrDefault();
        }

        /// <summary>
        /// Get notification by name
        /// </summary>
        protected async Task<Notification> GetNotificationAsync(string notificationName)
        {
            return await GetNotificationQuery(notificationName).FirstOrDefaultAsync();
        }

        private IQueryable<Person> GetRecipientQuery(UserNotification notification)
        {
            return PersonRepository.GetAll().Where(p => p.User.Id == notification.UserId);
        }

        /// <summary>
        /// Get recipient (person) of the message
        /// </summary>
        protected async Task<Person> GetRecipientAsync(UserNotification notification)
        {
            return await GetRecipientQuery(notification).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Get recipient (person) of the message
        /// </summary>
        protected Person GetRecipient(UserNotification notification)
        {
            return GetRecipientQuery(notification).FirstOrDefault();
        }

        /// <summary>
        /// Generate content based on template (uses mustache syntax)
        /// </summary>
        protected async Task<string> GenerateContentAsync(string template, UserNotification notification)
        {
            return !string.IsNullOrWhiteSpace(template)
                ? await _stubbleRenderer.RenderAsync(template, notification.Notification.Data)
                : template;
        }

        /// <summary>
        /// Generate content based on template (uses mustache syntax)
        /// </summary>
        protected string GenerateContent(string template, NotificationData data, bool stripHtml, bool removeDiacritics = false)
        {
            if (removeDiacritics)
            {
                // remove sms-unsupported symbols
                var props = data.GetType().GetProperties();
                foreach (var prop in props)
                {
                    if (prop.PropertyType == typeof(string) && prop.CanWrite)
                    {
                        prop.SetValue(data, prop.GetValue(data)?.ToString().RemoveDiacritics());
                    }
                }
            }

            var result = !string.IsNullOrWhiteSpace(template)
                ? removeDiacritics
                    ? _stubbleRenderer.Render(template, data,
                        data.Properties.ToDictionary(i => i.Key, i => i.Value.ToString()), new RenderSettings() { SkipHtmlEncoding = true })
                    : _stubbleRenderer.Render(template, data,
                        data.Properties.ToDictionary(i => i.Key, i => i.Value.ToString()))
                : template;

            if (stripHtml)
                result = result?.StripHtml()?.Trim();

            return result;
        }

        /// <summary>
        /// Create new record in the <see cref="NotificationMessage"/>. Is used for audit purposes and retries
        /// </summary>
        /// <param name="templateId">Id of the template</param>
        /// <param name="recipientId">Id of the person</param>
        /// <param name="fillData">fill data action (specific to the send type)</param>
        /// <returns></returns>
        protected async Task<Guid> CreateNotificationMessageAsync(Guid templateId, Guid? recipientId,
            Action<NotificationMessage> fillData)
        {
            var messageId = Guid.NewGuid();
            using (var uow = UowManager.Begin(TransactionScopeOption.RequiresNew))
            {
                // get template again to isolate sessions
                var localTemplate = await TemplateRepository.GetAsync(templateId);
                var localRecipient = recipientId.HasValue
                    ? await PersonRepository.GetAsync(recipientId.Value)
                    : null;
                var message = new NotificationMessage()
                {
                    Id = messageId,
                    Notification = localTemplate.Notification,
                    Template = localTemplate,
                    Recipient = localRecipient,
                    Status = RefListNotificationStatus.Outgoing,
                    TryCount = 0
                };

                fillData.Invoke(message);

                await NotificationMessageRepository.InsertAsync(message);
                await uow.CompleteAsync();
            }

            return messageId;
        }

        /// <summary>
        /// Create new record in the <see cref="NotificationMessage"/>. Is used for audit purposes and retries
        /// </summary>
        /// <param name="templateId">Id of the template</param>
        /// <param name="recipientId">Id of the person</param>
        /// <param name="fillData">fill data action (specific to the send type)</param>
        /// <returns></returns>
        protected Guid CreateNotificationMessage(Guid templateId, Guid? recipientId,
            Action<NotificationMessage> fillData)
        {
            var messageId = Guid.NewGuid();
            using (var uow = UowManager.Begin(TransactionScopeOption.RequiresNew))
            {
                // get template again to isolate sessions
                var localTemplate = TemplateRepository.Get(templateId);
                var localRecipient = recipientId.HasValue
                    ? PersonRepository.Get(recipientId.Value)
                    : null;
                var message = new NotificationMessage()
                {
                    Id = messageId,
                    Notification = localTemplate.Notification,
                    Template = localTemplate,
                    Recipient = localRecipient,
                    Status = RefListNotificationStatus.Outgoing,
                    TryCount = 0
                };

                fillData.Invoke(message);

                NotificationMessageRepository.Insert(message);
                uow.Complete();
            }

            return messageId;
        }

        /// <summary>
        /// Update Notification Message
        /// </summary>
        protected async Task UpdateNotificationMessageAsync(Guid id, Action<NotificationMessage> fillData)
        {
            using (var uow = UowManager.Begin(TransactionScopeOption.RequiresNew))
            {
                var message = await NotificationMessageRepository.GetAsync(id);

                fillData.Invoke(message);

                await NotificationMessageRepository.UpdateAsync(message);
                await uow.CompleteAsync();
            }
        }

        /// <summary>
        /// Update Notification Message
        /// </summary>
        protected void UpdateNotificationMessage(Guid id, Action<NotificationMessage> fillData)
        {
            using (var uow = UowManager.Begin(TransactionScopeOption.RequiresNew))
            {
                var message = NotificationMessageRepository.Get(id);

                fillData.Invoke(message);

                NotificationMessageRepository.Update(message);
                uow.Complete();
            }
        }

        /// <summary>
        /// Sends notification message. Must be implemented in the derived class
        /// </summary>
        /// <param name="message"></param>
        /// <returns></returns>
        protected abstract Task DoSendNotificationMessageAsync(NotificationMessage message);

        /// <summary>
        /// Sends notification message. Must be implemented in the derived class
        /// </summary>
        /// <param name="message"></param>
        /// <returns></returns>
        protected abstract void DoSendNotificationMessage(NotificationMessage message);

        /// <summary>
        /// Send notification in the background task. Used by Hangfire
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [AutomaticRetry(Attempts = 5, DelaysInSeconds = new int[] { 10, 20, 20, 20, 20 })]
        public async Task SendNotification(Guid id)
        {
            RefListNotificationStatus? status = null;
            using (var uow = UowManager.Begin(TransactionScopeOption.RequiresNew))
            {
                // safe get message and skip if deleted manually
                var message = await NotificationMessageRepository.GetAsync(id);

                if (message == null)
                    throw new ShaNotificationNotFoundException(id);

                if (message.Status == RefListNotificationStatus.Preparing)
                    throw new ShaNotificationIsStillPreparingException(id);

                message.TryCount++;
                message.SendDate = DateTime.Now;
                try
                {
                    await DoSendNotificationMessageAsync(message);

                    message.ErrorMessage = null;
                    message.Status = RefListNotificationStatus.Sent;
                    await NotificationMessageRepository.UpdateAsync(message);
                }
                catch (Exception e)
                {
                    // update message
                    message.ErrorMessage = e.FullMessage();
                    message.Status = message.TryCount < 5
                        ? RefListNotificationStatus.WaitToRetry
                        : RefListNotificationStatus.Failed;
                    await NotificationMessageRepository.UpdateAsync(message);
                }

                status = message.Status;
                await uow.CompleteAsync();
            }

            // throw exception if we need to retry
            if (status == RefListNotificationStatus.WaitToRetry)
                throw new ShaNotificationFailedWaitRetryException(id);
        }

        private async Task SendNotificationInternalAsync(NotificationMessage message)
        {
            if (message == null)
                return;

            if (message.Status == RefListNotificationStatus.Preparing)
                return;

            message.TryCount++;
            message.SendDate = DateTime.Now;
            try
            {
                await DoSendNotificationMessageAsync(message);

                message.ErrorMessage = null;
                message.Status = RefListNotificationStatus.Sent;
                await NotificationMessageRepository.UpdateAsync(message);
            }
            catch (Exception e)
            {
                // update message
                message.ErrorMessage = e.FullMessage();
                message.Status = message.TryCount < 5
                    ? RefListNotificationStatus.WaitToRetry
                    : RefListNotificationStatus.Failed;
                await NotificationMessageRepository.UpdateAsync(message);
            }
        }

        private void SendNotificationInternal(NotificationMessage message)
        {
            if (message == null)
                return;

            if (message.Status == RefListNotificationStatus.Preparing)
                return;

            message.TryCount++;
            message.SendDate = DateTime.Now;
            try
            {
                DoSendNotificationMessage(message);

                message.ErrorMessage = null;
                message.Status = RefListNotificationStatus.Sent;
                NotificationMessageRepository.Update(message);
            }
            catch (Exception e)
            {
                // update message
                message.ErrorMessage = e.FullMessage();
                message.Status = message.TryCount < 5
                    ? RefListNotificationStatus.WaitToRetry
                    : RefListNotificationStatus.Failed;
                NotificationMessageRepository.Update(message);
            }
        }



        /// <summary>
        /// Return notification data (unwrap <see cref="ShaNotificationData"/> if needed)
        /// </summary>
        /// <returns></returns>
        protected NotificationData GetNotificationData(TenantNotificationInfo tenantNotificationInfo)
        {
            var tenantNotification = tenantNotificationInfo.ToTenantNotification();
            return tenantNotification.Data is ShaNotificationData shaNotificationData
                ? shaNotificationData.GetData()
                : tenantNotification.Data;
        }

        /// <summary>
        /// Send template-based notifications
        /// </summary>
        public void SendNotifications(List<NotificationMessageDto> notificationMessages,
            RefListNotificationType notificationType)
        {
            var messageDtos = notificationMessages.Where(n =>
                n.SendType?.ItemValue == (int) notificationType &&
                n.Status?.ItemValue == (int) RefListNotificationStatus.Preparing &&
                !string.IsNullOrWhiteSpace(n.RecipientText)).ToList();

            if (!messageDtos.Any())
                return;

            using (var uow = UowManager.Begin())
            {
                foreach (var messageDto in messageDtos)
                {
                    var message = NotificationMessageRepository.Get(messageDto.Id);
                    if (message.TenantNotification == null)
                        throw new Exception($"{message.TenantNotification} must not be null");

                    var tenantNotification = message.TenantNotification.ToTenantNotification();
                    if (tenantNotification.Data is ShaNotificationData shaNotificationData)
                    {
                        var template = shaNotificationData.TemplateId.HasValue
                            ? TemplateRepository.Get(shaNotificationData.TemplateId.Value)
                            : GetTemplate(message.TenantNotification.NotificationName, notificationType);

                        if (template == null || !template.IsEnabled)
                            continue;

                        if (template.SendType != notificationType)
                            throw new Exception(
                                $"Wrong type of template. Expected `{notificationType}`, actual `{template.SendType}`");

                        var notificationData = shaNotificationData.GetData();

                        message.Notification = template.Notification;
                        message.Template = template;
                        message.Subject = GenerateContent(template.Subject, notificationData, true, message.SendType == RefListNotificationType.SMS);
                        message.Body = GenerateContent(template.Body, notificationData,
                            template.BodyFormat == RefListNotificationTemplateType.PlainText, 
                            message.SendType == RefListNotificationType.SMS);
                        message.Status = RefListNotificationStatus.Outgoing;
                        if (!string.IsNullOrEmpty(shaNotificationData.SourceEntityId))
                            message.SourceEntity = new GenericEntityReference(shaNotificationData.SourceEntityId, shaNotificationData.SourceEntityClassName, shaNotificationData.SourceEntityDisplayName);
                        NotificationMessageRepository.Update(message);

                        // schedule sending
                        SendNotificationInternal(message);
                    }
                }

                uow.Complete();
            }
        }

        /// <summary>
        /// Send template-based notifications
        /// </summary>
        public async Task SendNotificationsAsync(List<NotificationMessageDto> notificationMessages,
            RefListNotificationType notificationType)
        {
            var messageDtos = notificationMessages.Where(n =>
                n.SendType?.ItemValue == (int) notificationType &&
                n.Status?.ItemValue == (int) RefListNotificationStatus.Preparing &&
                !string.IsNullOrWhiteSpace(n.RecipientText)).ToList();

            if (!messageDtos.Any())
                return;

            var messagesToSend = new List<Guid>();
            using (var uow = UowManager.Begin())
            {
                foreach (var messageDto in messageDtos)
                {
                    var message = await NotificationMessageRepository.GetAsync(messageDto.Id);
                    if (message.TenantNotification == null)
                        throw new Exception($"{message.TenantNotification} must not be null");

                    var tenantNotification = message.TenantNotification.ToTenantNotification();
                    if (tenantNotification.Data is ShaNotificationData shaNotificationData)
                    {
                        var template = shaNotificationData.TemplateId.HasValue
                            ? await TemplateRepository.GetAsync(shaNotificationData.TemplateId.Value)
                            : await GetTemplateAsync(message.TenantNotification.NotificationName, notificationType);

                        if (template == null || !template.IsEnabled)
                            continue;

                        if (template.SendType != notificationType)
                            throw new Exception(
                                $"Wrong type of template. Expected `{notificationType}`, actual `{template.SendType}`");

                        var notificationData = shaNotificationData.GetData();

                        message.Notification = template.Notification;
                        message.Template = template;
                        message.Cc = shaNotificationData.Cc;
                        message.Subject = GenerateContent(template.Subject, notificationData, true);
                        message.Body = GenerateContent(template.Body, notificationData,
                            template.BodyFormat == RefListNotificationTemplateType.PlainText,
                            message.SendType == RefListNotificationType.SMS);
                        message.Status = RefListNotificationStatus.Outgoing;
                        if (!string.IsNullOrEmpty(shaNotificationData.SourceEntityId))
                            message.SourceEntity = new GenericEntityReference(shaNotificationData.SourceEntityId, shaNotificationData.SourceEntityClassName, shaNotificationData.SourceEntityDisplayName); ;
                        await NotificationMessageRepository.UpdateAsync(message);

                        messagesToSend.Add(message.Id);
                    }
                }

                // send all prepared messages in background
                UowManager.Current.DoAfterTransaction(() =>
                {
                    foreach (var messageId in messagesToSend)
                    {
                        BackgroundJob.Enqueue(() => SendNotification(messageId));
                    }
                });

                await uow.CompleteAsync();
            }
        }

        /// <summary>
        /// Re-sends specified notification message
        /// </summary>
        /// <param name="notificationMessage"></param>
        /// <returns></returns>
        public async Task ResendMessageAsync(NotificationMessageDto notificationMessage)
        {
            if (notificationMessage.SendType == null ||
                notificationMessage.SendType.ItemValue != (int) NotificationType)
                return;

            var message = await NotificationMessageRepository.GetAsync(notificationMessage.Id);
            await SendNotificationInternalAsync(message);
        }
    }
}