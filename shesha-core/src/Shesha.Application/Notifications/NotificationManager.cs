using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.UI;
using NHibernate.Linq;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Notifications.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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

            if (type.ParsedOverrideChannels.Any())
            {
                return await _notificationChannelRepository
                    .GetAll()
                    .Where(channel => type.ParsedOverrideChannels.Contains(new NotificationChannelIdentifier(channel.Module.Name, channel.Name)))
                    .ToListAsync();
            }

            // Fallback - Return default channels based on priority (if applicable)
            var notificationSettings = await _notificationSettings.NotificationSettings.GetValueAsync();
            switch (priority)
            {
                case RefListNotificationPriority.Low:
                    return notificationSettings.Low.Select(x => _notificationChannelRepository.FirstOrDefault(c => new ByNameAndModuleSpecification<NotificationChannelConfig>(x.Name, x.Module).IsSatisfiedBy(c))).ToList();
                case RefListNotificationPriority.Medium:
                    return notificationSettings.Medium.Select(x => _notificationChannelRepository.FirstOrDefault(c => new ByNameAndModuleSpecification<NotificationChannelConfig>(x.Name, x.Module).IsSatisfiedBy(c))).ToList();
                case RefListNotificationPriority.High:
                    return notificationSettings.High.Select(x => _notificationChannelRepository.FirstOrDefault(c => new ByNameAndModuleSpecification<NotificationChannelConfig>(x.Name, x.Module).IsSatisfiedBy(c))).ToList();
                default:
                    throw new UserFriendlyException("Channel not specified!");
            };
        }
    }
}
