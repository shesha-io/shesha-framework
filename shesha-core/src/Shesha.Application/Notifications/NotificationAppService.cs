using Abp.Application.Services.Dto;
using Abp.BackgroundJobs;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Notifications;
using Abp.UI;
using Hangfire;
using Hangfire.Storage;
using Newtonsoft.Json.Linq;
using NHibernate.Linq;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using Shesha.EntityReferences;
using Shesha.Notifications.Dto;
using Shesha.Notifications.Configuration;
using Shesha.Notifications.Helpers;
using Shesha.Notifications.Jobs;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Office2010.Excel;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain.ConfigurationItems;

namespace Shesha.Notifications
{
    public class NotificationAppService: SheshaAppServiceBase
    {
        private readonly IEnumerable<INotificationChannelSender> _channelSenders;
        private readonly IRepository<NotificationChannelConfig, Guid> _notificationChannelRepository;
        private readonly IRepository<NotificationTemplate, Guid> _messageTemplateRepository;
        private readonly IRepository<StoredFile, Guid> _storedFileRepository;
        private readonly INotificationSettings _notificationSettings;
        private readonly IStoredFileService _storedFileService;
        private readonly IBackgroundJobManager _backgroundJobManager;
        private readonly INotificationSender _notificationSender;
        private readonly INotificationManager _notificationManager;


        public NotificationAppService(IEnumerable<INotificationChannelSender> channelSenders,
                                   IRepository<NotificationChannelConfig, Guid> notificationChannelRepository,
                                   IRepository<NotificationTemplate, Guid> messageTemplateRepository,
                                   IRepository<StoredFile, Guid> storedFileRepository,
                                   IStoredFileService storedFileService,
                                   INotificationSettings notificationSettings,
                                   IBackgroundJobManager backgroundJobManager,
                                   INotificationSender notificationSender,
                                   INotificationManager notificationManager)
                 
        {
            _channelSenders = channelSenders;
            _notificationChannelRepository = notificationChannelRepository;
            _messageTemplateRepository = messageTemplateRepository;
            _notificationSettings = notificationSettings;
            _storedFileService = storedFileService;
            _backgroundJobManager = backgroundJobManager;
            _storedFileRepository = storedFileRepository;
            _notificationSender = notificationSender;
            _notificationManager = notificationManager;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="TData"></typeparam>
        /// <param name="type"></param>
        /// <param name="fromPerson"></param>
        /// <param name="toPerson"></param>
        /// <param name="data"></param>
        /// <param name="priority"></param>
        /// <param name="attachments"></param>
        /// <param name="triggeringEntity"></param>
        /// <param name="channel"></param>
        /// <returns></returns>
        public async Task SendNotification<TData>(NotificationTypeConfig type, Person fromPerson, Person toPerson, TData data, RefListNotificationPriority priority, List<NotificationAttachmentDto> attachments = null, GenericEntityReference triggeringEntity = null, NotificationChannelConfig channel = null) where TData: NotificationData
        {
            var notification = await SaveOrUpdateEntityAsync<Notification>(null, item =>
            {
                item.NotificationType = type;
                item.FromPerson = fromPerson;
                item.ToPerson = toPerson;
                item.NotificationData = data.ToString();
                item.TriggeringEntity = triggeringEntity;
                item.Priority = (RefListNotificationPriority)priority;
            });

            await CurrentUnitOfWork.SaveChangesAsync();

            if (channel != null)
            {
                // Send notification to a specific channel
                await SendNotificationToChannel(notification, data, fromPerson, toPerson, type, priority,channel, attachments);
            }
            else
            {
                // Send notification to all determined channels
                var channels = await _notificationManager.GetChannelsAsync(type, toPerson, (RefListNotificationPriority)priority);

                foreach (var channelConfig in channels)
                {
                    await SendNotificationToChannel(notification, data, fromPerson, toPerson, type, priority, channelConfig, attachments);
                }
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="TData"></typeparam>
        /// <param name="notification"></param>
        /// <param name="data"></param>
        /// <param name="fromPerson"></param>
        /// <param name="toPerson"></param>
        /// <param name="type"></param>
        /// <param name="priority"></param>
        /// <param name="channelConfig"></param>
        /// <param name="attachments"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        private async Task SendNotificationToChannel<TData>(Notification notification, TData data, Person fromPerson, Person toPerson, NotificationTypeConfig type, RefListNotificationPriority priority, NotificationChannelConfig channelConfig, List<NotificationAttachmentDto> attachments = null) where TData: NotificationData
        {
            var template = await _messageTemplateRepository.FirstOrDefaultAsync(x => x.PartOf.Id == type.Id && channelConfig.SupportedFormat == x.MessageFormat);

            if (template == null)
                throw new UserFriendlyException($"There is no {type.Name} template found for the {channelConfig.Name} channel");

            var senderChannelInterface = _channelSenders.FirstOrDefault(x => x.GetType().Name == channelConfig.SenderTypeName);

            if (senderChannelInterface == null)
                throw new UserFriendlyException($"Sender not found for channel {channelConfig.Name}");

            // Create a new notification message
            var message = await SaveOrUpdateEntityAsync<NotificationMessage>(null, item =>
            {
                item.PartOf = notification;
                item.Channel = channelConfig;
                item.Subject = TemplateHelper.ReplacePlaceholders(template.TitleTemplate,data);
                item.Message = TemplateHelper.ReplacePlaceholders(template.BodyTemplate, data);
                item.RetryCount = 0;
                item.ReadStatus = RefListNotificationReadStatus.Unread;
                item.Direction = RefListNotificationDirection.Outgoing;
                item.Status = RefListNotificationStatus.Preparing;
                item.DateSent = DateTime.Now;
            });

            await CurrentUnitOfWork.SaveChangesAsync();

            // save attachments if specified
            if (attachments != null)
            {
                foreach (var attachmentDto in attachments)
                {
                    var file = await _storedFileRepository.GetAsync(attachmentDto.StoredFileId);

                    await SaveOrUpdateEntityAsync<NotificationMessageAttachment>(null, item =>
                    {
                        item.Message = message;
                        item.File = file;
                        item.FileName = attachmentDto.FileName;
                    });
                }
            }

            await CurrentUnitOfWork.SaveChangesAsync();

            if (type.IsTimeSensitive)
            {
                await _notificationSender.SendAsync(fromPerson, toPerson, message, senderChannelInterface);
            }
            else
            {
                await _backgroundJobManager.EnqueueAsync<DirectNotificationJobQueuer, DirectNotificationJobArgs>(new DirectNotificationJobArgs()
                {
                    SenderTypeName = channelConfig.SenderTypeName,
                    FromPerson = fromPerson.Id,
                    ToPerson = toPerson.Id,
                    Message = message.Id,
                    Attempt = 0
                });
            }

            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
