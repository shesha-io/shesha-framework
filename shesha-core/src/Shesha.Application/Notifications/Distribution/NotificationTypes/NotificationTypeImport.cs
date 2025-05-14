using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Notifications.Distribution.NotificationTypes.Dto;
using Shesha.Services.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Notifications.Distribution.NotificationTypes
{
    /// <summary>
    /// file template import
    /// </summary>
    public class NotificationTypeImport : ConfigurationItemImportBase<NotificationTypeConfig, DistributedNotificationType>, INotificationTypeImport, ITransientDependency
    {
        private readonly IRepository<NotificationTypeConfig, Guid> _repository;
        private readonly INotificationManager _manager;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<NotificationTemplate, Guid> _templateRepo;

        public NotificationTypeImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<NotificationTypeConfig, Guid> repository,
            IRepository<NotificationTemplate, Guid> templateRepo,
            INotificationManager manager,
            IUnitOfWorkManager unitOfWorkManager            
        ) : base (moduleRepo, frontEndAppRepo)
        {
            _repository = repository;
            _templateRepo = templateRepo;
            _manager = manager;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public string ItemType => NotificationTypeConfig.ItemTypeName;

        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedNotificationType itemConfig))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(NotificationTypeConfig)}. Actual type is {item.GetType().FullName}");

            return await ImportAsync(itemConfig, context);
        }

        protected async Task<ConfigurationItemBase> ImportAsync(DistributedNotificationType item, IConfigurationItemsImportContext context)
        {
            // use status specified in the context with fallback to imported value
            var statusToImport = context.ImportStatusAs ?? item.VersionStatus;

            var existingNotification = await _repository.GetByByFullName(item.ModuleName, item.Name).FirstOrDefaultAsync(e => e.IsLast);

            if (existingNotification != null)
            {
                switch (existingNotification.VersionStatus)
                {
                    case ConfigurationItemVersionStatus.Draft:
                    case ConfigurationItemVersionStatus.Ready:
                        {
                            // cancel existing version
                            await _manager.CancelVersionAsync(existingNotification);
                            break;
                        }
                }
                // mark existing live form as retired if we import new form as live
                if (statusToImport == ConfigurationItemVersionStatus.Live)
                {
                    var liveVersion = existingNotification.VersionStatus == ConfigurationItemVersionStatus.Live
                        ? existingNotification
                        : await _repository.GetByByFullName(item.ModuleName, item.Name).FirstOrDefaultAsync(e => e.VersionStatus == ConfigurationItemVersionStatus.Live);
                    if (liveVersion != null)
                    {
                        await _manager.UpdateStatusAsync(liveVersion, ConfigurationItemVersionStatus.Retired);
                        await _unitOfWorkManager.Current.SaveChangesAsync(); // save changes to guarantee sequence of update
                    }
                }
                
                // Create new version. Note: it copies all nested items
                var newVersion = await _manager.CreateNewVersionWithoutDetailsAsync(existingNotification);

                // important: set status according to the context
                newVersion.VersionStatus = statusToImport;
                newVersion.CreatedByImport = context.ImportResult;
                newVersion.Normalize();

                // todo: save external Id
                // how to handle origin?

                await _repository.UpdateAsync(newVersion);

                await ImportTemplatesAsync(newVersion, item.Templates);

                return newVersion;
            }
            else
            {
                var newNotification = new NotificationTypeConfig();
                await MapConfigAsync(item, newNotification, context);

                newNotification.VersionNo = 1;

                // important: set status according to the context
                newNotification.VersionStatus = statusToImport;
                newNotification.CreatedByImport = context.ImportResult;

                newNotification.Normalize();

                await _repository.InsertAsync(newNotification);

                await ImportTemplatesAsync(newNotification, item.Templates);

                return newNotification;
            }
        }

        private async Task ImportTemplatesAsync(NotificationTypeConfig newVersion, List<DistributedNotificationTemplateDto> templates)
        {
            foreach (var templateDto in templates) 
            {
                var template = new NotificationTemplate { PartOf = newVersion }.CopyTemplatePropsFrom(templateDto);
                await _templateRepo.InsertAsync(template);
            }
        }

        protected async Task<NotificationTypeConfig> MapConfigAsync(DistributedNotificationType item, NotificationTypeConfig dbItem, IConfigurationItemsImportContext context)
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
            dbItem.CopyNotificationSpecificPropsFrom(item);

            return dbItem;
        }
    }
}