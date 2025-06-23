using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Notifications.Distribution.NotificationChannels.Dto;
using Shesha.Services.ConfigurationItems;
using System;
using System.Threading.Tasks;

namespace Shesha.Notifications.Distribution.NotificationChannels
{
    /// <summary>
    /// file template import
    /// </summary>
    public class NotificationChannelImport : ConfigurationItemImportBase<NotificationChannelConfig, DistributedNotificationChannel>, INotificationChannelImport, ITransientDependency
    {
        public readonly IRepository<NotificationChannelConfig, Guid> _configurationRepo;

        public NotificationChannelImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<NotificationChannelConfig, Guid> configurationRepo
        ) : base (moduleRepo, frontEndAppRepo)
        {
            _configurationRepo = configurationRepo;
        }

        public string ItemType => NotificationChannelConfig.ItemTypeName;

        public Task<ConfigurationItem> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedNotificationChannel itemConfig))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(NotificationChannelConfig)}. Actual type is {item.GetType().FullName}");

            return ImportAsync(itemConfig, context);
        }

        protected async Task<ConfigurationItem> ImportAsync(DistributedNotificationChannel item, IConfigurationItemsImportContext context)
        {
            // get DB config
            var dbItem = await _configurationRepo.FirstOrDefaultAsync(x => x.Name == item.Name && (x.Module == null && item.ModuleName == null || x.Module != null && x.Module.Name == item.ModuleName));

            if (dbItem != null)
            {
                await MapConfigAsync(item, dbItem, context);
                await _configurationRepo.UpdateAsync(dbItem);
            }
            else
            {
                dbItem = new NotificationChannelConfig();
                await MapConfigAsync(item, dbItem, context);

                dbItem.Module = await GetModuleAsync(item.ModuleName, context);

                dbItem.Normalize();
                await _configurationRepo.InsertAsync(dbItem);
            }
            return dbItem;
        }


        protected async Task<NotificationChannelConfig> MapConfigAsync(DistributedNotificationChannel item, NotificationChannelConfig dbItem, IConfigurationItemsImportContext context)
        {
            dbItem.Name = item.Name;
            dbItem.Module = await GetModuleAsync(item.ModuleName, context);
            dbItem.Application = await GetFrontEndAppAsync(item.FrontEndApplication, context);
            dbItem.ItemType = item.ItemType;

            var revision = dbItem.EnsureLatestRevision();

            revision.Label = item.Label;
            revision.Description = item.Description;
            dbItem.Suppress = item.Suppress;

            // entity specific properties
            revision.SupportedFormat = item.SupportedFormat;
            revision.MaxMessageSize = item.MaxMessageSize;
            revision.SupportedMechanism = item.SupportedMechanism;
            revision.SenderTypeName = item.SenderTypeName;
            revision.DefaultPriority = item.DefaultPriority;
            revision.Status = item.Status;

            return dbItem;
        }
    }
}