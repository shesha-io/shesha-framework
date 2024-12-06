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

namespace Shesha.Notifications
{
    public class NotificationAppService: SheshaAppServiceBase
    {
        private readonly IEnumerable<INotificationChannelSender> _channelSenders;
        private readonly IRepository<NotificationTypeConfig, Guid> _notificationTypeRepository;
        private readonly IRepository<NotificationChannelConfig, Guid> _notificationChannelRepository;
        private readonly IRepository<NotificationTemplate, Guid> _messageTemplateRepository;
        private readonly IRepository<NotificationMessage, Guid> _notificationMessageRepository;
        private readonly IRepository<UserNotificationPreference, Guid> _userNotificationPreference;
        private readonly IRepository<UserTopicSubscription, Guid> _userTopicSubscriptionRepository;
        private readonly IRepository<NotificationTopic, Guid> _notificationTopicRepository;
        private readonly IRepository<StoredFile, Guid> _storedFileRepository;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly INotificationSettings _notificationSettings;
        private readonly IStoredFileService _storedFileService;
        private readonly IBackgroundJobManager _backgroundJobManager;
        private readonly INotificationSender _notificationSender;

        public NotificationAppService(IEnumerable<INotificationChannelSender> channelSenders,
                                   IRepository<NotificationTypeConfig, Guid> notificationTypeRepository,
                                   IRepository<NotificationChannelConfig, Guid> notificationChannelRepository,
                                   IRepository<UserNotificationPreference, Guid> userNotificationPreference,
                                   IRepository<NotificationTemplate, Guid> messageTemplateRepository,
                                   IRepository<Person, Guid> personRepository,
                                   IRepository<StoredFile, Guid> storedFileRepository,
                                   IRepository<UserTopicSubscription, Guid> userTopicSubscriptionRepository,
                                   IStoredFileService storedFileService,
                                   IRepository<NotificationMessage, Guid> notificationMessageRepository,
                                   IRepository<NotificationTopic, Guid> notificationTopicRepository,
                                   INotificationSettings notificationSettings,
                                   IBackgroundJobManager backgroundJobManager,
                                   INotificationSender notificationSender)
                 
        {
            _channelSenders = channelSenders;
            _notificationTypeRepository = notificationTypeRepository;
            _notificationChannelRepository = notificationChannelRepository;
            _userNotificationPreference = userNotificationPreference;
            _messageTemplateRepository = messageTemplateRepository;
            _notificationSettings = notificationSettings;
            _personRepository = personRepository;
            _storedFileService = storedFileService;
            _notificationMessageRepository = notificationMessageRepository;
            _userTopicSubscriptionRepository = userTopicSubscriptionRepository;
            _backgroundJobManager = backgroundJobManager;
            _storedFileRepository = storedFileRepository;
            _notificationTopicRepository = notificationTopicRepository;
            _notificationSender = notificationSender;
        }


        public class TestData : NotificationData
        {
            public string subject { get; set; }
            public string name { get; set; }
            public string body { get; set; }
        }

        public async Task OmoTest()
        {
            var type = await _notificationTypeRepository.FirstOrDefaultAsync(x => x.Name == "Warning");
            var fromPerson = await _personRepository.FirstOrDefaultAsync(x => x.FirstName == "System");
            var toPerson = await _personRepository.FirstOrDefaultAsync(x => x.EmailAddress1 == "omolemo.lethuloe@boxfusion.io");
            var channel = await _notificationChannelRepository.FirstOrDefaultAsync(x => x.Name == "SMS");
            var getAttachments = await _storedFileService.GetAttachmentsAsync(fromPerson.Id, "Shesha.Domain.Person");

            var attachments = getAttachments.Select(x => new NotificationAttachmentDto()
            {
                FileName = x.FileName,
                StoredFileId = x.Id,
            }).ToList();


            var testing = new TestData()
            {
                name = "Omolemo",
                subject = "Test Subject",
                body = "Test Body"
            };
            var triggeringEntity = new GenericEntityReference(fromPerson);
            await SendNotification(type, fromPerson, toPerson, data: testing, RefListNotificationPriority.High, attachments, triggeringEntity, channel);
        }

