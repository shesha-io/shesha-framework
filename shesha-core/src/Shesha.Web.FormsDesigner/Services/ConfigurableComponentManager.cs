using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Session;
using Abp.Timing;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Web.FormsDesigner.Domain;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services
{
    /// <summary>
    /// Configurable component manager
    /// </summary>
    public class ConfigurableComponentManager : ConfigurationItemManager<ConfigurableComponent>, IEventHandler<EntityUpdatingEventData<ConfigurableComponent>>, IConfigurableComponentManager, ITransientDependency
    {
        public ConfigurableComponentManager(IRepository<ConfigurableComponent, Guid> repository, IRepository<ConfigurationItem, Guid> configurationItemRepository, IRepository<Module, Guid> moduleRepository, IUnitOfWorkManager unitOfWorkManager) : base(repository, configurationItemRepository, moduleRepository, unitOfWorkManager)
        {
        }

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public override string ItemType => ConfigurableComponent.ItemTypeName;

        public void HandleEvent(EntityUpdatingEventData<ConfigurableComponent> eventData)
        {
            if (eventData.Entity.Configuration != null)
            {
                eventData.Entity.Configuration.LastModificationTime = Clock.Now;
                eventData.Entity.Configuration.LastModifierUserId = AbpSession?.UserId;
                ConfigurationItemRepository.InsertOrUpdate(eventData.Entity.Configuration);
            }
        }

        public override Task<ConfigurationItemBase> CopyAsync(ConfigurationItemBase item, CopyItemInput input)
        {
            throw new NotImplementedException();
        }

        public override Task<IConfigurationItemDto> MapToDtoAsync(ConfigurationItemBase item)
        {
            throw new NotImplementedException();
        }

        public async Task<ConfigurableComponent> CreateNewVersionAsync(ConfigurableComponent item)
        {
            // todo: check business rules

            var newVersion = new ConfigurableComponent();
            newVersion.Configuration.Origin = item.Configuration.Origin;
            newVersion.Configuration.ItemType = item.Configuration.ItemType;
            newVersion.Configuration.Name = item.Configuration.Name;
            newVersion.Configuration.Module = item.Configuration.Module;
            newVersion.Configuration.Application = item.Configuration.Application;
            newVersion.Configuration.Description = item.Configuration.Description;
            newVersion.Configuration.Label = item.Configuration.Label;
            newVersion.Configuration.TenantId = item.Configuration.TenantId;

            newVersion.Configuration.ParentVersion = item.Configuration; // set parent version
            newVersion.Configuration.VersionNo = item.Configuration.VersionNo + 1; // version + 1
            newVersion.Configuration.VersionStatus = ConfigurationItemVersionStatus.Draft; // draft

            newVersion.Settings = item.Settings;
            newVersion.Normalize();

            await ConfigurationItemRepository.InsertAsync(newVersion.Configuration);
            await Repository.InsertAsync(newVersion);

            return newVersion;
        }

        public override async Task<ConfigurationItemBase> CreateNewVersionAsync(ConfigurationItemBase item)
        {
            var component = item as ConfigurableComponent;
            if (component == null)
                throw new ArgumentException($"{nameof(item)} must be of type {nameof(ConfigurableComponent)}", nameof(item));

            var result = await CreateNewVersionAsync(component);
            return result;
        }

        /// inheritedDoc
        public async Task UpdateStatusAsync(ConfigurableComponent form, ConfigurationItemVersionStatus status)
        {
            // todo: implement transition rules
            // todo: cover transition rules by unit tests

            // mark previously published version as retired
            if (status == ConfigurationItemVersionStatus.Live)
            {
                var liveVersionsQuery = Repository.GetAll().Where(v => v.Configuration.Module == form.Configuration.Module &&
                    v.Configuration.Name == form.Configuration.Name &&
                    v != form &&
                    v.Configuration.VersionStatus == ConfigurationItemVersionStatus.Live);
                var liveVersions = await liveVersionsQuery.ToListAsync();

                foreach (var version in liveVersions)
                {
                    version.Configuration.VersionStatus = ConfigurationItemVersionStatus.Retired;
                    await ConfigurationItemRepository.UpdateAsync(version.Configuration);
                }

                await UnitOfWorkManager.Current.SaveChangesAsync();
            }

            form.Configuration.VersionStatus = status;
            await ConfigurationItemRepository.UpdateAsync(form.Configuration);
        }
    }
}
