using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Runtime.Session;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
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
    public class ConfigurableComponentManager : ConfigurationItemManager<ConfigurableComponent>, IConfigurableComponentManager, ITransientDependency
    {
        public ConfigurableComponentManager(IRepository<ConfigurableComponent, Guid> repository, IRepository<ConfigurationItem, Guid> configurationItemRepository, IRepository<Module, Guid> moduleRepository, IUnitOfWorkManager unitOfWorkManager) : base(repository, moduleRepository, unitOfWorkManager)
        {
        }

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public override Task<ConfigurableComponent> CopyAsync(ConfigurableComponent item, CopyItemInput input)
        {
            throw new NotImplementedException();
        }

        public override Task<IConfigurationItemDto> MapToDtoAsync(ConfigurableComponent item)
        {
            throw new NotImplementedException();
        }

        public override async Task<ConfigurableComponent> CreateNewVersionAsync(ConfigurableComponent item)
        {
            // todo: check business rules

            var newVersion = new ConfigurableComponent();
            newVersion.Origin = item.Origin;
            newVersion.Name = item.Name;
            newVersion.Module = item.Module;
            newVersion.Description = item.Description;
            newVersion.Label = item.Label;
            newVersion.TenantId = item.TenantId;

            newVersion.ParentVersion = item; // set parent version
            newVersion.VersionNo = item.VersionNo + 1; // version + 1
            newVersion.VersionStatus = ConfigurationItemVersionStatus.Draft; // draft

            newVersion.Settings = item.Settings;
            newVersion.Normalize();

            await Repository.InsertAsync(newVersion);

            return newVersion;
        }

        /// inheritedDoc
        public override async Task UpdateStatusAsync(ConfigurableComponent form, ConfigurationItemVersionStatus status)
        {
            // todo: implement transition rules
            // todo: cover transition rules by unit tests

            // mark previously published version as retired
            if (status == ConfigurationItemVersionStatus.Live)
            {
                var liveVersionsQuery = Repository.GetAll().Where(v => v.Module == form.Module &&
                    v.Name == form.Name &&
                    v != form &&
                    v.VersionStatus == ConfigurationItemVersionStatus.Live);
                var liveVersions = await liveVersionsQuery.ToListAsync();

                foreach (var version in liveVersions)
                {
                    version.VersionStatus = ConfigurationItemVersionStatus.Retired;
                    await Repository.UpdateAsync(version);
                }

                await UnitOfWorkManager.Current.SaveChangesAsync();
            }

            form.VersionStatus = status;
            
            await Repository.UpdateAsync(form);
        }
    }
}
