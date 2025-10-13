using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.UI;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Notifications.Configuration;
using Shesha.Notifications.MessageParticipants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public class NotificationManager : ConfigurationItemManager<NotificationTypeConfig>, INotificationManager, ITransientDependency
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

            // Step 2: Check for Parsed Override Channels
            if (type.ParsedOverrideChannels.Any())
            {
                var overrideChannels = new List<NotificationChannelConfig>();
                foreach (var channel in type.ParsedOverrideChannels) 
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

        protected override async Task CopyItemPropertiesAsync(NotificationTypeConfig source, NotificationTypeConfig destination)
        {
            destination.Disable = source.Disable;
            destination.CanOptOut = source.CanOptOut;
            destination.Category = source.Category;
            destination.OverrideChannels = source.OverrideChannels;
            destination.IsTimeSensitive = source.IsTimeSensitive;
            destination.AllowAttachments = source.AllowAttachments;

            await CopyTemplatesAsync(source, destination);
        }

        private async Task CopyTemplatesAsync(NotificationTypeConfig source, NotificationTypeConfig destination)
        {
            var srcItems = await _templateRepository.GetAll().Where(i => i.PartOf == source).ToListAsync();

            foreach (var srcItem in srcItems)
            {
                var dstItem = srcItem.Clone();
                dstItem.PartOf = destination;

                await _templateRepository.InsertAsync(dstItem);
            }
        }
    }
}