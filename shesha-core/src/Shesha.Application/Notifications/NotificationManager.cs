using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.UI;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Notifications.Configuration;
using Shesha.Notifications.Dto;
using Shesha.Notifications.MessageParticipants;
using Shesha.Validations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public class NotificationManager : ConfigurationItemManager<NotificationTypeConfig, NotificationTypeConfigRevision>, INotificationManager, ITransientDependency
    {
        private readonly IRepository<NotificationChannelConfig, Guid> _notificationChannelRepository;
        private readonly IRepository<UserNotificationPreference, Guid> _userNotificationPreference;
        private readonly IRepository<NotificationTemplate, Guid> _templateRepository;
        private readonly INotificationSettings _notificationSettings;

        public NotificationManager(
            IRepository<NotificationChannelConfig, Guid> notificationChannelRepository,
            IRepository<UserNotificationPreference, Guid> userNotificationPreference,
            IRepository<NotificationTemplate, Guid> templateRepository,
            INotificationSettings notificationSettings) : base()
        {
            _notificationChannelRepository = notificationChannelRepository;
            _userNotificationPreference = userNotificationPreference;
            _templateRepository = templateRepository;
            _notificationSettings = notificationSettings;            
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="type"></param>
        /// <param name="receiver"></param>
        /// <param name="priority"></param>
        /// <returns></returns>
        public async Task<List<NotificationChannelConfig>> GetChannelsAsync(NotificationTypeConfig type, IMessageReceiver receiver, RefListNotificationPriority priority)
        {
            // Step 1: Check User Notification Preference
            var recipientPerson = receiver?.GetPerson();
            if (recipientPerson != null)
            {
                var defaultChannels = await _userNotificationPreference.GetAll().Where(x => x.User.Id == recipientPerson.Id && x.NotificationType.Id == type.Id && x.DefaultChannel != null)
                    .Select(e => e.DefaultChannel)
                    .ToListAsync();
                
                // Return DefaultChannel from user preferences if available
                if (defaultChannels.Any())
                    return defaultChannels;
            }

            var revision = type.Revision;
            // Step 2: Check for Parsed Override Channels
            if (revision.ParsedOverrideChannels.Any())
            {
                var overrideChannels = new List<NotificationChannelConfig>();
                foreach (var channel in revision.ParsedOverrideChannels) 
                {
                    // TODO: check versioned query
                    var dbChannel = await _notificationChannelRepository.GetAll().Where(new ByNameAndModuleSpecification<NotificationChannelConfig>(channel.Name, channel.Module).ToExpression())
                        .FirstOrDefaultAsync();
                    if (dbChannel != null)
                        overrideChannels.Add(dbChannel);
                }

                return overrideChannels;
            }

            // Step 3: Fallback to default channels based on priority
            var notificationSettings = await _notificationSettings.NotificationSettings.GetValueAsync();

            var selectedNotifications = priority switch
            {
                RefListNotificationPriority.Low => notificationSettings.Low,
                RefListNotificationPriority.Medium => notificationSettings.Medium,
                RefListNotificationPriority.High => notificationSettings.High,
                _ => throw new UserFriendlyException("Channel not specified!")
            };
            if (selectedNotifications == null)
                return new();

            // TODO: check versioned query
            var liveChannels = _notificationChannelRepository.GetAll();

            var result = selectedNotifications
                .SelectMany(identifier => liveChannels
                    .Where(new ByNameAndModuleSpecification<NotificationChannelConfig>(identifier.Name, identifier.Module).ToExpression()))
                .ToList();

            return result;
        }

        public override Task<IConfigurationItemDto> MapToDtoAsync(NotificationTypeConfig item)
        {
            
            var dto = ObjectMapper.Map<NotificationTypeConfigDto>(item);
            return Task.FromResult<IConfigurationItemDto>(dto);
        }

        public async Task<NotificationTypeConfig> CreateNewVersionWithoutDetailsAsync(NotificationTypeConfig src)
        {
            var newVersion = new NotificationTypeConfig();
            newVersion.Origin = src.Origin;
            newVersion.Name = src.Name;
            newVersion.Module = src.Module;

            var revision = newVersion.EnsureLatestRevision();
            revision.Description = src.Revision.Description;
            revision.Label = src.Revision.Label;

            // notification specific props
            revision.CopyNotificationSpecificPropsFrom(src.Revision);

            newVersion.Normalize();

            await Repository.InsertAsync(newVersion);

            return newVersion;
        }

        public override Task<NotificationTypeConfig> ExposeAsync(NotificationTypeConfig item, Module module)
        {
            throw new NotImplementedException();
        }

        public override async Task<NotificationTypeConfig> CreateItemAsync(CreateItemInput input)
        {
            var validationResults = new ValidationResults();
            var alreadyExist = await Repository.GetAll().Where(f => f.Module == input.Module && f.Name == input.Name).AnyAsync();
            if (alreadyExist)
                validationResults.Add($"Form with name `{input.Name}` already exists in module `{input.Module.Name}`");
            validationResults.ThrowValidationExceptionIfAny(L);

            var notification = new NotificationTypeConfig
            {
                Name = input.Name,
                Module = input.Module,
                Folder = input.Folder,
            };
            notification.Origin = notification;

            await Repository.InsertAsync(notification);

            var revision = notification.MakeNewRevision();
            revision.Description = input.Description;
            revision.Label = input.Label;

            await RevisionRepository.InsertAsync(revision);

            return notification;
        }

        protected override Task CopyRevisionPropertiesAsync(NotificationTypeConfigRevision source, NotificationTypeConfigRevision destination)
        {
            throw new NotImplementedException();
        }
    }
}