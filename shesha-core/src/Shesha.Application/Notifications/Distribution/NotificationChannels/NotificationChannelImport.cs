using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
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

        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedNotificationChannel itemConfig))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(NotificationChannelConfig)}. Actual type is {item.GetType().FullName}");

            return await ImportAsync(itemConfig, context);
        }

        protected async Task<ConfigurationItemBase> ImportAsync(DistributedNotificationChannel item, IConfigurationItemsImportContext context)
        {
            // use status specified in the context with fallback to imported value
            var statusToImport = context.ImportStatusAs ?? item.VersionStatus;

            // get DB config
            var dbItem = await _configurationRepo.FirstOrDefaultAsync(x => x.Name == item.Name && x.Description == item.Description
                                                                                && (x.Module == null && item.ModuleName == null || x.Module != null && x.Module.Name == item.ModuleName)
                                                                                && x.IsLast);

            if (dbItem != null)
            {

                // ToDo: Temporary update the current version.
                // Need to update the rest of the other code to work with versioning first

                await MapConfigAsync(item, dbItem, context);
                await _configurationRepo.UpdateAsync(dbItem);
            }
            else
            {
                dbItem = new NotificationChannelConfig();
                await MapConfigAsync(item, dbItem, context);

                // fill audit?
                dbItem.VersionNo = 1;
                dbItem.Module = await GetModuleAsync(item.ModuleName, context);

                // important: set status according to the context
                dbItem.VersionStatus = statusToImport;
                dbItem.CreatedByImport = context.ImportResult;

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

            dbItem.Label = item.Label;
            dbItem.Description = item.Description;
            dbItem.VersionNo = item.VersionNo;
            dbItem.VersionStatus = item.VersionStatus;
            dbItem.Suppress = item.Suppress;

            // entity specific properties
            dbItem.SupportedFormat = item.SupportedFormat;
            dbItem.MaxMessageSize = item.MaxMessageSize;
            dbItem.SupportedMechanism = item.SupportedMechanism;
            dbItem.SenderTypeName = item.SenderTypeName;
            dbItem.DefaultPriority = item.DefaultPriority;
            dbItem.Status = item.Status;

            return dbItem;
        }
    }
}
