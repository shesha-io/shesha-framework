using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Runtime.Validation;
using Abp.UI;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Notifications.Configuration;
using Shesha.Notifications.Dto;
using Shesha.Notifications.MessageParticipants;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
            IRepository<NotificationTypeConfig, Guid> repository,
            IRepository<Module, Guid> moduleRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IRepository<NotificationChannelConfig, Guid> notificationChannelRepository,
            IRepository<UserNotificationPreference, Guid> userNotificationPreference,
            IRepository<NotificationTemplate, Guid> templateRepository,
            INotificationSettings notificationSettings) : base(repository, moduleRepository, unitOfWorkManager)
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
            var liveChannels = _notificationChannelRepository
                .GetAll()
                .Where(channel => channel.IsLast && channel.VersionStatus == ConfigurationItemVersionStatus.Live);

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

        public override async Task<NotificationTypeConfig> CopyAsync(NotificationTypeConfig src, CopyItemInput input)
        {
            // todo: validate input
            var module = await ModuleRepository.FirstOrDefaultAsync(input.ModuleId);

            var validationResults = new List<ValidationResult>();

            // todo: review validation messages, add localization support
            if (src == null)
                validationResults.Add(new ValidationResult("Please select notification type to copy", new List<string> { nameof(input.ItemId) }));
            if (module == null)
                validationResults.Add(new ValidationResult("Module is mandatory", new List<string> { nameof(input.ModuleId) }));
            if (string.IsNullOrWhiteSpace(input.Name))
                validationResults.Add(new ValidationResult("Name is mandatory", new List<string> { nameof(input.Name) }));

            if (module != null && !string.IsNullOrWhiteSpace(input.Name))
            {
                var alreadyExist = await Repository.GetAll().Where(f => f.Module == module && f.Name == input.Name).AnyAsync();
                if (alreadyExist)
                    validationResults.Add(new ValidationResult(
                        module != null
                            ? $"Notification Type with name `{input.Name}` already exists in module `{module.Name}`"
                            : $"Notification Type with name `{input.Name}` already exists"
                        )
                    );
            }

            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            var newCopy = new NotificationTypeConfig();
            newCopy.Name = input.Name;
            newCopy.Module = module;
            newCopy.Description = input.Description;
            newCopy.Label = input.Label;

            newCopy.VersionNo = 1;
            newCopy.VersionStatus = ConfigurationItemVersionStatus.Draft;
            newCopy.Origin = newCopy;

            // notification specific props
            newCopy.CopyNotificationSpecificPropsFrom(src.NotNull());

            newCopy.Normalize();

            await Repository.InsertAsync(newCopy);

            await CopyTemplatesAsync(src, newCopy);

            return newCopy;
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

        public async Task<NotificationTypeConfig> CreateNewVersionWithoutDetailsAsync(NotificationTypeConfig src)
        {
            var newVersion = new NotificationTypeConfig();
            newVersion.Origin = src.Origin;
            newVersion.Name = src.Name;
            newVersion.Module = src.Module;
            newVersion.Description = src.Description;
            newVersion.Label = src.Label;
            newVersion.TenantId = src.TenantId;

            newVersion.ParentVersion = src; // set parent version
            newVersion.VersionNo = src.VersionNo + 1; // version + 1
            newVersion.VersionStatus = ConfigurationItemVersionStatus.Draft; // draft

            // notification specific props
            newVersion.CopyNotificationSpecificPropsFrom(src);

            newVersion.Normalize();

            await Repository.InsertAsync(newVersion);

            return newVersion;
        }

        public override async Task<NotificationTypeConfig> CreateNewVersionAsync(NotificationTypeConfig src)
        {
            var newVersion = await CreateNewVersionWithoutDetailsAsync(src);

            await CopyTemplatesAsync(src, newVersion);

            return newVersion;
        }
    }
}