using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.UI;
using NHibernate.Linq;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.Notifications.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public class NotificationManager: INotificationManager, ITransientDependency
    {
        private readonly IRepository<NotificationChannelConfig, Guid> _notificationChannelRepository;
        private readonly IRepository<UserNotificationPreference, Guid> _userNotificationPreference;
        private readonly INotificationSettings _notificationSettings;

        public NotificationManager(IRepository<NotificationChannelConfig, Guid> notificationChannelRepository,
                                   IRepository<UserNotificationPreference, Guid> userNotificationPreference,
                                   INotificationSettings notificationSettings)
        {
            _notificationChannelRepository = notificationChannelRepository;
            _userNotificationPreference = userNotificationPreference;
            _notificationSettings = notificationSettings;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="type"></param>
        /// <param name="recipient"></param>
        /// <param name="priority"></param>
        /// <returns></returns>
        public async Task<List<NotificationChannelConfig>> GetChannelsAsync(NotificationTypeConfig type, Person recipient, RefListNotificationPriority priority)
        {
            // Step 1: Check User Notification Preference
            var userPreferences = new List<UserNotificationPreference>();
            if (recipient != null)
            {
                userPreferences = await _userNotificationPreference.GetAllListAsync(
                    x => x.User.Id == recipient.Id && x.NotificationType.Id == type.Id
                );
            }

            if (userPreferences != null && userPreferences.Any())
            {
                // Return DefaultChannel from user preferences if available
                return userPreferences.Select(x => x.DefaultChannel).ToList();
            }

            // Step 2: Check for Parsed Override Channels
            if (type.ParsedOverrideChannels.Any())
            {
                var overrideChannels = await _notificationChannelRepository
                    .GetAll()
                    .Where(channel => type.ParsedOverrideChannels.Contains(
                        new NotificationChannelIdentifier(channel.Module.Name, channel.Name)))
                    .ToListAsync();

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

            // Deserialize notification identifiers
            var notificationIdentifiers = selectedNotifications
                .Select(json => JsonSerializer.Deserialize<NotificationChannelIdentifier>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }))
                .ToList();

            var liveChannels = _notificationChannelRepository
                .GetAll()
                .Where(channel => channel.IsLast && channel.VersionStatus == ConfigurationItemVersionStatus.Live);

            var result = notificationIdentifiers
                .SelectMany(identifier => liveChannels
                    .Where(new ByNameAndModuleSpecification<NotificationChannelConfig>(identifier.Name, identifier.Module).ToExpression()))
                .ToList();

            return result;
        }

    }
}
