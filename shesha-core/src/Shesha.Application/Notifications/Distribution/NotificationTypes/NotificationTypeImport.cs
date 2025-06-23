using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
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
        private readonly IRepository<NotificationTemplate, Guid> _templateRepo;

        public NotificationTypeImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<NotificationTypeConfig, Guid> repository,
            IRepository<NotificationTemplate, Guid> templateRepo,
            INotificationManager manager            
        ) : base (moduleRepo, frontEndAppRepo)
        {
            _repository = repository;
            _templateRepo = templateRepo;
            _manager = manager;           
        }

        public string ItemType => NotificationTypeConfig.ItemTypeName;

        public Task<ConfigurationItem> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedNotificationType itemConfig))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(NotificationTypeConfig)}. Actual type is {item.GetType().FullName}");

            return ImportAsync(itemConfig, context);
        }

        protected async Task<ConfigurationItem> ImportAsync(DistributedNotificationType item, IConfigurationItemsImportContext context)
        {
            var existingNotification = await _repository.GetByByFullName(item.ModuleName, item.Name).FirstOrDefaultAsync();

            if (existingNotification != null)
            {
                // Create new version. Note: it copies all nested items
                var newVersion = await _manager.CreateNewVersionWithoutDetailsAsync(existingNotification);

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

                // TODO: V1 review
                //newNotification.CreatedByImport = context.ImportResult;

                newNotification.Normalize();

                await _repository.InsertAsync(newNotification);

                await ImportTemplatesAsync(newNotification, item.Templates);

                return newNotification;
            }
        }

        private Task ImportTemplatesAsync(NotificationTypeConfig newVersion, List<DistributedNotificationTemplateDto> templates)
        {
            throw new NotImplementedException();
            /*
            foreach (var templateDto in templates) 
            {
                var template = new NotificationTemplate { PartOf = newVersion }.CopyTemplatePropsFrom(templateDto);
                await _templateRepo.InsertAsync(template);
            }
            */
        }

        protected async Task<NotificationTypeConfig> MapConfigAsync(DistributedNotificationType item, NotificationTypeConfig dbItem, IConfigurationItemsImportContext context)
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
            revision.CopyNotificationSpecificPropsFrom(item);

            return dbItem;
        }
    }
}