        public async Task OmoBroadcastTest()
        {
            var type = await _notificationTypeRepository.FirstOrDefaultAsync(x => x.Name == "Warning");
            var topic = await _notificationTopicRepository.FirstOrDefaultAsync(x => x.Name == "string");
            var getAttachments = await _storedFileService.GetAttachmentsAsync(topic.Id, "Shesha.Core.NotificationTopic");
            var channel = await _notificationChannelRepository.FirstOrDefaultAsync(x => x.Name == "Email");


            var attachments = getAttachments.Select(x => new NotificationAttachmentDto()
            {
                FileName = x.FileName,
                StoredFileId = x.Id,
            }).ToList();


            var testing = new TestData()
            {
                name = "Omolemo",
                subject = "Test Subject",
                body = "Test Body"
            };
            var triggeringEntity = new GenericEntityReference(topic);
            await SendBroadcastNotification(type, topic, data: testing, RefListNotificationPriority.High, attachments, triggeringEntity, channel);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="TData"></typeparam>
        /// <param name="type"></param>
        /// <param name="topic"></param>
        /// <param name="data"></param>
        /// <param name="priority"></param>
        /// <param name="attachments"></param>
        /// <param name="triggeringEntity"></param>
        /// <param name="channel"></param>
        /// <returns></returns>
        public async Task SendBroadcastNotification<TData>(NotificationTypeConfig type, NotificationTopic topic, TData data, RefListNotificationPriority priority, List<NotificationAttachmentDto> attachments = null, GenericEntityReference triggeringEntity = null, NotificationChannelConfig channel = null) where TData: NotificationData
        {
            var notification = await SaveOrUpdateEntityAsync<Notification>(null, item =>
            {
                item.NotificationType = type;
                item.NotificationTopic = topic;
                item.NotificationData = data.ToString();
                item.Priority = (RefListNotificationPriority)priority;
                item.TriggeringEntity = triggeringEntity;
            });

            await CurrentUnitOfWork.SaveChangesAsync();

            var users = await _userTopicSubscriptionRepository.GetAllListAsync(x => x.Topic.Id == topic.Id);

            if (channel != null)
            {
                var template = await _messageTemplateRepository.FirstOrDefaultAsync(x => x.PartOf.Id == type.Id && channel.SupportedFormat == x.MessageFormat);
                if (template == null)
                    throw new UserFriendlyException($"There is no {type.Name} template found for the {channel.Name} channel");

                var subject = TemplateHelper.ReplacePlaceholders(template.TitleTemplate, data);
                var message = TemplateHelper.ReplacePlaceholders(template.BodyTemplate, data);

                await _backgroundJobManager.EnqueueAsync<BroadcastNotificationJobQueuer, BroadcastNotificationJobArgs>(new BroadcastNotificationJobArgs()
                {
                    TemplateId = template.Id,
                    NotificationId = notification.Id,
                    ChannelId = channel.Id,
                    Subject = subject,
                    Message = message,
                    Attachments = attachments,
                });
            }
            else
            {
                var subscriptions = await _userTopicSubscriptionRepository.GetAllListAsync(x => x.Topic.Id == topic.Id);

                if (subscriptions != null && subscriptions.Any())
                {
                    foreach (var user in users)
                    {
                        var userChannels = await GetChannelsAsync(type, user.User, priority);

                        foreach (var channelConfig in userChannels)
                        {
                            var template = await _messageTemplateRepository.FirstOrDefaultAsync(x => x.PartOf.Id == type.Id && channelConfig.SupportedFormat == x.MessageFormat);
                            if (template == null)
                                throw new UserFriendlyException($"There is no {type.Name} template found for the {channelConfig.Name} channel");

                            var subject = TemplateHelper.ReplacePlaceholders(template.TitleTemplate, data);
                            var message = TemplateHelper.ReplacePlaceholders(template.BodyTemplate, data);

                            await _backgroundJobManager.EnqueueAsync<BroadcastNotificationJobQueuer, BroadcastNotificationJobArgs>(new BroadcastNotificationJobArgs()
                            {
                                TemplateId = template.Id,
                                NotificationId = notification.Id,
                                ChannelId = channelConfig.Id,
                                Subject = subject,
                                Message = message,
                                Attachments = attachments,
                            });
                        }
                    }

                }
            }
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
                var channels = await GetChannelsAsync(type, toPerson, (RefListNotificationPriority)priority);

                foreach (var channelConfig in channels)
                {
                    await SendNotificationToChannel(notification, data, fromPerson, toPerson, type, priority, channelConfig, attachments);
                }
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="type"></param>
        /// <param name="recipient"></param>
        /// <param name="priority"></param>
        /// <returns></returns>
        private async Task<List<NotificationChannelConfig>> GetChannelsAsync(NotificationTypeConfig type, Person recipient, RefListNotificationPriority priority)
        {
            List<NotificationChannelConfig> results = new List<NotificationChannelConfig>();

            // Check User Notification Preferences
            var userPreferences = await _userNotificationPreference.GetAllListAsync(
                x => x.User.Id == recipient.Id && x.NotificationType.Id == type.Id
            );

            if (userPreferences != null && userPreferences.Any())
            {
                // Flatten and return DefaultChannel from user preferences if available
                return userPreferences.Select(x => x.DefaultChannel).ToList();
            }

            // Check Override Channels in NotificationTypeConfig
            if (!string.IsNullOrEmpty(type.OverrideChannels))
            {
                try
                {
                    var overrideChannelIds = JsonSerializer.Deserialize<Guid[]>(type.OverrideChannels);

                    // Fetch channels by IDs if the repository supports it
                    var channels = await _notificationChannelRepository
                        .GetAll()
                        .Where(channel => overrideChannelIds.Contains(channel.Id))
                        .ToListAsync();

                    if (channels.Any())
                    {
                        return channels;
                    }
                }
                catch (JsonException ex)
                {
                    throw new UserFriendlyException("Error deserializing override channels", ex);
                }
                return results;
            }

            // Fallback - Return default channels based on priority (if applicable)
            var notificationSettings = await _notificationSettings.NotificationSettings.GetValueAsync();
            switch (priority)
            {
                case RefListNotificationPriority.Low:
                    return notificationSettings.Low.Select(x => _notificationChannelRepository.Get(x)).ToList();
                case RefListNotificationPriority.Medium:
                    return notificationSettings.Medium.Select(x => _notificationChannelRepository.Get(x)).ToList();
                case RefListNotificationPriority.High:
                    return notificationSettings.High.Select(x => _notificationChannelRepository.Get(x)).ToList();
                default:
                    throw new UserFriendlyException("Channel not specified!");
            };
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
